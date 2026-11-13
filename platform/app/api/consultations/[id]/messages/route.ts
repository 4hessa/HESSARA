// إرسال رسالة وبثّ إجابة النموذج. البروتوكول: أسطر JSON
// {t:"start"} ثم {t:"d",v} متكررة ثم {t:"done"} أو {t:"error"}.
import { newId } from "@/lib/auth";
import { systemPrompt } from "@/lib/consult";
import { all, get, run, type ConsultRow, type MessageRow } from "@/lib/db";
import { authed, fail, LIMITS, rateLimit, readJson, str } from "@/lib/http";
import { recordCheck, resolveModel } from "@/lib/providers";
import { ProviderError } from "@/lib/providers/types";

export const maxDuration = 300; // ثوانٍ: أقصى مدة للدالة على الاستضافة عديمة الحالة

type Ctx = { params: Promise<{ id: string }> };
const MAX_HISTORY = 40;
const MAX_CONCURRENT = 3; // بثّ متزامن لكل مستخدم
const g = globalThis as typeof globalThis & { __hessaraStreams?: Map<string, number> };
const inflight = (g.__hessaraStreams ??= new Map());
const MAX_GENERATION_MS = 5 * 60_000; // سقف زمني حتى لا يحتجز مزوّد معلّق الاتصال إلى ما لا نهاية

export const POST = authed<Ctx>(async (req, user, ctx) => {
  const { id } = await ctx.params;
  const c = await get<ConsultRow>("SELECT * FROM consultations WHERE id = ? AND user_id = ?", id, user.id);
  if (!c) return fail(404, "الاستشارة غير موجودة.");
  if (!rateLimit(`msg:${user.id}`, 30, 60_000)) return fail(429, "طلبات كثيرة خلال دقيقة. انتظر قليلًا.");

  if ((inflight.get(user.id) ?? 0) >= MAX_CONCURRENT) return fail(429, "لديك إجابات قيد التوليد. انتظر اكتمالها أو أوقفها.");

  const b = await readJson(req);
  const retry = b?.retry === true;
  const model = resolveModel(c.model_id);
  if (!model) return fail(409, "النموذج المختار لهذه الاستشارة لم يعد متاحًا. اختر نموذجًا آخر.");
  if (model.def.adapter !== "demo" && !user.external_consent)
    return Response.json({ error: "يلزم موافقتك على إرسال نص الاستشارة إلى مزوّد خارجي.", code: "consent" }, { status: 412 });

  const now = Date.now();
  let userMsgId: string | null = null;
  if (retry) {
    const last = await get<MessageRow>("SELECT * FROM messages WHERE consultation_id = ? ORDER BY created_at DESC, id DESC LIMIT 1", c.id);
    if (last?.role === "assistant") await run("DELETE FROM messages WHERE id = ?", last.id);
  } else {
    const text = str(b?.text, LIMITS.message);
    if (!text) return fail(400, `اكتب رسالتك (حتى ${LIMITS.message} حرف).`);
    userMsgId = newId();
    await run("INSERT INTO messages (id, consultation_id, role, content, created_at) VALUES (?,?,?,?,?)", userMsgId, c.id, "user", text, now);
  }
  await run("UPDATE consultations SET updated_at = ? WHERE id = ?", now, c.id);

  const history = (await all<MessageRow>(
    "SELECT * FROM (SELECT * FROM messages WHERE consultation_id = ? ORDER BY created_at DESC, id DESC LIMIT ?) AS recent ORDER BY created_at, id",
    c.id, MAX_HISTORY,
  )).filter((m) => m.content.trim());
  while (history.length && history[0].role !== "user") history.shift();
  if (!history.length || history[history.length - 1].role !== "user") return fail(400, "لا توجد رسالة للإجابة عنها.");

  const assistantId = newId();
  const enc = new TextEncoder();
  const abort = new AbortController();
  const timeout = AbortSignal.timeout(MAX_GENERATION_MS);
  inflight.set(user.id, (inflight.get(user.id) ?? 0) + 1);
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    const n = (inflight.get(user.id) ?? 1) - 1;
    if (n <= 0) inflight.delete(user.id); else inflight.set(user.id, n);
  };
  req.signal.addEventListener("abort", () => abort.abort(), { once: true });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let text = "";
      let closed = false;
      const send = (o: unknown) => {
        if (closed) return;
        try { controller.enqueue(enc.encode(JSON.stringify(o) + "\n")); } catch { closed = true; }
      };
      const save = async (status: string) => {
        if (!text.trim()) return;
        try { await persist(status); } catch { /* حُذفت الاستشارة أو الحساب أثناء البث: لا شيء يُحفظ */ }
      };
      const persist = async (status: string) => {
        await run("INSERT INTO messages (id, consultation_id, role, content, model_id, engine, status, created_at) VALUES (?,?,?,?,?,?,?,?)",
          assistantId, c.id, "assistant", text, c.model_id, model.def.adapter === "demo" ? "demo" : "llm", status, Date.now());
        await run("INSERT INTO actions (id, user_id, consultation_id, kind, detail, created_at) VALUES (?,?,?,?,?,?)",
          newId(), user.id, c.id, "model_call", `استدعاء ${model.def.name}${c.agent_id ? ` عبر الوكيل ${c.agent_id}` : ""} — ${status}`, Date.now());
      };
      send({ t: "start", id: assistantId, userMessageId: userMsgId, modelId: c.model_id });
      try {
        for await (const chunk of model.adapter.stream({
          model: model.apiModel,
          system: systemPrompt(c.agent_id),
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          signal: AbortSignal.any([abort.signal, timeout]),
        })) {
          text += chunk;
          send({ t: "d", v: chunk });
        }
        if (abort.signal.aborted) await save("stopped");
        else if (timeout.aborted) {
          // بلوغ السقف الزمني ليس اكتمالًا: تُحفظ الإجابة ناقصة ويُبلَّغ المستخدم.
          await save("stopped");
          send({ t: "error", message: "تجاوز التوليد المدة القصوى فأُوقف. الإجابة المحفوظة غير مكتملة.", partial: !!text.trim(), id: assistantId });
        } else if (!text.trim()) send({ t: "error", message: "أعاد النموذج ردًا فارغًا. أعد المحاولة." });
        else {
          await save("complete");
          if (model.def.adapter !== "demo") recordCheck(c.model_id, true);
          send({ t: "done", id: assistantId, status: "complete" });
        }
      } catch (e) {
        if (abort.signal.aborted) await save("stopped");
        else {
          const message = e instanceof ProviderError ? e.message : "حدث خطأ غير متوقع أثناء توليد الإجابة.";
          if (!(e instanceof ProviderError)) console.error("[consult] stream error", (e as Error).name);
          else if (e.kind !== "refused" && e.kind !== "rate_limit") recordCheck(c.model_id, false, e.message);
          await save("stopped");
          send({ t: "error", message, partial: !!text.trim(), id: assistantId });
        }
      } finally {
        release();
        closed = true;
        try { controller.close(); } catch { /* أُغلق مسبقًا */ }
      }
    },
    cancel() { abort.abort(); release(); },
  });

  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" },
  });
});

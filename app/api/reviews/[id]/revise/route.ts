// نسخة منقّحة: يولّدها نموذج لغوي إن وُجد، أو يقدّمها المستخدم يدويًا. المقارنة تُحسب دائمًا على الخادم.
import { get, run, type ReviewRow } from "@/lib/db";
import { authed, fail, LIMITS, ok, rateLimit, readJson, str } from "@/lib/http";
import { firstLlm } from "@/lib/providers";
import { diffWords } from "@/lib/review/diff";
import { llmRevise } from "@/lib/review/llm";
import { ProviderError } from "@/lib/providers/types";

export const POST = authed<{ params: Promise<{ id: string }> }>(async (req, user, ctx) => {
  if (!rateLimit(`revise:${user.id}`, 10, 60_000)) return fail(429, "طلبات كثيرة. انتظر قليلًا.");
  const r = get<ReviewRow>("SELECT * FROM reviews WHERE id = ? AND user_id = ?", (await ctx.params).id, user.id);
  if (!r) return fail(404, "المراجعة غير موجودة.");
  const b = await readJson(req);
  let revised = b?.generate === true ? null : str(b?.revised, LIMITS.reviewInput);
  if (!revised && b?.generate !== true) return fail(400, "الصق النسخة المنقّحة أولًا.");
  let source: "manual" | "llm" = "manual";
  if (!revised) {
    const llm = firstLlm(user.pref_model);
    if (!llm) return fail(409, "لا يوجد نموذج لغوي مهيّأ لتوليد نسخة منقّحة. الصق نسختك المعدّلة يدويًا للمقارنة.");
    if (!user.external_consent) return Response.json({ error: "يلزم موافقتك على إرسال النص إلى مزوّد خارجي.", code: "consent" }, { status: 412 });
    try {
      revised = (await llmRevise(llm, r.input, JSON.parse(r.result), AbortSignal.any([req.signal, AbortSignal.timeout(120_000)]))).trim();
      source = "llm";
    } catch (e) {
      return fail(502, e instanceof ProviderError ? e.message : "تعذر توليد النسخة المنقّحة.");
    }
    if (!revised) return fail(502, "أعاد النموذج نصًا فارغًا.");
  }
  run("UPDATE reviews SET revised = ? WHERE id = ?", revised, r.id);
  return ok({ revised, source, diff: diffWords(r.input, revised) });
});

import { newId } from "@/lib/auth";
import { all, get, run, type ReviewRow } from "@/lib/db";
import { authed, fail, LIMITS, ok, rateLimit, readJson, str } from "@/lib/http";
import { firstLlm } from "@/lib/providers";
import { runReview } from "@/lib/review";
import { modeById } from "@/lib/review/types";

export const GET = authed(async (_req, user) =>
  ok({ reviews: all<ReviewRow>("SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC LIMIT 50", user.id) }),
);

export const POST = authed(async (req, user) => {
  if (!rateLimit(`review:${user.id}`, 15, 60_000)) return fail(429, "طلبات كثيرة. انتظر قليلًا.");
  const b = await readJson(req);
  const text = str(b?.text, LIMITS.reviewInput);
  if (!text || text.trim().length < 20) return fail(400, "أدخل نصًا للمراجعة لا يقل عن ٢٠ حرفًا.");
  const mode = modeById(typeof b?.mode === "string" ? b.mode : "");
  if (!mode) return fail(400, "اختر نمط مراجعة.");
  const criteria = (Array.isArray(b?.criteria) ? b.criteria : [])
    .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
    .map((c) => c.trim().slice(0, 300))
    .slice(0, 10);
  if (mode.needsCriteria && !criteria.length) return fail(400, "اكتب معيارًا واحدًا على الأقل ليحكم به المحكّم.");

  // لا تُربط المراجعة باستشارة إلا إذا كانت ملكًا للمستخدم نفسه.
  let consultationId: string | null = null;
  let messageId: string | null = null;
  if (typeof b?.consultationId === "string") {
    if (!get("SELECT 1 FROM consultations WHERE id = ? AND user_id = ?", b.consultationId, user.id)) return fail(404, "الاستشارة غير موجودة.");
    consultationId = b.consultationId;
    messageId = typeof b.messageId === "string" ? b.messageId : null;
  }
  const wantsLlm = b?.engine !== "heuristic" && !!firstLlm(user.pref_model);
  if (wantsLlm && !user.external_consent)
    return Response.json({ error: "يلزم موافقتك على إرسال النص إلى مزوّد خارجي للمراجعة.", code: "consent" }, { status: 412 });

  const result = await runReview({
    mode: mode.id, text, criteria,
    engine: b?.engine === "heuristic" ? "heuristic" : "auto",
    preferredModel: user.pref_model,
    signal: req.signal,
  });
  const id = newId();
  run("INSERT INTO reviews (id, user_id, consultation_id, message_id, mode, criteria, input, result, engine, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
    id, user.id, consultationId, messageId, mode.id, JSON.stringify(criteria), text, JSON.stringify(result), result.engine, Date.now());
  if (consultationId)
    run("INSERT INTO actions (id, user_id, consultation_id, kind, detail, created_at) VALUES (?,?,?,?,?,?)",
      newId(), user.id, consultationId, "review", `مراجعة «${mode.name}» — ${result.engineLabel}`, Date.now());
  return ok({ id, result });
});

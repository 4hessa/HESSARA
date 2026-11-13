import { newId } from "@/lib/auth";
import { all, get, run, type ReviewRow } from "@/lib/db";
import { authed, fail, LIMITS, ok, rateLimit, readJson, str } from "@/lib/http";
import { firstLlm } from "@/lib/providers";
import { runReview } from "@/lib/review";
import { modeById } from "@/lib/review/types";
import { langOf, makeT } from "@/lib/i18n";

export const GET = authed(async (_req, user) =>
  ok({ reviews: await all<ReviewRow>("SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC LIMIT 50", user.id) }),
);

export const POST = authed(async (req, user) => {
  const lang = langOf(req);
  const t = makeT(lang);
  if (!rateLimit(`review:${user.id}`, 15, 60_000)) return fail(429, t("طلبات كثيرة. انتظر قليلًا.", "Too many requests. Wait a little."));
  const b = await readJson(req);
  const text = str(b?.text, LIMITS.reviewInput);
  if (!text || text.trim().length < 20) return fail(400, t("أدخل نصًا للمراجعة لا يقل عن ٢٠ حرفًا.", "Enter at least 20 characters of text to review."));
  const mode = modeById(typeof b?.mode === "string" ? b.mode : "", lang);
  if (!mode) return fail(400, t("اختر نمط مراجعة.", "Choose a review mode."));
  const criteria = (Array.isArray(b?.criteria) ? b.criteria : [])
    .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
    .map((c) => c.trim().slice(0, 300))
    .slice(0, 10);
  if (mode.needsCriteria && !criteria.length) return fail(400, t("اكتب معيارًا واحدًا على الأقل ليحكم به المحكّم.", "Write at least one criterion for the judge to apply."));

  // لا تُربط المراجعة باستشارة إلا إذا كانت ملكًا للمستخدم نفسه.
  let consultationId: string | null = null;
  let messageId: string | null = null;
  if (typeof b?.consultationId === "string") {
    if (!await get("SELECT 1 FROM consultations WHERE id = ? AND user_id = ?", b.consultationId, user.id)) return fail(404, t("الاستشارة غير موجودة.", "Consultation not found."));
    consultationId = b.consultationId;
    if (typeof b.messageId === "string") {
      if (!await get("SELECT 1 FROM messages WHERE id = ? AND consultation_id = ?", b.messageId, consultationId)) return fail(404, t("الرسالة غير موجودة.", "Message not found."));
      messageId = b.messageId;
    }
  }
  const wantsLlm = b?.engine !== "heuristic" && !!firstLlm(user.pref_model);
  if (wantsLlm && !user.external_consent)
    return Response.json({ error: t("يلزم موافقتك على إرسال النص إلى مزوّد خارجي للمراجعة.", "Your consent is needed to send the text to an external provider for review."), code: "consent" }, { status: 412 });

  const result = await runReview({
    mode: mode.id, text, criteria,
    engine: b?.engine === "heuristic" ? "heuristic" : "auto",
    preferredModel: user.pref_model,
    lang,
    signal: AbortSignal.any([req.signal, AbortSignal.timeout(120_000)]),
  });
  const id = newId();
  await run("INSERT INTO reviews (id, user_id, consultation_id, message_id, mode, criteria, input, result, engine, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
    id, user.id, consultationId, messageId, mode.id, JSON.stringify(criteria), text, JSON.stringify(result), result.engine, Date.now());
  if (consultationId)
    await run("INSERT INTO actions (id, user_id, consultation_id, kind, detail, created_at) VALUES (?,?,?,?,?,?)",
      newId(), user.id, consultationId, "review", JSON.stringify({ mode: mode.id, engine: result.engine }), Date.now());
  return ok({ id, result });
});

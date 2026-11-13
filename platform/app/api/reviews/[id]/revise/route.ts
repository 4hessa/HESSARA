// نسخة منقّحة: يولّدها نموذج لغوي إن وُجد، أو يقدّمها المستخدم يدويًا. المقارنة تُحسب دائمًا على الخادم.
import { get, run, type ReviewRow } from "@/lib/db";
import { authed, fail, LIMITS, ok, rateLimit, readJson, str } from "@/lib/http";
import { firstLlm } from "@/lib/providers";
import { diffWords } from "@/lib/review/diff";
import { llmRevise } from "@/lib/review/llm";
import { ProviderError } from "@/lib/providers/types";
import { langOf, makeT } from "@/lib/i18n";

export const POST = authed<{ params: Promise<{ id: string }> }>(async (req, user, ctx) => {
  const lang = langOf(req);
  const t = makeT(lang);
  if (!rateLimit(`revise:${user.id}`, 10, 60_000)) return fail(429, t("طلبات كثيرة. انتظر قليلًا.", "Too many requests. Wait a little."));
  const r = await get<ReviewRow>("SELECT * FROM reviews WHERE id = ? AND user_id = ?", (await ctx.params).id, user.id);
  if (!r) return fail(404, t("المراجعة غير موجودة.", "Review not found."));
  const b = await readJson(req);
  let revised = b?.generate === true ? null : str(b?.revised, LIMITS.reviewInput);
  if (!revised && b?.generate !== true) return fail(400, t("الصق النسخة المنقّحة أولًا.", "Paste the revised version first."));
  let source: "manual" | "llm" = "manual";
  if (!revised) {
    const llm = firstLlm(user.pref_model);
    if (!llm) return fail(409, t("لا يوجد نموذج لغوي مهيّأ لتوليد نسخة منقّحة. الصق نسختك المعدّلة يدويًا للمقارنة.", "No language model is configured to generate a revised version. Paste your own edited version to compare."));
    if (!user.external_consent) return Response.json({ error: t("يلزم موافقتك على إرسال النص إلى مزوّد خارجي.", "Your consent is needed to send the text to an external provider."), code: "consent" }, { status: 412 });
    try {
      revised = (await llmRevise(llm, r.input, JSON.parse(r.result), AbortSignal.any([req.signal, AbortSignal.timeout(120_000)]), lang)).trim();
      source = "llm";
    } catch (e) {
      return fail(502, e instanceof ProviderError ? e.text(lang) : t("تعذر توليد النسخة المنقّحة.", "Could not generate the revised version."));
    }
    if (!revised) return fail(502, t("أعاد النموذج نصًا فارغًا.", "The model returned empty text."));
  }
  await run("UPDATE reviews SET revised = ? WHERE id = ?", revised, r.id);
  return ok({ revised, source, diff: diffWords(r.input, revised) });
});

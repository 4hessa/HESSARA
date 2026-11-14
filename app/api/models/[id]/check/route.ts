// اختبار اتصال فعلي: طلب قصير جدًا للنموذج، وتُسجَّل النتيجة في حالة النموذج.
import { authed, fail, ok, rateLimit } from "@/lib/http";
import { modelView, recordCheck, resolveModel } from "@/lib/providers";
import { collect, ProviderError } from "@/lib/providers/types";
import { langOf, makeT } from "@/lib/i18n";

export const POST = authed<{ params: Promise<{ id: string }> }>(async (req, user, ctx) => {
  const lang = langOf(req);
  const t = makeT(lang);
  const { id } = await ctx.params;
  if (!rateLimit(`check:${user.id}`, 10, 10 * 60_000)) return fail(429, t("اختبارات كثيرة. انتظر قليلًا.", "Too many tests. Wait a little."));
  const m = resolveModel(id);
  if (!m) return fail(409, t("النموذج غير مهيّأ على الخادم.", "The model is not configured on the server."));
  const signal = AbortSignal.timeout(30_000);
  try {
    const out = await collect(
      m.adapter.stream({
        model: m.apiModel,
        system: "أجب بكلمة واحدة.",
        messages: [{ role: "user", content: "اكتب كلمة: جاهز" }],
        signal,
        maxTokens: 2000,
      }),
    );
    if (!out.trim()) throw new ProviderError(signal.aborted
      ? { ar: "انتهت مهلة الاختبار (30 ثانية) دون رد.", en: "The test timed out (30 seconds) with no reply." }
      : { ar: "أعاد المزوّد ردًا فارغًا.", en: "The provider returned an empty reply." });
    await recordCheck(id, true);
  } catch (e) {
    // إجابة مبتورة تثبت أن الاتصال والمفتاح يعملان.
    if (e instanceof ProviderError && e.kind === "truncated") await recordCheck(id, true);
    else await recordCheck(id, false, e instanceof ProviderError ? { ar: e.message, en: e.en } : { ar: "فشل الاتصال.", en: "The connection failed." });
  }
  return ok({ model: modelView(m.def, lang) });
});

// اختبار اتصال فعلي: طلب قصير جدًا للنموذج، وتُسجَّل النتيجة في حالة النموذج.
import { authed, fail, ok, rateLimit } from "@/lib/http";
import { modelView, recordCheck, resolveModel } from "@/lib/providers";
import { collect, ProviderError } from "@/lib/providers/types";

export const POST = authed<{ params: Promise<{ id: string }> }>(async (_req, user, ctx) => {
  const { id } = await ctx.params;
  if (!rateLimit(`check:${user.id}`, 10, 10 * 60_000)) return fail(429, "اختبارات كثيرة. انتظر قليلًا.");
  const m = resolveModel(id);
  if (!m) return fail(409, "النموذج غير مهيّأ على الخادم.");
  try {
    const out = await collect(
      m.adapter.stream({
        model: m.apiModel,
        system: "أجب بكلمة واحدة.",
        messages: [{ role: "user", content: "اكتب كلمة: جاهز" }],
        signal: AbortSignal.timeout(30_000),
        maxTokens: 2000,
      }),
    );
    if (!out.trim()) throw new ProviderError("أعاد المزوّد ردًا فارغًا.");
    recordCheck(id, true);
  } catch (e) {
    recordCheck(id, false, e instanceof ProviderError ? e.message : "فشل الاتصال.");
  }
  return ok({ model: modelView(m.def) });
});

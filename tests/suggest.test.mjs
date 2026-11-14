// اقتراح الوكيل من كلمات السؤال: أمثلة واقعية بالعربية والإنجليزية، والتعادل والنص القصير بلا اقتراح.
import test from "node:test";
import assert from "node:assert/strict";
const { suggestAgent } = await import("../lib/catalog/suggestAgent.ts");

test("يقترح الوكيل الأقرب لأسئلة نموذجية", () => {
  const cases = [
    ["أحتاج خطة لمشروع تخرج مدته ثمانية أسابيع، بمراحل ومهام واضحة.", "planning"],
    ["كيف أراجع أمان نقطة الدخول في تطبيقي وأحميها من الاختراق؟", "security"],
    ["تظهر رسالة الخطأ TypeError: cannot read properties of undefined عند تشغيل الدالة", "coding"],
    ["لدي تطبيق يعتمد على نموذج لغوي، لكن استجابته بطيئة. أريد معرفة السبب وتحسين الأداء.", "systems"],
    ["أريد ضبطًا دقيقًا لنموذج لغوي على بيانات التدريب الخاصة بي وتقييمه", "ai"],
    ["ما المنهجية المناسبة لاختبار فرضية دراستي، وكم حجم العينة؟", "research"],
    ["Our database server cannot keep up; latency doubles under load.", "systems"],
    ["How should I structure the timeline and milestones for a six-week sprint plan?", "planning"],
  ];
  for (const [q, want] of cases) assert.equal(suggestAgent(q), want, q);
});

test("لا اقتراح للنص القصير أو حين تغيب الدلالة أو تتعادل", () => {
  assert.equal(suggestAgent("مرحبا"), null);
  assert.equal(suggestAgent("ما رأيك في هذا الموضوع بشكل عام يا صديقي؟"), null);
  assert.equal(suggestAgent("خطة أمان"), null, "نص قصير");
  assert.equal(suggestAgent("أحتاج خطة لتشفير البيانات قبل التسليم النهائي"), null, "تعادل: خطة مقابل تشفير");
});

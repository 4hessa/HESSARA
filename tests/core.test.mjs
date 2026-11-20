import test from "node:test";
import assert from "node:assert/strict";
import { diffWords } from "../lib/review/diff.ts";
import { heuristicReview } from "../lib/review/heuristic.ts";

test("diff: نص متطابق لا يُنتج تغييرات", () => {
  assert.deepEqual(diffWords("أ ب ج", "أ ب ج").filter((p) => p.type !== "same"), []);
});

test("diff: يكشف الإضافة والحذف ويعيد بناء النصين", () => {
  const parts = diffWords("قِس الأداء ثم غيّر", "قِس الأداء أولًا ثم عدّل");
  assert.equal(parts.filter((p) => p.type !== "add").map((p) => p.text).join(""), "قِس الأداء ثم غيّر");
  assert.equal(parts.filter((p) => p.type !== "del").map((p) => p.text).join(""), "قِس الأداء أولًا ثم عدّل");
});

test("المراجع القاعدي: يكشف غياب القياس والتحقق والحكم المطلق", () => {
  const r = heuristicReview("technical", "استخدم نموذجًا أصغر وسيكون التطبيق أسرع دائمًا.", []);
  const titles = r.findings.map((f) => f.title);
  assert.ok(titles.includes("لا قياس قبل الحل"));
  assert.ok(titles.includes("لا طريقة للتحقق من النتيجة"));
  assert.ok(titles.includes("حكم مطلق"));
  assert.equal(r.engine, "heuristic");
  assert.equal(r.needsHuman, true);
});

test("المراجع القاعدي: نص يتضمن قياسًا وتحققًا لا يُتّهم بغيابهما", () => {
  const r = heuristicReview("technical", "قِس الوسيط أولًا، ثم اختبر التغيير وقارن. الافتراض: الحمل ثابت.", []);
  const titles = r.findings.map((f) => f.title);
  assert.ok(!titles.includes("لا قياس قبل الحل"));
  assert.ok(!titles.includes("لا طريقة للتحقق من النتيجة"));
});

test("مدقق الأدلة: رقم بلا مصدر ملاحظة عالية، ومع مصدر لا", () => {
  const bad = heuristicReview("evidence", "هذا الحل أسرع بنسبة 40% من غيره.", []);
  assert.ok(bad.findings.some((f) => f.title === "رقم أو نسبة بلا مصدر" && f.severity === "high"));
  const good = heuristicReview("evidence", "أسرع بنسبة 40% وفق قياسنا: https://example.org/bench", []);
  assert.ok(!good.findings.some((f) => f.title === "رقم أو نسبة بلا مصدر"));
});

test("المحكّم المنظّم القاعدي: لا يحكم بالاستيفاء أبدًا", () => {
  const r = heuristicReview("judge", "تتضمن الخطة خطة تراجع واضحة.", ["وجود خطة تراجع", "ذكر الميزانية"]);
  assert.equal(r.verdicts.length, 2);
  assert.ok(r.verdicts.every((v) => v.status !== "pass"));
  assert.equal(r.verdicts[1].status, "fail");
});

test("diff: مدخلان كثيرا الأسطر لا يحجزان ذاكرة غير محدودة", () => {
  const a = "a\n".repeat(10000), b = "b\n".repeat(10000);
  const before = process.memoryUsage().heapUsed + process.memoryUsage().arrayBuffers;
  const t = Date.now();
  const parts = diffWords(a, b);
  const grown = process.memoryUsage().heapUsed + process.memoryUsage().arrayBuffers - before;
  assert.equal(parts.length, 2);
  assert.ok(Date.now() - t < 500, "زمن محدود");
  assert.ok(grown < 50 * 1024 * 1024, "ذاكرة محدودة");
});

test("المراجع القاعدي: مدخلات عدائية لا تسبب كلفة تربيعية في التعابير النمطية", () => {
  for (const [mode, text] of [["feasibility", "\n".repeat(20000) + "x"], ["evidence", "1".repeat(20000)], ["technical", " ".repeat(20000)], ["risk", "ا".repeat(20000)]]) {
    const t = performance.now();
    heuristicReview(mode, text, []);
    assert.ok(performance.now() - t < 200, `${mode}: ${Math.round(performance.now() - t)}ms`);
  }
});

test("محلل المخاطر القاعدي: لا يقول «لا مخاطر» عن نص يذكر الفشل أو التأخير أو علاجهما، ويبقى يكشف غيابها", () => {
  const titles = (t) => heuristicReview("risk", t, []).findings.map((f) => f.title);
  // من إجابة حقيقية على الموقع الحي، كانت تُعطى «المخاطر غير مذكورة» بأهمية عالية
  assert.ok(!titles("أشهر سبب لفشل مشاريع التخرج هو تضخم النطاق، فابدأوا بنسخة أساسية.").includes("المخاطر غير مذكورة"));
  assert.ok(!titles("إذا تأخرتم في الأسبوعين الأولين فستضطرون لتقطيع الميزات.").includes("المخاطر غير مذكورة"));
  assert.ok(!titles("احفظوا نسخًا احتياطية من قاعدة البيانات كل يوم.").includes("المخاطر غير مذكورة"), "علاج المخاطرة حديث عنها");
  assert.ok(!titles("The main pitfall is the free tier: if it fails, testing stops.").includes("المخاطر غير مذكورة"));
  // في سؤال عن البطء «يتأخر» عَرَضٌ لا مخاطرة، و«الاسترجاع» استرجاع بيانات لا خطة تراجع
  const slow = titles("زمن الاستجابة يتأخر بسبب الاسترجاع من قاعدة البيانات، وتراجع الأداء واضح.");
  assert.ok(slow.includes("المخاطر غير مذكورة") && slow.includes("لا خطة تراجع"), slow.join("، "));
  assert.ok(titles("ابدأوا بتحديد النطاق ثم وزّعوا المهام على الفريق.").includes("المخاطر غير مذكورة"), "«تحديد» ليست «تحديات»");
  const f = heuristicReview("risk", "ابدأوا بتحديد النطاق ثم وزّعوا المهام.", []).findings.find((x) => x.title === "المخاطر غير مذكورة");
  assert.match(f.detail, /لم يُعثر في النص على ألفاظ/, "الصياغة تصف ما فحصه المحرك، لا حكمًا على المعنى");
});

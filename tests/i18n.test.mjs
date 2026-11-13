// طبقة اللغتين: اختيار اللغة من ملف الارتباط وترويسة Accept-Language، ومخرجات المحركات بالإنجليزية.
import test from "node:test";
import assert from "node:assert/strict";

const { fromAcceptLanguage, negotiate, langOf, makeT } = await import("../lib/i18n.ts");
const { heuristicReview } = await import("../lib/review/heuristic.ts");
const { modeById, REVIEW_MODES, REVIEW_MODES_EN } = await import("../lib/review/types.ts");
const { demoAnswer } = await import("../lib/providers/demo.ts");
const { ProviderError } = await import("../lib/providers/types.ts");
const { AGENTS, AGENTS_EN, agentById } = await import("../lib/catalog/agents.ts");
const { MODELS, localizeModel } = await import("../lib/catalog/models.ts");

test("Accept-Language: أول لغة مدعومة حسب الأفضلية، والعربية عند غياب المطابقة", () => {
  assert.equal(fromAcceptLanguage("en-US,en;q=0.9,ar;q=0.8"), "en");
  assert.equal(fromAcceptLanguage("ar-SA,ar;q=0.9,en;q=0.8"), "ar");
  assert.equal(fromAcceptLanguage("fr-FR,fr;q=0.9,ar;q=0.5,en;q=0.7"), "en", "يُرتَّب حسب q لا حسب الموضع");
  assert.equal(fromAcceptLanguage("de,ja"), null);
  assert.equal(fromAcceptLanguage("en;q=0,ar"), "ar", "q=0 يعني رفض اللغة");
  assert.equal(negotiate(undefined, "de"), "ar");
  assert.equal(negotiate("en", "ar"), "en", "ملف الارتباط يتقدّم على الترويسة");
  assert.equal(negotiate("xx", "en"), "en", "قيمة ملف ارتباط غير صالحة تُهمَل");
});

test("لغة الطلب في مسارات الواجهة البرمجية من ملف الارتباط hs_lang", () => {
  const req = (cookie, accept) => new Request("http://x/api", { headers: { ...(cookie ? { cookie } : {}), ...(accept ? { "accept-language": accept } : {}) } });
  assert.equal(langOf(req("a=1; hs_lang=en; b=2")), "en");
  assert.equal(langOf(req("hs_lang=ar", "en")), "ar");
  assert.equal(langOf(req("xhs_lang=en", "ar")), "ar", "لا يُقبل اسم ملف ارتباط يحتوي الاسم داخله");
  assert.equal(langOf(req(null, "en-GB")), "en");
  assert.equal(makeT("en")("نعم", "Yes"), "Yes");
});

test("أنماط المراجعة والوكلاء بالإنجليزية تطابق العربية في المعرّفات والبنية", () => {
  assert.deepEqual(REVIEW_MODES_EN.map((m) => m.id), REVIEW_MODES.map((m) => m.id));
  REVIEW_MODES.forEach((m, i) => assert.equal(REVIEW_MODES_EN[i].criteria.length, m.criteria.length, m.id));
  assert.deepEqual(AGENTS_EN.map((a) => [a.id, a.icon, a.reviewMode, a.intake.map((f) => f.key).join()]), AGENTS.map((a) => [a.id, a.icon, a.reviewMode, a.intake.map((f) => f.key).join()]));
  assert.equal(agentById("coding", "en").name, "Coding agent");
  assert.equal(modeById("risk", "en").name, "Risk analyst");
  for (const m of MODELS) assert.ok(localizeModel(m, "en").description && !/[؀-ۿ]/.test(localizeModel(m, "en").description), m.id);
});

test("المراجع القاعدي بالإنجليزية: نص إنجليزي يُفحص بأنماط إنجليزية وتُكتب الملاحظات بالإنجليزية", () => {
  const weak = heuristicReview("risk", "Move the database to a bigger server and it will always be faster.", [], "en");
  assert.equal(weak.engineLabel, "Rule-based reviewer (deterministic pattern checks)");
  assert.ok(weak.findings.some((f) => f.title === "No rollback plan"));
  assert.ok(weak.findings.every((f) => !/[؀-ۿ]/.test(f.title + f.detail)));
  const strong = heuristicReview("risk", "Risk: the migration could fail. Rollback plan: keep a backup and a feature flag. Monitor error-rate alerts. Roll out gradually to a canary subset of users. No secrets or personal data are touched.", [], "en");
  assert.equal(strong.findings.length, 0, JSON.stringify(strong.findings));
  assert.ok(strong.strengths.length >= 4);
});

test("المحرك التجريبي يجيب بلغة تعليمات النظام", () => {
  const en = demoAnswer("You are a technical advisor on the HESSARA advisory platform.\nAgent id: coding", ["I get an exception when the list is empty"]);
  assert.match(en, /^> \*\*Coding agent\*\* \(demo mode\)/);
  assert.match(en, /## Diagnosis steps/);
  assert.match(en, /not the output of an AI model/);
  assert.doesNotMatch(en, /[؀-ۿ]/);
  const ar = demoAnswer("أنت مستشار تقني ضمن منصة «هسّارة»", ["تطبيقي بطيء"]);
  assert.match(ar, /## ملخص المشكلة/);
});

test("خطأ المزوّد يحمل الرسالتين: العربية في message والإنجليزية في text('en')", () => {
  const e = new ProviderError({ ar: "رسالة", en: "Message" }, "auth");
  assert.equal(e.message, "رسالة");
  assert.equal(e.text("en"), "Message");
  assert.equal(e.text("ar"), "رسالة");
  assert.equal(new ProviderError("نص واحد").text("en"), "نص واحد", "الرسالة النصية الواحدة تُستخدم للغتين");
});

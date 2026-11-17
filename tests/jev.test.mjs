// نموذج التقييم Jev في المحكّم المنظّم، مقابل خادم محاكٍ يعيد صيغة واجهة /v1/decisions في بوابة Vercel.
// يثبت: شكل الطلب (سؤال نعم/لا لكل معيار)، تحويل الاحتمالات إلى أحكام بالعتبتين، والارتداد الصريح
// إلى المراجع القاعدي عند رفض البوابة دون محاولة نموذج لغوي يمر بها أيضًا.
// لا يثبت أن Jev الحقيقي يعطي هذه الاحتمالات: ذلك يحتاج اختبارًا حيًّا بعد تفعيل رصيد البوابة.
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

const requests = [];
let handlers = [];
const server = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    requests.push({ url: req.url, headers: req.headers, body: body ? JSON.parse(body) : null });
    const h = handlers.shift();
    if (!h) { res.writeHead(500); return res.end("no handler queued"); }
    h(res);
  });
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
process.env.AI_GATEWAY_BASE_URL = `http://127.0.0.1:${server.address().port}/v1`;
process.env.AI_GATEWAY_API_KEY = "gw-key";
for (const k of ["VERCEL", "HESSARA_ROUTE", "ANTHROPIC_API_KEY"]) delete process.env[k];
test.after(() => server.close());

const { runReview } = await import("../lib/review/index.ts");
const json = (status, body) => (res) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(body)); };
const TEXT = "انقل قاعدة البيانات إلى خادم أكبر بعد قياس زمن الاستعلامات، مع نسخة احتياطية وخطة تراجع واضحة.";
const CRITERIA = ["وجود خطة تراجع", "ذكر مصدر كل رقم", "قياس قبل التغيير"];

test("Jev يحكم على كل معيار باحتمال، وتتحول الاحتمالات إلى أحكام بالعتبتين", async () => {
  handlers.push(json(200, { answers: [
    { type: "predicate", name: "c1", probability: 0.93 },
    { type: "predicate", name: "c2", probability: 0.12 },
    { type: "predicate", name: "c3", probability: 0.5 },
  ], model: "typesafe-ai/jev" }));
  const r = await runReview({ mode: "judge", text: TEXT, criteria: CRITERIA, lang: "ar" });
  assert.equal(r.engine, "jev");
  assert.deepEqual(r.verdicts.map((v) => v.status), ["pass", "fail", "unclear"]);
  assert.deepEqual(r.verdicts.map((v) => v.probability), [0.93, 0.12, 0.5]);
  assert.match(r.verdicts[0].reason, /93%/);
  assert.match(r.summary, /1 مستوفى، و1 غير مستوفى، و1 غير محسوم/);
  const q = requests.at(-1);
  assert.equal(q.url, "/v1/decisions");
  assert.equal(q.headers.authorization, "Bearer gw-key");
  assert.equal(q.body.model, "typesafe-ai/jev");
  assert.equal(q.body.input, TEXT);
  assert.deepEqual(q.body.questions.map((x) => [x.type, x.name]), [["predicate", "c1"], ["predicate", "c2"], ["predicate", "c3"]]);
  assert.match(q.body.questions[0].instructions, /وجود خطة تراجع/);
});

test("رفض البوابة: سبب صريح، ولا محاولة لنموذج لغوي عبرها، والحكم من المراجع القاعدي", async () => {
  const before = requests.length;
  handlers.push(json(403, { error: { message: "AI Gateway requires a valid credit card on file to service requests." } }));
  const r = await runReview({ mode: "judge", text: TEXT, criteria: CRITERIA, lang: "ar" });
  assert.equal(r.engine, "heuristic");
  assert.equal(requests.length, before + 1, "طلب واحد فقط: لا محاولة ثانية عبر البوابة نفسها");
  assert.match(r.limits[0], /تعذر الحكم بنموذج التقييم Jev \(بوابة Vercel تطلب إضافة بطاقة دفع صالحة/);
  assert.match(r.limits[0], /فاستُخدم المراجع القاعدي بديلًا/);
  assert.equal(r.verdicts.length, CRITERIA.length);
});

test("ردّ بلا احتمال صالح يُعدّ فشلًا صريحًا لا حكمًا", async () => {
  handlers.push(json(200, { answers: [{ name: "c1", probability: 0.9 }] })); // ناقص c2 و c3
  handlers.push(json(403, { error: { message: "credit card on file" } })); // لو حاول نموذجًا لغويًا عبر البوابة
  const r = await runReview({ mode: "judge", text: TEXT, criteria: CRITERIA, lang: "en" });
  assert.notEqual(r.engine, "jev");
  assert.match(r.limits[0], /Jev evaluation model could not judge \(Jev returned no valid probability/);
  handlers = [];
});

test("الأنماط الأخرى لا تستدعي Jev، والمراجعة القاعدية الصريحة لا ترسل شيئًا", async () => {
  const before = requests.length;
  handlers.push(json(403, { error: { message: "credit card on file" } })); // نموذج لغوي عبر البوابة
  await runReview({ mode: "risk", text: TEXT, criteria: [], lang: "ar" });
  assert.ok(requests.slice(before).every((q) => q.url !== "/v1/decisions"));
  handlers = [];
  const n = requests.length;
  const r = await runReview({ mode: "judge", text: TEXT, criteria: CRITERIA, engine: "heuristic", lang: "ar" });
  assert.equal(r.engine, "heuristic");
  assert.equal(requests.length, n);
});

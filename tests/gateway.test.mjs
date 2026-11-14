// طريق بوابة Vercel للذكاء الاصطناعي، مقابل خادم محاكٍ محلي يعيد صيغة chat/completions المتوافقة مع OpenAI.
// يثبت: اختيار الطريق (البوابة أولًا ثم المفتاح المباشر)، شكل الطلب ومصادقته، تحويل أخطاء البوابة إلى رسائل واضحة،
// وحفظ نتيجة آخر اختبار في قاعدة البيانات حتى تقرأها نسخة خادم أخرى.
// لا يثبت أن البوابة الحقيقية تقبل الطلب أو أن في الحساب رصيدًا: ذلك يحتاج اختبارًا حيًّا بعد النشر.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

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
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hessara-gw-"));
process.env.HESSARA_DB_PATH = path.join(dir, "test.db");
process.env.AI_GATEWAY_BASE_URL = `http://127.0.0.1:${server.address().port}/v1`;
for (const k of ["AI_GATEWAY_API_KEY", "VERCEL", "HESSARA_ROUTE", "DATABASE_URL", "HESSARA_PGLITE", "OPENAI_API_KEY", "OPENAI_MODEL", "LOCAL_MODEL", "LOCAL_BASE_URL"]) delete process.env[k];
test.after(() => { server.close(); fs.rmSync(dir, { recursive: true, force: true }); });

const P = await import("../lib/providers/index.ts");
const { requestToken } = await import("../lib/providers/gateway.ts");
const { collect, ProviderError } = await import("../lib/providers/types.ts");
const { modelById } = await import("../lib/catalog/models.ts");

const sse = (chunks) => (res) => {
  res.writeHead(200, { "content-type": "text/event-stream" });
  for (const c of chunks) res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: c } }] })}\n\n`);
  res.end("data: [DONE]\n\n");
};
const jsonError = (status, message) => (res) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: { message, type: "error" } }));
};
const ask = (m) => collect(m.adapter.stream({ model: m.apiModel, system: "s", messages: [{ role: "user", content: "مرحبا" }] }));

test("دون بوابة ولا مفاتيح: النماذج السحابية غير مهيّأة، وتُذكر المتغيرات الناقصة", () => {
  assert.equal(P.resolveModel("gpt"), null);
  assert.deepEqual(P.missingConfig(modelById("gpt")), ["OPENAI_API_KEY", "OPENAI_MODEL"]);
  assert.equal(P.modelView(modelById("gpt")).status, "not_configured");
});

test("مفتاح البوابة يجعل كل نموذج له معرّف فيها متاحًا، ويرسل الطلب إليها بالمعرّف والمفتاح الصحيحين", async () => {
  process.env.AI_GATEWAY_API_KEY = "gw-key";
  try {
    for (const id of ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5", "gpt", "gemini", "deepseek", "qwen", "llama"]) {
      const m = P.resolveModel(id);
      assert.ok(m, `${id} يجب أن يكون متاحًا عبر البوابة`);
      assert.equal(m.route, "gateway");
      assert.equal(m.apiModel, modelById(id).gateway);
      assert.equal(P.modelView(modelById(id)).status, "configured");
    }
    assert.equal(P.resolveModel("local"), null, "النموذج المحلي لا يمر عبر البوابة");
    handlers.push(sse(["أهلًا", " بك"]));
    assert.equal(await ask(P.resolveModel("gemini")), "أهلًا بك");
    const r = requests.at(-1);
    assert.equal(r.url, "/v1/chat/completions");
    assert.equal(r.headers.authorization, "Bearer gw-key");
    assert.equal(r.body.model, "google/gemini-3.5-flash");
    assert.equal(r.body.stream, true);
    assert.deepEqual(r.body.messages[0], { role: "system", content: "s" });
  } finally {
    delete process.env.AI_GATEWAY_API_KEY;
  }
});

test("على Vercel دون مفتاح: يُستخدم رمز OIDC الخاص بالطلب الجاري", async () => {
  process.env.VERCEL = "1";
  try {
    const m = requestToken.run("oidc-of-this-request", () => P.resolveModel("llama"));
    assert.equal(m.route, "gateway");
    handlers.push(sse(["تم"]));
    assert.equal(await ask(m), "تم");
    assert.equal(requests.at(-1).headers.authorization, "Bearer oidc-of-this-request");
  } finally {
    delete process.env.VERCEL;
  }
});

test("البوابة أولًا، ويعيد HESSARA_ROUTE=direct المفاتيح المباشرة", () => {
  process.env.AI_GATEWAY_API_KEY = "gw-key";
  process.env.OPENAI_API_KEY = "sk-direct";
  process.env.OPENAI_MODEL = "gpt-direct";
  try {
    assert.equal(P.resolveModel("gpt").route, "gateway");
    process.env.HESSARA_ROUTE = "direct";
    const m = P.resolveModel("gpt");
    assert.equal(m.route, "direct");
    assert.equal(m.apiModel, "gpt-direct");
    assert.equal(P.resolveModel("gemini"), null, "دون مفتاح Gemini المباشر لا طريق له");
  } finally {
    for (const k of ["AI_GATEWAY_API_KEY", "OPENAI_API_KEY", "OPENAI_MODEL", "HESSARA_ROUTE"]) delete process.env[k];
  }
});

test("أخطاء البوابة: نقص الرصيد والمصادقة ومعرّف غير موجود برسائل واضحة لا بنص البوابة الخام", async () => {
  process.env.AI_GATEWAY_API_KEY = "gw-key";
  try {
    const m = P.resolveModel("deepseek");
    const cases = [
      [jsonError(402, "Payment required"), /رصيد بوابة Vercel/],
      [jsonError(403, "Insufficient funds: please top up your credits"), /رصيد بوابة Vercel/],
      [jsonError(401, "Invalid token"), /AI_GATEWAY_API_KEY/],
      [jsonError(404, "Model not found"), /غير موجود في بوابة Vercel/],
      [jsonError(429, "Too many requests"), /حد الطلبات/],
    ];
    for (const [h, re] of cases) {
      handlers.push(h);
      await assert.rejects(ask(m), (e) => e instanceof ProviderError && re.test(e.message) && !/Payment|funds|Invalid|not found|Too many/.test(e.message));
    }
  } finally {
    delete process.env.AI_GATEWAY_API_KEY;
  }
});

test("النموذج المحلي لا يُعرض على Vercel ما لم يُضبط عنوانه", () => {
  const ids = () => P.visibleModels().map((d) => d.id);
  assert.ok(ids().includes("local"), "محليًا يبقى ظاهرًا بحالته");
  process.env.VERCEL = "1";
  try {
    assert.ok(!ids().includes("local"));
    process.env.LOCAL_MODEL = "llama3"; process.env.LOCAL_BASE_URL = "http://10.0.0.5:11434/v1";
    assert.ok(ids().includes("local"), "مع عنوان مضبوط يظهر");
  } finally {
    for (const k of ["VERCEL", "LOCAL_MODEL", "LOCAL_BASE_URL"]) delete process.env[k];
  }
});

test("نتيجة الاختبار تُحفظ في القاعدة وتقرؤها نسخة أخرى، وتُهمل إذا تغيّر طريق الاتصال", async () => {
  process.env.AI_GATEWAY_API_KEY = "gw-key";
  try {
    await P.recordCheck("qwen", true);
    await P.recordCheck("gpt", false, { ar: "رصيد بوابة Vercel لا يكفي.", en: "Too low." });
    globalThis.__hessaraChecks.clear(); // كأنها نسخة خادم جديدة لا تعرف شيئًا في ذاكرتها
    await P.syncChecks(0);
    assert.equal(P.modelView(modelById("qwen")).status, "ready");
    const gpt = P.modelView(modelById("gpt"), "ar");
    assert.equal(gpt.status, "failed");
    assert.equal(gpt.checkError, "رصيد بوابة Vercel لا يكفي.");
    assert.equal(P.modelView(modelById("gpt"), "en").checkError, "Too low.");
    // تحويل الطريق إلى المفتاح المباشر يجعل النتيجة السابقة غير ذات صلة
    process.env.HESSARA_ROUTE = "direct";
    process.env.QWEN_API_KEY = "k"; process.env.QWEN_MODEL = "qwen-direct"; process.env.QWEN_BASE_URL = "http://127.0.0.1:9/v1";
    assert.equal(P.modelView(modelById("qwen")).status, "configured");
    const listed = await P.listModels(true);
    assert.equal(listed.find((m) => m.id === "qwen").route, "direct");
  } finally {
    for (const k of ["AI_GATEWAY_API_KEY", "HESSARA_ROUTE", "QWEN_API_KEY", "QWEN_MODEL", "QWEN_BASE_URL"]) delete process.env[k];
  }
});

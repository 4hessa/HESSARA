// تحويل الكلام إلى نص، مقابل خادم محاكٍ لواجهة audio/transcriptions المتوافقة مع OpenAI.
// يثبت: شروط الإعداد، وما يُكشف للمتصفح، وشكل الطلب ومصادقته، وتحويل أخطاء الخدمة إلى رسائل واضحة.
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

const hits = [];
let reply = (res) => { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify({ text: "  سؤال عن الشبكات  " })); };
const server = http.createServer((req, res) => {
  const parts = [];
  req.on("data", (c) => parts.push(c));
  req.on("end", () => {
    hits.push({ url: req.url, auth: req.headers.authorization, type: req.headers["content-type"], body: Buffer.concat(parts).toString("latin1") });
    reply(res);
  });
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
test.after(() => server.close());

const VARS = ["WHISPER_API_KEY", "WHISPER_BASE_URL", "WHISPER_MODEL"];
for (const k of VARS) delete process.env[k];
const T = await import("../lib/transcribe.ts");
const { ProviderError } = await import("../lib/providers/types.ts");
const cfg = { key: "k", baseUrl: `http://127.0.0.1:${server.address().port}/v1`, model: "whisper-x" };
const audio = (n = 100) => new Blob([Buffer.alloc(n, 1)], { type: "audio/webm" });

test("الإعداد يتطلب المفتاح والعنوان والنموذج معًا، ولا يصل إلى المتصفح إلا اسم الخادم", () => {
  try {
    assert.equal(T.sttConfig(), null);
    assert.equal(T.sttPublic(), null);
    process.env.WHISPER_API_KEY = "secret";
    process.env.WHISPER_BASE_URL = "https://api.example.com/openai/v1/";
    assert.equal(T.sttConfig(), null, "دون النموذج لا يُعرض الإدخال الصوتي");
    process.env.WHISPER_MODEL = "whisper-x";
    assert.deepEqual(T.sttConfig(), { key: "secret", baseUrl: "https://api.example.com/openai/v1", model: "whisper-x" });
    assert.deepEqual(T.sttPublic(), { host: "api.example.com" });
    assert.ok(!JSON.stringify(T.sttPublic()).includes("secret"));
  } finally {
    for (const k of VARS) delete process.env[k];
  }
});

test("يُرسل الملف بالنموذج واللغة والمفتاح إلى audio/transcriptions، ويعيد النص منقّحًا", async () => {
  assert.equal(await T.transcribe(cfg, audio(), "audio/webm", "ar"), "سؤال عن الشبكات");
  const h = hits.at(-1);
  assert.equal(h.url, "/v1/audio/transcriptions");
  assert.equal(h.auth, "Bearer k");
  assert.match(h.type, /^multipart\/form-data; boundary=/);
  assert.match(h.body, /name="model"\r\n\r\nwhisper-x\r\n/);
  assert.match(h.body, /name="language"\r\n\r\nar\r\n/);
  assert.match(h.body, /name="file"; filename="voice\.webm"\r\nContent-Type: audio\/webm/);
  await T.transcribe(cfg, new Blob([Buffer.alloc(10)]), "audio/mp4", "en");
  assert.match(hits.at(-1).body, /filename="voice\.mp4"/);
  assert.match(hits.at(-1).body, /name="language"\r\n\r\nen\r\n/);
});

test("أخطاء الخدمة برسائل واضحة، والصيغة غير الصوتية تُرفض قبل أي إرسال", async () => {
  try {
    for (const [status, kind] of [[401, "auth"], [429, "rate_limit"], [400, "bad_request"], [413, "bad_request"], [503, "unavailable"]]) {
      reply = (res) => { res.writeHead(status, { "content-type": "application/json" }); res.end('{"error":{"message":"x"}}'); };
      await assert.rejects(T.transcribe(cfg, audio(10), "audio/ogg", "ar"), (e) => e instanceof ProviderError && e.kind === kind && !!e.text("ar") && !!e.text("en"), String(status));
    }
    reply = (res) => { res.writeHead(200, { "content-type": "application/json" }); res.end('{"text":"   "}'); };
    assert.equal(await T.transcribe(cfg, audio(10), "audio/ogg", "ar"), "", "صمت: نص فارغ يعالجه المسار برسالة");
    const before = hits.length;
    await assert.rejects(T.transcribe(cfg, new Blob(["x"]), "text/plain", "ar"), (e) => e instanceof ProviderError);
    assert.equal(hits.length, before, "لم يُرسل شيء");
  } finally {
    reply = (res) => { res.writeHead(200, { "content-type": "application/json" }); res.end('{"text":"ok"}'); };
  }
});

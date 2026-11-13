// اختبار موائم Anthropic مقابل خادم محاكٍ محلي يعيد صيغة واجهة Messages الفعلية (بث SSE ورسائل الخطأ).
// يثبت شكل الطلب الذي ترسله الحزمة الرسمية، وتحويل الأخطاء إلى رسائل واضحة، دون مفتاح حقيقي ودون شبكة.
// لا يثبت أن المزوّد الحقيقي يقبل الطلب: ذلك يحتاج اختبارًا حيًّا بمفتاح.
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

const requests = [];
let handlers = [];
const server = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    requests.push({ method: req.method, url: req.url, headers: req.headers, body: body ? JSON.parse(body) : null });
    const h = handlers.shift();
    if (!h) return apiError(res, 500, "api_error", "no handler queued");
    h(res);
  });
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${server.address().port}`;
process.env.ANTHROPIC_API_KEY = "test-key";
delete process.env.ANTHROPIC_WORKSPACE_ID;
test.after(() => server.close());

const { anthropicAdapter } = await import("../lib/providers/anthropic.ts");
const { ProviderError } = await import("../lib/providers/types.ts");

function sse(res, { text = ["مر", "حبا"], stop = "end_turn", hold = false } = {}) {
  res.writeHead(200, { "content-type": "text/event-stream" });
  const ev = (type, data) => res.write(`event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`);
  ev("message_start", { message: { id: "msg_test", type: "message", role: "assistant", model: "m", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 5, output_tokens: 1 } } });
  ev("content_block_start", { index: 0, content_block: { type: "text", text: "" } });
  for (const t of text) ev("content_block_delta", { index: 0, delta: { type: "text_delta", text: t } });
  if (hold) return; // يبقي الاتصال مفتوحًا لاختبار الإيقاف
  ev("content_block_stop", { index: 0 });
  ev("message_delta", { delta: { stop_reason: stop, stop_sequence: null }, usage: { output_tokens: 3 } });
  ev("message_stop", {});
  res.end();
}
function apiError(res, status, type, message) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify({ type: "error", error: { type, message } }));
}
const call = (model, signal) => anthropicAdapter.stream({ model, system: "s", messages: [{ role: "user", content: "سؤال" }], signal, maxTokens: 100 });
async function collectAll(it) { let out = ""; for await (const t of it) out += t; return out; }
async function failure(it) {
  let partial = "";
  try { for await (const t of it) partial += t; } catch (e) { return { e, partial }; }
  assert.fail("كان يُتوقع خطأ");
}
const reset = () => { requests.length = 0; handlers = []; };

test("Opus 5.5: يرسل صيغة إعادة التوجيه وترويسة البيتا والمفتاح، ويبث النص", async () => {
  reset(); handlers.push((res) => sse(res));
  assert.equal(await collectAll(call("claude-opus-5-5")), "مرحبا");
  const r = requests[0];
  assert.match(r.url, /^\/v1\/messages/);
  // الحزمة 1.8 ترسل المفتاح في Authorization: Bearer (سلوك إصدار الواجهة 2026-10-21 الموثّق).
  assert.equal(r.headers.authorization, "Bearer test-key");
  assert.match(String(r.headers["anthropic-beta"]), /server-side-fallback-2026-07-01/);
  assert.equal(r.body.fallbacks, "default");
  assert.equal(r.body.stream, true);
  assert.equal(r.body.model, "claude-opus-5-5");
  assert.equal(r.body.max_tokens, 100);
  assert.equal(r.headers["anthropic-workspace-id"], undefined);
});

test("Haiku 5.5: لا يرسل صيغة إعادة التوجيه (غير مدعومة له)", async () => {
  reset(); handlers.push((res) => sse(res));
  await collectAll(call("claude-haiku-5-5"));
  assert.equal(requests[0].body.fallbacks, undefined);
  assert.doesNotMatch(String(requests[0].headers["anthropic-beta"] ?? ""), /server-side-fallback/);
});

test("إن رُفضت صيغة إعادة التوجيه قبل أي مخرجات، يُعاد الطلب دونها مرة واحدة", async () => {
  reset();
  handlers.push((res) => apiError(res, 400, "invalid_request_error", "fallbacks: Extra inputs are not permitted"));
  handlers.push((res) => sse(res));
  assert.equal(await collectAll(call("claude-sonnet-5-5")), "مرحبا");
  assert.equal(requests.length, 2);
  assert.equal(requests[1].body.fallbacks, undefined);
});

test("ترويسة مساحة العمل تُرسل عند ضبط ANTHROPIC_WORKSPACE_ID", async () => {
  reset(); handlers.push((res) => sse(res));
  process.env.ANTHROPIC_WORKSPACE_ID = "wrkspc_test";
  try { await collectAll(call("claude-opus-5-5")); } finally { delete process.env.ANTHROPIC_WORKSPACE_ID; }
  assert.equal(requests[0].headers["anthropic-workspace-id"], "wrkspc_test");
});

test("مفتاح غير مرتبط بمساحة عمل: رسالة تذكر المتغير المطلوب، دون إعادة محاولة", async () => {
  reset();
  handlers.push((res) => apiError(res, 400, "invalid_request_error",
    "This API key is not scoped to a workspace, so this request must include the anthropic-workspace-id header with the ID of the workspace to use. Add the header, or use an API key that is scoped to a workspace."));
  const { e } = await failure(call("claude-opus-5-5"));
  assert.ok(e instanceof ProviderError);
  assert.match(e.message, /ANTHROPIC_WORKSPACE_ID/);
  assert.equal(requests.length, 1);
});

test("رصيد غير كافٍ: رسالة واضحة", async () => {
  reset();
  handlers.push((res) => apiError(res, 400, "invalid_request_error", "Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits."));
  const { e } = await failure(call("claude-haiku-5-5"));
  assert.match(e.message, /رصيد/);
});

test("مفتاح غير صالح (401): نوع الخطأ auth", async () => {
  reset(); handlers.push((res) => apiError(res, 401, "authentication_error", "invalid x-api-key"));
  const { e } = await failure(call("claude-haiku-5-5"));
  assert.equal(e.kind, "auth");
});

test("نموذج غير متاح (404): رسالة تخص النموذج", async () => {
  reset(); handlers.push((res) => apiError(res, 404, "not_found_error", "model: claude-x"));
  const { e } = await failure(call("claude-haiku-5-5"));
  assert.match(e.message, /النموذج غير متاح/);
});

test("بلوغ الحد الأقصى للطول: النص الجزئي يصل ثم خطأ truncated", async () => {
  reset(); handlers.push((res) => sse(res, { stop: "max_tokens" }));
  const { e, partial } = await failure(call("claude-haiku-5-5"));
  assert.equal(partial, "مرحبا");
  assert.equal(e.kind, "truncated");
});

test("امتناع النموذج: خطأ refused", async () => {
  reset(); handlers.push((res) => sse(res, { stop: "refusal", text: [] }));
  const { e } = await failure(call("claude-opus-5-5"));
  assert.equal(e.kind, "refused");
});

test("إيقاف التوليد من المستخدم: ينتهي البث دون خطأ", async () => {
  reset(); handlers.push((res) => sse(res, { text: ["جزء"], hold: true }));
  const ctl = new AbortController();
  let got = "";
  for await (const t of call("claude-haiku-5-5", ctl.signal)) { got += t; ctl.abort(); }
  assert.equal(got, "جزء");
});

// اختبار شامل لمسار النماذج اللغوية: التطبيق الحقيقي في المتصفح، ومزوّد Anthropic محاكٍ محليًا
// يعيد صيغة واجهة Messages الفعلية (بث SSE ورسائل الخطأ). يغطي ما لا يصل إليه الاختبار بالمحرك التجريبي:
// اختبار الاتصال، نافذة الموافقة، وسم «مولَّد بالذكاء الاصطناعي»، تعليمات الوكيل، المراجعة اللغوية،
// النسخة المنقّحة، وعرض أخطاء المزوّد. لا يثبت أن المزوّد الحقيقي يقبل الطلبات: ذلك يحتاج مفتاحًا.
// التشغيل: npm run build && npm run e2e:llm
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const PORT = 4321;
const BASE = `http://localhost:${PORT}`;
const OUT = path.resolve("test-output", "llm");
fs.mkdirSync(OUT, { recursive: true });
const dbPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "hessara-llm-")), "e2e.db");
const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`); };

// ───── مزوّد محاكٍ ─────
const calls = [];
let failNext = null; // { status, type, message } لمحاكاة خطأ في الطلب التالي
const ANSWER = `## ملخص المشكلة
تطبيق يعتمد على نموذج لغوي واستجابته بطيئة.

## الخطوات المقترحة
1. **قِس أولًا** زمن أول رمز والزمن الكلي.
2. فعّل البث إن لم يكن مفعّلًا.

## حدود الثقة
هذه أسباب شائعة لا تشخيص لتطبيقك.`;
const REVIEW = { summary: "الإجابة منظمة لكنها لا تذكر خطة تراجع.", strengths: ["تبدأ بالقياس"], findings: [{ severity: "medium", title: "لا خطة تراجع", detail: "لم تُذكر طريقة العودة.", quote: "فعّل البث", suggestion: "أضف مفتاح تبديل." }], verdicts: [], needsHuman: true };
const mock = http.createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    const body = JSON.parse(raw || "{}");
    calls.push({ headers: req.headers, body });
    if (failNext) { const f = failNext; failNext = null; res.writeHead(f.status, { "content-type": "application/json" }); return res.end(JSON.stringify({ type: "error", error: { type: f.type, message: f.message } })); }
    const sys = String(body.system ?? "");
    const text = sys.includes("أنت مراجع نقدي مستقل") ? "```json\n" + JSON.stringify(REVIEW) + "\n```"
      : sys.includes("أنت محرر تقني") ? "قِس زمن أول رمز والزمن الكلي أولًا، ثم فعّل البث خلف مفتاح تبديل يتيح التراجع."
      : sys === "أجب بكلمة واحدة." ? "جاهز"
      : ANSWER;
    res.writeHead(200, { "content-type": "text/event-stream" });
    const ev = (type, data) => res.write(`event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`);
    ev("message_start", { message: { id: "msg_mock", type: "message", role: "assistant", model: body.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 1 } } });
    ev("content_block_start", { index: 0, content_block: { type: "text", text: "" } });
    const parts = text.match(/[\s\S]{1,24}/g) ?? [];
    let i = 0;
    const tick = () => {
      if (res.destroyed) return;
      if (i < parts.length) { ev("content_block_delta", { index: 0, delta: { type: "text_delta", text: parts[i++] } }); return setTimeout(tick, 8); }
      ev("content_block_stop", { index: 0 });
      ev("message_delta", { delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 42 } });
      ev("message_stop", {});
      res.end();
    };
    tick();
  });
});
await new Promise((r) => mock.listen(0, "127.0.0.1", r));

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)], {
  env: {
    ...process.env, HESSARA_DB_PATH: dbPath, HESSARA_INSECURE_COOKIE: "1",
    ANTHROPIC_BASE_URL: `http://127.0.0.1:${mock.address().port}`, ANTHROPIC_API_KEY: "test-key",
    NODE_OPTIONS: "--disable-warning=ExperimentalWarning",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));
const waitUp = async () => { for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE + "/api/models")).ok) return; } catch {} await new Promise((r) => setTimeout(r, 500)); } throw new Error("server did not start\n" + serverLog); };

let browser;
try {
  await waitUp();
  browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 860 }, locale: "ar" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await ctx.request.post(BASE + "/api/auth/signup", { data: { name: "هيا", email: "haya@example.com", password: "llm-path-test-1", accept: true } });

  // ── اختبار الاتصال من صفحة النماذج ──
  await page.goto(BASE + "/models");
  const opus = page.locator("article#claude-opus-5-5");
  check("Claude Opus 5.5 مهيّأ ولم يُختبر بعد", (await opus.locator(".badge").first().innerText()).includes("مهيّأ"));
  await opus.getByRole("button", { name: "التفاصيل" }).click();
  await page.getByRole("button", { name: "اختبر الاتصال" }).click();
  await page.getByText("نجح اختبار الاتصال.").waitFor();
  check("اختبار الاتصال ينجح ويحوّل الحالة إلى «يعمل»", (await page.locator("dialog[open] .badge").first().innerText()).includes("يعمل"));
  const checkCall = calls.at(-1);
  check("طلب الاختبار قصير ويحمل المفتاح", checkCall.body.max_tokens === 2000 && checkCall.headers.authorization === "Bearer test-key");
  await page.keyboard.press("Escape");

  // ── استشارة: الافتراضي هو أول نموذج لغوي مهيّأ، ونافذة الموافقة تظهر قبل أول إرسال ──
  await page.goto(BASE + "/consult/new");
  check("النموذج الافتراضي في استشارة جديدة هو Claude Opus 5.5", (await page.locator(".picker-btn").first().innerText()).includes("Claude Opus 5.5"));
  await page.locator("#quick-consult").fill("تطبيقي المعتمد على نموذج لغوي بطيء، ما السبب؟");
  await page.locator("form.composer").getByRole("button", { name: "أرسل" }).click();
  await page.waitForURL(/\/consult\/[\w-]{8,}$/);
  const callsBefore = calls.length;
  await page.getByRole("button", { name: "أوافق وأتابع" }).waitFor();
  check("نافذة الموافقة تظهر ولا يُرسل شيء للمزوّد قبلها", calls.length === callsBefore);
  check("لا مؤشر «يكتب الإجابة» أثناء انتظار الموافقة", (await page.locator(".typing").count()) === 0 && (await page.getByRole("button", { name: "أوقف التوليد" }).count()) === 0);
  await page.waitForTimeout(400); // اكتمال حركة ظهور النافذة قبل اللقطة
  await page.screenshot({ path: path.join(OUT, "01-consent.png") });
  await page.getByRole("button", { name: "أوافق وأتابع" }).click();
  await page.getByRole("button", { name: "أعد التوليد" }).waitFor({ timeout: 30000 });
  const meta = await page.locator(".msg-meta").first().innerText();
  check("الإجابة موسومة باسم النموذج و«مولَّد بالذكاء الاصطناعي»", meta.includes("Claude Opus 5.5") && meta.includes("مولَّد بالذكاء الاصطناعي"));
  check("نص الإجابة المبثوث معروض كاملًا ومنسّقًا", await page.locator(".prose h3", { hasText: "حدود الثقة" }).isVisible());
  const consultCall = calls.at(-1);
  check("طلب الاستشارة: تعليمات المنصة، رسالة المستخدم، صيغة إعادة التوجيه",
    String(consultCall.body.system).includes("منصة «هسّارة»") && consultCall.body.messages.at(-1).content.includes("بطيء") && consultCall.body.fallbacks === "default");
  await page.screenshot({ path: path.join(OUT, "02-answer.png") });

  // ── مراجعة نقدية بالنموذج اللغوي ──
  await page.getByRole("button", { name: "مراجعة نقدية" }).first().click();
  await page.getByRole("button", { name: "شغّل المراجعة" }).click();
  await page.locator(".finding").first().waitFor();
  check("المراجعة تجري بالنموذج اللغوي ويُصرَّح بذلك", await page.getByText("مراجعة بنموذج لغوي: Claude Opus 5.5").isVisible());
  check("ملاحظة المراجع اللغوي معروضة", await page.getByText("لا خطة تراجع").isVisible());
  await page.screenshot({ path: path.join(OUT, "03-review.png") });

  // ── متابعة تحمل السجل ──
  await page.locator("#ws-input").fill("وما أول قياس أبدأ به؟");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelectorAll(".msg-meta").length >= 2, null, { timeout: 30000 });
  await page.getByRole("button", { name: "أعد التوليد" }).waitFor({ timeout: 30000 });
  const follow = calls.at(-1).body.messages;
  check("المتابعة ترسل السجل كاملًا بالتناوب الصحيح", follow.length === 3 && follow[0].role === "user" && follow[1].role === "assistant" && follow[2].role === "user");

  // ── خطأ مزوّد: رسالة واضحة، والنص محفوظ، وإعادة المحاولة تعمل ──
  failNext = { status: 400, type: "invalid_request_error", message: "Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits." };
  await page.locator("#ws-input").fill("سؤال سيفشل");
  await page.keyboard.press("Enter");
  await page.locator(".notice-danger").waitFor({ timeout: 20000 });
  check("خطأ نفاد الرصيد يُعرض برسالة عربية واضحة", (await page.locator(".notice-danger").innerText()).includes("رصيد حساب Anthropic لا يكفي"));
  await page.waitForTimeout(800); // التمرير ناعم في الواجهة
  const inView = await page.evaluate(() => {
    const n = document.querySelector(".notice-danger").getBoundingClientRect();
    const box = document.querySelector(".ws-scroll").getBoundingClientRect();
    return n.top >= box.top - 1 && n.bottom <= box.bottom + 1;
  });
  check("رسالة الخطأ داخل مجال الرؤية دون تمرير يدوي", inView);
  await page.screenshot({ path: path.join(OUT, "04-error.png") });
  await page.getByRole("button", { name: "أعد المحاولة" }).click();
  await page.waitForFunction(() => !document.querySelector(".notice-danger"), null, { timeout: 30000 });
  await page.getByRole("button", { name: "أعد التوليد" }).waitFor({ timeout: 30000 });
  check("إعادة المحاولة بعد الخطأ تنجح", (await page.locator(".msg-meta").count()) >= 3);
  await page.goto(BASE + "/models");
  check("بعد نجاح إعادة المحاولة تعود حالة النموذج إلى «يعمل»", (await page.locator("article#claude-opus-5-5 .badge").first().innerText()).includes("يعمل"));

  // ── وكيل متخصص: تعليماته تصل إلى المزوّد ولا تصل إلى المتصفح ──
  await page.goto(BASE + "/consult/new?agent=coding");
  await page.locator("#in-error").fill("TypeError: cannot read properties of undefined (reading 'map')");
  await page.getByRole("button", { name: "ابدأ الاستشارة" }).click();
  await page.waitForURL(/\/consult\/[\w-]{8,}$/);
  await page.getByRole("button", { name: "أعد التوليد" }).waitFor({ timeout: 30000 });
  const agentSys = String(calls.at(-1).body.system);
  check("تعليمات وكيل البرمجة التخصصية تصل إلى المزوّد", agentSys.includes("معرّف الوكيل: coding") && agentSys.includes("أنت مهندس برمجيات يراجع شفرة زميل"));
  const html = await (await ctx.request.get(page.url())).text();
  check("تعليمات الوكيل لا تظهر في صفحة المتصفح", !html.includes("أنت مهندس برمجيات يراجع شفرة زميل"));

  // ── المختبر: مراجعة لغوية ثم نسخة منقّحة يولّدها النموذج ──
  await page.goto(BASE + "/lab");
  await page.locator("#lab-text").fill("انقل قاعدة البيانات إلى خادم أكبر وسيصبح التطبيق أسرع دائمًا.");
  await page.getByRole("button", { name: "شغّل المراجعة" }).click();
  await page.getByText("مراجعة بنموذج لغوي: Claude Opus 5.5").waitFor();
  await page.getByRole("button", { name: "ولّد نسخة منقّحة بالنموذج" }).click();
  await page.locator(".diff ins").first().waitFor({ timeout: 30000 });
  check("المختبر: نسخة منقّحة مولَّدة وفروقها معروضة", (await page.locator("#lab-revised").inputValue()).includes("مفتاح تبديل"));
  await page.screenshot({ path: path.join(OUT, "05-lab.png"), fullPage: true });

  check("لا أخطاء JavaScript في المتصفح", errors.length === 0, errors.slice(0, 3).join(" | "));
} catch (e) {
  check("تنفيذ السكربت", false, String(e.stack || e).slice(0, 700));
} finally {
  await browser?.close();
  server.kill();
  mock.close();
  const failed = results.filter((r) => !r.ok);
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.length - failed.length}/${results.length} نجح`);
  process.exit(failed.length ? 1 : 0);
}

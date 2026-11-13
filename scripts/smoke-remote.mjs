// فحص حي لنسخة منشورة بنموذج حقيقي: يُنشئ حسابًا اختباريًا، يختبر الاتصال، يجري استشارة ومراجعة،
// ثم يحذف الحساب. كل استدعاء للنموذج يُحتسب على مفتاح المزوّد (بضعة استدعاءات قصيرة).
// التشغيل: SMOKE_URL="https://<deployment>/?_vercel_share=..." node scripts/smoke-remote.mjs
// (رابط المشاركة يتجاوز حماية Vercel Authentication للمعاينات؛ دونه يكفي عنوان النسخة إن لم تكن محمية.)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const START = process.env.SMOKE_URL;
if (!START) { console.error("SMOKE_URL مطلوب"); process.exit(2); }
const BASE = new URL(START).origin;
const OUT = path.resolve("test-output", "remote");
fs.mkdirSync(OUT, { recursive: true });
const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`); };
const email = `smoke-${Date.now()}@example.com`;
const password = `smoke-${Math.random().toString(36).slice(2)}-Aa1`;

let browser, page;
let signedUp = false;
const errors = [];
try {
  // خلف وسيط شبكة (كما في بيئات البناء السحابية) يمرّ المتصفح عبره؛ الثقة بشهادته مضبوطة في النظام.
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  browser = await chromium.launch(proxy ? { proxy: { server: proxy, bypass: "localhost,127.0.0.1" } } : {});
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 860 }, locale: "ar" });
  page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(START); // يضع ملف ارتباط المشاركة ثم يحوّل إلى الموقع
  check("الصفحة الرئيسية تُفتح بالعربية", (await page.locator("h1").first().innerText()).includes("تصنع الفرق") && (await page.locator("html").getAttribute("dir")) === "rtl");

  const anon = await (await ctx.request.get(BASE + "/api/models")).json();
  const status = Object.fromEntries(anon.models.map((m) => [m.id, m.status]));
  console.log("حالة النماذج:", JSON.stringify(status));
  check("نماذج Claude مهيّأة على الخادم (المفتاح موجود)", status["claude-opus-5-5"] !== "not_configured", status["claude-opus-5-5"]);

  // إنشاء الحساب عبر الواجهة: يمرّ بفحص مصدر الطلب خلف الاستضافة
  await page.goto(BASE + "/login?mode=signup");
  await page.locator("#name").fill("فحص حي");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator("input[name=accept]").check();
  await page.getByRole("button", { name: "أنشئ الحساب" }).click();
  signedUp = true; // من هنا قد يوجد الحساب، فيُحذف في النهاية مهما حدث بعدها
  await page.waitForURL(/\/home/, { timeout: 30000 });
  check("إنشاء الحساب يعمل خلف الاستضافة (فحص مصدر الطلب مقبول)", true);

  for (const id of ["claude-haiku-5-5", "claude-opus-5-5"]) {
    const t = Date.now();
    const r = await ctx.request.post(`${BASE}/api/models/${id}/check`, { headers: { origin: BASE } });
    const j = await r.json().catch(() => ({}));
    check(`اختبار الاتصال: ${id}`, j.model?.status === "ready", `${j.model?.status ?? r.status()} ${j.model?.checkError ?? j.error ?? ""} (${Date.now() - t}ms)`);
  }

  await page.goto(BASE + "/consult/new");
  console.log("النموذج الافتراضي:", await page.locator(".picker-btn").first().innerText());
  await page.locator("#quick-consult").fill("أجب باختصار في ثلاث نقاط: ما أول ما أقيسه إن كان تطبيقي المعتمد على نموذج لغوي بطيئًا؟");
  await page.locator("form.composer").getByRole("button", { name: "أرسل" }).click();
  await page.waitForURL(/\/consult\/[\w-]{8,}$/, { timeout: 30000 });
  await page.getByRole("button", { name: "أوافق وأتابع" }).click({ timeout: 30000 });
  const t0 = Date.now();
  await page.locator(".msg-meta").first().waitFor({ timeout: 60000 });
  const firstText = Date.now();
  await page.waitForFunction(() => document.querySelector(".prose")?.textContent?.length > 20 || document.querySelector(".notice-danger"), null, { timeout: 120000 });
  const ttft = Date.now() - t0;
  await Promise.race([
    page.getByRole("button", { name: "أعد التوليد" }).waitFor({ timeout: 300000 }),
    page.locator(".notice-danger").waitFor({ timeout: 300000 }),
  ]);
  const total = Date.now() - t0;
  const failed = await page.locator(".notice-danger").count();
  // عند خطأ المزوّد تُزال رسالة المساعد الفارغة ويبقى التنبيه، فلا وسم يُقرأ
  const meta = failed ? "" : await page.locator(".msg-meta").first().innerText();
  const answer = failed ? "" : await page.locator(".prose").first().innerText();
  check("استشارة حقيقية: إجابة مكتملة وموسومة بالنموذج", !failed && meta.includes("مولَّد بالذكاء الاصطناعي") && answer.length > 40,
    failed ? await page.locator(".notice-danger").innerText() : `أول نص بعد ~${ttft}ms، الإجابة كاملة بعد ${total}ms، ${answer.length} حرفًا`);
  console.log("--- بداية الإجابة:\n" + answer.slice(0, 400) + "\n---");
  await page.screenshot({ path: path.join(OUT, "01-answer.png") });
  void firstText;

  if (!failed) {
    await page.getByRole("button", { name: "مراجعة نقدية" }).first().click();
    await page.getByRole("button", { name: "شغّل المراجعة" }).click();
    await Promise.race([page.locator(".finding").first().waitFor({ timeout: 180000 }), page.getByText("نقاط القوة").waitFor({ timeout: 180000 })]);
    const label = await page.locator(".ws-panel .notice strong, dialog[open] .notice strong").first().innerText();
    check("المراجعة النقدية تجري بالنموذج اللغوي", label.includes("مراجعة بنموذج لغوي"), label);
    await page.screenshot({ path: path.join(OUT, "02-review.png") });
  }

} catch (e) {
  check("تنفيذ السكربت", false, String(e.stack || e).slice(0, 600));
} finally {
  // تنظيف دائم: يُحذف الحساب الاختباري وبياناته حتى إن فشلت خطوة قبله، فلا تبقى حسابات في قاعدة الإنتاج.
  if (signedUp) {
    try {
      if ((await page.request.get(BASE + "/api/me")).ok()) {
        await page.goto(BASE + "/profile");
        await page.getByRole("button", { name: "احذف حسابي وبياناتي" }).click();
        await page.locator("#del-pw").fill(password);
        await page.getByRole("button", { name: "احذف نهائيًا" }).click();
        await page.waitForURL(BASE + "/", { timeout: 30000 });
        check("حذف الحساب الاختباري", true);
      } else {
        check("حذف الحساب الاختباري", false, `لا جلسة للحساب ${email}؛ إن كان قد أُنشئ فهو باقٍ في القاعدة`);
      }
    } catch (e) {
      check("حذف الحساب الاختباري", false, `${email}: ${String(e.message || e).slice(0, 200)}`);
    }
  }
  if (page) check("لا أخطاء JavaScript في المتصفح", errors.length === 0, errors.slice(0, 2).join(" | "));
  await browser?.close();
  const failed = results.filter((r) => !r.ok);
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.length - failed.length}/${results.length} نجح`);
  process.exit(failed.length ? 1 : 0);
}

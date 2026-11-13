// اختبار شامل للمسار الرئيسي + الاستجابة + الإتاحة (axe) + فحوص أمان أساسية.
// التشغيل: npm run build && npm run e2e   (يشغّل خادمًا مؤقتًا بقاعدة بيانات مؤقتة)
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const PORT = 4317;
const BASE = `http://localhost:${PORT}`;
const OUT = path.resolve("test-output");
fs.mkdirSync(OUT, { recursive: true });
const dbPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "hessara-")), "e2e.db");
// E2E_DB=pglite يشغّل الاختبار نفسه على مسار Postgres (محرك PGlite داخل العملية).
const dbEnv = process.env.E2E_DB === "pglite" ? { HESSARA_PGLITE: "1" } : { HESSARA_DB_PATH: dbPath };
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`); };

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)], {
  env: { ...process.env, ...dbEnv, HESSARA_INSECURE_COOKIE: "1", HESSARA_DEMO_DELAY_MS: "15", NODE_OPTIONS: "--disable-warning=ExperimentalWarning" },
  stdio: ["ignore", "pipe", "pipe"],
});
let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));
const waitUp = async () => { for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE + "/api/models")).ok) return; } catch {} await new Promise((r) => setTimeout(r, 500)); } throw new Error("server did not start\n" + serverLog); };

async function axe(page, label) {
  await page.addScriptTag({ content: axeSource });
  const r = await page.evaluate(async () => await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } }));
  const v = r.violations.map((x) => `${x.id}(${x.nodes.length}): ${x.nodes[0].target.join(" ")}`);
  check(`axe ${label}`, v.length === 0, v.join(" | "));
}
const noOverflow = async (page, label) => {
  const o = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`لا تمرير أفقي: ${label}`, o <= 0, o > 0 ? `+${o}px` : "");
};
const shot = (page, name, full = false) => page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: full });

let browser;
try {
  await waitUp();
  browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 860 }, locale: "ar", colorScheme: "light" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

  // ── ١. الزائر: الصفحة الرئيسية بتصميم الموقع المرجعي ──
  await page.goto(BASE + "/");
  check("الصفحة الرئيسية تعرض العنوان الرئيسي", await page.getByRole("heading", { level: 1 }).innerText().then((t) => t.includes("ذكاءٌ يُرشِد")));
  check("الواجهة العربية من اليمين", await page.evaluate(() => document.documentElement.dir === "rtl" && document.documentElement.lang === "ar"));
  check("رسمة الرأس محمّلة", await page.locator(".art img").evaluate((img) => img.complete && img.naturalWidth > 0));
  await shot(page, "01-landing-light-desktop", true);
  await axe(page, "الصفحة الرئيسية (فاتح)");
  await noOverflow(page, "الرئيسية/حاسب");

  // الصفحات التعريفية والمقالات بالعربية
  for (const [p, n] of [["/platform", "platform"], ["/models", "models"], ["/consulting", "consulting"], ["/insights", "insights"], ["/insights/multi-agent-deliberation", "insight-article"], ["/resources", "resources"], ["/resources/security", "resource-doc"], ["/about", "about"], ["/careers", "careers"], ["/programs", "programs"], ["/contact", "contact"], ["/privacy", "privacy"], ["/terms", "terms"], ["/help", "help"]]) {
    const r = await page.goto(BASE + p);
    check(`صفحة ${n} تعمل (200)`, r?.status() === 200);
    await noOverflow(page, `${n}/حاسب`);
    if (["platform", "consulting", "insight-article", "resources", "privacy"].includes(n)) await axe(page, `${n} (عربي)`);
    if (n === "consulting") await shot(page, "01b-consulting-ar", true);
  }
  const nf = await page.goto(BASE + "/no-such-page");
  check("صفحة غير موجودة تعرض 404 بتصميم الموقع", nf?.status() === 404 && (await page.locator("h1").innerText()).includes("لا يقود"));

  // معاينة حية (المحرك التجريبي والمراجع القاعدي دون حساب) في صفحة الاستشارات
  await page.goto(BASE + "/consulting");
  await page.getByRole("button", { name: "أرسل السؤال" }).click();
  await page.getByRole("button", { name: /شغّل مراجعة/ }).click({ timeout: 20000 });
  await page.getByText("المراجع القاعدي").first().waitFor();
  check("المعاينة الحية: رد ثم مراجعة", true);

  // ── ٢. الزائر يبدأ استشارة فيُطلب منه الدخول ثم يعود إلى المسار ──
  const Q = "لدي تطبيق يعتمد على نموذج لغوي، لكن استجابته بطيئة. أريد معرفة السبب وتحسين الأداء.";
  await page.locator(".cta").getByRole("link", { name: "ابدأ استشارة" }).click();
  await page.waitForURL(/\/login\?next=/);
  await shot(page, "02-login-light-desktop");
  await axe(page, "تسجيل الدخول");
  // تحقق الحقول
  await page.getByRole("button", { name: "سجّل الدخول" }).click();
  check("تحقق الحقول يعرض رسائل واضحة", await page.locator(".field-error").count() >= 2);
  await page.getByRole("link", { name: "أنشئ حسابًا جديدًا" }).click();
  await page.waitForURL(/mode=signup/);
  await page.locator("#name").fill("أحمد");
  await page.locator("#email").fill("ahmad@example.com");
  await page.locator("#password").fill("correct-horse-9");
  await page.locator("input[name=accept]").check();
  await shot(page, "03-signup-light-desktop");
  await page.getByRole("button", { name: "أنشئ الحساب" }).click();
  await page.waitForURL(/\/consult\/new/);
  check("بعد إنشاء الحساب يعود المستخدم إلى بدء الاستشارة", true);
  await page.locator("#quick-consult").fill(Q);

  // ── ٣. الاستشارة ──
  await page.locator("form.composer").getByRole("button", { name: "أرسل" }).click();
  await page.waitForURL(/\/consult\/[\w-]{8,}$/);
  const consultUrl = page.url();
  await page.getByRole("button", { name: "أعد التوليد" }).waitFor({ timeout: 30000 });
  check("وصلت إجابة مكتملة", await page.getByText("تحليل الأسباب المحتملة").isVisible());
  check("هوية النموذج ظاهرة على الإجابة", await page.locator(".msg-meta").first().innerText().then((t) => t.includes("المحرك التجريبي")));
  await shot(page, "04-consult-light-desktop");

  // ── ٤. المراجعة النقدية ──
  await page.getByRole("button", { name: "مراجعة نقدية" }).first().click();
  await page.getByRole("button", { name: "محلل المخاطر" }).click();
  await page.getByRole("button", { name: "شغّل المراجعة" }).click();
  await page.locator(".finding").first().waitFor();
  check("المراجعة أنتجت ملاحظات وفق معايير معلنة", (await page.locator(".finding").count()) > 0);
  await shot(page, "05-consult-review-light-desktop");
  await axe(page, "مساحة الاستشارة + لوحة المراجعة");

  // ── ٥. حفظ + نموذج مفضل ──
  await page.getByRole("button", { name: "حفظ الاستشارة" }).click();
  await page.getByRole("button", { name: "إزالة من المحفوظات" }).waitFor();
  await page.getByRole("button", { name: "اجعله نموذجي المفضل" }).click();
  await page.locator(".account__model").waitFor();
  check("النموذج المفضل يظهر بجانب اسم المستخدم", await page.locator(".account__btn").innerText().then((t) => t.includes("أحمد") && t.includes("المحرك التجريبي")));

  // إيقاف التوليد + إعادة التوليد
  await page.locator("#ws-input").fill("خطة مشروع تخرج من ثمانية أسابيع: ما المراحل والمتطلبات والمخاطر وكيف أقسّم العمل على الفريق خلال المدة المحددة مع معايير قبول واضحة لكل مرحلة؟ " .repeat(2));
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "أوقف التوليد" }).click();
  await page.locator(".composer button[type=submit]").waitFor();
  check("إيقاف التوليد يعيد زر الإرسال", true);

  // ── ٦. العودة: اللوحة ──
  await page.goto(BASE + "/home");
  const home = await page.locator("main").innerText();
  check("اللوحة: تحية بالاسم + النموذج المفضل", home.includes("مرحبًا أحمد") && home.includes("نموذجك المفضل"));
  check("اللوحة: الاستشارة السابقة والمحفوظة موجودتان", (await page.locator("a.ws-item").count()) >= 2);
  await shot(page, "06-home-light-desktop", true);
  await axe(page, "اللوحة");
  await page.goto(consultUrl);
  check("إعادة فتح الاستشارة المحفوظة", await page.getByText("تحليل الأسباب المحتملة").isVisible());

  // ── ٧. تذكير راحة العين ──
  await page.goto(BASE + "/home?eyetest=2");
  await page.mouse.move(200, 200); await page.mouse.down(); await page.mouse.up();
  await page.locator(".eye-rest").waitFor({ timeout: 15000 });
  await shot(page, "07-eye-rest");
  await page.getByRole("button", { name: /ذكّرني بعد ٥/ }).click();
  check("تذكير الاستراحة يظهر ويُؤجَّل", (await page.locator(".eye-rest").count()) === 0);
  await page.reload(); await page.waitForTimeout(3500);
  check("لا يتكرر التذكير بعد التحديث مباشرة", (await page.locator(".eye-rest").count()) === 0);
  await page.evaluate(() => localStorage.removeItem("hs_eye"));

  // ── ٨. المختبر ──
  await page.goto(BASE + "/lab");
  await page.locator("#lab-text").fill("انقل قاعدة البيانات إلى خادم أكبر. هذا سيحل المشكلة دائمًا وسيجعل الاستجابة أسرع بنسبة 50%.");
  await page.getByRole("radio", { name: /مدقق الأدلة/ }).click();
  await page.getByRole("button", { name: "شغّل المراجعة" }).click();
  await page.getByText("رقم أو نسبة بلا مصدر").waitFor();
  await page.locator("#lab-revised").fill("قِس أولًا زمن الاستعلامات. إن كانت قاعدة البيانات هي الاختناق فانقلها إلى خادم أكبر وقارن الوسيط قبل وبعد.");
  await page.getByRole("button", { name: "أظهر الفروق" }).click();
  await page.locator(".diff ins").first().waitFor();
  check("المختبر: مراجعة + مقارنة نسخة منقّحة", (await page.locator(".diff del").count()) > 0);
  await page.getByRole("radio", { name: /المحكّم المنظّم/ }).click();
  await page.locator("#lab-criteria").fill("وجود خطة تراجع\nذكر مصدر كل رقم");
  await page.getByRole("button", { name: "شغّل المراجعة" }).click();
  await page.locator(".verdict").nth(1).waitFor();
  check("المحكّم المنظّم يصدر حكمًا لكل معيار", (await page.locator(".verdict").count()) === 2);
  await shot(page, "08-lab-light-desktop", true);
  await axe(page, "المختبر");

  // ── ٩. الوكلاء (نموذج الإدخال المنظّم) ──
  await page.goto(BASE + "/agents");
  await shot(page, "09-agents-light-desktop", true);
  await axe(page, "الوكلاء");
  await page.goto(BASE + "/consult/new?agent=coding");
  await page.locator("#in-error").fill("TypeError: cannot read properties of undefined (reading 'map')");
  await page.getByRole("button", { name: "ابدأ الاستشارة" }).click();
  await page.waitForURL(/\/consult\/[\w-]{8,}$/);
  await page.getByRole("button", { name: "أعد التوليد" }).waitFor({ timeout: 30000 });
  check("الوكيل: إدخال منظّم وإجابة موسومة باسم الوكيل", await page.locator(".ws-thread").innerText().then((t) => t.includes("وكيل البرمجة") && t.includes("خطوات التشخيص")));

  // ── ١٠. النماذج، الميديا، الملف الشخصي ──
  await page.goto(BASE + "/models");
  check("النماذج غير المهيّأة معطّلة للمحادثة", (await page.getByRole("button", { name: "غير متاح للمحادثة" }).count()) >= 1);
  await page.getByRole("button", { name: "التفاصيل" }).nth(1).click();
  await page.locator("dialog[open]").waitFor();
  await shot(page, "10-models-detail-light-desktop");
  await axe(page, "النماذج + نافذة التفاصيل");
  await page.keyboard.press("Escape");
  await page.goto(BASE + "/media");
  await page.locator("#m-q").fill("LLM");
  const links = await page.locator("article.card a.video-thumb").evaluateAll((as) => as.map((a) => a.href));
  check("الميديا: نتائج البحث روابط مباشرة إلى يوتيوب", links.length > 3 && links.every((h) => /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/.test(h)), `${links.length} نتيجة`);
  await page.locator("article.card").first().getByRole("button", { name: /إضافة الفيديو إلى المفضلة/ }).click();
  await page.getByText("أُضيف إلى المفضلة.").waitFor();
  check("الميديا: حفظ فيديو", true);
  await shot(page, "11-media-light-desktop"); await axe(page, "الميديا");
  await page.goto(BASE + "/profile"); await shot(page, "12-profile-light-desktop", true); await axe(page, "الملف الشخصي");
  await page.getByRole("switch", { name: /تذكير راحة العين/ }).uncheck();
  await page.getByText("حُفظ التغيير.").waitFor();
  check("تعطيل التذكير من الإعدادات", true);

  // ── ١١. لوحة المفاتيح ──
  await page.goto(BASE + "/home");
  await page.keyboard.press("Tab");
  check("رابط تخطي المحتوى أول عنصر في التنقل بلوحة المفاتيح", await page.evaluate(() => document.activeElement?.textContent?.includes("تخطَّ")));

  // ── ١٢. الوضع الداكن ──
  await ctx.addCookies([{ name: "hs_theme", value: "dark", url: BASE }]);
  for (const [p, n] of [["/home", "home"], [consultUrl.replace(BASE, ""), "consult"], ["/lab", "lab"], ["/models", "models"], ["/agents", "agents"], ["/profile", "profile"]]) {
    await page.goto(BASE + p); await shot(page, `20-${n}-dark-desktop`, n !== "consult"); await axe(page, `${n} (داكن)`);
  }

  // ── ١٣. الهاتف واللوحي ──
  for (const [w, h, label] of [[390, 844, "mobile"], [820, 1180, "tablet"]]) {
    const m = await browser.newContext({ viewport: { width: w, height: h }, locale: "ar", colorScheme: "light", storageState: await ctx.storageState(), hasTouch: true });
    await m.addCookies([{ name: "hs_theme", value: label === "mobile" ? "light" : "dark", url: BASE }]);
    const mp = await m.newPage();
    for (const [p, n] of [["/home", "home"], [consultUrl.replace(BASE, ""), "consult"], ["/lab", "lab"], ["/models", "models"], ["/agents", "agents"], ["/media", "media"], ["/profile", "profile"], ["/consult", "consult-index"]]) {
      await mp.goto(BASE + p); await mp.waitForTimeout(150);
      await noOverflow(mp, `${n}/${label}`);
      await shot(mp, `30-${n}-${label}`);
    }
    if (label === "mobile") {
      await mp.goto(consultUrl);
      const box = await mp.locator("#ws-input").boundingBox();
      check("الهاتف: حقل الكتابة ظاهر داخل الشاشة", !!box && box.y + box.height <= h);
      await mp.getByRole("button", { name: "سجل الاستشارات" }).click();
      await mp.locator("dialog[open]").waitFor(); await shot(mp, "31-consult-history-mobile");
      await mp.keyboard.press("Escape");
      await mp.getByRole("button", { name: "مراجعة نقدية" }).first().click();
      await mp.locator("dialog[open]").waitFor(); await shot(mp, "32-consult-review-mobile");
      await axe(mp, "الاستشارة/هاتف");
      const small = await mp.evaluate(() => [...document.querySelectorAll(".nav a, .nav summary, .nav button")].map((a) => a.getBoundingClientRect()).filter((r) => r.width && (r.width < 24 || r.height < 24)).length);
      check("الهاتف: أهداف اللمس في شريط التنقل ≥ ٢٤ بكسل (WCAG 2.5.8)", small === 0);
      await mp.keyboard.press("Escape");
      await mp.locator("dialog[open]").waitFor({ state: "detached" }).catch(() => {});
      await mp.locator(".menu summary").click();
      await mp.locator(".menu__panel").waitFor();
      check("الهاتف: قائمة التنقل تُفتح وتحوي أقسام المنصة وزر اللغة", await mp.locator(".menu__panel").innerText().then((t) => t.includes("الاستشارات") && t.includes("English")));
      await shot(mp, "33-nav-menu-mobile");
    }
    await m.close();
  }
  // الزائر على الهاتف (فاتح وداكن)
  for (const scheme of ["light", "dark"]) {
    const g = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ar", colorScheme: scheme });
    if (scheme === "dark") await g.addCookies([{ name: "hs_theme", value: "dark", url: BASE }]); // الداكن اختيار صريح لا يتبع النظام
    const gp = await g.newPage();
    await gp.goto(BASE + "/"); await noOverflow(gp, `التعريفية/هاتف/${scheme}`); await shot(gp, `40-landing-${scheme}-mobile`, true);
    if (scheme === "dark") { await axe(gp, "التعريفية (داكن، هاتف)"); await gp.setViewportSize({ width: 1366, height: 860 }); await shot(gp, "41-landing-dark-desktop", true); await gp.goto(BASE + "/login"); await shot(gp, "42-login-dark-desktop"); await axe(gp, "الدخول (داكن)"); }
    else { await gp.goto(BASE + "/login"); await noOverflow(gp, "الدخول/هاتف"); await shot(gp, "43-login-light-mobile"); }
    // تكبير النص ٢٠٠٪
    if (scheme === "light") { await gp.goto(BASE + "/"); await gp.evaluate(() => (document.documentElement.style.fontSize = "200%")); await noOverflow(gp, "التعريفية/هاتف/نص ٢٠٠٪"); }
    await g.close();
  }

  // ── اللغة الإنجليزية: زر التبديل، والمسار نفسه بالإنجليزية ──
  await page.goto(BASE + "/home");
  await page.locator(".nav__end .lang").click();
  await page.waitForFunction(() => document.documentElement.lang === "en" && document.documentElement.dir === "ltr");
  await page.locator("h1").filter({ hasText: "Welcome, أحمد" }).waitFor();
  check("زر اللغة يبدّل الواجهة إلى الإنجليزية من اليسار", true);
  check("تفضيل اللغة محفوظ في ملف ارتباط", (await ctx.cookies()).some((c) => c.name === "hs_lang" && c.value === "en"));
  await page.locator("#quick-consult").fill("My graduation project plan: eight weeks, two people. What phases and acceptance criteria should it have?");
  await page.locator("form.composer").getByRole("button", { name: "Send" }).click();
  await page.waitForURL(/\/consult\/[\w-]{8,}$/);
  await page.getByRole("button", { name: "Regenerate" }).waitFor({ timeout: 30000 });
  check("الإنجليزية: المحرك التجريبي يجيب بالإنجليزية", await page.locator(".ws-thread").innerText().then((t) => t.includes("Suggested phases") && t.includes("Demo template — not AI")));
  await page.getByRole("button", { name: "Critical review" }).first().click();
  await page.getByRole("button", { name: "Run the review" }).click();
  await page.locator(".finding, .ws-panel .notice").first().waitFor();
  check("الإنجليزية: المراجعة النقدية بالإنجليزية", await page.locator(".ws-panel").innerText().then((t) => t.includes("Rule-based reviewer") && !/[\u0600-\u06FF]{3}/.test(t.replace(/أحمد/g, ""))));
  await shot(page, "50-consult-review-en");
  await axe(page, "الاستشارة (إنجليزي)");
  for (const [p, n] of [["/", "home"], ["/models", "models"], ["/lab", "lab"], ["/agents", "agents"], ["/media", "media"], ["/profile", "profile"], ["/insights/citation-first-reasoning", "insight"], ["/resources/getting-started", "resource"]]) {
    await page.goto(BASE + p);
    await noOverflow(page, `${n}/en`);
    await shot(page, `51-${n}-en`, true);
    if (["models", "lab", "agents", "insight"].includes(n)) await axe(page, `${n} (إنجليزي)`);
  }
  const enErr = await ctx.request.post(BASE + "/api/consultations", { data: { text: "", modelId: "hessara-demo" } });
  check("الإنجليزية: رسائل أخطاء الواجهة البرمجية بالإنجليزية", (await enErr.json()).error?.startsWith("Write the consultation text"));
  await page.goto(BASE + "/profile");
  await page.locator("#p-lang").selectOption("ar");
  await page.waitForFunction(() => document.documentElement.lang === "ar" && document.documentElement.dir === "rtl");
  check("العودة إلى العربية من الملف الشخصي", true);

  // ── ١٤. فحوص أمان ──
  const anon = await fetch(BASE + "/api/consultations");
  check("أمان: الواجهة البرمجية ترفض غير المسجَّل (401)", anon.status === 401);
  const id = consultUrl.split("/").pop();
  const other = await browser.newContext();
  const or = await other.request.post(BASE + "/api/auth/signup", { data: { name: "سارة", email: "sara@example.com", password: "another-pass-77", accept: true } });
  const cross = await other.request.get(`${BASE}/api/consultations/${id}`);
  check("أمان: لا يصل مستخدم إلى استشارة مستخدم آخر (404)", or.ok() && cross.status() === 404);
  const crossPage = await other.request.get(`${BASE}/consult/${id}`);
  check("أمان: صفحة استشارة الغير غير موجودة", crossPage.status() === 404);
  const crossExport = await other.request.get(`${BASE}/api/consultations/${id}/export`);
  check("أمان: تصدير استشارة الغير مرفوض", crossExport.status() === 404);
  await other.close();
  const cookie = (await ctx.cookies()).find((c) => c.name === "hs_session");
  check("أمان: ملف ارتباط الجلسة HttpOnly و SameSite=Lax", !!cookie && cookie.httpOnly && cookie.sameSite === "Lax");
  const csrf = await fetch(BASE + "/api/me", { method: "PATCH", headers: { "content-type": "application/json", origin: "https://evil.example", cookie: `hs_session=${cookie.value}` }, body: JSON.stringify({ name: "x" }) });
  check("أمان: طلب مغيِّر من أصل آخر مرفوض (403)", csrf.status === 403);
  const redir = await fetch(BASE + "/login?next=https://evil.example", { headers: { cookie: `hs_session=${cookie.value}` }, redirect: "manual" });
  check("أمان: لا إعادة توجيه مفتوحة عبر next", !(redir.headers.get("location") || "").includes("evil"));
  const hdr = (await fetch(BASE + "/")).headers;
  check("أمان: ترويسات CSP و nosniff و X-Frame-Options", !!hdr.get("content-security-policy") && hdr.get("x-content-type-options") === "nosniff" && hdr.get("x-frame-options") === "DENY");
  const xss = await ctx.request.post(BASE + "/api/consultations", { data: { text: "<img src=x onerror=window.__xss=1> **<script>window.__xss=1</script>**", modelId: "hessara-demo" } });
  const xid = (await xss.json()).id;
  await ctx.request.post(`${BASE}/api/consultations/${xid}/messages`, { data: { text: "<img src=x onerror=window.__xss=1>" } });
  await page.goto(`${BASE}/consult/${xid}`); await page.waitForTimeout(500);
  check("أمان: المدخلات تُعرض نصًا ولا تُنفَّذ (XSS)", !(await page.evaluate(() => window.__xss)));
  const big = await ctx.request.post(BASE + "/api/consultations", { data: { text: "ا".repeat(13000), modelId: "hessara-demo" } });
  check("أمان: حد حجم الرسالة مطبَّق", big.status() === 400);
  const huge = await fetch(BASE + "/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "a@b.co", password: "x".repeat(300000) }) });
  check("أمان: جسم طلب متضخم يُرفض قبل المصادقة", huge.status === 400 || huge.status === 401);
  const rv = await ctx.request.post(BASE + "/api/reviews", { data: { text: "a\n".repeat(9000), mode: "technical" } });
  const t0 = Date.now();
  const rvd = await ctx.request.post(`${BASE}/api/reviews/${(await rv.json()).id}/revise`, { data: { revised: "b\n".repeat(9000) } });
  check("أمان: مقارنة مدخلين كثيري الأسطر محدودة الزمن والذاكرة", rvd.ok() && Date.now() - t0 < 3000, `${Date.now() - t0}ms`);
  // إخفاقات الدخول تُحسب لكل بريد ولا تقفل الخدمة على غيره
  const tryLogin = (email, password) => fetch(BASE + "/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
  let st = 0;
  for (let i = 0; i < 11; i++) st = (await tryLogin("victim@example.com", "wrong-" + i)).status;
  const otherOk = await tryLogin("ahmad@example.com", "correct-horse-9");
  check("أمان: التخمين يُوقف لكل بريد (429) دون قفل دخول الآخرين", st === 429 && otherOk.status === 200, `${st}/${otherOk.status}`);
  let dst = 0;
  for (let i = 0; i < 6; i++) dst = (await ctx.request.delete(BASE + "/api/me", { data: { password: "guess-" + i } })).status();
  check("أمان: تخمين كلمة المرور عبر حذف الحساب محدود (429)", dst === 429, String(dst));
  const anonModels = await (await fetch(BASE + "/api/models")).json();
  check("أمان: تفاصيل تهيئة الخادم محجوبة عن الزائر", anonModels.models.every((m) => m.missing.length === 0));
  const badMsg = await ctx.request.post(BASE + "/api/reviews", { data: { text: "نص للمراجعة لا يقل عن عشرين حرفًا بالتأكيد.", mode: "technical", consultationId: id, messageId: "not-mine" } });
  check("أمان: ربط مراجعة برسالة لا تخص الاستشارة مرفوض", badMsg.status() === 404);
  const bundle = fs.readdirSync(".next/static", { recursive: true }).filter((f) => String(f).endsWith(".js")).map((f) => fs.readFileSync(path.join(".next/static", String(f)), "utf8")).join("");
  check("أمان: لا أسماء مفاتيح خدمات ولا تعليمات النظام في حزمة المتصفح", !/ANTHROPIC_API_KEY|OPENAI_API_KEY|sk-ant-|أنت مستشار تقني ضمن منصة|أنت مهندس برمجيات يراجع شفرة زميل|أنت مراجع نقدي مستقل/.test(bundle));

  // حذف الحساب
  await page.goto(BASE + "/profile");
  await page.getByRole("button", { name: "احذف حسابي وبياناتي" }).click();
  await page.locator("#del-pw").fill("correct-horse-9");
  await page.getByRole("button", { name: "احذف نهائيًا" }).click();
  await page.getByText("محاولات كثيرة").waitFor(); // الحد من الفحص السابق ما زال ساريًا: الحذف محجوب حتى بكلمة المرور الصحيحة
  check("أمان: حد الحذف يسري حتى مع كلمة المرور الصحيحة أثناء النافذة", true);
  const fresh = await browser.newContext();
  await fresh.request.post(BASE + "/api/auth/signup", { data: { name: "ليلى", email: "layla@example.com", password: "delete-me-123", accept: true } });
  const fp = await fresh.newPage();
  await fp.goto(BASE + "/profile");
  await fp.getByRole("button", { name: "احذف حسابي وبياناتي" }).click();
  await fp.locator("#del-pw").fill("delete-me-123");
  await fp.getByRole("button", { name: "احذف نهائيًا" }).click();
  await fp.waitForURL(BASE + "/");
  await fresh.close();
  const relog = await fetch(BASE + "/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "layla@example.com", password: "delete-me-123" }) });
  check("حذف الحساب يزيل البيانات (تعذر الدخول بعده)", relog.status === 401);

  const realErrors = errors.filter((e) => !/401|404|412|Failed to load resource/.test(e));
  check("لا أخطاء JavaScript في المتصفح", realErrors.length === 0, realErrors.slice(0, 3).join(" | "));
} catch (e) {
  check("تنفيذ السكربت", false, String(e.stack || e).slice(0, 600));
} finally {
  await browser?.close();
  server.kill();
  const failed = results.filter((r) => !r.ok);
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.length - failed.length}/${results.length} نجح`);
  process.exit(failed.length ? 1 : 0);
}

// الحدود المشتركة، والحد اليومي، وعدّاد الزيارات، على قاعدة SQLite مؤقتة (المسار نفسه الذي تستخدمه Postgres بصيغة مشتركة).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hessara-platform-"));
process.env.HESSARA_DB_PATH = path.join(dir, "test.db");
for (const k of ["DATABASE_URL", "HESSARA_PGLITE", "VERCEL", "HESSARA_DAILY_LIMIT", "HESSARA_ADMIN_EMAILS", "HESSARA_TRUST_PROXY"]) delete process.env[k];
test.after(() => fs.rmSync(dir, { recursive: true, force: true }));

const { run } = await import("../lib/db.ts");
const L = await import("../lib/limits.ts");
const U = await import("../lib/usage.ts");
const { normalizeViewPath, isBot } = await import("../lib/pageviews.ts");

test("الحدود المشتركة: تُحصى المحاولات وتُرفض بعد الحد، وتبدأ نافذة جديدة بعد انقضاء السابقة", async () => {
  for (let i = 0; i < 3; i++) assert.equal(await L.allow("t:a", 3, 60_000), true);
  assert.equal(await L.allow("t:a", 3, 60_000), false, "المحاولة الرابعة تتجاوز الحد");
  await run("UPDATE rate_limits SET reset_at = ? WHERE bucket = ?", Date.now() - 1, "t:a");
  assert.equal(await L.allow("t:a", 3, 60_000), true, "انقضت النافذة فبدأ العد من جديد");
});

test("عدّاد الإخفاقات: يزيد عند الفشل ويُصفَّر عند النجاح", async () => {
  assert.equal(await L.failures("fail:x"), 0);
  await L.noteFailureShared("fail:x", 60_000);
  await L.noteFailureShared("fail:x", 60_000);
  assert.equal(await L.failures("fail:x"), 2);
  await L.clearShared("fail:x");
  assert.equal(await L.failures("fail:x"), 0);
});

test("حد العنوان لا يُطبَّق دون وسيط موثوق، ويُطبَّق خلفه على آخر عنوان أضافه", async () => {
  const req = (ip) => new Request("http://x/", { headers: { "x-forwarded-for": `1.1.1.1, ${ip}` } });
  assert.equal(await L.allowIp(req("9.9.9.9"), "ip", 1, 60_000), true);
  assert.equal(await L.allowIp(req("9.9.9.9"), "ip", 1, 60_000), true, "دون HESSARA_TRUST_PROXY لا حد بالعنوان");
  process.env.HESSARA_TRUST_PROXY = "1";
  try {
    assert.equal(await L.allowIp(req("8.8.8.8"), "ip", 1, 60_000), true);
    assert.equal(await L.allowIp(req("8.8.8.8"), "ip", 1, 60_000), false);
    assert.equal(await L.allowIp(req("7.7.7.7"), "ip", 1, 60_000), true, "عنوان آخر حاويته مستقلة");
  } finally { delete process.env.HESSARA_TRUST_PROXY; }
});

test("الحد اليومي: يُحتسب كل استدعاء ناجح، ويُستنفد عند الحد، ولا حد على صاحب المشروع", async () => {
  await run("INSERT INTO users (id, email, name, pass_hash, created_at) VALUES (?,?,?,?,?)", "u1", "a@example.com", "A", "x", Date.now());
  process.env.HESSARA_DAILY_LIMIT = "2";
  try {
    const user = { id: "u1", email: "a@example.com" };
    assert.deepEqual(await U.quotaFor(user), { used: 0, limit: 2, left: 2 });
    await U.countUse("u1"); await U.countUse("u1");
    const q = await U.quotaFor(user);
    assert.deepEqual(q, { used: 2, limit: 2, left: 0 });
    assert.equal(U.quotaExhausted(q), true);
    process.env.HESSARA_ADMIN_EMAILS = "owner@example.com, A@Example.com";
    const qa = await U.quotaFor(user);
    assert.equal(qa.left, null, "صاحب المشروع بلا حد");
    assert.equal(U.quotaExhausted(qa), false);
  } finally { delete process.env.HESSARA_DAILY_LIMIT; delete process.env.HESSARA_ADMIN_EMAILS; }
  assert.equal(U.dailyLimit(), 20, "الحد الافتراضي");
  process.env.HESSARA_DAILY_LIMIT = "abc";
  assert.equal(U.dailyLimit(), 20, "قيمة غير صالحة تعود إلى الافتراضي");
  delete process.env.HESSARA_DAILY_LIMIT;
  assert.match(U.quotaMessage(20, "ar"), /بلغت حدّك اليومي .*\(20\)/);
});

test("عدّاد الزيارات: المعرّفات في الروابط تُستبدل، ومسارات الواجهة البرمجية والإدارة لا تُحصى", () => {
  assert.equal(normalizeViewPath("/"), "/");
  assert.equal(normalizeViewPath("/insights/?x=1#y"), "/insights");
  assert.equal(normalizeViewPath("/consult/new"), "/consult/new");
  assert.equal(normalizeViewPath("/consult/Ab12-xY_9"), "/consult/:id");
  assert.equal(normalizeViewPath("/consult/Ab12/report"), "/consult/:id/report");
  assert.equal(normalizeViewPath("/s/someLongShareToken_123"), "/s/:token");
  for (const p of ["/api/me", "/admin", "/_next/x", "relative", "/<script>", ""]) assert.equal(normalizeViewPath(p), null, p);
  assert.equal(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)"), true);
  assert.equal(isBot("Mozilla/5.0 HeadlessChrome/140"), true);
  assert.equal(isBot("Mozilla/5.0 (Windows NT 10.0) Chrome/140 Safari/537.36"), false);
});

// سجل الأخطاء الداخلي واستبيان سهولة الاستخدام، على قاعدة SQLite مؤقتة.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hessara-errsus-"));
process.env.HESSARA_DB_PATH = path.join(dir, "test.db");
for (const k of ["DATABASE_URL", "HESSARA_PGLITE", "VERCEL"]) delete process.env[k];
test.after(() => fs.rmSync(dir, { recursive: true, force: true }));

const { all, run } = await import("../lib/db.ts");
const E = await import("../lib/errors.ts");
const S = await import("../lib/sus.ts");

test("تنقية رسالة الخطأ: لا بريد ولا روابط ولا أرقام طويلة ولا رموز، وطول محدود", () => {
  const m = E.redact("Key (email)=(sara@example.com) failed at https://x.io/a?b=1 id 123456 tok abcdefghijklmnopqrstuvwxyz123\nsecond line");
  assert.equal(m, "Key (email)=([email]) failed at [url] id [n] tok [token]");
  assert.ok(E.redact("x".repeat(500)).length <= 180);
});

test("قالب المسار من المتصفح يخفي المعرّفات", () => {
  assert.equal(E.clientRoute("/consult/9f1c2a7b?x=1"), "/consult/[id]");
  assert.equal(E.clientRoute("/consult/9f1c2a7b/report"), "/consult/[id]/report");
  assert.equal(E.clientRoute("/consult/new"), "/consult/new");
  assert.equal(E.clientRoute("/s/AbCdEfGhIjKlMnOpQrStUv"), "/s/[token]");
  assert.equal(E.clientRoute("/insights/multi-agent-deliberation"), "/insights/[slug]");
  assert.equal(E.clientRoute("/"), "/");
  assert.equal(E.clientRoute("https://evil.example/"), "(unknown)");
  assert.equal(E.clientRoute("/<script>"), "(unknown)");
});

test("نوع الخطأ، وما ليس خطأً", () => {
  assert.equal(E.errorKind(new TypeError("x")), "TypeError");
  assert.equal(E.errorKind(Object.assign(new Error("dup"), { name: "error", code: "23505" })), "error:23505");
  assert.equal(E.isNoise({ digest: "NEXT_NOT_FOUND" }), true);
  assert.equal(E.isNoise({ digest: "NEXT_REDIRECT;replace;/login;307;" }), true);
  assert.equal(E.isNoise(Object.assign(new Error("x"), { name: "AbortError" })), true);
  assert.equal(E.isNoise(new Error("real")), false);
});

test("الأخطاء تُجمَّع حسب اليوم والمصدر والمسار والنوع، وتُحذف القديمة", async () => {
  const now = Date.now();
  await E.recordError("server", "/api/x", "TypeError", "first sara@example.com", now);
  await E.recordError("server", "/api/x", "TypeError", "second", now + 1);
  await E.recordError("client", "/home", "TypeError", "browser", now);
  const rows = await all("SELECT source, route, kind, hits, sample FROM error_counts ORDER BY source");
  assert.deepEqual(rows.map((r) => [r.source, r.route, r.kind, Number(r.hits), r.sample]), [
    ["client", "/home", "TypeError", 1, "browser"],
    ["server", "/api/x", "TypeError", 2, "second"],
  ]);
  await E.recordError("server", "/old", "Error", "old", now - 40 * 86_400_000);
  await E.pruneErrors(now);
  assert.equal((await all("SELECT 1 FROM error_counts WHERE route = '/old'")).length, 0, "أقدم من ٣٠ يومًا");
  await E.recordServerError({ digest: "NEXT_NOT_FOUND" }, "/x");
  assert.equal((await all("SELECT 1 FROM error_counts WHERE route = '/x'")).length, 0, "إشارات التنقل لا تُسجَّل");
});

test("درجة المقياس: 0 إلى 100 بطريقة الحساب المعيارية", () => {
  assert.equal(S.susScore([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]), 50);
  assert.equal(S.susScore([5, 1, 5, 1, 5, 1, 5, 1, 5, 1]), 100);
  assert.equal(S.susScore([1, 5, 1, 5, 1, 5, 1, 5, 1, 5]), 0);
  assert.equal(S.susScore([4, 2, 4, 1, 4, 2, 5, 2, 4, 3]), 77.5);
  assert.equal(S.susScore([3, 3, 3]), null, "ناقصة");
  assert.equal(S.susScore([0, 3, 3, 3, 3, 3, 3, 3, 3, 3]), null, "خارج المدى");
  assert.equal(S.susScore([3.5, 3, 3, 3, 3, 3, 3, 3, 3, 3]), null, "ليست عددًا صحيحًا");
  assert.equal(S.SUS_ITEMS.length, 10);
});

test("الاستبيان: يُعرض بعد استشارتين، والرفض نهائي، والإجابة واحدة لكل مستخدم، والملخص بلا هوية", async () => {
  const t = Date.now();
  for (const [id, email] of [["s1", "s1@example.com"], ["s2", "s2@example.com"]])
    await run("INSERT INTO users (id, email, name, pass_hash, created_at) VALUES (?,?,?,?,?)", id, email, id, "x", t);
  assert.equal(await S.susStatus("s1"), "not_yet");
  for (const c of ["c1", "c2"]) await run("INSERT INTO consultations (id, user_id, title, model_id, created_at, updated_at) VALUES (?,?,?,?,?,?)", c, "s1", "t", "demo", t, t);
  assert.equal(await S.susStatus("s1"), "eligible");
  await S.dismissSus("s1", "ar");
  assert.equal(await S.susStatus("s1"), "dismissed");
  await S.saveSus("s1", [4, 2, 4, 1, 4, 2, 5, 2, 4, 3], "ar");
  assert.equal(await S.susStatus("s1"), "answered", "الإجابة بعد الرفض تُقبل");
  await S.dismissSus("s1", "ar");
  assert.equal(await S.susStatus("s1"), "answered", "الرفض لا يمحو إجابة سابقة");
  await S.saveSus("s1", [3, 3, 3, 3, 3, 3, 3, 3, 3, 3], "ar");
  await S.saveSus("s2", [5, 1, 5, 1, 5, 1, 5, 1, 5, 1], "en");
  const sum = await S.susSummary();
  assert.equal(sum.n, 2, "الإرسال الثاني حلّ محل الأول");
  assert.equal(sum.mean, 75);
  assert.equal(sum.median, 75);
  assert.equal(sum.min, 50);
  assert.equal(sum.max, 100);
  assert.equal(sum.items[0], 4);
  const csv = await S.susCsv();
  const lines = csv.trim().split("\n");
  assert.equal(lines[0], "q1,q2,q3,q4,q5,q6,q7,q8,q9,q10,score,lang,day");
  assert.equal(lines.length, 3);
  assert.ok(!/s1|s2|example\.com/.test(csv), "لا معرّف ولا بريد في الملف");
  await run("DELETE FROM users WHERE id = ?", "s2");
  assert.equal((await S.susSummary()).n, 1, "تُحذف الإجابة مع الحساب");
});

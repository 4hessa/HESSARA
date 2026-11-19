// نموذج «تواصل معنا»: التحقق من المدخلات، والحفظ والقراءة والحذف، وحذف ما تجاوز مدة الحفظ.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hessara-contact-"));
process.env.HESSARA_DB_PATH = path.join(dir, "test.db");
for (const k of ["DATABASE_URL", "HESSARA_PGLITE"]) delete process.env[k];
test.after(() => fs.rmSync(dir, { recursive: true, force: true }));

const { checkContact, CONTACT, CONTACT_ERRORS } = await import("../lib/contact-rules.ts");
const C = await import("../lib/contact.ts");

const good = { name: "  ريم   العتيبي ", email: "reem@example.com", body: "أود السؤال عن مشروع التخرج." };

test("رسالة صحيحة تُنظَّف: المسافات الزائدة في الاسم، ومحارف التحكم والتنسيق الخفية", () => {
  const r = checkContact({ ...good, body: "سطر‮ أول\r\nسطر\u0007 ثانٍ وطويل بما يكفي" });
  assert.equal(r.ok, true);
  assert.equal(r.value.name, "ريم العتيبي");
  assert.equal(r.value.body, "سطر أول\nسطر ثانٍ وطويل بما يكفي");
  assert.equal(checkContact({ ...good, name: "   " }).value.name, null, "الاسم اختياري");
});

test("رفض البريد الناقص أو المموَّه، والرسالة القصيرة أو الطويلة، والاسم الطويل", () => {
  for (const email of ["", "reem", "reem@", "reem@example", "a b@example.com", "<x>@example.com", 42]) {
    assert.deepEqual(checkContact({ ...good, email }), { ok: false, error: "email" }, String(email));
  }
  assert.deepEqual(checkContact({ ...good, body: "قصيرة" }), { ok: false, error: "body_short" });
  assert.deepEqual(checkContact({ ...good, body: "ب".repeat(CONTACT.body + 1) }), { ok: false, error: "body_long" });
  assert.deepEqual(checkContact({ ...good, name: "ا".repeat(CONTACT.name + 1) }), { ok: false, error: "name" });
  assert.deepEqual(checkContact(null), { ok: false, error: "email" });
  for (const e of Object.values(CONTACT_ERRORS)) assert.ok(e.ar && e.en);
});

test("الحقل المخفي المملوء يكشف البرنامج الآلي", () => {
  assert.deepEqual(checkContact({ ...good, website: "http://spam.example" }), { ok: false, spam: true });
  assert.equal(checkContact({ ...good, website: "" }).ok, true);
});

test("الحفظ والقراءة (الأحدث أولًا) والعدّ والحذف، وحذف ما تجاوز سنة عند القراءة", async () => {
  const now = Date.now();
  const v = checkContact(good).value;
  const oldId = await C.saveContact(v, "ar", now - (CONTACT.retentionDays + 1) * 86_400_000);
  const a = await C.saveContact(v, "ar", now - 1000);
  const b = await C.saveContact({ ...v, name: null }, "en", now);
  assert.equal(await C.countContact(), 3);
  const rows = await C.listContact();
  assert.deepEqual(rows.map((r) => r.id), [b, a], "القديمة حُذفت والأحدث أولًا");
  assert.ok(!rows.some((r) => r.id === oldId));
  assert.equal(rows[0].name, null);
  assert.equal(rows[1].email, "reem@example.com");
  assert.equal(typeof rows[0].created_at, "number");
  assert.equal(await C.countContact(now - 5000), 2);
  await C.deleteContact(a);
  assert.deepEqual((await C.listContact()).map((r) => r.id), [b]);
});

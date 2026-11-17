// ملف منفصل: node --test يشغّل كل ملف في عملية مستقلة، فلا تتسرّب حالة طبقة البيانات إلى غيره.
import test from "node:test";
import assert from "node:assert/strict";

test("طبقة البيانات: فشل الاتصال بـ Postgres لا يُحفظ، والطلب التالي يعيد المحاولة", async () => {
  process.env.DATABASE_URL = "postgres://u:p@127.0.0.1:9/none"; // منفذ لا يستمع عليه شيء
  const { all } = await import("../lib/db.ts");
  await assert.rejects(() => all("SELECT 1"));
  assert.equal(globalThis.__hessaraDriver, undefined, "يجب ألا يبقى وعد فاشل محفوظًا");
  await assert.rejects(() => all("SELECT 1")); // محاولة جديدة لا خطأ محفوظ
  assert.equal(globalThis.__hessaraDriver, undefined);
});

test("طبقة البيانات: على Vercel دون DATABASE_URL يُعدّ التخزين الدائم مفقودًا", async () => {
  const { persistentStoreMissing } = await import("../lib/db.ts");
  const saved = { VERCEL: process.env.VERCEL, DATABASE_URL: process.env.DATABASE_URL, HESSARA_PGLITE: process.env.HESSARA_PGLITE };
  try {
    delete process.env.HESSARA_PGLITE;
    process.env.VERCEL = "1"; delete process.env.DATABASE_URL;
    assert.equal(persistentStoreMissing(), true);
    process.env.DATABASE_URL = "postgres://x";
    assert.equal(persistentStoreMissing(), false);
    delete process.env.VERCEL; delete process.env.DATABASE_URL;
    assert.equal(persistentStoreMissing(), false, "محليًا تبقى SQLite على القرص مقبولة");
  } finally {
    for (const [k, v] of Object.entries(saved)) v === undefined ? delete process.env[k] : (process.env[k] = v);
  }
});

test("طبقة البيانات: sslmode الضعيف الدلالة يُثبَّت على التحقق الكامل، وغيره لا يُمس", async () => {
  const { secureSslMode } = await import("../lib/db.ts");
  assert.equal(secureSslMode("postgres://u:p@h/db?sslmode=require"), "postgres://u:p@h/db?sslmode=verify-full");
  assert.equal(secureSslMode("postgres://u:p@h/db?channel_binding=require&sslmode=require"), "postgres://u:p@h/db?channel_binding=require&sslmode=verify-full");
  assert.equal(secureSslMode("postgres://u:p@h/db?sslmode=prefer&x=1"), "postgres://u:p@h/db?sslmode=verify-full&x=1");
  assert.equal(secureSslMode("postgres://u:p@h/db?sslmode=disable"), "postgres://u:p@h/db?sslmode=disable");
  assert.equal(secureSslMode("postgres://u:p@h/db"), "postgres://u:p@h/db");
});

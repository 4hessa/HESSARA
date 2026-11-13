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

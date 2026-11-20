// نسخة الحساب في المتصفح: لقطة خادم قُرئت قبل آخر كتابة لا تمحوها، وكل ما عداها يحل محل النسخة المحلية.
import test from "node:test";
import assert from "node:assert/strict";

const { newerUser } = await import("../lib/account-sync.ts");

test("لقطة الخادم الأقدم من آخر كتابة لا تمحوها، والأحدث تحل محلها", () => {
  const saved = { id: "u1", prefModel: "demo", readAt: 2000 };
  const stale = { id: "u1", prefModel: null, readAt: 1000 };
  const fresh = { id: "u1", prefModel: "gemini", readAt: 3000 };
  assert.equal(newerUser(saved, stale), saved, "تحديث طُلب قبل الكتابة ووصل بعدها");
  assert.equal(newerUser(saved, fresh), fresh, "تغيير أحدث على الخادم يظهر");
  const same = { ...saved };
  assert.equal(newerUser(saved, same), same, "الوقت نفسه: نسخة الخادم");
});

test("الدخول والخروج وتبديل الحساب لا ينتظرون مقارنة الأوقات", () => {
  const cur = { id: "u1", readAt: 5000 };
  assert.equal(newerUser(cur, null), null, "الخروج من الحساب");
  const other = { id: "u2", readAt: 1 };
  assert.equal(newerUser(cur, other), other, "حساب آخر يحل محله مهما كان وقته");
  assert.equal(newerUser(null, cur), cur, "الدخول");
  assert.equal(newerUser(null, null), null);
});

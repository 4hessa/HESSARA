import { destroySession, toPublic, verifyPassword } from "@/lib/auth";
import { agentById } from "@/lib/catalog/agents";
import { modelById } from "@/lib/catalog/models";
import { get, run, type UserRow } from "@/lib/db";
import { authed, clearFailures, fail, isBlocked, LIMITS, noteFailure, ok, readJson, str } from "@/lib/http";
import { isUsable } from "@/lib/providers";

export const GET = authed(async (_req, user) => ok({ user: toPublic(user) }));

export const PATCH = authed(async (req, user) => {
  const b = await readJson(req);
  if (!b) return fail(400, "طلب غير صالح.");
  const set: string[] = [];
  const vals: (string | number | null)[] = [];
  const put = (col: string, v: string | number | null) => { set.push(`${col} = ?`); vals.push(v); };

  if ("name" in b) {
    const name = str(b.name, LIMITS.name)?.trim();
    if (!name) return fail(400, "الاسم مطلوب.");
    put("name", name);
  }
  if ("avatar" in b) {
    if (typeof b.avatar !== "string" || !/^a[1-6]$/.test(b.avatar)) return fail(400, "صورة رمزية غير معروفة.");
    put("avatar", b.avatar);
  }
  if ("prefModel" in b) {
    if (b.prefModel === null) put("pref_model", null);
    else {
      const m = modelById(b.prefModel as string);
      if (!m) return fail(400, "نموذج غير معروف.");
      if (!isUsable(m.id)) return fail(409, "هذا النموذج غير مهيّأ حاليًا، اختر نموذجًا متاحًا.");
      put("pref_model", m.id);
    }
  }
  if ("prefAgent" in b) {
    if (b.prefAgent === null) put("pref_agent", null);
    else if (!agentById(b.prefAgent as string)) return fail(400, "وكيل غير معروف.");
    else put("pref_agent", b.prefAgent as string);
  }
  if ("reminderEnabled" in b) put("reminder_enabled", b.reminderEnabled ? 1 : 0);
  if ("reminderMinutes" in b) {
    const n = Number(b.reminderMinutes);
    if (![10, 20, 30, 60].includes(n)) return fail(400, "مدة غير مدعومة.");
    put("reminder_minutes", n);
  }
  if ("personalize" in b) put("personalize", b.personalize ? 1 : 0);
  if ("externalConsent" in b) put("external_consent", b.externalConsent ? 1 : 0);
  if (!set.length) return fail(400, "لا تغييرات.");
  run(`UPDATE users SET ${set.join(", ")} WHERE id = ?`, ...vals, user.id);
  return ok({ user: toPublic(get<UserRow>("SELECT * FROM users WHERE id = ?", user.id)!) });
});

// حذف الحساب وكل بياناته (المحادثات والمراجعات والمفضلات تُحذف بالتتابع).
export const DELETE = authed(async (req, user) => {
  const b = await readJson(req);
  // دون حد تصير هذه النقطة وسيلة لتخمين كلمة المرور لمن يحمل جلسة مسروقة.
  const key = `delpw:${user.id}`;
  if (isBlocked(key, 5)) return fail(429, "محاولات كثيرة. انتظر ربع ساعة.");
  if (typeof b?.password !== "string" || b.password.length > 200 || !(await verifyPassword(b.password, user.pass_hash))) {
    noteFailure(key, 15 * 60_000);
    return fail(403, "كلمة المرور غير صحيحة.");
  }
  clearFailures(key);
  run("DELETE FROM users WHERE id = ?", user.id);
  await destroySession();
  return ok();
});

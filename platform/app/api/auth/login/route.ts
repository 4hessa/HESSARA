import { createSession, verifyPassword } from "@/lib/auth";
import { get, persistentStoreMissing, type UserRow } from "@/lib/db";
import { clearFailures, fail, ipLimit, isBlocked, noteFailure, ok, readJson, sameOrigin } from "@/lib/http";
import { tOf } from "@/lib/i18n";

export async function POST(req: Request) {
  const t = tOf(req);
  if (!sameOrigin(req)) return fail(403, t("مصدر الطلب غير مسموح.", "Request origin not allowed."));
  if (persistentStoreMissing()) return fail(503, t("التخزين الدائم غير مهيّأ على الخادم: يلزم ضبط DATABASE_URL (قاعدة Postgres). لا يمكن إنشاء حساب أو تسجيل الدخول قبل ذلك.", "Persistent storage is not configured on the server: DATABASE_URL (a Postgres database) must be set. Accounts cannot be created or used until then."));
  const body = await readJson(req);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  const password = typeof body?.password === "string" ? body.password : "";
  // حد بالعنوان (خلف وسيط موثوق فقط) + عدّاد إخفاقات لكل بريد يوقف التخمين مهما تعددت العناوين.
  const key = `login-fail:${email}`;
  if (!ipLimit(req, "login", 30, 15 * 60_000) || isBlocked(key, 10))
    return fail(429, t("محاولات كثيرة. انتظر ربع ساعة ثم حاول مجددًا.", "Too many attempts. Wait fifteen minutes, then try again."));
  const user = email ? await get<UserRow>("SELECT * FROM users WHERE email = ?", email) : undefined;
  // رسالة واحدة للحالتين حتى لا يُكشف وجود الحساب.
  if (!(await verifyPassword(password, user?.pass_hash)) || !user) {
    noteFailure(key, 15 * 60_000);
    return fail(401, t("البريد الإلكتروني أو كلمة المرور غير صحيحة.", "The email address or password is incorrect."));
  }
  clearFailures(key);
  await createSession(user.id);
  return ok();
}

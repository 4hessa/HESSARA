import { createSession, hashPassword, newId } from "@/lib/auth";
import { get, persistentStoreMissing, run } from "@/lib/db";
import { fail, ipLimit, LIMITS, ok, readJson, sameOrigin, str } from "@/lib/http";
import { tOf } from "@/lib/i18n";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const t = tOf(req);
  if (!sameOrigin(req)) return fail(403, t("مصدر الطلب غير مسموح.", "Request origin not allowed."));
  if (persistentStoreMissing()) return fail(503, t("التخزين الدائم غير مهيّأ على الخادم: يلزم ضبط DATABASE_URL (قاعدة Postgres). لا يمكن إنشاء حساب أو تسجيل الدخول قبل ذلك.", "Persistent storage is not configured on the server: DATABASE_URL (a Postgres database) must be set. Accounts cannot be created or used until then."));
  if (!ipLimit(req, "signup", 10, 3600_000)) return fail(429, t("محاولات كثيرة. حاول لاحقًا.", "Too many attempts. Try again later."));
  const body = await readJson(req);
  const name = str(body?.name, LIMITS.name)?.trim();
  const email = str(body?.email, 200)?.trim().toLowerCase();
  const password = typeof body?.password === "string" ? body.password : "";
  if (!name) return fail(400, t("اكتب اسمك.", "Enter your name."));
  if (!email || !EMAIL.test(email)) return fail(400, t("صيغة البريد الإلكتروني غير صحيحة.", "The email address format is not valid."));
  if (password.length < 8 || password.length > 200) return fail(400, t("كلمة المرور يجب ألا تقل عن ٨ أحرف.", "The password must be at least 8 characters."));
  if (body?.accept !== true) return fail(400, t("يلزم قبول شروط الاستخدام وسياسة الخصوصية.", "You must accept the terms of use and the privacy policy."));
  if (await get("SELECT 1 FROM users WHERE email = ?", email)) return fail(409, t("يوجد حساب بهذا البريد. سجّل الدخول بدلًا من ذلك.", "An account with this email already exists. Sign in instead."));
  const id = newId();
  await run("INSERT INTO users (id, email, name, pass_hash, created_at) VALUES (?,?,?,?,?)", id, email, name, await hashPassword(password), Date.now());
  await createSession(id);
  return ok();
}

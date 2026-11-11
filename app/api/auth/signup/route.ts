import { createSession, hashPassword, newId } from "@/lib/auth";
import { get, run } from "@/lib/db";
import { clientKey, fail, LIMITS, ok, rateLimit, readJson, sameOrigin, str } from "@/lib/http";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "مصدر الطلب غير مسموح.");
  if (!rateLimit(`signup:${clientKey(req)}`, 10, 3600_000)) return fail(429, "محاولات كثيرة. حاول لاحقًا.");
  const body = await readJson(req);
  const name = str(body?.name, LIMITS.name)?.trim();
  const email = str(body?.email, 200)?.trim().toLowerCase();
  const password = typeof body?.password === "string" ? body.password : "";
  if (!name) return fail(400, "اكتب اسمك.");
  if (!email || !EMAIL.test(email)) return fail(400, "صيغة البريد الإلكتروني غير صحيحة.");
  if (password.length < 8 || password.length > 200) return fail(400, "كلمة المرور يجب ألا تقل عن ٨ أحرف.");
  if (body?.accept !== true) return fail(400, "يلزم قبول شروط الاستخدام وسياسة الخصوصية.");
  if (get("SELECT 1 FROM users WHERE email = ?", email)) return fail(409, "يوجد حساب بهذا البريد. سجّل الدخول بدلًا من ذلك.");
  const id = newId();
  run("INSERT INTO users (id, email, name, pass_hash, created_at) VALUES (?,?,?,?,?)", id, email, name, hashPassword(password), Date.now());
  await createSession(id);
  return ok();
}

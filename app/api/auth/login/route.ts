import { createSession, verifyPassword } from "@/lib/auth";
import { get, type UserRow } from "@/lib/db";
import { clearFailures, fail, ipLimit, isBlocked, noteFailure, ok, readJson, sameOrigin } from "@/lib/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "مصدر الطلب غير مسموح.");
  const body = await readJson(req);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  const password = typeof body?.password === "string" ? body.password : "";
  // حد بالعنوان (خلف وسيط موثوق فقط) + عدّاد إخفاقات لكل بريد يوقف التخمين مهما تعددت العناوين.
  const key = `login-fail:${email}`;
  if (!ipLimit(req, "login", 30, 15 * 60_000) || isBlocked(key, 10))
    return fail(429, "محاولات كثيرة. انتظر ربع ساعة ثم حاول مجددًا.");
  const user = email ? await get<UserRow>("SELECT * FROM users WHERE email = ?", email) : undefined;
  // رسالة واحدة للحالتين حتى لا يُكشف وجود الحساب.
  if (!(await verifyPassword(password, user?.pass_hash)) || !user) {
    noteFailure(key, 15 * 60_000);
    return fail(401, "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  }
  clearFailures(key);
  await createSession(user.id);
  return ok();
}

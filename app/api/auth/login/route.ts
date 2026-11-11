import { createSession, verifyPassword } from "@/lib/auth";
import { get, type UserRow } from "@/lib/db";
import { clientKey, fail, ok, rateLimit, readJson, sameOrigin } from "@/lib/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "مصدر الطلب غير مسموح.");
  const body = await readJson(req);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!rateLimit(`login:${clientKey(req)}:${email}`, 8, 15 * 60_000))
    return fail(429, "محاولات كثيرة. انتظر ربع ساعة ثم حاول مجددًا.");
  const user = email ? get<UserRow>("SELECT * FROM users WHERE email = ?", email) : undefined;
  // رسالة واحدة للحالتين حتى لا يُكشف وجود الحساب.
  if (!user || !verifyPassword(password, user.pass_hash)) return fail(401, "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  await createSession(user.id);
  return ok();
}

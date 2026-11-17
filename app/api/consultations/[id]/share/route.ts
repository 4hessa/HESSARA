// رابط مشاركة للقراءة فقط: يُنشئه صاحب الاستشارة ويلغيه متى شاء. الرمز عشوائي (144 بتًا) فلا يُخمَّن،
// ولا يكشف الرابط اسم صاحبه ولا بريده. حذف الاستشارة أو الحساب يحذف الرابط معه.
import crypto from "node:crypto";
import { get, run } from "@/lib/db";
import { authed, fail, ok } from "@/lib/http";
import { tOf } from "@/lib/i18n";

type Ctx = { params: Promise<{ id: string }> };

export const POST = authed<Ctx>(async (req, user, ctx) => {
  const t = tOf(req);
  const { id } = await ctx.params;
  if (!(await get("SELECT 1 FROM consultations WHERE id = ? AND user_id = ?", id, user.id))) return fail(404, t("الاستشارة غير موجودة.", "Consultation not found."));
  const existing = await get<{ token: string }>("SELECT token FROM shares WHERE consultation_id = ?", id);
  if (existing) return ok({ token: existing.token });
  const token = crypto.randomBytes(18).toString("base64url");
  try {
    await run("INSERT INTO shares (token, consultation_id, user_id, created_at) VALUES (?,?,?,?)", token, id, user.id, Date.now());
  } catch {
    // طلبان متزامنان: الثاني يصطدم بقيد التفرد، فيُعاد الرابط الذي أنشأه الأول.
    const again = await get<{ token: string }>("SELECT token FROM shares WHERE consultation_id = ?", id);
    if (again) return ok({ token: again.token });
    return fail(500, t("تعذر إنشاء الرابط.", "Could not create the link."));
  }
  return ok({ token });
});

export const DELETE = authed<Ctx>(async (req, user, ctx) => {
  const { id } = await ctx.params;
  await run("DELETE FROM shares WHERE consultation_id = ? AND user_id = ?", id, user.id);
  return ok();
});

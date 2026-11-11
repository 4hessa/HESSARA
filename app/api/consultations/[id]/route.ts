import { all, get, run, type ConsultRow, type MessageRow, type ReviewRow } from "@/lib/db";
import { authed, fail, ok, readJson, str } from "@/lib/http";
import { isUsable } from "@/lib/providers";

type Ctx = { params: Promise<{ id: string }> };
const own = (id: string, userId: string) => get<ConsultRow>("SELECT * FROM consultations WHERE id = ? AND user_id = ?", id, userId);

export const GET = authed<Ctx>(async (_req, user, ctx) => {
  const c = own((await ctx.params).id, user.id);
  if (!c) return fail(404, "الاستشارة غير موجودة.");
  const messages = all<MessageRow>("SELECT * FROM messages WHERE consultation_id = ? ORDER BY created_at, rowid", c.id);
  const reviews = all<ReviewRow>("SELECT * FROM reviews WHERE consultation_id = ? AND user_id = ? ORDER BY created_at DESC", c.id, user.id);
  return ok({ consultation: c, messages, reviews });
});

export const PATCH = authed<Ctx>(async (req, user, ctx) => {
  const c = own((await ctx.params).id, user.id);
  if (!c) return fail(404, "الاستشارة غير موجودة.");
  const b = await readJson(req);
  if (!b) return fail(400, "طلب غير صالح.");
  if ("saved" in b) run("UPDATE consultations SET saved = ? WHERE id = ?", b.saved ? 1 : 0, c.id);
  if ("title" in b) {
    const t = str(b.title, 120)?.trim();
    if (!t) return fail(400, "العنوان مطلوب.");
    run("UPDATE consultations SET title = ? WHERE id = ?", t, c.id);
  }
  if ("modelId" in b) {
    if (typeof b.modelId !== "string" || !isUsable(b.modelId)) return fail(409, "النموذج المختار غير متاح.");
    run("UPDATE consultations SET model_id = ? WHERE id = ?", b.modelId, c.id);
  }
  return ok({ consultation: own(c.id, user.id) });
});

export const DELETE = authed<Ctx>(async (_req, user, ctx) => {
  const c = own((await ctx.params).id, user.id);
  if (!c) return fail(404, "الاستشارة غير موجودة.");
  run("DELETE FROM consultations WHERE id = ?", c.id);
  return ok();
});

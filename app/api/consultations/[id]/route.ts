import { all, get, run, type ConsultRow, type MessageRow, type ReviewRow } from "@/lib/db";
import { authed, fail, ok, readJson, str } from "@/lib/http";
import { isUsable } from "@/lib/providers";
import { tOf } from "@/lib/i18n";

type Ctx = { params: Promise<{ id: string }> };
const own = (id: string, userId: string) => get<ConsultRow>("SELECT * FROM consultations WHERE id = ? AND user_id = ?", id, userId);

export const GET = authed<Ctx>(async (req, user, ctx) => {
  const t = tOf(req);
  const c = await own((await ctx.params).id, user.id);
  if (!c) return fail(404, t("الاستشارة غير موجودة.", "Consultation not found."));
  const messages = await all<MessageRow>("SELECT * FROM messages WHERE consultation_id = ? ORDER BY created_at, id", c.id);
  const reviews = await all<ReviewRow>("SELECT * FROM reviews WHERE consultation_id = ? AND user_id = ? ORDER BY created_at DESC", c.id, user.id);
  return ok({ consultation: c, messages, reviews });
});

export const PATCH = authed<Ctx>(async (req, user, ctx) => {
  const t = tOf(req);
  const c = await own((await ctx.params).id, user.id);
  if (!c) return fail(404, t("الاستشارة غير موجودة.", "Consultation not found."));
  const b = await readJson(req);
  if (!b) return fail(400, t("طلب غير صالح.", "Invalid request."));
  if ("saved" in b) await run("UPDATE consultations SET saved = ? WHERE id = ?", b.saved ? 1 : 0, c.id);
  if ("title" in b) {
    const title = str(b.title, 120)?.trim();
    if (!title) return fail(400, t("العنوان مطلوب.", "A title is required."));
    await run("UPDATE consultations SET title = ? WHERE id = ?", title, c.id);
  }
  if ("modelId" in b) {
    if (typeof b.modelId !== "string" || !isUsable(b.modelId)) return fail(409, t("النموذج المختار غير متاح.", "The chosen model is not available."));
    await run("UPDATE consultations SET model_id = ? WHERE id = ?", b.modelId, c.id);
  }
  return ok({ consultation: await own(c.id, user.id) });
});

export const DELETE = authed<Ctx>(async (req, user, ctx) => {
  const t = tOf(req);
  const c = await own((await ctx.params).id, user.id);
  if (!c) return fail(404, t("الاستشارة غير موجودة.", "Consultation not found."));
  await run("DELETE FROM consultations WHERE id = ?", c.id);
  return ok();
});

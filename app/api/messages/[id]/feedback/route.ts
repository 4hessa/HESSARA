import { get, run } from "@/lib/db";
import { authed, fail, ok, readJson } from "@/lib/http";

export const POST = authed<{ params: Promise<{ id: string }> }>(async (req, user, ctx) => {
  const { id } = await ctx.params;
  const b = await readJson(req);
  const v = b?.value === 1 || b?.value === -1 ? b.value : b?.value === null ? null : undefined;
  if (v === undefined) return fail(400, "قيمة غير صالحة.");
  const m = get("SELECT m.id FROM messages m JOIN consultations c ON c.id = m.consultation_id WHERE m.id = ? AND c.user_id = ? AND m.role = 'assistant'", id, user.id);
  if (!m) return fail(404, "الرسالة غير موجودة.");
  run("UPDATE messages SET feedback = ? WHERE id = ?", v, id);
  return ok();
});

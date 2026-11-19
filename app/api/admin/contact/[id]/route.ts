// حذف رسالة تواصل: لصاحب المشروع وحده، ولغيره يبدو المسار غير موجود.
import { deleteContact } from "@/lib/contact";
import { authed, fail, ok } from "@/lib/http";
import { isAdmin } from "@/lib/usage";

export const DELETE = authed<{ params: Promise<{ id: string }> }>(async (_req, user, ctx) => {
  if (!isAdmin(user.email)) return fail(404, "Not found");
  await deleteContact((await ctx.params).id);
  return ok();
});

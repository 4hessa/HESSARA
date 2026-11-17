// تنزيل إجابات استبيان سهولة الاستخدام لصاحب المشروع، ملفًا جدوليًا دون أي معرّف للمستخدمين.
import { authed, fail } from "@/lib/http";
import { susCsv } from "@/lib/sus";
import { isAdmin } from "@/lib/usage";

export const GET = authed(async (_req, user) => {
  if (!isAdmin(user.email)) return fail(404, "Not found");
  return new Response(await susCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="hessara-sus.csv"',
      "cache-control": "no-store",
    },
  });
});

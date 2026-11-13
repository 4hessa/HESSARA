import { destroySession } from "@/lib/auth";
import { fail, ok, sameOrigin } from "@/lib/http";
import { tOf } from "@/lib/i18n";

export async function POST(req: Request) {
  const t = tOf(req);
  if (!sameOrigin(req)) return fail(403, t("مصدر الطلب غير مسموح.", "Request origin not allowed."));
  await destroySession();
  return ok();
}

import { destroySession } from "@/lib/auth";
import { fail, ok, sameOrigin } from "@/lib/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "مصدر الطلب غير مسموح.");
  await destroySession();
  return ok();
}

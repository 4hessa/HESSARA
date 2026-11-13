import { currentUser } from "@/lib/auth";
import { ok } from "@/lib/http";
import { langOf } from "@/lib/i18n";
import { listModels } from "@/lib/providers";

export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  return ok({ models: listModels(!!(await currentUser()), langOf(req)) });
}

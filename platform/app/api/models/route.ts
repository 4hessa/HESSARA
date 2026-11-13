import { currentUser } from "@/lib/auth";
import { ok } from "@/lib/http";
import { listModels } from "@/lib/providers";

export const dynamic = "force-dynamic";
export async function GET() {
  return ok({ models: listModels(!!(await currentUser())) });
}

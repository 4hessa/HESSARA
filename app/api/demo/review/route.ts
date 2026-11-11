import { clientKey, fail, ok, rateLimit, readJson, sameOrigin, str } from "@/lib/http";
import { heuristicReview } from "@/lib/review/heuristic";
import { modeById } from "@/lib/review/types";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "مصدر الطلب غير مسموح.");
  if (!rateLimit(`demo:${clientKey(req)}`, 20, 60_000)) return fail(429, "طلبات كثيرة. انتظر قليلًا.");
  const b = await readJson(req);
  const text = str(b?.text, 8000);
  const mode = modeById(typeof b?.mode === "string" ? b.mode : "technical");
  if (!text || !mode || mode.needsCriteria) return fail(400, "طلب غير صالح.");
  return ok({ result: heuristicReview(mode.id, text, []) });
}

import { fail, ipLimit, ok, readJson, sameOrigin, str } from "@/lib/http";
import { heuristicReview } from "@/lib/review/heuristic";
import { modeById } from "@/lib/review/types";
import { langOf, makeT } from "@/lib/i18n";

export async function POST(req: Request) {
  const lang = langOf(req);
  const t = makeT(lang);
  if (!sameOrigin(req)) return fail(403, t("مصدر الطلب غير مسموح.", "Request origin not allowed."));
  if (!ipLimit(req, "demo", 20, 60_000)) return fail(429, t("طلبات كثيرة. انتظر قليلًا.", "Too many requests. Wait a little."));
  const b = await readJson(req);
  const text = str(b?.text, 8000);
  const mode = modeById(typeof b?.mode === "string" ? b.mode : "technical", lang);
  if (!text || !mode || mode.needsCriteria) return fail(400, t("طلب غير صالح.", "Invalid request."));
  return ok({ result: heuristicReview(mode.id, text, [], lang) });
}

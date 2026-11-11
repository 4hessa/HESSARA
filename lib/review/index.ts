import { firstLlm } from "../providers";
import { ProviderError } from "../providers/types";
import { heuristicReview } from "./heuristic";
import { llmReview } from "./llm";
import { modeById, type ReviewResult } from "./types";

export type EngineChoice = "auto" | "heuristic";

/** يشغّل المراجعة بنموذج لغوي إن وُجد وإلا بالمراجع القاعدي، ويصرّح دائمًا بالمحرك المستخدم. */
export async function runReview(opts: {
  mode: string; text: string; criteria: string[]; engine?: EngineChoice; preferredModel?: string | null; signal?: AbortSignal;
}): Promise<ReviewResult> {
  const mode = modeById(opts.mode);
  if (!mode) throw new Error("نمط مراجعة غير معروف.");
  const criteria = mode.needsCriteria ? opts.criteria : [...mode.criteria, ...opts.criteria];
  const llm = opts.engine === "heuristic" ? null : firstLlm(opts.preferredModel);
  if (llm) {
    try {
      return await llmReview(llm, opts.mode, opts.text, criteria, opts.signal);
    } catch (e) {
      const r = heuristicReview(opts.mode, opts.text, criteria);
      r.limits.unshift(`تعذرت المراجعة بالنموذج اللغوي (${e instanceof ProviderError ? e.message : "خطأ في تحليل مخرجات النموذج"}) فاستُخدم المراجع القاعدي بديلًا.`);
      return r;
    }
  }
  return heuristicReview(opts.mode, opts.text, criteria);
}

import { firstLlm } from "../providers/index.ts";
import { ProviderError } from "../providers/types.ts";
import { heuristicReview } from "./heuristic.ts";
import { llmReview } from "./llm.ts";
import { modeById, type ReviewResult } from "./types.ts";

export type EngineChoice = "auto" | "heuristic";

/** يشغّل المراجعة بنموذج لغوي إن وُجد وإلا بالمراجع القاعدي، ويصرّح دائمًا بالمحرك المستخدم. */
export async function runReview(opts: {
  mode: string; text: string; criteria: string[]; engine?: EngineChoice; preferredModel?: string | null; signal?: AbortSignal; lang?: "ar" | "en";
}): Promise<ReviewResult> {
  const lang = opts.lang ?? "ar";
  const mode = modeById(opts.mode, lang);
  if (!mode) throw new Error(lang === "ar" ? "نمط مراجعة غير معروف." : "Unknown review mode.");
  const criteria = mode.needsCriteria ? opts.criteria : [...mode.criteria, ...opts.criteria];
  const llm = opts.engine === "heuristic" ? null : firstLlm(opts.preferredModel);
  if (llm) {
    try {
      return await llmReview(llm, opts.mode, opts.text, criteria, opts.signal, lang);
    } catch (e) {
      const r = heuristicReview(opts.mode, opts.text, criteria, lang);
      r.limits.unshift(lang === "ar"
        ? `تعذرت المراجعة بالنموذج اللغوي (${e instanceof ProviderError ? e.text("ar") : "خطأ في تحليل مخرجات النموذج"}) فاستُخدم المراجع القاعدي بديلًا.`
        : `The language-model review failed (${e instanceof ProviderError ? e.text("en") : "the model's output could not be parsed"}), so the rule-based reviewer was used instead.`);
      return r;
    }
  }
  return heuristicReview(opts.mode, opts.text, criteria, lang);
}

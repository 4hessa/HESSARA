import { firstLlm } from "../providers/index.ts";
import { ProviderError } from "../providers/types.ts";
import { heuristicReview } from "./heuristic.ts";
import { jevAvailable, jevResult, jevVerdicts } from "./jev.ts";
import { llmReview } from "./llm.ts";
import { modeById, type ReviewResult } from "./types.ts";

export type EngineChoice = "auto" | "heuristic";

/**
 * يشغّل المراجعة ويصرّح دائمًا بالمحرك المستخدم:
 * المحكّم المنظّم يُحكم بنموذج القرار Jev حين يتاح؛ وبقية الأنماط بنموذج لغوي إن وُجد؛ وإلا بالمراجع القاعدي.
 */
export async function runReview(opts: {
  mode: string; text: string; criteria: string[]; engine?: EngineChoice; preferredModel?: string | null; signal?: AbortSignal; lang?: "ar" | "en";
}): Promise<ReviewResult> {
  const lang = opts.lang ?? "ar";
  const mode = modeById(opts.mode, lang);
  if (!mode) throw new Error(lang === "ar" ? "نمط مراجعة غير معروف." : "Unknown review mode.");
  const criteria = mode.needsCriteria ? opts.criteria : [...mode.criteria, ...opts.criteria];
  const notes: string[] = [];
  let gatewayRefused = false;
  if (opts.mode === "judge" && opts.engine !== "heuristic" && jevAvailable() && criteria.length) {
    try {
      return jevResult(await jevVerdicts(opts.text, criteria, lang, opts.signal), lang);
    } catch (e) {
      // رفض البوابة (مصادقة أو رصيد) يعني أن أي نموذج يمر بها سيُرفض للسبب نفسه.
      gatewayRefused = e instanceof ProviderError && e.kind === "auth";
      notes.push(lang === "ar"
        ? `تعذر الحكم بنموذج التقييم Jev (${e instanceof ProviderError ? e.text("ar") : "خطأ غير متوقع"}).`
        : `The Jev evaluation model could not judge (${e instanceof ProviderError ? e.text("en") : "an unexpected error"}).`);
    }
  }
  const candidate = opts.engine === "heuristic" ? null : firstLlm(opts.preferredModel);
  const llm = gatewayRefused && candidate?.route === "gateway" ? null : candidate;
  if (llm) {
    try {
      const r = await llmReview(llm, opts.mode, opts.text, criteria, opts.signal, lang);
      r.limits.unshift(...notes);
      return r;
    } catch (e) {
      notes.push(lang === "ar"
        ? `تعذرت المراجعة بالنموذج اللغوي (${e instanceof ProviderError ? e.text("ar") : "خطأ في تحليل مخرجات النموذج"}).`
        : `The language-model review failed (${e instanceof ProviderError ? e.text("en") : "the model's output could not be parsed"}).`);
    }
  }
  const r = heuristicReview(opts.mode, opts.text, criteria, lang);
  if (notes.length) {
    const tail = lang === "ar" ? " فاستُخدم المراجع القاعدي بديلًا." : " The rule-based reviewer was used instead.";
    r.limits.unshift(...notes.slice(0, -1), notes[notes.length - 1] + tail);
  }
  return r;
}

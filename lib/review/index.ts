import { lastCheckFailed, llmCandidates, syncChecks, type ResolvedModel } from "../providers/index.ts";
import { ProviderError } from "../providers/types.ts";
import { heuristicReview } from "./heuristic.ts";
import { jevAvailable, jevResult, jevVerdicts } from "./jev.ts";
import { llmReview } from "./llm.ts";
import { modeById, type ReviewResult } from "./types.ts";

export type EngineChoice = "auto" | "heuristic";

// سبب الفشل يوضع بين قوسين داخل جملة، فتُحذف نقطته الأخيرة كي لا تتكرر العلامة.
const reason = (e: unknown, lang: "ar" | "en", fallback: string) => (e instanceof ProviderError ? e.text(lang) : fallback).replace(/[.。]\s*$/, "");

/**
 * يشغّل المراجعة ويصرّح دائمًا بالمحرك المستخدم:
 * المحكّم المنظّم يُحكم بنموذج القرار Jev حين يتاح؛ وبقية الأنماط بنموذج لغوي إن وُجد؛ وإلا بالمراجع القاعدي.
 * authorModel: النموذج الذي كتب الإجابة. تُراجَع بنموذج غيره متى كان مثله ثقة، وإلا صُرّح بأنها مراجعة ذاتية.
 * إن فشل النموذج الأول جُرّب نموذج ثانٍ لم يفشل آخر اختبار له، قبل الارتداد إلى المراجع القاعدي.
 */
export async function runReview(opts: {
  mode: string; text: string; criteria: string[]; engine?: EngineChoice; preferredModel?: string | null; authorModel?: string | null; signal?: AbortSignal; lang?: "ar" | "en";
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
        ? `تعذر الحكم بنموذج التقييم Jev (${reason(e, "ar", "خطأ غير متوقع")}).`
        : `The Jev evaluation model could not judge (${reason(e, "en", "an unexpected error")}).`);
    }
  }
  if (opts.engine !== "heuristic") await syncChecks();
  const tried: ResolvedModel[] = [];
  let llmFailed = false;
  let refused: ResolvedModel | null = null;
  // رفض المزوّد للمفتاح (مصادقة) يعني أن كل نموذج على الطريق نفسه بالمفتاح نفسه سيُرفض للسبب نفسه.
  const sharesRefusedKey = (next: ResolvedModel) =>
    !!refused && refused.route === next.route && (next.route === "gateway" || (!!refused.def.env.key && refused.def.env.key === next.def.env.key));
  for (const llm of opts.engine === "heuristic" ? [] : llmCandidates(opts.preferredModel, opts.authorModel)) {
    if (tried.length === 2) break;
    if (gatewayRefused && llm.route === "gateway") continue;
    // المحاولة الثانية لنموذج لم يفشل آخر اختبار له، ولا يشارك الأول مفتاحًا رفضه المزوّد.
    if (tried.length && (lastCheckFailed(llm.def) || sharesRefusedKey(llm))) continue;
    tried.push(llm);
    try {
      const r = await llmReview(llm, opts.mode, opts.text, criteria, opts.signal, lang);
      if (opts.authorModel && llm.def.id === opts.authorModel) r.limits.unshift(lang === "ar"
        ? "راجع الإجابةَ النموذجُ نفسه الذي كتبها، لأنه لم يتح نموذج آخر بالثقة نفسها. والمراجعة الذاتية أضعف من مراجعة نموذج مستقل."
        : "The answer was reviewed by the same model that wrote it, because no other model was available with the same reliability. Self-review is weaker than review by an independent model.");
      r.limits.unshift(...notes);
      return r;
    } catch (e) {
      llmFailed = true;
      refused = e instanceof ProviderError && e.kind === "auth" ? llm : null;
      notes.push(lang === "ar"
        ? `تعذرت المراجعة بالنموذج اللغوي ${llm.def.name} (${reason(e, "ar", "خطأ في تحليل مخرجات النموذج")}).`
        : `The language-model review with ${llm.def.name} failed (${reason(e, "en", "the model's output could not be parsed")}).`);
      if (opts.signal?.aborted) break;
    }
  }
  const r = heuristicReview(opts.mode, opts.text, criteria, lang);
  if (notes.length) {
    const tail = lang === "ar" ? " فاستُخدم المراجع القاعدي بديلًا." : " The rule-based reviewer was used instead.";
    r.limits.unshift(...notes.slice(0, -1), notes[notes.length - 1] + tail);
    // سبب الارتداد يُعرض أعلى النتيجة أيضًا، لا في آخر الحدود وحدها.
    if (llmFailed || gatewayRefused) r.fallback = lang === "ar"
      ? "تعذرت المراجعة بالنموذج اللغوي، فهذه نتيجة فحص الألفاظ. يمكن إعادة المراجعة بعد قليل."
      : "The language-model review could not run, so this is the result of word checks. You can run the review again shortly.";
  }
  return r;
}

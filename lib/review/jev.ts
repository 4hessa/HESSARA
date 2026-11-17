// نموذج التقييم Jev من TypeSafe AI، عبر بوابة Vercel للذكاء الاصطناعي.
// لا يكتب نصًا: يجيب عن سؤال «نعم أو لا» لكل معيار باحتمال معايَر، فيصلح حَكَمًا للمحكّم المنظّم.
// الواجهة: POST /v1/decisions المتوافقة مع OpenAI (https://vercel.com/docs/ai-gateway/modalities/decision)
import { gatewayBaseUrl, gatewayEnabled, gatewayError, gatewayToken } from "../providers/gateway.ts";
import { safeFetch } from "../providers/sse.ts";
import { ProviderError } from "../providers/types.ts";
import type { ReviewResult, Verdict } from "./types.ts";

export const JEV_MODEL = "typesafe-ai/jev";
/** Jev متاح حيث تتاح البوابة (على Vercel، أو مع AI_GATEWAY_API_KEY). */
export const jevAvailable = () => gatewayEnabled();

// عتبتا الحكم: 60% فأكثر مستوفى، و40% فأقل غير مستوفى، وما بينهما غير محسوم.
const PASS = 0.6;
const FAIL = 0.4;

type L = "ar" | "en";

/** حكم لكل معيار: سؤال «predicate» واحد لكل معيار، في طلب واحد. */
export async function jevVerdicts(text: string, criteria: string[], lang: L, signal?: AbortSignal): Promise<Verdict[]> {
  const token = gatewayToken();
  const res = await safeFetch(`${gatewayBaseUrl().replace(/\/$/, "")}/decisions`, {
    method: "POST",
    signal,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({
      model: JEV_MODEL,
      input: text,
      questions: criteria.map((c, i) => ({
        type: "predicate",
        name: `c${i + 1}`,
        instructions: lang === "ar" ? `هل يستوفي النص هذا المعيار؟ ${c}` : `Does the text meet this criterion? ${c}`,
      })),
    }),
  });
  if (!res.ok) throw await gatewayError(res);
  let body: { answers?: { name?: string; probability?: unknown }[] };
  try {
    body = await res.json();
  } catch {
    throw new ProviderError({ ar: "أعاد Jev ردًا غير مفهوم.", en: "Jev returned an unreadable reply." }, "bad_request");
  }
  const answers = Array.isArray(body?.answers) ? body.answers : [];
  return criteria.map((criterion, i) => {
    const p = answers.find((a) => a?.name === `c${i + 1}`)?.probability;
    if (typeof p !== "number" || !Number.isFinite(p) || p < 0 || p > 1)
      throw new ProviderError({ ar: "أعاد Jev ردًا بلا احتمال صالح لأحد المعايير.", en: "Jev returned no valid probability for a criterion." }, "bad_request");
    const pct = Math.round(p * 100);
    return {
      criterion,
      status: p >= PASS ? "pass" : p <= FAIL ? "fail" : "unclear",
      probability: p,
      reason: lang === "ar" ? `احتمال استيفاء المعيار حسب Jev: ${pct}%.` : `Probability that the criterion is met, according to Jev: ${pct}%.`,
    };
  });
}

/** نتيجة مراجعة كاملة من أحكام Jev، بالصيغة نفسها التي تعرضها الواجهة لبقية المحركات. */
export function jevResult(verdicts: Verdict[], lang: L): ReviewResult {
  const n = (s: Verdict["status"]) => verdicts.filter((v) => v.status === s).length;
  const ar = lang === "ar";
  return {
    engine: "jev",
    engineLabel: ar ? "Jev من TypeSafe AI: نموذج قرار يعطي احتمالًا لكل معيار" : "Jev by TypeSafe AI: a decision model that gives a probability for each criterion",
    summary: ar
      ? `حكم Jev على ${verdicts.length} معيار: ${n("pass")} مستوفى، و${n("fail")} غير مستوفى، و${n("unclear")} غير محسوم.`
      : `Jev judged ${verdicts.length} criteria: ${n("pass")} met, ${n("fail")} not met, ${n("unclear")} undecided.`,
    strengths: [],
    findings: [],
    verdicts,
    needsHuman: true,
    limits: ar
      ? ["الاحتمال تقدير من النموذج لا برهان؛ راجع المعايير الحاسمة بنفسك.", "يحكم Jev على النص كما هو، ولا يتحقق من صحة معلومات خارجه.", "عتبة الحكم: 60% فأكثر مستوفى، و40% فأقل غير مستوفى، وما بينهما غير محسوم."]
      : ["The probability is the model's estimate, not proof; check the decisive criteria yourself.", "Jev judges the text as it is and does not verify facts beyond it.", "Thresholds: 60% or more is met, 40% or less is not met, anything between is undecided."],
  };
}

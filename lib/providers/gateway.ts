// بوابة الذكاء الاصطناعي في Vercel: واجهة واحدة متوافقة مع OpenAI تخدم نماذج كل المزوّدين
// (Anthropic وOpenAI وGoogle وDeepSeek وAlibaba وMeta)، وتُحاسَب من رصيد البوابة في حساب Vercel
// بدل حساب منفصل لدى كل مزوّد. التوثيق: https://vercel.com/docs/ai-gateway
import { AsyncLocalStorage } from "node:async_hooks";
import { httpError } from "./sse.ts";
import { ProviderError } from "./types.ts";

const DEFAULT_URL = "https://ai-gateway.vercel.sh/v1";
/** AI_GATEWAY_BASE_URL للاختبار مقابل خادم محاكٍ فقط. */
export const gatewayBaseUrl = () => process.env.AI_GATEWAY_BASE_URL?.trim() || DEFAULT_URL;

/** رمز OIDC للطلب الجاري، يضعه غلاف مسارات الواجهة البرمجية من ترويسة الطلب. */
export const requestToken = new AsyncLocalStorage<string | undefined>();
// سياق الاستدعاء الذي تضعه بيئة تشغيل Vercel (المصدر نفسه الذي تقرأ منه حزمة @vercel/oidc).
const RUNTIME_CONTEXT = Symbol.for("@vercel/request-context");
type RuntimeContext = { get?: () => { headers?: Record<string, string | undefined> } | undefined };

/**
 * رمز المصادقة مع البوابة: مفتاحها AI_GATEWAY_API_KEY إن ضُبط، وإلا رمز OIDC الذي تمنحه Vercel
 * لكل استدعاء دالة، فلا يلزم مفتاح على الاستضافة نفسها.
 */
export function gatewayToken(): string | undefined {
  const key = process.env.AI_GATEWAY_API_KEY?.trim();
  if (key) return key;
  const fromRequest = requestToken.getStore();
  if (fromRequest) return fromRequest;
  const ctx = (globalThis as unknown as Record<symbol, RuntimeContext | undefined>)[RUNTIME_CONTEXT]?.get?.();
  return ctx?.headers?.["x-vercel-oidc-token"] || process.env.VERCEL_OIDC_TOKEN?.trim() || undefined;
}

/**
 * تُوجَّه النماذج عبر البوابة إذا ضُبط مفتاحها، أو كان التشغيل على Vercel حيث يصل رمز OIDC مع كل استدعاء.
 * HESSARA_ROUTE=direct يعطّلها فتُستخدم مفاتيح المزوّدين المباشرة وحدها.
 */
export function gatewayEnabled(): boolean {
  if (process.env.HESSARA_ROUTE?.trim() === "direct") return false;
  return !!process.env.AI_GATEWAY_API_KEY?.trim() || process.env.VERCEL === "1";
}

/** رسالة واضحة من ردّ البوابة. نص الردّ الأصلي يُسجَّل في سجلات الخادم فقط ولا يُعرض للمستخدم. */
export async function gatewayError(res: Response): Promise<ProviderError> {
  let raw = "";
  try {
    raw = (await res.text()).slice(0, 800);
  } catch {
    /* لا جسم */
  }
  let message = raw;
  try {
    const j = JSON.parse(raw);
    message = String(j?.error?.message ?? j?.message ?? raw);
  } catch {
    /* نص عادي */
  }
  console.error("[gateway]", res.status, message.slice(0, 300));
  // ردّ البوابة الفعلي (٢٠٢٦-١١-١٤) لحساب بلا بطاقة: 403 "AI Gateway requires a valid credit card on file ... to unlock your free credits".
  if (/credit card|card on file/i.test(message))
    return new ProviderError({
      ar: "بوابة Vercel تطلب إضافة بطاقة دفع صالحة إلى الحساب لفتح الرصيد المجاني. تُضاف من تبويب AI Gateway في لوحة Vercel.",
      en: "The Vercel AI Gateway needs a valid payment card on the account to unlock its free credits. Add one from the AI Gateway tab in the Vercel dashboard.",
    }, "auth");
  // ردّ البوابة الفعلي لنموذج Jev (٢٠٢٦-١١-١٤): 403 "Free tier users do not have access to this model. Upgrade to paid credits ...".
  if (/free tier/i.test(message))
    return new ProviderError({
      ar: "هذا النموذج غير متاح ضمن الرصيد المجاني لبوابة Vercel، ويحتاج رصيدًا مدفوعًا يُشحن من تبويب AI Gateway في لوحة Vercel.",
      en: "This model is not available on the Vercel AI Gateway's free credits; it needs paid credits, added from the AI Gateway tab in the Vercel dashboard.",
    }, "auth");
  if (res.status === 402 || /insufficient|credit|balance|funds|payment|top[ -]?up/i.test(message))
    return new ProviderError({
      ar: "رصيد بوابة Vercel للذكاء الاصطناعي لا يكفي. يُضاف من تبويب AI Gateway في لوحة Vercel.",
      en: "The Vercel AI Gateway credit balance is too low. Add credits from the AI Gateway tab in the Vercel dashboard.",
    }, "auth");
  if (res.status === 401)
    return new ProviderError({
      ar: "تعذرت المصادقة مع بوابة Vercel. أضف مفتاح البوابة باسم AI_GATEWAY_API_KEY في متغيرات المشروع.",
      en: "Authentication with the Vercel AI Gateway failed. Add a gateway key as AI_GATEWAY_API_KEY in the project's variables.",
    }, "auth");
  if (res.status === 404)
    return new ProviderError({ ar: "معرّف النموذج غير موجود في بوابة Vercel.", en: "The model identifier was not found on the Vercel AI Gateway." }, "bad_request");
  return httpError(res.status);
}

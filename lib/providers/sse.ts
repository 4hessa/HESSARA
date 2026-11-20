// قارئ أحداث SSE عام للمزوّدين الذين نخاطبهم عبر HTTP مباشرة.
import { ProviderError } from "./types.ts";

export async function* sseData(res: Response): AsyncIterable<string> {
  if (!res.body) return;
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i: number;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (line.startsWith("data:")) yield line.slice(5).trim();
    }
  }
}

export function httpError(status: number): ProviderError {
  if (status === 401 || status === 403) return new ProviderError({ ar: "مفتاح الخدمة غير صالح أو بلا صلاحية.", en: "The service key is invalid or lacks permission." }, "auth");
  if (status === 429) return new ProviderError({ ar: "تجاوز الحساب حد الطلبات لدى المزوّد.", en: "The account has exceeded the provider's rate limit." }, "rate_limit");
  if (status === 400 || status === 404) return new ProviderError({ ar: "رفض المزوّد الطلب (معرّف النموذج أو الصيغة).", en: "The provider rejected the request (model identifier or format)." }, "bad_request");
  return new ProviderError({ ar: "خدمة المزوّد غير متاحة مؤقتًا.", en: "The provider's service is temporarily unavailable." }, "unavailable");
}

/**
 * خطأ HTTP من مزوّد يُتصل به مباشرة: يُسجَّل رمزه وبداية ردّه في سجلات الخادم للتشخيص، ولا يُعرض للمستخدم.
 * بدونه لا يُعرف لماذا فشل نموذج على الموقع الحي (ردّ المزوّد لا يحمل المفتاح).
 */
export async function providerHttpError(res: Response, label: string): Promise<ProviderError> {
  const raw = (await res.text().catch(() => "")).slice(0, 2000);
  let message = raw;
  try {
    const j = JSON.parse(raw);
    message = String(j?.error?.message ?? j?.message ?? raw);
  } catch {
    /* نص عادي */
  }
  console.error(`[${label}]`, res.status, message.replace(/\s+/g, " ").slice(0, 300));
  return httpError(res.status);
}

export async function safeFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ProviderError({ ar: "تعذر الاتصال بخدمة المزوّد.", en: "Could not connect to the provider's service." }, "network");
  }
}

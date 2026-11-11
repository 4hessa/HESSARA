// قارئ أحداث SSE عام للمزوّدين الذين نخاطبهم عبر HTTP مباشرة.
import { ProviderError } from "./types";

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
  if (status === 401 || status === 403) return new ProviderError("مفتاح الخدمة غير صالح أو بلا صلاحية.", "auth");
  if (status === 429) return new ProviderError("تجاوز الحساب حد الطلبات لدى المزوّد.", "rate_limit");
  if (status === 400 || status === 404) return new ProviderError("رفض المزوّد الطلب (معرّف النموذج أو الصيغة).", "bad_request");
  return new ProviderError("خدمة المزوّد غير متاحة مؤقتًا.", "unavailable");
}

export async function safeFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ProviderError("تعذر الاتصال بخدمة المزوّد.", "network");
  }
}

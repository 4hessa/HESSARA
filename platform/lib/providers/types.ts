// عقد موحّد لكل مزوّد: واجهة المحادثة لا تعرف أي مزوّد يعمل خلفها.
export type ChatTurn = { role: "user" | "assistant"; content: string };

export type StreamRequest = {
  model: string; // معرّف النموذج لدى المزوّد
  system: string;
  messages: ChatTurn[];
  signal?: AbortSignal;
  maxTokens?: number;
};

export interface ProviderAdapter {
  /** يولّد النص على دفعات. يرمي ProviderError عند الفشل. */
  stream(req: StreamRequest): AsyncIterable<string>;
}

// truncated: وصلت مخرجات جزئية ثم توقف التوليد عند الحد الأقصى للطول.
export type ProviderErrorKind = "auth" | "rate_limit" | "unavailable" | "refused" | "bad_request" | "network" | "truncated";

// دون «خصائص المعاملات» في المُنشئ: صيغة لا يدعمها تشغيل Node المباشر لملفات TypeScript (تحتاجه اختبارات الوحدات).
export class ProviderError extends Error {
  kind: ProviderErrorKind;
  constructor(message: string, kind: ProviderErrorKind = "unavailable") {
    super(message);
    this.kind = kind;
  }
}

export async function collect(it: AsyncIterable<string>): Promise<string> {
  let out = "";
  for await (const chunk of it) out += chunk;
  return out;
}

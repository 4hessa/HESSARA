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

export class ProviderError extends Error {
  constructor(
    message: string,
    public kind: "auth" | "rate_limit" | "unavailable" | "refused" | "bad_request" | "network" = "unavailable",
  ) {
    super(message);
  }
}

export async function collect(it: AsyncIterable<string>): Promise<string> {
  let out = "";
  for await (const chunk of it) out += chunk;
  return out;
}

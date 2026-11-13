// موائم لواجهات «chat/completions» المتوافقة مع OpenAI
// (OpenAI نفسها، DeepSeek، مستضيفو Llama وQwen، والخوادم المحلية مثل Ollama).
import { httpError, safeFetch, sseData } from "./sse.ts";
import type { ProviderAdapter, StreamRequest } from "./types.ts";

export function openaiCompatAdapter(cfg: { baseUrl: string; apiKey?: string }): ProviderAdapter {
  return {
    async *stream(req: StreamRequest) {
      const res = await safeFetch(`${cfg.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        signal: req.signal,
        headers: {
          "content-type": "application/json",
          ...(cfg.apiKey ? { authorization: `Bearer ${cfg.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: req.model,
          stream: true,
          messages: [{ role: "system", content: req.system }, ...req.messages],
        }),
      });
      if (!res.ok) throw httpError(res.status);
      for await (const data of sseData(res)) {
        if (data === "[DONE]") break;
        try {
          const delta = JSON.parse(data)?.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta) yield delta;
        } catch {
          /* سطر غير مكتمل: يُتجاهل */
        }
      }
    },
  };
}

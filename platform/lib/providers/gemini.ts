// موائم Google Gemini عبر واجهة streamGenerateContent.
import { httpError, safeFetch, sseData } from "./sse";
import type { ProviderAdapter, StreamRequest } from "./types";

export function geminiAdapter(apiKey: string): ProviderAdapter {
  return {
    async *stream(req: StreamRequest) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(req.model)}:streamGenerateContent?alt=sse`;
      const res = await safeFetch(url, {
        method: "POST",
        signal: req.signal,
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: req.system }] },
          contents: req.messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        }),
      });
      if (!res.ok) throw httpError(res.status);
      for await (const data of sseData(res)) {
        try {
          const parts = JSON.parse(data)?.candidates?.[0]?.content?.parts;
          if (Array.isArray(parts)) for (const p of parts) if (typeof p?.text === "string") yield p.text;
        } catch {
          /* يُتجاهل */
        }
      }
    },
  };
}

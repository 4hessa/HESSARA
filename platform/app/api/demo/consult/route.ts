// معاينة عامة للزوار: المحرك التجريبي فقط، دون تخزين ودون أي مزوّد خارجي.
import { systemPrompt } from "@/lib/consult";
import { fail, ipLimit, readJson, sameOrigin, str } from "@/lib/http";
import { demoAdapter } from "@/lib/providers/demo";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "مصدر الطلب غير مسموح.");
  if (!ipLimit(req, "demo", 20, 60_000)) return fail(429, "طلبات كثيرة. انتظر قليلًا.");
  const text = str((await readJson(req))?.text, 2000);
  if (!text) return fail(400, "اكتب سؤالًا (حتى ٢٠٠٠ حرف).");
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of demoAdapter.stream({ model: "demo", system: systemPrompt(null), messages: [{ role: "user", content: text }], signal: req.signal }))
        controller.enqueue(enc.encode(JSON.stringify({ t: "d", v: chunk }) + "\n"));
      controller.enqueue(enc.encode(JSON.stringify({ t: "done" }) + "\n"));
      controller.close();
    },
  });
  return new Response(stream, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } });
}

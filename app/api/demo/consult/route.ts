// معاينة عامة للزوار: المحرك التجريبي فقط، دون تخزين ودون أي مزوّد خارجي.
import { systemPrompt } from "@/lib/consult";
import { fail, ipLimit, readJson, sameOrigin, str } from "@/lib/http";
import { demoAdapter } from "@/lib/providers/demo";
import { langOf, makeT } from "@/lib/i18n";

export async function POST(req: Request) {
  const lang = langOf(req);
  const t = makeT(lang);
  if (!sameOrigin(req)) return fail(403, t("مصدر الطلب غير مسموح.", "Request origin not allowed."));
  if (!ipLimit(req, "demo", 20, 60_000)) return fail(429, t("طلبات كثيرة. انتظر قليلًا.", "Too many requests. Wait a little."));
  const text = str((await readJson(req))?.text, 2000);
  if (!text) return fail(400, t("اكتب سؤالًا (حتى ٢٠٠٠ حرف).", "Write a question (up to 2,000 characters)."));
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of demoAdapter.stream({ model: "demo", system: systemPrompt(null, lang), messages: [{ role: "user", content: text }], signal: req.signal }))
        controller.enqueue(enc.encode(JSON.stringify({ t: "d", v: chunk }) + "\n"));
      controller.enqueue(enc.encode(JSON.stringify({ t: "done" }) + "\n"));
      controller.close();
    },
  });
  return new Response(stream, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } });
}

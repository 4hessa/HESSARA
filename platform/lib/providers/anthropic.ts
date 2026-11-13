// موائم Anthropic عبر الحزمة الرسمية. المفتاح يُقرأ من بيئة الخادم فقط.
import Anthropic from "@anthropic-ai/sdk";
import { ProviderError, type ProviderAdapter, type StreamRequest } from "./types";

// النماذج التي تدعم إعادة التوجيه من جهة الخادم عند الامتناع (حسب توثيق المزوّد).
const FALLBACK_MODELS = new Set(["claude-opus-5-5", "claude-sonnet-5-5", "claude-fable-5-2"]);

export const anthropicAdapter: ProviderAdapter = {
  async *stream(req: StreamRequest) {
    // مفتاح غير مرتبط بمساحة عمل يتطلب ترويسة anthropic-workspace-id في كل طلب (توثيق Anthropic: Authentication).
    const workspace = process.env.ANTHROPIC_WORKSPACE_ID?.trim();
    const client = new Anthropic(workspace ? { defaultHeaders: { "anthropic-workspace-id": workspace } } : undefined);
    try {
      const base = {
        model: req.model,
        max_tokens: req.maxTokens ?? 16000,
        system: req.system,
        messages: req.messages,
      };
      const stream = FALLBACK_MODELS.has(req.model)
        ? client.beta.messages.stream(
            // صيغة "default" توجّه الطلب تلقائيًا حسب فئة الامتناع.
            { ...base, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" } as never,
            { signal: req.signal },
          )
        : client.messages.stream(base, { signal: req.signal });

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield event.delta.text;
        }
      }
      const final = await stream.finalMessage();
      if (final.stop_reason === "refusal") {
        throw new ProviderError("امتنع النموذج عن إكمال هذا الطلب وفق سياسات المزوّد.", "refused");
      }
    } catch (err) {
      if (err instanceof ProviderError) throw err;
      if (err instanceof Anthropic.APIUserAbortError) return;
      if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError)
        throw new ProviderError("مفتاح الخدمة غير صالح أو لا يملك صلاحية هذا النموذج.", "auth");
      if (err instanceof Anthropic.RateLimitError)
        throw new ProviderError("تجاوز الحساب حد الطلبات لدى المزوّد. حاول بعد قليل.", "rate_limit");
      if (err instanceof Anthropic.BadRequestError && /workspace/i.test(err.message))
        throw new ProviderError("مفتاح Anthropic غير مرتبط بمساحة عمل: اضبط ANTHROPIC_WORKSPACE_ID على الخادم، أو أنشئ مفتاحًا مرتبطًا بمساحة عمل.", "auth");
      if (err instanceof Anthropic.BadRequestError || err instanceof Anthropic.NotFoundError)
        throw new ProviderError("رفض المزوّد الطلب (معرّف النموذج أو الصيغة).", "bad_request");
      if (err instanceof Anthropic.APIConnectionError)
        throw new ProviderError("تعذر الاتصال بخدمة المزوّد.", "network");
      if (err instanceof Anthropic.APIError)
        throw new ProviderError("خدمة المزوّد غير متاحة مؤقتًا.", "unavailable");
      throw err;
    }
  },
};

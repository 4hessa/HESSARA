// موائم Anthropic عبر الحزمة الرسمية. المفتاح يُقرأ من بيئة الخادم فقط.
import Anthropic from "@anthropic-ai/sdk";
import { ProviderError, type ProviderAdapter, type StreamRequest } from "./types.ts";

// النماذج التي تدعم إعادة التوجيه من جهة الخادم عند الامتناع (حسب توثيق المزوّد).
const FALLBACK_MODELS = new Set(["claude-opus-5-5", "claude-sonnet-5-5", "claude-fable-5-2"]);
const FALLBACK_BETA = "server-side-fallback-2026-07-01";

type Base = { model: string; max_tokens: number; system: string; messages: StreamRequest["messages"] };
type TextStream = AsyncIterable<{ type: string; delta?: { type: string; text?: string } }> & {
  finalMessage(): Promise<{ stop_reason: string | null }>;
};

async function* run(client: Anthropic, base: Base, withFallback: boolean, signal?: AbortSignal): AsyncIterable<string> {
  const stream = (
    withFallback
      ? // صيغة "default" توجّه الطلب تلقائيًا حسب فئة الامتناع.
        client.beta.messages.stream({ ...base, betas: [FALLBACK_BETA], fallbacks: "default" } as never, { signal })
      : client.messages.stream(base, { signal })
  ) as unknown as TextStream;

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta?.type === "text_delta" && event.delta.text) {
      yield event.delta.text;
    }
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") {
    throw new ProviderError({ ar: "امتنع النموذج عن إكمال هذا الطلب وفق سياسات المزوّد.", en: "The model declined to complete this request under the provider's policies." }, "refused");
  }
  if (final.stop_reason === "max_tokens") {
    throw new ProviderError({ ar: "بلغت الإجابة الحد الأقصى للطول فتوقفت قبل اكتمالها.", en: "The answer reached the maximum length and stopped before it was complete." }, "truncated");
  }
}

export const anthropicAdapter: ProviderAdapter = {
  async *stream(req: StreamRequest) {
    // مفتاح غير مرتبط بمساحة عمل يتطلب ترويسة anthropic-workspace-id في كل طلب (توثيق Anthropic: Authentication).
    const workspace = process.env.ANTHROPIC_WORKSPACE_ID?.trim();
    const client = new Anthropic(workspace ? { defaultHeaders: { "anthropic-workspace-id": workspace } } : undefined);
    const base: Base = { model: req.model, max_tokens: req.maxTokens ?? 16000, system: req.system, messages: req.messages };
    const withFallback = FALLBACK_MODELS.has(req.model);
    let yielded = false;
    try {
      try {
        for await (const text of run(client, base, withFallback, req.signal)) {
          yielded = true;
          yield text;
        }
      } catch (err) {
        // ميزة إعادة التوجيه تجريبية لدى المزوّد ولم تُختبر حيًّا هنا: إن رُفضت صيغتها قبل أي مخرجات
        // يُعاد الطلب نفسه دونها مرة واحدة، بدل أن تفشل كل استشارات هذا النموذج.
        if (withFallback && !yielded && err instanceof Anthropic.BadRequestError && /fallback|beta/i.test(err.message)) {
          console.warn("[anthropic] server-side fallback rejected; retrying without it");
          yield* run(client, base, false, req.signal);
        } else {
          throw err;
        }
      }
    } catch (err) {
      if (err instanceof ProviderError) throw err;
      if (err instanceof Anthropic.APIUserAbortError) return;
      if (err instanceof Anthropic.AuthenticationError)
        throw new ProviderError({ ar: "مفتاح Anthropic غير صالح أو منتهي الصلاحية.", en: "The Anthropic key is invalid or has expired." }, "auth");
      if (err instanceof Anthropic.PermissionDeniedError)
        throw new ProviderError({ ar: "مفتاح Anthropic لا يملك صلاحية هذا النموذج أو مساحة العمل.", en: "The Anthropic key has no access to this model or workspace." }, "auth");
      if (err instanceof Anthropic.RateLimitError)
        throw new ProviderError({ ar: "تجاوز الحساب حد الطلبات لدى المزوّد. حاول بعد قليل.", en: "The account has exceeded the provider's rate limit. Try again shortly." }, "rate_limit");
      if (err instanceof Anthropic.BadRequestError && /credit balance/i.test(err.message))
        throw new ProviderError({ ar: "رصيد حساب Anthropic لا يكفي. أضف رصيدًا من صفحة الفوترة في لوحة Claude.", en: "The Anthropic account's credit balance is too low. Add credits from the billing page of the Claude Console." }, "auth");
      if (err instanceof Anthropic.BadRequestError && /workspace/i.test(err.message))
        throw new ProviderError({ ar: "مفتاح Anthropic غير مرتبط بمساحة عمل: اضبط ANTHROPIC_WORKSPACE_ID على الخادم، أو أنشئ مفتاحًا مرتبطًا بمساحة عمل.", en: "The Anthropic key is not scoped to a workspace: set ANTHROPIC_WORKSPACE_ID on the server, or create a key scoped to a workspace." }, "auth");
      if (err instanceof Anthropic.NotFoundError)
        throw new ProviderError({ ar: "النموذج غير متاح لهذا الحساب، أو معرّفه غير صحيح.", en: "The model is not available to this account, or its identifier is wrong." }, "bad_request");
      if (err instanceof Anthropic.BadRequestError)
        throw new ProviderError({ ar: "رفض المزوّد الطلب (معرّف النموذج أو الصيغة).", en: "The provider rejected the request (model identifier or format)." }, "bad_request");
      if (err instanceof Anthropic.APIConnectionError)
        throw new ProviderError({ ar: "تعذر الاتصال بخدمة المزوّد.", en: "Could not connect to the provider's service." }, "network");
      if (err instanceof Anthropic.APIError)
        throw new ProviderError({ ar: "خدمة المزوّد غير متاحة مؤقتًا.", en: "The provider's service is temporarily unavailable." }, "unavailable");
      throw err;
    }
  },
};

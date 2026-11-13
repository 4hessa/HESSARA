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
    throw new ProviderError("امتنع النموذج عن إكمال هذا الطلب وفق سياسات المزوّد.", "refused");
  }
  if (final.stop_reason === "max_tokens") {
    throw new ProviderError("بلغت الإجابة الحد الأقصى للطول فتوقفت قبل اكتمالها.", "truncated");
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
        throw new ProviderError("مفتاح Anthropic غير صالح أو منتهي الصلاحية.", "auth");
      if (err instanceof Anthropic.PermissionDeniedError)
        throw new ProviderError("مفتاح Anthropic لا يملك صلاحية هذا النموذج أو مساحة العمل.", "auth");
      if (err instanceof Anthropic.RateLimitError)
        throw new ProviderError("تجاوز الحساب حد الطلبات لدى المزوّد. حاول بعد قليل.", "rate_limit");
      if (err instanceof Anthropic.BadRequestError && /credit balance/i.test(err.message))
        throw new ProviderError("رصيد حساب Anthropic لا يكفي. أضف رصيدًا من صفحة الفوترة في لوحة Claude.", "auth");
      if (err instanceof Anthropic.BadRequestError && /workspace/i.test(err.message))
        throw new ProviderError("مفتاح Anthropic غير مرتبط بمساحة عمل: اضبط ANTHROPIC_WORKSPACE_ID على الخادم، أو أنشئ مفتاحًا مرتبطًا بمساحة عمل.", "auth");
      if (err instanceof Anthropic.NotFoundError)
        throw new ProviderError("النموذج غير متاح لهذا الحساب، أو معرّفه غير صحيح.", "bad_request");
      if (err instanceof Anthropic.BadRequestError)
        throw new ProviderError("رفض المزوّد الطلب (معرّف النموذج أو الصيغة).", "bad_request");
      if (err instanceof Anthropic.APIConnectionError)
        throw new ProviderError("تعذر الاتصال بخدمة المزوّد.", "network");
      if (err instanceof Anthropic.APIError)
        throw new ProviderError("خدمة المزوّد غير متاحة مؤقتًا.", "unavailable");
      throw err;
    }
  },
};

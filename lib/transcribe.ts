// تحويل الكلام إلى نص عبر واجهة «audio/transcriptions» المتوافقة مع OpenAI (Whisper لدى Groq حاليًا).
// يُمرَّر التسجيل كما هو ولا يُحفظ في أي مكان؛ يعود النص وحده إلى المتصفح.
import type { Lang } from "./i18n.ts";
import { httpError, safeFetch } from "./providers/sse.ts";
import { ProviderError } from "./providers/types.ts";
import { STT_TYPES } from "./stt-rules.ts";

const env = (k: string) => process.env[k]?.trim() || undefined;

export type SttConfig = { key: string; baseUrl: string; model: string };

/** الإعداد كاملًا أو null: المفتاح والعنوان والنموذج معًا، فلا يظهر الإدخال الصوتي بإعداد ناقص. */
export function sttConfig(): SttConfig | null {
  const key = env("WHISPER_API_KEY");
  const baseUrl = env("WHISPER_BASE_URL");
  const model = env("WHISPER_MODEL");
  return key && baseUrl && model ? { key, baseUrl: baseUrl.replace(/\/+$/, ""), model } : null;
}

/** ما يُرسل إلى المتصفح: هل الإدخال الصوتي متاح، واسم الخادم الذي يذهب إليه التسجيل (يُذكر في نص الموافقة). */
export function sttPublic(): { host: string } | null {
  const c = sttConfig();
  if (!c) return null;
  try {
    return { host: new URL(c.baseUrl).host };
  } catch {
    return null;
  }
}

export async function transcribe(cfg: SttConfig, audio: Blob, type: string, lang: Lang, signal?: AbortSignal): Promise<string> {
  const ext = STT_TYPES[type];
  if (!ext) throw new ProviderError({ ar: "صيغة التسجيل غير مدعومة.", en: "The recording format is not supported." }, "bad_request");
  const form = new FormData();
  form.append("file", new File([audio], `voice.${ext}`, { type }));
  form.append("model", cfg.model);
  // لغة الواجهة تلميح يحسّن الدقة؛ من يتكلم بلغة أخرى يبدّل لغة الواجهة.
  form.append("language", lang);
  form.append("response_format", "json");
  form.append("temperature", "0");
  const res = await safeFetch(`${cfg.baseUrl}/audio/transcriptions`, {
    method: "POST",
    headers: { authorization: `Bearer ${cfg.key}` },
    body: form,
    signal,
  });
  if (!res.ok) {
    // نص ردّ الخدمة يُسجَّل في سجلات الخادم للتشخيص، ولا يُعرض للمستخدم.
    console.error("[stt]", res.status, (await res.text().catch(() => "")).slice(0, 300));
    if (res.status === 413)
      throw new ProviderError({ ar: "التسجيل أكبر مما تقبله خدمة التحويل.", en: "The recording is larger than the transcription service accepts." }, "bad_request");
    throw httpError(res.status);
  }
  const data = (await res.json().catch(() => null)) as { text?: unknown } | null;
  return typeof data?.text === "string" ? data.text.trim() : "";
}

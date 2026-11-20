// تحويل الكلام إلى نص عبر واجهة «audio/transcriptions» المتوافقة مع OpenAI (Whisper لدى Groq حاليًا).
// يُمرَّر التسجيل كما هو ولا يُحفظ في أي مكان؛ يعود النص وحده إلى المتصفح.
import type { Lang } from "./i18n.ts";
import { httpError, safeFetch } from "./providers/sse.ts";
import { ProviderError } from "./providers/types.ts";
import { STT_TYPES } from "./stt-rules.ts";

const env = (k: string) => process.env[k]?.trim() || undefined;

export type SttConfig = { key: string; baseUrl: string; model: string };

type Segment = { text?: unknown; no_speech_prob?: unknown; avg_logprob?: unknown; compression_ratio?: unknown };

// يختلق Whisper عبارات شائعة من ترجمات الفيديو حين يكون التسجيل صمتًا أو ضجيجًا. تُحذف حين تكون هي النص كله
// فقط، فلا يُمس كلام حقيقي يتضمنها. (ظهرت «اشتركوا في القناة» و«موسيقى» على الموقع الحي لنغمة بلا كلام.)
const HALLUCINATIONS = [
  "اشتركوا في القناة", "اشتركوا في القناه", "ترجمة نانسي قنقر", "شكرا للمشاهدة", "شكرا على المشاهدة", "شكرا لكم على المشاهدة", "موسيقى",
  "thank you", "thanks for watching", "thank you for watching", "subscribe to the channel", "you", "music",
].map((p) => normal(p));
function normal(s: string) {
  return s.toLowerCase().replace(/[\u064B-\u0652\u0640]/g, "").replace(/[إأآ]/g, "ا").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

/**
 * نص التسجيل بعد حذف ما تقدّر الخدمة نفسها أنه بلا كلام (عتبات Whisper الافتراضية: احتمال الصمت فوق 0.6
 * مع ثقة متوسطة دون -1، أو تكرار مفرط)، ثم حذف العبارة المختلَقة المعروفة إن كانت هي النص كله.
 */
export function cleanTranscript(data: { text?: unknown; segments?: unknown } | null): string {
  let text = typeof data?.text === "string" ? data.text : "";
  if (Array.isArray(data?.segments)) {
    const kept = (data.segments as Segment[]).filter((sg) => {
      const silent = Number(sg.no_speech_prob) > 0.6 && Number(sg.avg_logprob) < -1;
      const looping = Number(sg.compression_ratio) > 2.4;
      return !silent && !looping;
    });
    text = kept.map((sg) => (typeof sg.text === "string" ? sg.text : "")).join("");
  }
  text = text.replace(/\s+/g, " ").trim();
  return HALLUCINATIONS.includes(normal(text)) ? "" : text;
}

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
  form.append("temperature", "0");
  // verbose_json يعيد المقاطع مع احتمال الصمت لكلٍّ منها؛ إن رفضته خدمة متوافقة يُعاد الطلب بالصيغة البسيطة.
  const send = (format: string) => {
    form.set("response_format", format);
    return safeFetch(`${cfg.baseUrl}/audio/transcriptions`, { method: "POST", headers: { authorization: `Bearer ${cfg.key}` }, body: form, signal });
  };
  let res = await send("verbose_json");
  if (res.status === 400) {
    await res.body?.cancel().catch(() => {});
    res = await send("json");
  }
  if (!res.ok) {
    // نص ردّ الخدمة يُسجَّل في سجلات الخادم للتشخيص، ولا يُعرض للمستخدم.
    console.error("[stt]", res.status, (await res.text().catch(() => "")).slice(0, 300));
    if (res.status === 413)
      throw new ProviderError({ ar: "التسجيل أكبر مما تقبله خدمة التحويل.", en: "The recording is larger than the transcription service accepts." }, "bad_request");
    throw httpError(res.status);
  }
  return cleanTranscript((await res.json().catch(() => null)) as { text?: unknown; segments?: unknown } | null);
}

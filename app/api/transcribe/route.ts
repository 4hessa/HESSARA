// تحويل تسجيل صوتي قصير إلى نص لحقل الاستشارة، للمستخدم المسجَّل الموافق على الإرسال الخارجي.
// التسجيل لا يُحفظ: يُمرَّر إلى خدمة التحويل ويعود النص وحده، ويراجعه المستخدم قبل أن يرسله.
import { authed, fail, ok, rateLimit } from "@/lib/http";
import { langOf, makeT } from "@/lib/i18n";
import { allow } from "@/lib/limits";
import { ProviderError } from "@/lib/providers/types";
import { STT, STT_TYPES } from "@/lib/stt-rules";
import { sttConfig, transcribe } from "@/lib/transcribe";

const DAY = 86_400_000;
export const maxDuration = 60;

export const POST = authed(async (req, user) => {
  const lang = langOf(req);
  const t = makeT(lang);
  const cfg = sttConfig();
  if (!cfg) return fail(404, t("الإدخال الصوتي غير مهيّأ على الخادم.", "Voice input is not configured on the server."));
  if (!user.external_consent)
    return Response.json(
      { error: t("يلزم موافقتك على إرسال التسجيل إلى خدمة خارجية.", "Your consent is needed to send the recording to an external service."), code: "consent" },
      { status: 412 },
    );
  const tooLong = t("التسجيل أطول من المسموح (دقيقتان).", "The recording is longer than allowed (two minutes).");
  if (Number(req.headers.get("content-length") || 0) > STT.maxBytes + 64_000) return fail(413, tooLong);
  if (!rateLimit(`stt:${user.id}`, 6, 60_000)) return fail(429, t("تسجيلات كثيرة خلال دقيقة. انتظر قليلًا.", "Too many recordings in a minute. Wait a little."));

  let audio: FormDataEntryValue | null = null;
  try {
    audio = (await req.formData()).get("audio");
  } catch {
    /* جسم ليس نموذجًا صالحًا */
  }
  if (!(audio instanceof Blob) || audio.size === 0) return fail(400, t("لم يصل تسجيل صوتي.", "No recording arrived."));
  if (audio.size > STT.maxBytes) return fail(413, tooLong);
  const type = audio.type.split(";")[0].trim().toLowerCase();
  if (!STT_TYPES[type]) return fail(415, t("صيغة التسجيل غير مدعومة.", "The recording format is not supported."));

  // الحدود اليومية تُحسب بعد التحقق، فلا يستهلكها طلب مرفوض.
  if (!(await allow(`stt-day:${user.id}`, STT.perUserDaily, DAY)))
    return fail(429, t(`بلغت حد الإدخال الصوتي لليوم (${STT.perUserDaily} تسجيلًا). يمكنك الكتابة.`, `You have reached today's voice-input limit (${STT.perUserDaily} recordings). You can type instead.`));
  if (!(await allow("stt-day:all", STT.platformDaily, DAY)))
    return fail(429, t("بلغ الإدخال الصوتي حده اليومي على المنصة. يمكنك الكتابة.", "Voice input has reached the platform's daily limit. You can type instead."));

  try {
    const text = await transcribe(cfg, audio, type, lang, AbortSignal.any([req.signal, AbortSignal.timeout(55_000)]));
    if (!text) return fail(422, t("لم يُتعرَّف على كلام في التسجيل. حاول مرة أخرى بصوت أوضح.", "No speech was recognised in the recording. Try again more clearly."));
    return ok({ text });
  } catch (e) {
    if (e instanceof ProviderError) return fail(502, e.text(lang));
    const name = (e as Error).name;
    if (name === "AbortError" || name === "TimeoutError")
      return fail(504, t("استغرق التحويل وقتًا أطول من المتوقع. حاول مرة أخرى.", "Transcription took too long. Try again."));
    console.error("[stt] unexpected:", (e as Error).message);
    return fail(502, t("تعذر تحويل التسجيل إلى نص.", "The recording could not be transcribed."));
  }
});

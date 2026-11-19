"use client";
// إدخال صوتي لحقل الاستشارة: يسجّل حتى دقيقتين، ويرسل التسجيل إلى /api/transcribe، ثم يضيف النص إلى الحقل
// ليراجعه المستخدم ويعدّله قبل الإرسال؛ لا يُرسل شيء تلقائيًا. يظهر فقط للمستخدم المسجَّل، حين يكون التحويل
// مهيّأً على الخادم ويدعم المتصفح التسجيل. تُطلب الموافقة قبل أول تسجيل (ensureConsent("voice")).
import { useEffect, useRef, useState } from "react";
import { RECORDER_TYPES, STT } from "@/lib/stt-rules";
import { useApp } from "./app";
import { Icon } from "./Icon";

type State = "idle" | "recording" | "sending";
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function VoiceInput({ onText, disabled }: { onText: (text: string) => void; disabled?: boolean }) {
  const { user, stt, t, toast, ensureConsent } = useApp();
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [secs, setSecs] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const alive = useRef(true);

  const release = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
  };

  useEffect(() => {
    alive.current = true;
    setSupported(!!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined");
    return () => {
      // مغادرة الصفحة أثناء التسجيل: يُطلق الميكروفون، ولا يُرسل ما سُجّل.
      alive.current = false;
      if (recorder.current?.state === "recording") recorder.current.stop();
      release();
    };
  }, []);

  if (!user || !stt || !supported) return null;

  async function send(blob: Blob) {
    if (!alive.current) return;
    setState("sending");
    try {
      const form = new FormData();
      form.append("audio", blob, "voice");
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
      if (res.ok && data.text) onText(data.text);
      else toast(data.error ?? t("تعذر تحويل التسجيل إلى نص.", "The recording could not be transcribed."));
    } catch {
      toast(t("تعذر إرسال التسجيل. تحقق من الاتصال وأعد المحاولة.", "The recording could not be sent. Check your connection and try again."));
    } finally {
      if (alive.current) setState("idle");
    }
  }

  function stop() {
    if (recorder.current?.state === "recording") recorder.current.stop();
    release();
  }

  async function start() {
    if (!(await ensureConsent("voice"))) return;
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      toast((e as DOMException).name === "NotFoundError"
        ? t("لا يوجد ميكروفون متاح على هذا الجهاز.", "No microphone is available on this device.")
        : t("لم يُسمح باستخدام الميكروفون. اسمح به من إعدادات المتصفح ثم أعد المحاولة.", "Microphone access was not allowed. Allow it in your browser settings and try again."));
      return;
    }
    const mimeType = RECORDER_TYPES.find((m) => MediaRecorder.isTypeSupported?.(m));
    const rec = new MediaRecorder(stream.current, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 32_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: rec.mimeType || mimeType || "audio/webm" });
      if (blob.size) void send(blob);
      else if (alive.current) setState("idle");
    };
    recorder.current = rec;
    rec.start(1000);
    setSecs(0);
    setState("recording");
    const began = Date.now();
    timer.current = setInterval(() => {
      const s = Math.floor((Date.now() - began) / 1000);
      setSecs(s);
      if (s >= STT.maxSeconds) stop();
    }, 250);
  }

  const recording = state === "recording";
  const label = recording
    ? t("أوقف التسجيل وحوّله إلى نص", "Stop recording and transcribe")
    : state === "sending" ? t("يُحوَّل التسجيل إلى نص…", "Transcribing the recording…")
    : t("اكتب بالصوت", "Dictate with your voice");
  return (
    <>
      <button type="button" className={`btn btn-sm ${recording ? "btn-secondary voice-rec" : "btn-ghost btn-icon"}`}
        onClick={recording ? stop : start} disabled={disabled || state === "sending"} aria-label={label} title={label}>
        {state === "sending" ? <span className="spinner" /> : <Icon name={recording ? "stop" : "mic"} size={18} />}
        {recording && <span className="voice-time" aria-hidden="true">{clock(secs)}<span className="voice-max"> / {clock(STT.maxSeconds)}</span></span>}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {recording ? t("بدأ التسجيل. اضغط الزر نفسه للإيقاف.", "Recording. Press the same button to stop.") : state === "sending" ? t("يُحوَّل التسجيل إلى نص.", "Transcribing.") : ""}
      </span>
    </>
  );
}

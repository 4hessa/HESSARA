"use client";
// معاينة حقيقية: تستدعي المحرك التجريبي والمراجع القاعدي على الخادم (دون حساب ودون تخزين).
import { useRef, useState } from "react";
import type { ReviewResult } from "@/lib/review/types";
import { api } from "./app";
import { VendorMark } from "./bits";
import { Icon } from "./Icon";
import { Markdown } from "./Markdown";
import { ReviewView } from "./Review";

const SAMPLES = [
  "لدي تطبيق يعتمد على نموذج لغوي، لكن استجابته بطيئة. أريد معرفة السبب وتحسين الأداء.",
  "أحتاج خطة لمشروع تخرج مدته ثمانية أسابيع.",
  "كيف أراجع أمن واجهة تسجيل الدخول في تطبيقي؟",
];

export function LandingPreview() {
  const [q, setQ] = useState(SAMPLES[0]);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [error, setError] = useState("");
  const ctl = useRef<AbortController | null>(null);

  async function ask() {
    ctl.current?.abort();
    const c = (ctl.current = new AbortController());
    setBusy(true); setAnswer(""); setReview(null); setError("");
    try {
      const res = await fetch("/api/demo/consult", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: q }), signal: c.signal });
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error ?? "تعذر الاتصال.");
      const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = "", acc = "";
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n")) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); if (l) { const ev = JSON.parse(l); if (ev.t === "d") { acc += ev.v; setAnswer(acc); } } }
      }
    } catch (e) { if ((e as Error).name !== "AbortError") setError((e as Error).message); }
    setBusy(false);
  }
  async function runReview() {
    const r = await api<{ result: ReviewResult }>("/api/demo/review", { body: { text: answer, mode: "risk" } });
    if (r.ok) setReview(r.data.result); else setError(r.data.error ?? "تعذرت المراجعة.");
  }

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="row-between" style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "1px solid var(--border)", background: "var(--bg-2)" }}>
        <span className="row"><VendorMark vendorKey="hessara" small /><strong className="t-small">المحرك التجريبي</strong></span>
        <span className="badge badge-warn">بيانات تجريبية — قوالب ثابتة لا ذكاء اصطناعي</span>
      </div>
      <div className="stack" style={{ padding: "var(--s-4)" }}>
        <div className="chips" role="group" aria-label="اختر سؤالًا تجريبيًا">
          {SAMPLES.map((s) => <button key={s} className="chip" aria-pressed={q === s} onClick={() => setQ(s)} style={{ height: "auto", padding: "6px 12px", textAlign: "start", whiteSpace: "normal" }}>{s}</button>)}
        </div>
        <div className="row">
          <button className="btn btn-primary btn-sm" onClick={ask} disabled={busy}>{busy ? <span className="spinner" /> : <Icon name="send" size={18} />} أرسل السؤال</button>
          {answer && !busy && <button className="btn btn-secondary btn-sm" onClick={runReview}><Icon name="lab" size={18} /> شغّل مراجعة «محلل المخاطر»</button>}
        </div>
        {error && <p className="field-error" role="alert"><Icon name="alert" size={16} /> {error}</p>}
        {(answer || busy) && (
          <div className={review ? "grid-2" : undefined} aria-live="polite">
            <div style={{ maxHeight: 420, overflowY: "auto", paddingInlineEnd: 8 }} tabIndex={0} aria-label="إجابة المحرك التجريبي">
              {answer ? <Markdown text={answer} /> : <span className="typing"><i /><i /><i /></span>}
            </div>
            {review && <div style={{ maxHeight: 420, overflowY: "auto", paddingInlineEnd: 8 }} tabIndex={0} aria-label="نتيجة المراجعة"><ReviewView result={review} /></div>}
          </div>
        )}
      </div>
    </div>
  );
}

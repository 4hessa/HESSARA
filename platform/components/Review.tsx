"use client";
import Link from "next/link";
import { useState } from "react";
import { REVIEW_MODES, type ReviewResult } from "@/lib/review/types";
import { api, useApp } from "./app";
import { Icon } from "./Icon";

const SEV = { high: { t: "عالية", c: "badge-danger" }, medium: { t: "متوسطة", c: "badge-warn" }, low: { t: "منخفضة", c: "" } } as const;
const VER = { pass: { t: "مستوفى", c: "badge-ok", i: "check" }, fail: { t: "غير مستوفى", c: "badge-danger", i: "close" }, unclear: { t: "غير محسوم", c: "badge-warn", i: "help" } } as const;

export function ReviewView({ result }: { result: ReviewResult }) {
  return (
    <div className="stack">
      <div className={`notice ${result.engine === "heuristic" ? "notice-warn" : "notice-accent"}`}>
        <Icon name="info" />
        <div>
          <strong>{result.engineLabel}</strong>
          <p className="t-small">{result.summary}</p>
        </div>
      </div>

      {result.verdicts.length > 0 && (
        <section aria-label="الأحكام حسب المعايير">
          <h3 className="t-h4">الأحكام حسب المعايير</h3>
          <div>
            {result.verdicts.map((v, i) => (
              <div className="verdict" key={i}>
                <span className={`badge ${VER[v.status].c}`}><Icon name={VER[v.status].i} size={14} /> {VER[v.status].t}</span>
                <div><strong className="t-small">{v.criterion}</strong><p className="t-small muted">{v.reason}</p></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {result.findings.length > 0 && (
        <section className="stack-sm" aria-label="الملاحظات">
          <h3 className="t-h4">الملاحظات ({result.findings.length})</h3>
          {result.findings.map((f, i) => (
            <article className={`finding ${f.severity}`} key={i}>
              <div className="row-between">
                <strong>{f.title}</strong>
                <span className={`badge ${SEV[f.severity].c}`}>أهمية {SEV[f.severity].t}</span>
              </div>
              <p className="t-small">{f.detail}</p>
              {f.quote && <p className="quote" dir="auto">«{f.quote}»</p>}
              {f.suggestion && <p className="t-small"><strong>الإجراء المقترح: </strong>{f.suggestion}</p>}
            </article>
          ))}
        </section>
      )}

      {result.strengths.length > 0 && (
        <section className="stack-sm" aria-label="نقاط القوة">
          <h3 className="t-h4">نقاط القوة</h3>
          <ul className="list-check">{result.strengths.map((s, i) => <li key={i}><Icon name="check" size={16} /><span>{s}</span></li>)}</ul>
        </section>
      )}

      <section className="stack-sm" aria-label="حدود هذه المراجعة">
        <h3 className="t-h4">حدود هذه المراجعة</h3>
        <ul className="t-small muted" style={{ listStyle: "disc", paddingInlineStart: "var(--s-5)", display: "grid", gap: 4 }}>
          {result.limits.map((l, i) => <li key={i}>{l}</li>)}
          {result.needsHuman && <li>تحتاج النتيجة مراجعة بشرية قبل اتخاذ قرار مبني عليها.</li>}
        </ul>
      </section>
    </div>
  );
}

/** تشغيل مراجعة على نص معيّن (يُستخدم في لوحة الاستشارة). */
export function ReviewRunner({ text, consultationId, messageId, defaultMode }: {
  text: string; consultationId?: string; messageId?: string; defaultMode?: string;
}) {
  const { ensureConsent, toast } = useApp();
  const [mode, setMode] = useState(defaultMode ?? "technical");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [res, setRes] = useState<{ id: string; result: ReviewResult } | null>(null);
  const modes = REVIEW_MODES.filter((m) => !m.needsCriteria);

  async function run() {
    setBusy(true); setError("");
    let r = await api<{ id: string; result: ReviewResult }>("/api/reviews", { body: { text, mode, consultationId, messageId } });
    if (r.status === 412 && (await ensureConsent())) r = await api("/api/reviews", { body: { text, mode, consultationId, messageId } });
    else if (r.status === 412) r = await api("/api/reviews", { body: { text, mode, consultationId, messageId, engine: "heuristic" } });
    setBusy(false);
    if (!r.ok) { setError(r.data.error ?? "تعذرت المراجعة."); return; }
    setRes(r.data);
    toast("اكتملت المراجعة النقدية.");
  }

  return (
    <div className="stack">
      <div className="stack-sm">
        <span className="label" id="rv-mode">نمط المراجعة</span>
        <div className="chips" role="group" aria-labelledby="rv-mode">
          {modes.map((m) => <button key={m.id} className="chip" aria-pressed={mode === m.id} onClick={() => { setMode(m.id); setRes(null); }}>{m.name}</button>)}
        </div>
        <p className="t-caption">{modes.find((m) => m.id === mode)?.short}</p>
      </div>
      <details>
        <summary className="t-small link" style={{ cursor: "pointer" }}>المعايير المعلنة لهذا النمط</summary>
        <ul className="t-small muted" style={{ listStyle: "disc", paddingInlineStart: "var(--s-5)", marginTop: 8 }}>
          {modes.find((m) => m.id === mode)?.criteria.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </details>
      <button className="btn btn-primary" onClick={run} disabled={busy}>
        {busy ? <span className="spinner" /> : <Icon name="lab" />} {busy ? "جارٍ المراجعة…" : res ? "أعد المراجعة" : "شغّل المراجعة"}
      </button>
      {error && <p className="field-error" role="alert"><Icon name="alert" size={16} /> {error}</p>}
      {res && (
        <>
          <ReviewView result={res.result} />
          <Link className="btn btn-secondary" href={`/lab?review=${res.id}`}>افتحها في المختبر لمقارنة نسخة منقّحة</Link>
        </>
      )}
    </div>
  );
}

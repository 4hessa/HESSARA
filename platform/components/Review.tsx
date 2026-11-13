"use client";
import Link from "next/link";
import { useState } from "react";
import { modesFor, type ReviewResult } from "@/lib/review/types";
import { api, useApp } from "./app";
import { Icon } from "./Icon";

const SEV = { high: { ar: "أهمية عالية", en: "High importance", c: "badge-danger" }, medium: { ar: "أهمية متوسطة", en: "Medium importance", c: "badge-warn" }, low: { ar: "أهمية منخفضة", en: "Low importance", c: "" } } as const;
const VER = { pass: { ar: "مستوفى", en: "Met", c: "badge-ok", i: "check" }, fail: { ar: "غير مستوفى", en: "Not met", c: "badge-danger", i: "close" }, unclear: { ar: "غير محسوم", en: "Undecided", c: "badge-warn", i: "help" } } as const;

export function ReviewView({ result }: { result: ReviewResult }) {
  const { t, lang } = useApp();
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
        <section aria-label={t("الأحكام حسب المعايير", "Verdicts by criterion")}>
          <h3 className="t-h4">{t("الأحكام حسب المعايير", "Verdicts by criterion")}</h3>
          <div>
            {result.verdicts.map((v, i) => (
              <div className="verdict" key={i}>
                <span className={`badge ${VER[v.status].c}`}><Icon name={VER[v.status].i} size={14} /> {VER[v.status][lang]}</span>
                <div><strong className="t-small">{v.criterion}</strong><p className="t-small muted">{v.reason}</p></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {result.findings.length > 0 && (
        <section className="stack-sm" aria-label={t("الملاحظات", "Findings")}>
          <h3 className="t-h4">{t("الملاحظات", "Findings")} ({result.findings.length})</h3>
          {result.findings.map((f, i) => (
            <article className={`finding ${f.severity}`} key={i}>
              <div className="row-between">
                <strong>{f.title}</strong>
                <span className={`badge ${SEV[f.severity].c}`}>{SEV[f.severity][lang]}</span>
              </div>
              <p className="t-small">{f.detail}</p>
              {f.quote && <p className="quote" dir="auto">{lang === "ar" ? `«${f.quote}»` : `“${f.quote}”`}</p>}
              {f.suggestion && <p className="t-small"><strong>{t("الإجراء المقترح: ", "Suggested action: ")}</strong>{f.suggestion}</p>}
            </article>
          ))}
        </section>
      )}

      {result.strengths.length > 0 && (
        <section className="stack-sm" aria-label={t("نقاط القوة", "Strengths")}>
          <h3 className="t-h4">{t("نقاط القوة", "Strengths")}</h3>
          <ul className="list-check">{result.strengths.map((s, i) => <li key={i}><Icon name="check" size={16} /><span>{s}</span></li>)}</ul>
        </section>
      )}

      <section className="stack-sm" aria-label={t("حدود هذه المراجعة", "Limits of this review")}>
        <h3 className="t-h4">{t("حدود هذه المراجعة", "Limits of this review")}</h3>
        <ul className="t-small muted" style={{ listStyle: "disc", paddingInlineStart: "1.3rem", display: "grid", gap: "0.25rem" }}>
          {result.limits.map((l, i) => <li key={i}>{l}</li>)}
          {result.needsHuman && <li>{t("تحتاج النتيجة مراجعة بشرية قبل اتخاذ قرار مبني عليها.", "The result needs human review before any decision is based on it.")}</li>}
        </ul>
      </section>
    </div>
  );
}

/** تشغيل مراجعة على نص معيّن (يُستخدم في لوحة الاستشارة). */
export function ReviewRunner({ text, consultationId, messageId, defaultMode }: {
  text: string; consultationId?: string; messageId?: string; defaultMode?: string;
}) {
  const { ensureConsent, toast, t, lang } = useApp();
  const [mode, setMode] = useState(defaultMode ?? "technical");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [res, setRes] = useState<{ id: string; result: ReviewResult } | null>(null);
  const modes = modesFor(lang).filter((m) => !m.needsCriteria);

  async function run() {
    setBusy(true); setError("");
    let r = await api<{ id: string; result: ReviewResult }>("/api/reviews", { body: { text, mode, consultationId, messageId } });
    if (r.status === 412 && (await ensureConsent())) r = await api("/api/reviews", { body: { text, mode, consultationId, messageId } });
    else if (r.status === 412) r = await api("/api/reviews", { body: { text, mode, consultationId, messageId, engine: "heuristic" } });
    setBusy(false);
    if (!r.ok) { setError(r.data.error ?? t("تعذرت المراجعة.", "The review failed.")); return; }
    setRes(r.data);
    toast(t("اكتملت المراجعة النقدية.", "The critical review is complete."));
  }

  return (
    <div className="stack">
      <div className="stack-sm">
        <span className="label" id="rv-mode">{t("نمط المراجعة", "Review mode")}</span>
        <div className="chips" role="group" aria-labelledby="rv-mode">
          {modes.map((m) => <button key={m.id} className="chip" aria-pressed={mode === m.id} onClick={() => { setMode(m.id); setRes(null); }}>{m.name}</button>)}
        </div>
        <p className="t-caption">{modes.find((m) => m.id === mode)?.short}</p>
      </div>
      <details>
        <summary className="t-small link" style={{ cursor: "pointer" }}>{t("المعايير المعلنة لهذا النمط", "The stated criteria for this mode")}</summary>
        <ul className="t-small muted" style={{ listStyle: "disc", paddingInlineStart: "1.3rem", marginTop: "0.5rem" }}>
          {modes.find((m) => m.id === mode)?.criteria.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </details>
      <button className="btn btn-primary" onClick={run} disabled={busy}>
        {busy ? <span className="spinner" /> : <Icon name="lab" />} {busy ? t("جارٍ المراجعة…", "Reviewing…") : res ? t("أعد المراجعة", "Review again") : t("شغّل المراجعة", "Run the review")}
      </button>
      {error && <p className="field-error" role="alert"><Icon name="alert" size={16} /> {error}</p>}
      {res && (
        <>
          <ReviewView result={res.result} />
          <Link className="btn btn-secondary" href={`/lab?review=${res.id}`}>{t("افتحها في المختبر لمقارنة نسخة منقّحة", "Open it in the lab to compare a revised version")}</Link>
        </>
      )}
    </div>
  );
}

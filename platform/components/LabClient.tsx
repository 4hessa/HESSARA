"use client";
// مختبر النقد: المدخل ← المعايير ← النتائج، ثم مقارنة نسخة منقّحة بالأصل.
import { useState } from "react";
import type { DiffPart } from "@/lib/review/diff";
import { modesFor, type ReviewResult } from "@/lib/review/types";
import { api, useApp } from "./app";
import { fmtDate } from "./bits";
import { Icon } from "./Icon";
import { ReviewView } from "./Review";

type Past = { id: string; mode: string; input: string; created_at: number; engine: string; result: ReviewResult; criteria: string[]; revised: string | null };

export function LabClient({ initial, past, hasLlm }: { initial: Past | null; past: Past[]; hasLlm: boolean }) {
  const { ensureConsent, toast, t, lang } = useApp();
  const REVIEW_MODES = modesFor(lang);
  const [text, setText] = useState(initial?.input ?? "");
  const [mode, setMode] = useState(initial?.mode ?? "technical");
  const [criteria, setCriteria] = useState((initial?.criteria ?? []).join("\n"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [res, setRes] = useState<{ id: string; result: ReviewResult } | null>(initial ? { id: initial.id, result: initial.result } : null);
  const [revised, setRevised] = useState(initial?.revised ?? "");
  const [diff, setDiff] = useState<DiffPart[] | null>(null);
  const [revBusy, setRevBusy] = useState(false);
  const m = REVIEW_MODES.find((x) => x.id === mode)!;
  const list = criteria.split("\n").map((s) => s.trim()).filter(Boolean);

  async function run() {
    setError("");
    if (text.trim().length < 20) { setError(t("أدخل نصًا لا يقل عن ٢٠ حرفًا.", "Enter at least 20 characters of text.")); return; }
    if (m.needsCriteria && !list.length) { setError(t("اكتب معيارًا واحدًا على الأقل، كل معيار في سطر.", "Write at least one criterion, one per line.")); return; }
    setBusy(true); setDiff(null);
    const body = { text, mode, criteria: list };
    let r = await api<{ id: string; result: ReviewResult }>("/api/reviews", { body });
    if (r.status === 412) r = await api("/api/reviews", { body: (await ensureConsent()) ? body : { ...body, engine: "heuristic" } });
    setBusy(false);
    if (!r.ok) { setError(r.data.error ?? t("تعذرت المراجعة.", "The review failed.")); return; }
    setRes(r.data); setRevised("");
    document.getElementById("lab-results")?.scrollIntoView({ block: "nearest" });
  }
  async function compare(generate: boolean) {
    if (!res) return;
    setRevBusy(true);
    const r = await api<{ revised: string; diff: DiffPart[]; source: string }>(`/api/reviews/${res.id}/revise`, { body: generate ? { generate: true } : { revised } });
    setRevBusy(false);
    if (!r.ok) { toast(r.data.error ?? t("تعذرت المقارنة.", "The comparison failed.")); return; }
    setRevised(r.data.revised); setDiff(r.data.diff);
  }

  return (
    <div className="stack-lg">
      <div className="lab">
        <section className="lab-col" aria-labelledby="lab-in">
          <h2 id="lab-in" className="col-title"><b>01</b> {t("المدخل", "Input")}</h2>
          <div className="field">
            <label className="label" htmlFor="lab-text">{t("النص المراد مراجعته", "The text to review")}</label>
            <textarea id="lab-text" className="textarea" dir="auto" style={{ minHeight: "20rem" }} maxLength={20000} value={text} onChange={(e) => setText(e.target.value)}
              placeholder={t("الصق إجابة نموذج، أو خطة، أو شفرة، أو مقترحًا تقنيًا…", "Paste a model's answer, a plan, code, or a technical proposal…")} aria-describedby="lab-text-hint" />
            <span id="lab-text-hint" className="hint">{text.length.toLocaleString(lang === "ar" ? "ar" : "en")} / {t("٢٠٬٠٠٠ حرف. لا تلصق أسرارًا أو بيانات شخصية.", "20,000 characters. Do not paste secrets or personal data.")}</span>
          </div>
        </section>

        <section className="lab-col" aria-labelledby="lab-crit">
          <h2 id="lab-crit" className="col-title"><b>02</b> {t("معايير المراجعة", "Review criteria")}</h2>
          <div className="stack-sm" role="radiogroup" aria-label={t("نمط المراجعة", "Review mode")}>
            {REVIEW_MODES.map((x) => (
              <button key={x.id} role="radio" aria-checked={mode === x.id} className="option" style={{ gridTemplateColumns: "1fr" }} onClick={() => setMode(x.id)}>
                <span className="stack-sm" style={{ gap: 0 }}><strong className="t-small">{x.name}</strong><span className="t-caption">{x.short}</span></span>
              </button>
            ))}
          </div>
          {m.criteria.length > 0 && (
            <details open>
              <summary className="label" style={{ cursor: "pointer" }}>{t("المعايير المعلنة", "Stated criteria")} ({m.criteria.length})</summary>
              <ul className="t-small muted" style={{ listStyle: "disc", paddingInlineStart: "1.3rem", marginTop: "0.5rem" }}>{m.criteria.map((c) => <li key={c}>{c}</li>)}</ul>
            </details>
          )}
          <div className="field">
            <label className="label" htmlFor="lab-criteria">{m.needsCriteria ? t("معاييرك (مطلوبة، معيار في كل سطر)", "Your criteria (required, one per line)") : t("معايير إضافية (اختياري)", "Extra criteria (optional)")}</label>
            <textarea id="lab-criteria" className="textarea" dir="auto" value={criteria} onChange={(e) => setCriteria(e.target.value)} placeholder={t("مثال:\nتتضمن الخطة معيار قبول لكل مرحلة\nتذكر الإجابة مصدر كل رقم", "For example:\nThe plan includes an acceptance criterion for every phase\nThe answer gives the source of every figure")} />
          </div>
          <button className="btn btn-primary btn-block" onClick={run} disabled={busy}>{busy ? <span className="spinner" /> : <Icon name="lab" />}{busy ? t("جارٍ المراجعة…", "Reviewing…") : t("شغّل المراجعة", "Run the review")}</button>
          {error && <p className="field-error" role="alert"><Icon name="alert" size={16} /> {error}</p>}
          <p className="t-caption">{hasLlm ? t("المحرك: نموذج لغوي مهيّأ يحكم وفق المعايير، ويُستبدل به المراجع القاعدي إن تعذر الاتصال.", "Engine: a configured language model judges against the criteria; the rule-based reviewer takes over if the connection fails.") : t("المحرك الحالي: المراجع القاعدي (فحوص نمطية). لا يوجد نموذج لغوي مهيّأ على الخادم.", "Current engine: the rule-based reviewer (pattern checks). No language model is configured on the server.")}</p>
        </section>

        <section className="lab-col" id="lab-results" aria-labelledby="lab-out" aria-live="polite">
          <h2 id="lab-out" className="col-title"><b>03</b> {t("النتائج", "Results")}</h2>
          {busy ? <div className="stack-sm"><div className="skeleton" style={{ height: "4.5rem" }} /><div className="skeleton" style={{ height: "6rem" }} /><div className="skeleton" style={{ height: "6rem" }} /></div>
            : res ? <ReviewView result={res.result} />
            : <div className="empty"><Icon name="lab" size={28} /><p>{t("ستظهر هنا الملاحظات المنظّمة ونقاط القصور والإجراءات المقترحة بعد تشغيل المراجعة.", "Structured findings, shortcomings, and suggested actions will appear here once the review runs.")}</p></div>}
        </section>
      </div>

      {res && (
        <section className="card" aria-labelledby="lab-rev">
          <h2 id="lab-rev" className="t-h3">{t("قارن نسخة منقّحة بالأصل", "Compare a revised version with the original")}</h2>
          <p className="t-small muted">{t("عدّل النص بناءً على الملاحظات والصقه هنا", "Edit the text in light of the findings and paste it here")}{hasLlm ? t("، أو اطلب من النموذج اللغوي توليد نسخة منقّحة", ", or ask the language model to generate a revised version") : ""}{t(". تُحسب الفروق كلمةً بكلمة.", ". Differences are computed word by word.")}</p>
          <div className="field"><label className="label" htmlFor="lab-revised">{t("النسخة المنقّحة", "Revised version")}</label>
            <textarea id="lab-revised" className="textarea" dir="auto" style={{ minHeight: "10rem" }} maxLength={20000} value={revised} onChange={(e) => setRevised(e.target.value)} /></div>
          <div className="row">
            <button className="btn btn-primary btn-sm" disabled={revBusy || !revised.trim()} onClick={() => compare(false)}>{revBusy && <span className="spinner" />}{t("أظهر الفروق", "Show the differences")}</button>
            {hasLlm && <button className="btn btn-secondary btn-sm" disabled={revBusy} onClick={async () => { if (await ensureConsent()) { setRevised(""); compare(true); } }}>{t("ولّد نسخة منقّحة بالنموذج", "Generate a revised version with the model")}</button>}
            {diff && <button className="btn btn-ghost btn-sm" onClick={() => { setText(revised); setRes(null); setDiff(null); window.scrollTo({ top: 0 }); }}>{t("راجِع النسخة المنقّحة", "Review the revised version")}</button>}
          </div>
          {diff && (
            <>
              <p className="t-caption diff-legend"><ins>{t("مضاف", "Added")}</ins> · <del>{t("محذوف", "Removed")}</del></p>
              <div className="diff" dir="auto" aria-label={t("الفروق بين الأصل والنسخة المنقّحة", "Differences between the original and the revised version")}>
                {diff.map((p, i) => p.type === "add" ? <ins key={i}>{p.text}</ins> : p.type === "del" ? <del key={i}>{p.text}</del> : <span key={i}>{p.text}</span>)}
              </div>
            </>
          )}
        </section>
      )}

      {past.length > 0 && (
        <section className="card" aria-labelledby="lab-past">
          <h2 id="lab-past" className="t-h3">{t("مراجعاتك السابقة", "Your earlier reviews")}</h2>
          <ul>{past.map((p) => (
            <li key={p.id}><a className="ws-item" href={`/lab?review=${p.id}`}><span className="ws-item-title">{p.input.slice(0, 90)}</span>
              <span className="t-caption">{REVIEW_MODES.find((x) => x.id === p.mode)?.name} · {p.engine === "llm" ? t("نموذج لغوي", "Language model") : t("مراجع قاعدي", "Rule-based reviewer")} · {fmtDate(p.created_at, lang)}</span></a></li>
          ))}</ul>
        </section>
      )}
    </div>
  );
}

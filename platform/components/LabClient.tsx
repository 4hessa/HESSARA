"use client";
// مختبر النقد: المدخل ← المعايير ← النتائج، ثم مقارنة نسخة منقّحة بالأصل.
import { useState } from "react";
import type { DiffPart } from "@/lib/review/diff";
import { REVIEW_MODES, type ReviewResult } from "@/lib/review/types";
import { api, useApp } from "./app";
import { fmtDate } from "./bits";
import { Icon } from "./Icon";
import { ReviewView } from "./Review";

type Past = { id: string; mode: string; input: string; created_at: number; engine: string; result: ReviewResult; criteria: string[]; revised: string | null };

export function LabClient({ initial, past, hasLlm }: { initial: Past | null; past: Past[]; hasLlm: boolean }) {
  const { ensureConsent, toast } = useApp();
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
    if (text.trim().length < 20) { setError("أدخل نصًا لا يقل عن ٢٠ حرفًا."); return; }
    if (m.needsCriteria && !list.length) { setError("اكتب معيارًا واحدًا على الأقل، كل معيار في سطر."); return; }
    setBusy(true); setDiff(null);
    const body = { text, mode, criteria: list };
    let r = await api<{ id: string; result: ReviewResult }>("/api/reviews", { body });
    if (r.status === 412) r = await api("/api/reviews", { body: (await ensureConsent()) ? body : { ...body, engine: "heuristic" } });
    setBusy(false);
    if (!r.ok) { setError(r.data.error ?? "تعذرت المراجعة."); return; }
    setRes(r.data); setRevised("");
    document.getElementById("lab-results")?.scrollIntoView({ block: "nearest" });
  }
  async function compare(generate: boolean) {
    if (!res) return;
    setRevBusy(true);
    const r = await api<{ revised: string; diff: DiffPart[]; source: string }>(`/api/reviews/${res.id}/revise`, { body: generate ? { generate: true } : { revised } });
    setRevBusy(false);
    if (!r.ok) { toast(r.data.error ?? "تعذرت المقارنة."); return; }
    setRevised(r.data.revised); setDiff(r.data.diff);
  }

  return (
    <div className="stack-lg">
      <div className="lab">
        <section className="lab-col" aria-labelledby="lab-in">
          <h2 id="lab-in" className="col-title"><b>01</b> المدخل</h2>
          <div className="field">
            <label className="label" htmlFor="lab-text">النص المراد مراجعته</label>
            <textarea id="lab-text" className="textarea" dir="auto" style={{ minHeight: 320 }} maxLength={20000} value={text} onChange={(e) => setText(e.target.value)}
              placeholder="الصق إجابة نموذج، أو خطة، أو شفرة، أو مقترحًا تقنيًا…" aria-describedby="lab-text-hint" />
            <span id="lab-text-hint" className="hint">{text.length.toLocaleString("ar")} / ٢٠٬٠٠٠ حرف. لا تلصق أسرارًا أو بيانات شخصية.</span>
          </div>
        </section>

        <section className="lab-col" aria-labelledby="lab-crit">
          <h2 id="lab-crit" className="col-title"><b>02</b> معايير المراجعة</h2>
          <div className="stack-sm" role="radiogroup" aria-label="نمط المراجعة">
            {REVIEW_MODES.map((x) => (
              <button key={x.id} role="radio" aria-checked={mode === x.id} className="option" style={{ gridTemplateColumns: "1fr" }} onClick={() => setMode(x.id)}>
                <span className="stack-sm" style={{ gap: 0 }}><strong className="t-small">{x.name}</strong><span className="t-caption">{x.short}</span></span>
              </button>
            ))}
          </div>
          {m.criteria.length > 0 && (
            <details open>
              <summary className="label" style={{ cursor: "pointer" }}>المعايير المعلنة ({m.criteria.length})</summary>
              <ul className="t-small muted" style={{ listStyle: "disc", paddingInlineStart: "var(--s-5)", marginTop: 8 }}>{m.criteria.map((c) => <li key={c}>{c}</li>)}</ul>
            </details>
          )}
          <div className="field">
            <label className="label" htmlFor="lab-criteria">{m.needsCriteria ? "معاييرك (مطلوبة، معيار في كل سطر)" : "معايير إضافية (اختياري)"}</label>
            <textarea id="lab-criteria" className="textarea" dir="auto" value={criteria} onChange={(e) => setCriteria(e.target.value)} placeholder={"مثال:\nتتضمن الخطة معيار قبول لكل مرحلة\nتذكر الإجابة مصدر كل رقم"} />
          </div>
          <button className="btn btn-primary btn-block" onClick={run} disabled={busy}>{busy ? <span className="spinner" /> : <Icon name="lab" />}{busy ? "جارٍ المراجعة…" : "شغّل المراجعة"}</button>
          {error && <p className="field-error" role="alert"><Icon name="alert" size={16} /> {error}</p>}
          <p className="t-caption">{hasLlm ? "المحرك: نموذج لغوي مهيّأ يحكم وفق المعايير، ويُستبدل به المراجع القاعدي إن تعذر الاتصال." : "المحرك الحالي: المراجع القاعدي (فحوص نمطية). لا يوجد نموذج لغوي مهيّأ على الخادم."}</p>
        </section>

        <section className="lab-col" id="lab-results" aria-labelledby="lab-out" aria-live="polite">
          <h2 id="lab-out" className="col-title"><b>03</b> النتائج</h2>
          {busy ? <div className="stack-sm"><div className="skeleton" style={{ height: 72 }} /><div className="skeleton" style={{ height: 96 }} /><div className="skeleton" style={{ height: 96 }} /></div>
            : res ? <ReviewView result={res.result} />
            : <div className="empty"><Icon name="lab" size={28} /><p>ستظهر هنا الملاحظات المنظّمة ونقاط القصور والإجراءات المقترحة بعد تشغيل المراجعة.</p></div>}
        </section>
      </div>

      {res && (
        <section className="card" aria-labelledby="lab-rev">
          <h2 id="lab-rev" className="t-h3">قارن نسخة منقّحة بالأصل</h2>
          <p className="t-small muted">عدّل النص بناءً على الملاحظات والصقه هنا{hasLlm ? "، أو اطلب من النموذج اللغوي توليد نسخة منقّحة" : ""}. تُحسب الفروق كلمةً بكلمة.</p>
          <div className="field"><label className="label" htmlFor="lab-revised">النسخة المنقّحة</label>
            <textarea id="lab-revised" className="textarea" dir="auto" style={{ minHeight: 160 }} maxLength={20000} value={revised} onChange={(e) => setRevised(e.target.value)} /></div>
          <div className="row">
            <button className="btn btn-primary btn-sm" disabled={revBusy || !revised.trim()} onClick={() => compare(false)}>{revBusy && <span className="spinner" />}أظهر الفروق</button>
            {hasLlm && <button className="btn btn-secondary btn-sm" disabled={revBusy} onClick={async () => { if (await ensureConsent()) { setRevised(""); compare(true); } }}>ولّد نسخة منقّحة بالنموذج</button>}
            {diff && <button className="btn btn-ghost btn-sm" onClick={() => { setText(revised); setRes(null); setDiff(null); window.scrollTo({ top: 0 }); }}>راجِع النسخة المنقّحة</button>}
          </div>
          {diff && (
            <>
              <p className="t-caption"><ins style={{ background: "var(--diff-add)", textDecoration: "none", padding: "0 4px" }}>مضاف</ins> · <del style={{ background: "var(--diff-del)", padding: "0 4px" }}>محذوف</del></p>
              <div className="diff" dir="auto" aria-label="الفروق بين الأصل والنسخة المنقّحة">
                {diff.map((p, i) => p.type === "add" ? <ins key={i}>{p.text}</ins> : p.type === "del" ? <del key={i}>{p.text}</del> : <span key={i}>{p.text}</span>)}
              </div>
            </>
          )}
        </section>
      )}

      {past.length > 0 && (
        <section className="card" aria-labelledby="lab-past">
          <h2 id="lab-past" className="t-h3">مراجعاتك السابقة</h2>
          <ul>{past.map((p) => (
            <li key={p.id}><a className="ws-item" href={`/lab?review=${p.id}`}><span className="ws-item-title">{p.input.slice(0, 90)}</span>
              <span className="t-caption">{REVIEW_MODES.find((x) => x.id === p.mode)?.name} · {p.engine === "llm" ? "نموذج لغوي" : "مراجع قاعدي"} · {fmtDate(p.created_at)}</span></a></li>
          ))}</ul>
        </section>
      )}
    </div>
  );
}

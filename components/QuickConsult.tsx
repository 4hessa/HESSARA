"use client";
// حقل بدء الاستشارة (الصفحة التعريفية ولوحة المستخدم ومسار «استشارة جديدة»).
// للزائر: يُحفظ النص مؤقتًا في تخزين جلسة المتصفح فقط، بإفصاح ظاهر، ثم يُستعاد بعد الدخول.
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { agentsFor } from "@/lib/catalog/agents";
import { suggestAgent } from "@/lib/catalog/suggestAgent";
import { AdvisorPicker, defaultModel, type Advisor } from "./AdvisorPicker";
import { api, useApp } from "./app";
import { Icon } from "./Icon";

export const DRAFT_KEY = "hs_draft";
export const pendingKey = (id: string) => `hs_pending:${id}`;

export function QuickConsult({ examples, initialAgent, initialModel, initialText, autoFocus, restoreDraft }: {
  examples?: string[]; initialAgent?: string | null; initialModel?: string | null; initialText?: string; autoFocus?: boolean; restoreDraft?: boolean;
}) {
  const { user, models, t, lang } = useApp();
  const router = useRouter();
  const [text, setText] = useState(initialText ?? "");
  const [advisor, setAdvisor] = useState<Advisor>({ modelId: defaultModel(models, initialModel ?? user?.prefModel), agentId: initialAgent ?? user?.prefAgent ?? null });
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [error, setError] = useState("");
  const ta = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
      if (d?.text && (restoreDraft || !user)) {
        setText(d.text);
        if (user && d.advisor && models.some((m) => m.id === d.advisor.modelId && m.status !== "not_configured")) setAdvisor(d.advisor);
        if (user) sessionStorage.removeItem(DRAFT_KEY);
      }
    } catch { /* لا مسودة */ }
  }, [restoreDraft, user, models]);

  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, window.innerHeight * 0.4)}px`;
  }, [text]);

  // اقتراح وكيل متخصص من كلمات السؤال، ما لم يُختر وكيل أو يُتجاهل الاقتراح نفسه.
  const suggested = advisor.agentId ? null : suggestAgent(text);
  const suggestedAgent = suggested && suggested !== dismissed ? agentsFor(lang).find((a) => a.id === suggested) : undefined;

  async function submit() {
    const value = text.trim();
    if (!value || busy) return;
    setError("");
    if (!user) {
      try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ text: value, advisor })); } catch { /* يُكمل دون حفظ */ }
      router.push("/login?next=/consult/new");
      return;
    }
    setBusy(true);
    const r = await api<{ id: string }>("/api/consultations", { body: { text: value, ...advisor } });
    if (!r.ok) { setBusy(false); setError(r.data.error ?? t("تعذر بدء الاستشارة.", "Could not start the consultation.")); return; }
    try { sessionStorage.setItem(pendingKey(r.data.id), value); } catch { /* سيُطلب من المستخدم إعادة الإرسال */ }
    router.push(`/consult/${r.data.id}`);
  }

  return (
    <div className="stack-sm">
      <form className="composer" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <label htmlFor="quick-consult" className="sr-only">{t("نص الاستشارة", "Consultation text")}</label>
        <textarea id="quick-consult" ref={ta} value={text} autoFocus={autoFocus} maxLength={12000} rows={2}
          placeholder={t("اشرح المشكلة التي تواجهك، وسنساعدك في تحليلها...", "Describe the problem you are facing, and we will help you analyse it...")}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); } }}
          aria-describedby="quick-consult-hint" />
        <div className="composer-bar">
          <AdvisorPicker value={advisor} onChange={setAdvisor} />
          <span className="grow" />
          <button type="submit" className="btn btn-primary btn-sm" disabled={!text.trim() || busy}>
            {busy ? <span className="spinner" /> : <Icon name="send" size={18} />}
            {busy ? t("جارٍ البدء…", "Starting…") : t("أرسل", "Send")}
          </button>
        </div>
      </form>
      {suggestedAgent && (
        <div className="notice notice-accent agent-suggest" role="status">
          <Icon name="info" />
          <div className="agent-suggest__body">
            <span className="t-small">{t("اقتراح بحسب كلمات سؤالك:", "Suggested from the wording of your question:")} <strong>{suggestedAgent.name}</strong></span>
            <span className="row">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAdvisor({ ...advisor, agentId: suggestedAgent.id })}>{t("استشر هذا الوكيل", "Consult this agent")}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDismissed(suggestedAgent.id)}>{t("تجاهل", "Dismiss")}</button>
            </span>
          </div>
        </div>
      )}
      {error && <p className="field-error" role="alert"><Icon name="alert" size={16} /> {error}</p>}
      <p id="quick-consult-hint" className="t-caption">
        {user
          ? <>{t("اضغط", "Press")} <kbd className="ltr">Ctrl + Enter</kbd> {t("للإرسال. إرفاق الملفات غير متاح في هذه النسخة.", "to send. Attaching files is not available in this version.")}</>
          : t("ستُطلب منك خطوة تسجيل الدخول، ويُحفظ نصك مؤقتًا في متصفحك فقط حتى تكملها.", "You will be asked to sign in; your text is kept temporarily in your browser only until you do.")}
      </p>
      {examples && examples.length > 0 && (
        <div className="chips" aria-label={t("أمثلة", "Examples")}>
          {examples.map((ex) => (
            <button key={ex} type="button" className="chip" onClick={() => { setText(ex); ta.current?.focus(); }}>{ex}</button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
// مساحة الاستشارات: سجل جانبي، محادثة مبثوثة، ولوحة مراجعة نقدية.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { agentById } from "@/lib/catalog/agents";
import type { ConsultRow, MessageRow } from "@/lib/db";
import { AdvisorPicker } from "./AdvisorPicker";
import { ModelNotice } from "./ModelNotice";
import { api, useApp } from "./app";
import { fmtDate, VendorMark } from "./bits";
import { Dialog } from "./Dialog";
import { Icon } from "./Icon";
import { Markdown } from "./Markdown";
import { pendingKey } from "./QuickConsult";
import { ReviewRunner } from "./Review";

type Msg = Pick<MessageRow, "id" | "role" | "content" | "model_id" | "engine" | "status" | "feedback">;

export function HistoryList({ items, currentId, savedOnly }: { items: ConsultRow[]; currentId?: string; savedOnly?: boolean }) {
  const { t, lang } = useApp();
  const [q, setQ] = useState("");
  const [list, setList] = useState(items);
  const [saved, setSaved] = useState(!!savedOnly);
  const [loading, setLoading] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; if (!savedOnly) return; }
    const ctl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await api<{ consultations: ConsultRow[] }>(`/api/consultations?q=${encodeURIComponent(q)}${saved ? "&saved=1" : ""}`, { signal: ctl.signal });
        if (r.ok) setList(r.data.consultations);
      } catch { /* أُلغي */ }
      setLoading(false);
    }, 250);
    return () => { clearTimeout(timer); ctl.abort(); };
  }, [q, saved, savedOnly]);
  return (
    <>
      <div className="ws-side-head">
        <Link href="/consult/new" className="btn btn-primary btn-sm btn-block"><Icon name="plus" size={18} /> {t("استشارة جديدة", "New consultation")}</Link>
        <div className="input-wrap">
          <label className="sr-only" htmlFor="hist-q">{t("ابحث في الاستشارات", "Search consultations")}</label>
          <input id="hist-q" className="input" type="search" placeholder={t("ابحث في العناوين والمحتوى", "Search titles and content")} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="chips">
          <button className="chip" aria-pressed={!saved} onClick={() => setSaved(false)}>{t("الكل", "All")}</button>
          <button className="chip" aria-pressed={saved} onClick={() => setSaved(true)}><Icon name="bookmark" size={16} /> {t("المحفوظة", "Saved")}</button>
        </div>
      </div>
      <nav className="ws-list" aria-label={t("سجل الاستشارات", "Consultation history")} aria-busy={loading}>
        {list.length === 0 && <p className="t-small muted" style={{ padding: "1rem" }}>{q || saved ? t("لا نتائج مطابقة.", "No matching results.") : t("لا استشارات بعد. ابدأ أول استشارة.", "No consultations yet. Start your first one.")}</p>}
        {list.map((c) => (
          <Link key={c.id} href={`/consult/${c.id}`} className="ws-item" aria-current={c.id === currentId ? "page" : undefined}>
            <span className="ws-item-title">{c.saved ? "★ " : ""}{c.title}</span>
            <span className="t-caption">{fmtDate(c.updated_at, lang)}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

/** أسباب «إجابة غير مفيدة»: قائمة ثابتة تُحصى في صفحة الإحصاءات. */
export const FEEDBACK_REASONS = [
  { id: "inaccurate", ar: "غير دقيقة", en: "Inaccurate" },
  { id: "incomplete", ar: "ناقصة", en: "Incomplete" },
  { id: "off_topic", ar: "لا تجيب عن السؤال", en: "Does not answer the question" },
  { id: "unclear", ar: "غير واضحة", en: "Unclear" },
  { id: "other", ar: "سبب آخر", en: "Another reason" },
] as const;

export function Workspace({ consultation: c0, messages: m0, history, quota, shareToken: share0 }: {
  consultation: ConsultRow; messages: Msg[]; history: ConsultRow[];
  /** ما تبقّى من الحد اليومي للنماذج الحقيقية؛ null لصاحب المشروع (بلا حد). */
  quota?: { left: number | null; limit: number | null } | null;
  shareToken?: string | null;
}) {
  const { models, user, setUser, toast, ensureConsent, t, lang } = useApp();
  const router = useRouter();
  const [c, setC] = useState(c0);
  const [msgs, setMsgs] = useState<Msg[]>(m0);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState<Msg | null>(null);
  const [sideOpen, setSideOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [wide, setWide] = useState(true);
  const [left, setLeft] = useState<number | null>(quota?.left ?? null);
  const [shareToken, setShareToken] = useState<string | null>(share0 ?? null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [reasonFor, setReasonFor] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const sentPending = useRef(false);

  const model = models.find((m) => m.id === c.model_id);
  const agent = agentById(c.agent_id, lang);
  const busy = streaming !== null;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1181px)");
    const on = () => setWide(mq.matches);
    on(); mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  // الخطأ أيضًا يُمرَّر إليه: يُضاف أسفل المحادثة، ودون تمرير يبقى خارج مجال الرؤية.
  useEffect(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs.length, streaming, error]);
  useEffect(() => {
    const el = taRef.current; if (!el) return;
    el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, window.innerHeight * 0.4)}px`;
  }, [draft]);

  const send = useCallback(async (text: string | null) => {
    if (abortRef.current) return;
    setError("");
    const retry = text === null;
    const tempId = `tmp-${Date.now()}`;
    if (!retry) setMsgs((m) => [...m, { id: tempId, role: "user", content: text, model_id: null, engine: null, status: "complete", feedback: null }]);
    else setMsgs((m) => (m[m.length - 1]?.role === "assistant" ? m.slice(0, -1) : m));
    setStreaming("");
    const ctl = new AbortController();
    abortRef.current = ctl;
    let acc = "", assistantId = "", finished = false, failed = "";
    try {
      const doFetch = () => fetch(`/api/consultations/${c.id}/messages`, {
        method: "POST", headers: { "content-type": "application/json" }, signal: ctl.signal,
        body: JSON.stringify(retry ? { retry: true } : { text }),
      });
      let res = await doFetch();
      if (res.status === 412) {
        // لم يُرسل شيء للمزوّد بعد: لا يُعرض «يكتب الإجابة» أثناء انتظار الموافقة.
        setStreaming(null);
        if (await ensureConsent()) { setStreaming(""); res = await doFetch(); }
        else throw new Error(t("لم تُمنح الموافقة على الإرسال إلى المزوّد الخارجي. يمكنك اختيار المحرك التجريبي بدلًا من ذلك.", "Consent to send to the external provider was not given. You can choose the demo engine instead."));
      }
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error ?? t("تعذر إرسال الرسالة.", "Could not send the message."));
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, i); buf = buf.slice(i + 1);
          if (!line) continue;
          const ev = JSON.parse(line);
          if (ev.t === "start") {
            assistantId = ev.id;
            if (ev.userMessageId) setMsgs((m) => m.map((x) => (x.id === tempId ? { ...x, id: ev.userMessageId } : x)));
          } else if (ev.t === "d") { acc += ev.v; setStreaming(acc); }
          else if (ev.t === "done") { finished = true; if (typeof ev.left === "number") setLeft(ev.left); }
          else if (ev.t === "error") failed = ev.message;
        }
      }
      if (!finished && !failed) failed = t("انقطع الاتصال قبل اكتمال الإجابة.", "The connection dropped before the answer was complete.");
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        failed = (e as Error).message || t("تعذر الاتصال بالخادم.", "Could not reach the server.");
        // لم تصل الرسالة: نعيد النص إلى حقل الكتابة حتى لا يضيع.
        if (!assistantId && !retry) { setMsgs((m) => m.filter((x) => x.id !== tempId)); setDraft(text ?? ""); }
      }
    }
    abortRef.current = null;
    if (acc.trim()) {
      setMsgs((m) => [...m, { id: assistantId || `tmp-a-${Date.now()}`, role: "assistant", content: acc, model_id: c.model_id, engine: model?.engine ?? "llm", status: finished ? "complete" : "stopped", feedback: null }]);
    }
    setStreaming(null);
    if (failed) setError(failed);
    router.refresh();
  }, [c.id, c.model_id, ensureConsent, model?.engine, router, t]);

  // الرسالة الأولى القادمة من حقل البدء السريع.
  useEffect(() => {
    if (sentPending.current) return;
    sentPending.current = true;
    try {
      const p = sessionStorage.getItem(pendingKey(c.id));
      if (p) { sessionStorage.removeItem(pendingKey(c.id)); if (m0.length === 0) send(p); }
    } catch { /* لا شيء معلّق */ }
  }, [c.id, m0.length, send]);

  const submit = () => { const v = draft.trim(); if (!v || busy) return; setDraft(""); send(v); };
  const patch = async (body: Record<string, unknown>, okMsg?: string) => {
    const r = await api<{ consultation: ConsultRow }>(`/api/consultations/${c.id}`, { method: "PATCH", body });
    if (r.ok) { setC(r.data.consultation); if (okMsg) toast(okMsg); router.refresh(); }
    else toast(r.data.error ?? t("تعذر حفظ التغيير.", "Could not save the change."));
  };
  const feedback = async (m: Msg, value: 1 | -1) => {
    const v = m.feedback === value ? null : value;
    setReasonFor(v === -1 ? m.id : null);
    setMsgs((all) => all.map((x) => (x.id === m.id ? { ...x, feedback: v } : x)));
    const r = await api(`/api/messages/${m.id}/feedback`, { body: { value: v } });
    if (!r.ok) toast(t("تعذر حفظ التقييم.", "Could not save your rating."));
  };
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast(t("نُسخت الإجابة.", "Answer copied.")); } catch { toast(t("تعذر النسخ من المتصفح.", "The browser could not copy.")); }
  };
  const lastAssistantId = [...msgs].reverse().find((m) => m.role === "assistant")?.id;
  let prevModel: string | null = null;

  const panelBody = panel && (
    <div className="dialog-body">
      <p className="t-small muted">{t("تُراجَع الإجابة المحددة مراجعة مستقلة عن النموذج الذي كتبها، وفق معايير معلنة.", "The selected answer is reviewed independently of the model that wrote it, against stated criteria.")}</p>
      <ReviewRunner key={panel.id} text={panel.content} consultationId={c.id} messageId={panel.id} defaultMode={agent?.reviewMode} />
    </div>
  );

  return (
    <div className={`workspace${panel && wide ? " with-panel" : ""}`}>
      <aside className="ws-side" aria-label={t("سجل الاستشارات", "Consultation history")}><HistoryList items={history} currentId={c.id} /></aside>

      <section className="ws-main" aria-label={t("المحادثة", "Conversation")}>
        <div className="ws-bar">
          <button className="btn btn-ghost btn-icon btn-sm ws-mobile-only" aria-label={t("سجل الاستشارات", "Consultation history")} onClick={() => setSideOpen(true)}><Icon name="menu" /></button>
          <h1 className="ws-title grow">{c.title}</h1>
          <span className="row hide-mobile" style={{ flexWrap: "nowrap" }} title={busy ? t("يولّد الإجابة", "Generating the answer") : model?.status === "failed" ? t("فشل آخر اتصال", "The last connection failed") : t("جاهز", "Ready")}>
            <span className={`status-dot${busy ? " busy" : model?.status === "failed" ? " off" : ""}`} />
            <span className="t-caption">{busy ? t("يكتب…", "Writing…") : model?.status === "failed" ? t("تعذر الاتصال", "Connection failed") : t("متصل", "Connected")}</span>
          </span>
          <AdvisorPicker compact lockAgent value={{ modelId: c.model_id, agentId: c.agent_id }}
            onChange={(a) => { if (a.modelId !== c.model_id) patch({ modelId: a.modelId }, t("تغيّر النموذج. الإجابات التالية ستأتي من النموذج الجديد.", "Model changed. The next answers will come from the new model.")); }} />
          <button className="btn btn-ghost btn-icon btn-sm" aria-pressed={!!c.saved} aria-label={c.saved ? t("إزالة من المحفوظات", "Remove from saved") : t("حفظ الاستشارة", "Save the consultation")}
            onClick={() => patch({ saved: !c.saved }, c.saved ? t("أُزيلت من المحفوظات.", "Removed from saved.") : t("حُفظت الاستشارة في المحفوظات.", "Consultation saved."))}><Icon name="bookmark" /></button>
          <a className="btn btn-ghost btn-icon btn-sm hide-mobile" href={`/api/consultations/${c.id}/export`} aria-label={t("تصدير الاستشارة ملفًا نصيًا", "Export the consultation as a text file")}><Icon name="export" /></a>
          <a className="btn btn-ghost btn-icon btn-sm hide-mobile" href={`/consult/${c.id}/report`} aria-label={t("تقرير الاستشارة للطباعة", "Printable consultation report")}><Icon name="print" /></a>
          <button className="btn btn-ghost btn-icon btn-sm" aria-pressed={!!shareToken} aria-label={t("مشاركة الاستشارة برابط", "Share the consultation by link")} onClick={() => setShareOpen(true)}><Icon name="share" /></button>
          <button className="btn btn-ghost btn-icon btn-sm" aria-label={t("حذف الاستشارة", "Delete the consultation")} onClick={() => setConfirmDelete(true)}><Icon name="trash" /></button>
        </div>

        <div className="ws-scroll" ref={scrollRef}>
          <div className="ws-thread" aria-live="polite" aria-busy={busy}>
            {agent && (
              <div className="notice notice-accent">
                <Icon name={agent.icon} />
                <div><strong>{agent.name}</strong><p className="t-small">{agent.scope} {agent.tools[0]}</p></div>
              </div>
            )}
            {msgs.length === 0 && !busy && <p className="muted">{t("اكتب رسالتك الأولى في الأسفل لبدء الاستشارة.", "Write your first message below to start the consultation.")}</p>}
            {msgs.map((m) => {
              if (m.role === "user") return <div key={m.id} className="msg"><span className="sr-only">{t("أنت:", "You:")}</span><div className="msg-user" dir="auto">{m.content}</div></div>;
              const mm = models.find((x) => x.id === m.model_id);
              const switched = prevModel !== null && prevModel !== m.model_id;
              prevModel = m.model_id;
              return (
                <div key={m.id} className="msg">
                  {switched && <div className="model-switch" role="note">{t("تغيّر النموذج إلى", "Model changed to")} <bdi>{mm?.name}</bdi></div>}
                  <div className="msg-meta">
                    {mm && <VendorMark vendorKey={mm.vendorKey} small />}
                    <strong style={{ color: "var(--ink)" }}><bdi>{mm?.name ?? t("نموذج غير معروف", "Unknown model")}</bdi></strong>
                    <span className={`badge ${m.engine === "demo" ? "badge-warn" : ""}`}>{m.engine === "demo" ? t("قالب تجريبي — ليس ذكاءً اصطناعيًا", "Demo template — not AI") : t("مولَّد بالذكاء الاصطناعي", "Generated by AI")}</span>
                    {m.status === "stopped" && <span className="badge badge-warn">{t("إجابة غير مكتملة", "Incomplete answer")}</span>}
                  </div>
                  <Markdown text={m.content} />
                  <div className="msg-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => copy(m.content)}><Icon name="copy" size={18} /> {t("نسخ", "Copy")}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setPanel(m)} aria-expanded={panel?.id === m.id}><Icon name="lab" size={18} /> {t("مراجعة نقدية", "Critical review")}</button>
                    {m.id === lastAssistantId && !busy && <button className="btn btn-ghost btn-sm" onClick={() => send(null)}><Icon name="retry" size={18} /> {t("أعد التوليد", "Regenerate")}</button>}
                    <button className="btn btn-ghost btn-icon btn-sm" aria-pressed={m.feedback === 1} aria-label={t("إجابة مفيدة", "Helpful answer")} onClick={() => feedback(m, 1)}><Icon name="up" size={18} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" aria-pressed={m.feedback === -1} aria-label={t("إجابة غير مفيدة", "Unhelpful answer")} onClick={() => feedback(m, -1)}><Icon name="down" size={18} /></button>
                  </div>
                  {reasonFor === m.id && m.feedback === -1 && (
                    <div className="chips" role="group" aria-label={t("ما المشكلة في الإجابة؟", "What was wrong with the answer?")}>
                      <span className="t-caption">{t("ما المشكلة؟", "What was wrong?")}</span>
                      {FEEDBACK_REASONS.map((r) => (
                        <button key={r.id} type="button" className="chip" onClick={async () => {
                          setReasonFor(null);
                          const res = await api(`/api/messages/${m.id}/feedback`, { body: { value: -1, reason: r.id } });
                          toast(res.ok ? t("شكرًا، سُجّل السبب.", "Thanks, the reason was recorded.") : res.data.error ?? t("تعذر الحفظ.", "Could not save."));
                        }}>{r[lang]}</button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {busy && (
              <div className="msg">
                <div className="msg-meta">{model && <VendorMark vendorKey={model.vendorKey} small />}<strong style={{ color: "var(--ink)" }}><bdi>{model?.name}</bdi></strong><span>{t("يكتب الإجابة…", "Writing the answer…")}</span></div>
                {streaming ? <Markdown text={streaming} /> : <span className="typing" aria-label={t("جارٍ التوليد", "Generating")}><i /><i /><i /></span>}
              </div>
            )}
            {/* رسالة الخطأ أدق من التنبيه العام، فلا يُعرضان معًا */}
            {model?.engine === "llm" && !busy && !error && <ModelNotice />}
            {error && (
              <div className="notice notice-danger" role="alert">
                <Icon name="alert" />
                <div className="stack-sm">
                  <span>{error}</span>
                  <div className="row">
                    {msgs[msgs.length - 1]?.role === "user" && <button className="btn btn-secondary btn-sm" onClick={() => send(null)}><Icon name="retry" size={18} /> {t("أعد المحاولة", "Try again")}</button>}
                    <Link className="btn btn-ghost btn-sm" href="/models">{t("حالة النماذج", "Model status")}</Link>
                  </div>
                </div>
              </div>
            )}
            {user && model && user.prefModel !== model.id && msgs.some((m) => m.role === "assistant" && m.status === "complete") && !busy && (
              <div className="row t-small muted">
                <span>{t("أعجبك أداء", "Liked how")} <bdi>{model.name}</bdi>{t("؟", " did?")}</span>
                <button className="btn btn-secondary btn-sm" onClick={async () => {
                  const r = await api<{ user: NonNullable<typeof user> }>("/api/me", { method: "PATCH", body: { prefModel: model.id } });
                  if (r.ok) { setUser(r.data.user); toast(t("أصبح هذا النموذج مفضّلك، وسيُختار تلقائيًا في الاستشارات الجديدة.", "This model is now your favourite and will be chosen automatically in new consultations.")); }
                  else toast(r.data.error ?? t("تعذر الحفظ.", "Could not save."));
                }}><Icon name="star" size={18} /> {t("اجعله نموذجي المفضل", "Make it my favourite model")}</button>
              </div>
            )}
          </div>
        </div>

        <div className="ws-compose">
          <form className="composer" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <label htmlFor="ws-input" className="sr-only">{t("رسالتك", "Your message")}</label>
            <textarea id="ws-input" ref={taRef} rows={1} value={draft} maxLength={12000} placeholder={t("اكتب متابعتك أو سؤالك التالي…", "Write your follow-up or next question…")}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia("(pointer: fine)").matches) { e.preventDefault(); submit(); } }} />
            <div className="composer-bar">
              <span className="t-caption grow">
                {t("تحقق من الإجابات قبل الاعتماد عليها.", "Check answers before relying on them.")}
                {model?.engine === "llm" && left !== null && quota?.limit != null && <> {t(`تبقّى لك اليوم ${left} من ${quota.limit} استدعاء للنماذج الحقيقية.`, `${left} of ${quota.limit} real-model calls left today.`)}</>}
              </span>
              {busy
                ? <button type="button" className="btn btn-secondary btn-sm" onClick={() => abortRef.current?.abort()}><Icon name="stop" size={18} /> {t("أوقف التوليد", "Stop generating")}</button>
                : <button type="submit" className="btn btn-primary btn-sm" disabled={!draft.trim()}><Icon name="send" size={18} /> {t("أرسل", "Send")}</button>}
            </div>
          </form>
        </div>
      </section>

      {panel && wide && (
        <aside className="ws-panel" aria-label={t("المراجعة النقدية", "Critical review")}>
          <div className="dialog-head"><h2>{t("المراجعة النقدية", "Critical review")}</h2>
            <button className="btn btn-ghost btn-icon btn-sm" aria-label={t("إغلاق اللوحة", "Close the panel")} onClick={() => setPanel(null)}><Icon name="close" /></button></div>
          {panelBody}
        </aside>
      )}
      <Dialog open={!!panel && !wide} onClose={() => setPanel(null)} title={t("المراجعة النقدية", "Critical review")} variant="sheet">{panelBody}</Dialog>
      <Dialog open={sideOpen} onClose={() => setSideOpen(false)} title={t("سجل الاستشارات", "Consultation history")} variant="sheet-start">
        <div onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setSideOpen(false); }}><HistoryList items={history} currentId={c.id} /></div>
      </Dialog>
      <Dialog open={shareOpen} onClose={() => setShareOpen(false)} title={t("مشاركة الاستشارة", "Share the consultation")}>
        <div className="dialog-body stack">
          <p className="t-small">{t("الرابط يتيح لأي شخص يملكه قراءة هذه الاستشارة ومراجعاتها دون حساب، ولا يمكنه التعديل عليها. لا يظهر فيه اسمك ولا بريدك، ولا تفهرسه محركات البحث، وتستطيع إيقافه في أي وقت.", "Anyone with the link can read this consultation and its reviews without an account, but cannot change it. It shows neither your name nor your email, search engines do not index it, and you can stop it at any time.")}</p>
          {shareToken && (
            <div className="field">
              <label className="label" htmlFor="share-url">{t("رابط المشاركة", "Share link")}</label>
              <input id="share-url" className="input ltr" readOnly value={`${typeof window === "undefined" ? "" : window.location.origin}/s/${shareToken}`} onFocus={(e) => e.currentTarget.select()} />
            </div>
          )}
          <a className="link t-small" href={`/consult/${c.id}/report`}>{t("فتح التقرير الجاهز للطباعة", "Open the printable report")}</a>
        </div>
        <div className="dialog-foot">
          {shareToken ? (
            <>
              <button className="btn btn-primary" onClick={async () => {
                try { await navigator.clipboard.writeText(`${window.location.origin}/s/${shareToken}`); toast(t("نُسخ الرابط.", "Link copied.")); } catch { toast(t("تعذر النسخ من المتصفح.", "The browser could not copy.")); }
              }}><Icon name="copy" size={18} /> {t("انسخ الرابط", "Copy the link")}</button>
              <button className="btn btn-secondary" disabled={shareBusy} onClick={async () => {
                setShareBusy(true);
                const r = await api(`/api/consultations/${c.id}/share`, { method: "DELETE" });
                setShareBusy(false);
                if (r.ok) { setShareToken(null); toast(t("أُوقفت المشاركة، ولم يعد الرابط يعمل.", "Sharing stopped; the link no longer works.")); } else toast(r.data.error ?? t("تعذر الإيقاف.", "Could not stop sharing."));
              }}>{t("أوقف المشاركة", "Stop sharing")}</button>
            </>
          ) : (
            <button className="btn btn-primary" disabled={shareBusy} onClick={async () => {
              setShareBusy(true);
              const r = await api<{ token: string }>(`/api/consultations/${c.id}/share`, { method: "POST" });
              setShareBusy(false);
              if (r.ok) setShareToken(r.data.token); else toast(r.data.error ?? t("تعذر إنشاء الرابط.", "Could not create the link."));
            }}><Icon name="share" size={18} /> {t("أنشئ رابط المشاركة", "Create the share link")}</button>
          )}
          <button className="btn btn-ghost" onClick={() => setShareOpen(false)}>{t("إغلاق", "Close")}</button>
        </div>
      </Dialog>
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title={t("حذف الاستشارة", "Delete the consultation")}>
        <div className="dialog-body"><p>{t("ستُحذف هذه الاستشارة ورسائلها ومراجعاتها نهائيًا. لا يمكن التراجع.", "This consultation, its messages, and its reviews will be deleted permanently. This cannot be undone.")}</p></div>
        <div className="dialog-foot">
          <button className="btn btn-danger" onClick={async () => {
            const r = await api(`/api/consultations/${c.id}`, { method: "DELETE" });
            if (r.ok) { toast(t("حُذفت الاستشارة.", "Consultation deleted.")); router.push("/consult"); router.refresh(); } else toast(r.data.error ?? t("تعذر الحذف.", "Could not delete."));
          }}>{t("احذف نهائيًا", "Delete permanently")}</button>
          <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>{t("إلغاء", "Cancel")}</button>
        </div>
      </Dialog>
    </div>
  );
}

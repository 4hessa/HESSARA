"use client";
// مساحة الاستشارات: سجل جانبي، محادثة مبثوثة، ولوحة مراجعة نقدية.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { agentById } from "@/lib/catalog/agents";
import type { ConsultRow, MessageRow } from "@/lib/db";
import { AdvisorPicker } from "./AdvisorPicker";
import { api, useApp } from "./app";
import { fmtDate, VendorMark } from "./bits";
import { Dialog } from "./Dialog";
import { Icon } from "./Icon";
import { Markdown } from "./Markdown";
import { pendingKey } from "./QuickConsult";
import { ReviewRunner } from "./Review";

type Msg = Pick<MessageRow, "id" | "role" | "content" | "model_id" | "engine" | "status" | "feedback">;

export function HistoryList({ items, currentId, savedOnly }: { items: ConsultRow[]; currentId?: string; savedOnly?: boolean }) {
  const [q, setQ] = useState("");
  const [list, setList] = useState(items);
  const [saved, setSaved] = useState(!!savedOnly);
  const [loading, setLoading] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; if (!savedOnly) return; }
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await api<{ consultations: ConsultRow[] }>(`/api/consultations?q=${encodeURIComponent(q)}${saved ? "&saved=1" : ""}`, { signal: ctl.signal });
        if (r.ok) setList(r.data.consultations);
      } catch { /* أُلغي */ }
      setLoading(false);
    }, 250);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q, saved, savedOnly]);
  return (
    <>
      <div className="ws-side-head">
        <Link href="/consult/new" className="btn btn-primary btn-sm btn-block"><Icon name="plus" size={18} /> استشارة جديدة</Link>
        <div className="input-wrap">
          <label className="sr-only" htmlFor="hist-q">ابحث في الاستشارات</label>
          <input id="hist-q" className="input" type="search" placeholder="ابحث في العناوين والمحتوى" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="chips">
          <button className="chip" aria-pressed={!saved} onClick={() => setSaved(false)}>الكل</button>
          <button className="chip" aria-pressed={saved} onClick={() => setSaved(true)}><Icon name="bookmark" size={16} /> المحفوظة</button>
        </div>
      </div>
      <nav className="ws-list" aria-label="سجل الاستشارات" aria-busy={loading}>
        {list.length === 0 && <p className="t-small muted" style={{ padding: "var(--s-4)" }}>{q || saved ? "لا نتائج مطابقة." : "لا استشارات بعد. ابدأ أول استشارة."}</p>}
        {list.map((c) => (
          <Link key={c.id} href={`/consult/${c.id}`} className="ws-item" aria-current={c.id === currentId ? "page" : undefined}>
            <span className="ws-item-title">{c.saved ? "★ " : ""}{c.title}</span>
            <span className="t-caption">{fmtDate(c.updated_at)}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

export function Workspace({ consultation: c0, messages: m0, history }: { consultation: ConsultRow; messages: Msg[]; history: ConsultRow[] }) {
  const { models, user, setUser, toast, ensureConsent } = useApp();
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
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const sentPending = useRef(false);

  const model = models.find((m) => m.id === c.model_id);
  const agent = agentById(c.agent_id);
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
        else throw new Error("لم تُمنح الموافقة على الإرسال إلى المزوّد الخارجي. يمكنك اختيار المحرك التجريبي بدلًا من ذلك.");
      }
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error ?? "تعذر إرسال الرسالة.");
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
          else if (ev.t === "done") finished = true;
          else if (ev.t === "error") failed = ev.message;
        }
      }
      if (!finished && !failed) failed = "انقطع الاتصال قبل اكتمال الإجابة.";
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        failed = (e as Error).message || "تعذر الاتصال بالخادم.";
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
  }, [c.id, c.model_id, ensureConsent, model?.engine, router]);

  // الرسالة الأولى القادمة من حقل البدء السريع.
  useEffect(() => {
    if (sentPending.current) return;
    sentPending.current = true;
    try {
      const p = sessionStorage.getItem(pendingKey(c.id));
      if (p) { sessionStorage.removeItem(pendingKey(c.id)); if (m0.length === 0) send(p); }
    } catch { /* لا شيء معلّق */ }
  }, [c.id, m0.length, send]);

  const submit = () => { const t = draft.trim(); if (!t || busy) return; setDraft(""); send(t); };
  const patch = async (body: Record<string, unknown>, okMsg?: string) => {
    const r = await api<{ consultation: ConsultRow }>(`/api/consultations/${c.id}`, { method: "PATCH", body });
    if (r.ok) { setC(r.data.consultation); if (okMsg) toast(okMsg); router.refresh(); }
    else toast(r.data.error ?? "تعذر حفظ التغيير.");
  };
  const feedback = async (m: Msg, value: 1 | -1) => {
    const v = m.feedback === value ? null : value;
    setMsgs((all) => all.map((x) => (x.id === m.id ? { ...x, feedback: v } : x)));
    const r = await api(`/api/messages/${m.id}/feedback`, { body: { value: v } });
    if (!r.ok) toast("تعذر حفظ التقييم.");
  };
  const copy = async (t: string) => {
    try { await navigator.clipboard.writeText(t); toast("نُسخت الإجابة."); } catch { toast("تعذر النسخ من المتصفح."); }
  };
  const lastAssistantId = [...msgs].reverse().find((m) => m.role === "assistant")?.id;
  let prevModel: string | null = null;

  const panelBody = panel && (
    <div className="dialog-body">
      <p className="t-small muted">تُراجَع الإجابة المحددة مراجعة مستقلة عن النموذج الذي كتبها، وفق معايير معلنة.</p>
      <ReviewRunner key={panel.id} text={panel.content} consultationId={c.id} messageId={panel.id} defaultMode={agent?.reviewMode} />
    </div>
  );

  return (
    <div className={`workspace${panel && wide ? " with-panel" : ""}`}>
      <aside className="ws-side" aria-label="سجل الاستشارات"><HistoryList items={history} currentId={c.id} /></aside>

      <section className="ws-main" aria-label="المحادثة">
        <div className="ws-bar">
          <button className="btn btn-ghost btn-icon btn-sm ws-mobile-only" aria-label="سجل الاستشارات" onClick={() => setSideOpen(true)}><Icon name="menu" /></button>
          <h1 className="ws-title grow">{c.title}</h1>
          <span className="row hide-mobile" style={{ flexWrap: "nowrap" }} title={busy ? "يولّد الإجابة" : model?.status === "failed" ? "فشل آخر اتصال" : "جاهز"}>
            <span className={`status-dot${busy ? " busy" : model?.status === "failed" ? " off" : ""}`} />
            <span className="t-caption">{busy ? "يكتب…" : model?.status === "failed" ? "تعذر الاتصال" : "متصل"}</span>
          </span>
          <AdvisorPicker compact lockAgent value={{ modelId: c.model_id, agentId: c.agent_id }}
            onChange={(a) => { if (a.modelId !== c.model_id) patch({ modelId: a.modelId }, "تغيّر النموذج. الإجابات التالية ستأتي من النموذج الجديد."); }} />
          <button className="btn btn-ghost btn-icon btn-sm" aria-pressed={!!c.saved} aria-label={c.saved ? "إزالة من المحفوظات" : "حفظ الاستشارة"}
            onClick={() => patch({ saved: !c.saved }, c.saved ? "أُزيلت من المحفوظات." : "حُفظت الاستشارة في المحفوظات.")}><Icon name="bookmark" /></button>
          <a className="btn btn-ghost btn-icon btn-sm hide-mobile" href={`/api/consultations/${c.id}/export`} aria-label="تصدير الاستشارة ملفًا نصيًا"><Icon name="export" /></a>
          <button className="btn btn-ghost btn-icon btn-sm" aria-label="حذف الاستشارة" onClick={() => setConfirmDelete(true)}><Icon name="trash" /></button>
        </div>

        <div className="ws-scroll" ref={scrollRef}>
          <div className="ws-thread" aria-live="polite" aria-busy={busy}>
            {agent && (
              <div className="notice notice-accent">
                <Icon name={agent.icon} />
                <div><strong>{agent.name}</strong><p className="t-small">{agent.scope} {agent.tools[0]}</p></div>
              </div>
            )}
            {msgs.length === 0 && !busy && <p className="muted">اكتب رسالتك الأولى في الأسفل لبدء الاستشارة.</p>}
            {msgs.map((m) => {
              if (m.role === "user") return <div key={m.id} className="msg"><span className="sr-only">أنت:</span><div className="msg-user" dir="auto">{m.content}</div></div>;
              const mm = models.find((x) => x.id === m.model_id);
              const switched = prevModel !== null && prevModel !== m.model_id;
              prevModel = m.model_id;
              return (
                <div key={m.id} className="msg">
                  {switched && <div className="model-switch" role="note">تغيّر النموذج إلى <bdi>{mm?.name}</bdi></div>}
                  <div className="msg-meta">
                    {mm && <VendorMark vendorKey={mm.vendorKey} small />}
                    <strong style={{ color: "var(--text)" }}><bdi>{mm?.name ?? "نموذج غير معروف"}</bdi></strong>
                    <span className={`badge ${m.engine === "demo" ? "badge-warn" : ""}`}>{m.engine === "demo" ? "قالب تجريبي — ليس ذكاءً اصطناعيًا" : "مولَّد بالذكاء الاصطناعي"}</span>
                    {m.status === "stopped" && <span className="badge badge-warn">إجابة غير مكتملة</span>}
                  </div>
                  <Markdown text={m.content} />
                  <div className="msg-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => copy(m.content)}><Icon name="copy" size={18} /> نسخ</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setPanel(m)} aria-expanded={panel?.id === m.id}><Icon name="lab" size={18} /> مراجعة نقدية</button>
                    {m.id === lastAssistantId && !busy && <button className="btn btn-ghost btn-sm" onClick={() => send(null)}><Icon name="retry" size={18} /> أعد التوليد</button>}
                    <button className="btn btn-ghost btn-icon btn-sm" aria-pressed={m.feedback === 1} aria-label="إجابة مفيدة" onClick={() => feedback(m, 1)}><Icon name="up" size={18} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" aria-pressed={m.feedback === -1} aria-label="إجابة غير مفيدة" onClick={() => feedback(m, -1)}><Icon name="down" size={18} /></button>
                  </div>
                </div>
              );
            })}
            {busy && (
              <div className="msg">
                <div className="msg-meta">{model && <VendorMark vendorKey={model.vendorKey} small />}<strong style={{ color: "var(--text)" }}><bdi>{model?.name}</bdi></strong><span>يكتب الإجابة…</span></div>
                {streaming ? <Markdown text={streaming} /> : <span className="typing" aria-label="جارٍ التوليد"><i /><i /><i /></span>}
              </div>
            )}
            {error && (
              <div className="notice notice-danger" role="alert">
                <Icon name="alert" />
                <div className="stack-sm">
                  <span>{error}</span>
                  <div className="row">
                    {msgs[msgs.length - 1]?.role === "user" && <button className="btn btn-secondary btn-sm" onClick={() => send(null)}><Icon name="retry" size={18} /> أعد المحاولة</button>}
                    <Link className="btn btn-ghost btn-sm" href="/models">حالة النماذج</Link>
                  </div>
                </div>
              </div>
            )}
            {user && model && user.prefModel !== model.id && msgs.some((m) => m.role === "assistant" && m.status === "complete") && !busy && (
              <div className="row t-small muted">
                <span>أعجبك أداء <bdi>{model.name}</bdi>؟</span>
                <button className="btn btn-secondary btn-sm" onClick={async () => {
                  const r = await api<{ user: NonNullable<typeof user> }>("/api/me", { method: "PATCH", body: { prefModel: model.id } });
                  if (r.ok) { setUser(r.data.user); toast("أصبح هذا النموذج مفضّلك، وسيُختار تلقائيًا في الاستشارات الجديدة."); }
                  else toast(r.data.error ?? "تعذر الحفظ.");
                }}><Icon name="star" size={18} /> اجعله نموذجي المفضل</button>
              </div>
            )}
          </div>
        </div>

        <div className="ws-compose">
          <form className="composer" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <label htmlFor="ws-input" className="sr-only">رسالتك</label>
            <textarea id="ws-input" ref={taRef} rows={1} value={draft} maxLength={12000} placeholder="اكتب متابعتك أو سؤالك التالي…"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia("(pointer: fine)").matches) { e.preventDefault(); submit(); } }} />
            <div className="composer-bar">
              <span className="t-caption grow">تحقق من الإجابات قبل الاعتماد عليها.</span>
              {busy
                ? <button type="button" className="btn btn-secondary btn-sm" onClick={() => abortRef.current?.abort()}><Icon name="stop" size={18} /> أوقف التوليد</button>
                : <button type="submit" className="btn btn-primary btn-sm" disabled={!draft.trim()}><Icon name="send" size={18} /> أرسل</button>}
            </div>
          </form>
        </div>
      </section>

      {panel && wide && (
        <aside className="ws-panel" aria-label="المراجعة النقدية">
          <div className="dialog-head"><h2 className="t-h4">المراجعة النقدية</h2>
            <button className="btn btn-ghost btn-icon btn-sm" aria-label="إغلاق اللوحة" onClick={() => setPanel(null)}><Icon name="close" /></button></div>
          {panelBody}
        </aside>
      )}
      <Dialog open={!!panel && !wide} onClose={() => setPanel(null)} title="المراجعة النقدية" variant="sheet">{panelBody}</Dialog>
      <Dialog open={sideOpen} onClose={() => setSideOpen(false)} title="سجل الاستشارات" variant="sheet-start">
        <div onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setSideOpen(false); }}><HistoryList items={history} currentId={c.id} /></div>
      </Dialog>
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="حذف الاستشارة">
        <div className="dialog-body"><p>ستُحذف هذه الاستشارة ورسائلها ومراجعاتها نهائيًا. لا يمكن التراجع.</p></div>
        <div className="dialog-foot">
          <button className="btn btn-danger" onClick={async () => {
            const r = await api(`/api/consultations/${c.id}`, { method: "DELETE" });
            if (r.ok) { toast("حُذفت الاستشارة."); router.push("/consult"); router.refresh(); } else toast(r.data.error ?? "تعذر الحذف.");
          }}>احذف نهائيًا</button>
          <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>إلغاء</button>
        </div>
      </Dialog>
    </div>
  );
}

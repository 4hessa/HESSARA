"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ModelView } from "@/lib/providers";
import { api, useApp } from "./app";
import { fmtDate, StatusBadge, VendorMark } from "./bits";
import { Dialog } from "./Dialog";
import { FavButton } from "./Fav";
import { Icon } from "./Icon";

export function ModelsClient({ favs }: { favs: string[] }) {
  const { models, setModels, user, setUser, toast } = useApp();
  const [vendor, setVendor] = useState("all");
  const [cat, setCat] = useState("all");
  const [avail, setAvail] = useState("all");
  const [task, setTask] = useState("all");
  const [detail, setDetail] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const vendors = useMemo(() => [...new Set(models.map((m) => m.vendor))], [models]);
  const tasks = useMemo(() => [...new Set(models.flatMap((m) => m.tasks))], [models]);
  const list = models.filter((m) =>
    (vendor === "all" || m.vendor === vendor) && (cat === "all" || m.category === cat) && (task === "all" || m.tasks.includes(task)) &&
    (avail === "all" || (avail === "yes" ? m.status !== "not_configured" : m.status === "not_configured")));
  const d = models.find((m) => m.id === detail);

  const setPref = async (m: ModelView) => {
    const r = await api<{ user: NonNullable<typeof user> }>("/api/me", { method: "PATCH", body: { prefModel: m.id } });
    if (r.ok) { setUser(r.data.user); toast(`أصبح ${m.name} نموذجك المفضل.`); } else toast(r.data.error ?? "تعذر الحفظ.");
  };
  const test = async (m: ModelView) => {
    setTesting(m.id);
    const r = await api<{ model: ModelView }>(`/api/models/${m.id}/check`, { method: "POST" });
    setTesting(null);
    if (r.ok) { setModels(models.map((x) => (x.id === m.id ? r.data.model : x))); toast(r.data.model.status === "ready" ? "نجح اختبار الاتصال." : "فشل اختبار الاتصال."); }
    else toast(r.data.error ?? "تعذر الاختبار.");
  };

  return (
    <>
      <div className="toolbar" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {[
          ["المزوّد", vendor, setVendor, [["all", "كل المزوّدين"], ...vendors.map((v) => [v, v])]],
          ["الفئة وطريقة التشغيل", cat, setCat, [["all", "كل الفئات"], ["سحابي", "سحابي"], ["محلي", "محلي على الخادم"], ["تجريبي", "تجريبي"]]],
          ["نوع المهام", task, setTask, [["all", "كل المهام"], ...tasks.map((t) => [t, t])]],
          ["حالة التوفر", avail, setAvail, [["all", "الكل"], ["yes", "المتاح الآن"], ["no", "غير المهيّأ"]]],
        ].map(([label, val, set, opts]) => (
          <div className="field" key={label as string}>
            <label className="label" htmlFor={`f-${label}`}>{label as string}</label>
            <select id={`f-${label}`} className="select" value={val as string} onChange={(e) => (set as (v: string) => void)(e.target.value)}>
              {(opts as string[][]).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </div>
        ))}
      </div>
      <p className="t-small muted" role="status" style={{ marginBottom: "var(--s-4)" }}>{list.length} من {models.length} نموذج</p>
      {list.length === 0 && <div className="empty"><p>لا نماذج تطابق عوامل التصفية.</p></div>}
      <div className="grid-3">
        {list.map((m) => {
          const usable = m.status !== "not_configured";
          return (
            <article key={m.id} className="card" id={m.id}>
              <div className="row-between"><VendorMark vendorKey={m.vendorKey} /><span className="row"><StatusBadge model={m} /><FavButton kind="model" id={m.id} initial={favs.includes(m.id)} label={m.name} /></span></div>
              <div><h2 className="t-h3"><bdi>{m.name}</bdi>{user?.prefModel === m.id && <span className="badge badge-accent" style={{ marginInlineStart: 8 }}>المفضل</span>}</h2>
                <p className="t-caption">المزوّد: <bdi>{m.vendor}</bdi> · {m.category}{m.version ? <> · الإصدار: <code className="ltr">{m.version}</code></> : m.engine === "llm" ? " · الإصدار: غير محدد على الخادم" : ""}</p></div>
              <p className="muted t-small">{m.description}</p>
              <div className="chips">{m.tasks.map((t) => <span key={t} className="badge">{t}</span>)}</div>
              <div className="card-foot">
                {usable ? <Link className="btn btn-primary btn-sm" href={`/consult/new?model=${m.id}`}>استشر هذا النموذج</Link> : <button className="btn btn-primary btn-sm" disabled>غير متاح للمحادثة</button>}
                <button className="btn btn-secondary btn-sm" onClick={() => setDetail(m.id)}>التفاصيل</button>
              </div>
            </article>
          );
        })}
      </div>

      <Dialog open={!!d} onClose={() => setDetail(null)} title={d?.name ?? ""}>
        {d && (
          <>
            <div className="dialog-body">
              <div className="row"><StatusBadge model={d} />{d.checkedAt && <span className="t-caption">آخر اختبار: {fmtDate(d.checkedAt)}</span>}</div>
              <p>{d.description}</p>
              {d.note && <p className="notice"><Icon name="info" /><span>{d.note}</span></p>}
              <dl className="stack-sm t-small">
                <div><dt className="label">المزوّد</dt><dd style={{ margin: 0 }}><bdi>{d.vendor}</bdi></dd></div>
                <div><dt className="label">الإصدار المستخدم</dt><dd style={{ margin: 0 }}>{d.version ? <code className="ltr">{d.version}</code> : d.engine === "demo" ? "لا ينطبق" : "لم يُحدَّد على الخادم — لا تفترض المنصة إصدارًا."}</dd></div>
                <div><dt className="label">المدخلات المدعومة</dt><dd style={{ margin: 0 }}>{d.inputs}</dd></div>
                <div><dt className="label">التكلفة</dt><dd style={{ margin: 0 }}>{d.pricing ?? (d.engine === "demo" ? "بلا تكلفة." : "غير متحقق منها في المنصة؛ راجع صفحة المزوّد الرسمية.")}</dd></div>
                {d.status === "not_configured" && <div><dt className="label">ما ينقص التهيئة</dt><dd style={{ margin: 0 }}>متغيرات بيئة على الخادم: {d.missing.map((x) => <code key={x} className="ltr" style={{ marginInlineEnd: 6 }}>{x}</code>)}</dd></div>}
                {d.checkError && <div><dt className="label">سبب فشل آخر اختبار</dt><dd style={{ margin: 0 }}>{d.checkError}</dd></div>}
              </dl>
              {d.docsUrl && <a className="link" href={d.docsUrl} target="_blank" rel="noopener noreferrer">التوثيق الرسمي للمزوّد <Icon name="external" size={16} /></a>}
              <p className="t-caption">لا تعرض هسّارة تقييمات رقمية للنماذج: لم تُجرَ بعد اختبارات مقارنة موثّقة.</p>
            </div>
            <div className="dialog-foot">
              {d.status !== "not_configured" && user && user.prefModel !== d.id && <button className="btn btn-primary" onClick={() => setPref(d)}><Icon name="star" /> اجعله المفضل</button>}
              {d.engine === "llm" && d.status !== "not_configured" && user && <button className="btn btn-secondary" disabled={testing === d.id} onClick={() => test(d)}>{testing === d.id && <span className="spinner" />}اختبر الاتصال</button>}
              {!user && <Link className="btn btn-secondary" href="/login">سجّل الدخول للاختيار</Link>}
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}

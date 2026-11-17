"use client";
// سجل النماذج الحي: كل نموذج بحالته الفعلية المقروءة من إعدادات الخادم، في صفوف بأسلوب قوائم الموقع المرجعي.
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ModelView } from "@/lib/providers";
import { api, useApp } from "./app";
import { fmtDate, StatusBadge, VendorMark } from "./bits";
import { Dialog } from "./Dialog";
import { FavButton } from "./Fav";
import { Icon } from "./Icon";

export function ModelsClient({ favs }: { favs: string[] }) {
  const { models, setModels, user, setUser, toast, t, lang } = useApp();
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
    if (r.ok) { setUser(r.data.user); toast(t(`أصبح ${m.name} نموذجك المفضل.`, `${m.name} is now your favourite model.`)); } else toast(r.data.error ?? t("تعذر الحفظ.", "Could not save."));
  };
  const test = async (m: ModelView) => {
    setTesting(m.id);
    const r = await api<{ model: ModelView }>(`/api/models/${m.id}/check`, { method: "POST" });
    setTesting(null);
    if (r.ok) { setModels(models.map((x) => (x.id === m.id ? r.data.model : x))); toast(r.data.model.status === "ready" ? t("نجح اختبار الاتصال.", "Connection test passed.") : t("فشل اختبار الاتصال.", "Connection test failed.")); }
    else toast(r.data.error ?? t("تعذر الاختبار.", "Could not run the test."));
  };

  const filters: [string, string, string, (v: string) => void, string[][]][] = [
    ["vendor", t("المزوّد", "Provider"), vendor, setVendor, [["all", t("كل المزوّدين", "All providers")], ...vendors.map((v) => [v, v])]],
    ["cat", t("الفئة وطريقة التشغيل", "Category"), cat, setCat, [["all", t("كل الفئات", "All categories")], [t("سحابي", "Cloud"), t("سحابي", "Cloud")], [t("محلي", "Local"), t("محلي على الخادم", "Local on the server")], [t("تجريبي", "Demo"), t("تجريبي", "Demo")]]],
    ["task", t("نوع المهام", "Task"), task, setTask, [["all", t("كل المهام", "All tasks")], ...tasks.map((x) => [x, x])]],
    ["avail", t("حالة التوفر", "Availability"), avail, setAvail, [["all", t("الكل", "All")], ["yes", t("المتاح الآن", "Available now")], ["no", t("غير المهيّأ", "Not configured")]]],
  ];

  return (
    <>
      <div className="toolbar" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {filters.map(([key, label, val, set, opts]) => (
          <div className="field" key={key}>
            <label className="label" htmlFor={`f-${key}`}>{label}</label>
            <select id={`f-${key}`} className="select" value={val} onChange={(e) => set(e.target.value)}>
              {opts.map(([v, x]) => <option key={v} value={v}>{x}</option>)}
            </select>
          </div>
        ))}
      </div>
      <p className="t-small muted" role="status">{t(`${list.length} من ${models.length} نموذج`, `${list.length} of ${models.length} models`)}</p>
      {list.length === 0 && <div className="empty" style={{ marginTop: "1rem" }}><p>{t("لا نماذج تطابق عوامل التصفية.", "No models match these filters.")}</p></div>}
      <div className="rows">
        {list.map((m) => {
          const usable = m.status !== "not_configured";
          return (
            <article key={m.id} className="entry model-row" id={m.id}>
              <span className="model-row__mark"><VendorMark vendorKey={m.vendorKey} /><span className="entry__k"><bdi>{m.vendor}</bdi></span></span>
              <div className="stack-sm">
                <h3 className="entry__t"><bdi>{m.name}</bdi>{user?.prefModel === m.id && <span className="badge badge-accent" style={{ marginInlineStart: "0.5rem", verticalAlign: "middle" }}>{t("المفضل", "Favourite")}</span>}</h3>
                <p className="t-caption">{m.category}{m.version ? <> · {t("الإصدار:", "Version:")} <code className="ltr">{m.version}</code></> : m.engine === "llm" ? ` · ${t("الإصدار: غير محدد على الخادم", "Version: not set on the server")}` : ""}</p>
                <p className="entry__d">{m.description}</p>
                <div className="chips">{m.tasks.map((x) => <span key={x} className="badge">{x}</span>)}</div>
                <div className="card-foot">
                  {usable ? <Link className="btn btn-sm" href={`/consult/new?model=${m.id}`}>{t("استشر هذا النموذج", "Consult this model")}</Link> : <button className="btn btn-sm" disabled>{t("غير متاح للمحادثة", "Not available for chat")}</button>}
                  <button className="btn btn-secondary btn-sm" onClick={() => setDetail(m.id)}>{t("التفاصيل", "Details")}</button>
                  <FavButton kind="model" id={m.id} initial={favs.includes(m.id)} label={m.name} />
                </div>
              </div>
              <span className="model-row__status"><StatusBadge model={m} lang={lang} /></span>
            </article>
          );
        })}
      </div>

      <Dialog open={!!d} onClose={() => setDetail(null)} title={d?.name ?? ""}>
        {d && (
          <>
            <div className="dialog-body">
              <div className="row"><StatusBadge model={d} lang={lang} />{d.checkedAt && <span className="t-caption">{t("آخر اختبار:", "Last test:")} {fmtDate(d.checkedAt, lang)}</span>}</div>
              <p>{d.description}</p>
              {d.note && <p className="notice"><Icon name="info" /><span>{d.note}</span></p>}
              <dl className="stack-sm t-small">
                <div><dt className="label">{t("المزوّد", "Provider")}</dt><dd style={{ margin: 0 }}><bdi>{d.vendor}</bdi></dd></div>
                {d.route === "gateway" && <div><dt className="label">{t("طريق الاتصال", "Connection")}</dt><dd style={{ margin: 0 }}>{t("بوابة Vercel للذكاء الاصطناعي، وتُحاسَب من رصيد البوابة في حساب Vercel.", "The Vercel AI Gateway, billed to the gateway credit in the Vercel account.")}</dd></div>}
                {d.route === "direct" && <div><dt className="label">{t("طريق الاتصال", "Connection")}</dt><dd style={{ margin: 0 }}>{t("مفتاح المزوّد مباشرة.", "The provider's own key.")}</dd></div>}
                <div><dt className="label">{t("الإصدار المستخدم", "Version in use")}</dt><dd style={{ margin: 0 }}>{d.version ? <code className="ltr">{d.version}</code> : d.engine === "demo" ? t("لا ينطبق", "Not applicable") : t("لم يُحدَّد على الخادم — لا تفترض المنصة إصدارًا.", "Not set on the server; the platform does not assume a version.")}</dd></div>
                <div><dt className="label">{t("المدخلات المدعومة", "Supported input")}</dt><dd style={{ margin: 0 }}>{d.inputs}</dd></div>
                <div><dt className="label">{t("التكلفة", "Cost")}</dt><dd style={{ margin: 0 }}>{d.pricing ?? (d.engine === "demo" ? t("بلا تكلفة.", "Free.") : t("غير متحقق منها في المنصة؛ راجع صفحة المزوّد الرسمية.", "Not verified by the platform; see the provider's official page."))}</dd></div>
                {d.status === "not_configured" && <div><dt className="label">{t("ما ينقص التهيئة", "Missing configuration")}</dt><dd style={{ margin: 0 }}>{t("متغيرات بيئة على الخادم:", "Server environment variables:")} {d.missing.map((x) => <code key={x} className="ltr" style={{ marginInlineEnd: 6 }}>{x}</code>)}</dd></div>}
                {d.checkError && <div><dt className="label">{t("سبب فشل آخر اختبار", "Why the last test failed")}</dt><dd style={{ margin: 0 }}>{d.checkError}</dd></div>}
              </dl>
              {d.docsUrl && <a className="link" href={d.docsUrl} target="_blank" rel="noopener noreferrer">{t("التوثيق الرسمي للمزوّد", "Provider's official documentation")} <Icon name="external" size={16} /></a>}
              <p className="t-caption">{t("لا تعرض هسّارة تقييمات رقمية للنماذج: لم تُجرَ بعد اختبارات مقارنة موثّقة.", "HESSARA shows no numeric model scores: no documented comparison tests have been run yet.")}</p>
            </div>
            <div className="dialog-foot">
              {d.status !== "not_configured" && user && user.prefModel !== d.id && <button className="btn btn-primary" onClick={() => setPref(d)}><Icon name="star" /> {t("اجعله المفضل", "Make it my favourite")}</button>}
              {d.engine === "llm" && d.status !== "not_configured" && user && <button className="btn btn-secondary" disabled={testing === d.id} onClick={() => test(d)}>{testing === d.id && <span className="spinner" />}{t("اختبر الاتصال", "Test connection")}</button>}
              {!user && <Link className="btn btn-secondary" href="/login">{t("سجّل الدخول للاختيار", "Sign in to choose")}</Link>}
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AGENTS } from "@/lib/catalog/agents";
import { api, useApp } from "./app";
import { Avatar, AVATAR_IDS } from "./bits";
import { Dialog } from "./Dialog";
import { Icon } from "./Icon";

export function ProfileClient() {
  const { user, setUser, models, toast } = useApp();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? "");
  const [del, setDel] = useState(false);
  const [pw, setPw] = useState("");
  const [delErr, setDelErr] = useState("");
  if (!user) return null;
  const save = async (body: Record<string, unknown>, msg = "حُفظ التغيير.") => {
    const before = user;
    setUser({ ...user, ...body }); // تحديث متفائل: تستجيب المفاتيح فورًا ثم تُثبَّت أو تُعاد
    const r = await api<{ user: typeof user }>("/api/me", { method: "PATCH", body });
    if (r.ok) { setUser(r.data.user); toast(msg); router.refresh(); } else { setUser(before); toast(r.data.error ?? "تعذر الحفظ."); }
  };
  const usable = models.filter((m) => m.status !== "not_configured");
  const prefUnavailable = user.prefModel && !usable.some((m) => m.id === user.prefModel);

  return (
    <div className="stack-lg" style={{ maxWidth: 720 }}>
      <section className="card" aria-labelledby="p-id">
        <h2 id="p-id" className="t-h3">الهوية</h2>
        <div className="row" style={{ flexWrap: "nowrap", alignItems: "center" }}>
          <Avatar id={user.avatar} large label="صورتك الرمزية الحالية" />
          <div><strong>{user.name}</strong><p className="t-caption ltr">{user.email}</p></div>
        </div>
        <form className="field" onSubmit={(e) => { e.preventDefault(); if (name.trim() && name !== user.name) save({ name }); }}>
          <label className="label" htmlFor="p-name">الاسم</label>
          <div className="row" style={{ flexWrap: "nowrap" }}><input id="p-name" className="input" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <button className="btn btn-secondary" disabled={!name.trim() || name === user.name}>احفظ</button></div>
        </form>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack-sm">
          <legend className="label">الصورة الرمزية (اختيارية)</legend>
          <p className="hint">أنماط ثنائية تجريدية لا ترتبط بأي صفة شخصية.</p>
          <div className="row" role="radiogroup" aria-label="الصورة الرمزية">
            {AVATAR_IDS.map((id, i) => (
              <button key={id} type="button" role="radio" aria-checked={user.avatar === id} aria-label={`النمط ${i + 1}`} onClick={() => save({ avatar: id })}
                style={{ background: "none", border: `2px solid ${user.avatar === id ? "var(--accent-ink)" : "transparent"}`, borderRadius: "50%", padding: 3, cursor: "pointer", lineHeight: 0 }}>
                <span style={{ display: "block", width: 44, height: 44 }}><Avatar id={id} large /></span>
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="card" aria-labelledby="p-pref">
        <h2 id="p-pref" className="t-h3">المستشار المفضل</h2>
        {prefUnavailable && <p className="notice notice-warn"><Icon name="alert" /><span>نموذجك المفضل لم يعد مهيّأً على الخادم. اختر نموذجًا آخر متاحًا.</span></p>}
        <div className="field">
          <label className="label" htmlFor="p-model">النموذج المفضل</label>
          <select id="p-model" className="select" value={user.prefModel ?? ""} onChange={(e) => save({ prefModel: e.target.value || null }, "حُدّث النموذج المفضل.")}>
            <option value="">بدون تفضيل</option>
            {models.map((m) => <option key={m.id} value={m.id} disabled={m.status === "not_configured"}>{m.name}{m.status === "not_configured" ? " — غير مهيّأ" : ""}</option>)}
          </select>
          <span className="hint">يظهر بجانب اسمك في الشريط العلوي ويُختار تلقائيًا في كل استشارة جديدة. لا يغيّر نموذج محادثة جارية. <Link className="link" href="/models">تصفّح النماذج</Link></span>
        </div>
        <div className="field">
          <label className="label" htmlFor="p-agent">الوكيل المفضل</label>
          <select id="p-agent" className="select" value={user.prefAgent ?? ""} onChange={(e) => save({ prefAgent: e.target.value || null }, "حُدّث الوكيل المفضل.")}>
            <option value="">بدون وكيل</option>
            {AGENTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </section>

      <section className="card" aria-labelledby="p-rem">
        <h2 id="p-rem" className="t-h3">تذكير الاستراحة</h2>
        <label className="switch"><span><strong>تذكير راحة العين</strong><br /><span className="hint">رسالة صغيرة بعد مدة من الاستخدام النشط. تذكير تنظيمي وليس توصية طبية.</span></span>
          <input type="checkbox" role="switch" checked={user.reminderEnabled} onChange={(e) => save({ reminderEnabled: e.target.checked })} /></label>
        <div className="field">
          <label className="label" htmlFor="p-min">المدة بين التذكيرات</label>
          <select id="p-min" className="select" disabled={!user.reminderEnabled} value={user.reminderMinutes} onChange={(e) => save({ reminderMinutes: Number(e.target.value) })}>
            <option value={10}>كل ١٠ دقائق (الافتراضي)</option><option value={20}>كل ٢٠ دقيقة</option><option value={30}>كل ٣٠ دقيقة</option><option value={60}>كل ٦٠ دقيقة</option>
          </select>
        </div>
      </section>

      <section className="card" aria-labelledby="p-priv">
        <h2 id="p-priv" className="t-h3">الخصوصية</h2>
        <label className="switch"><span><strong>الإرسال إلى مزوّدي النماذج الخارجيين</strong><br /><span className="hint">عند التعطيل يُطلب إذنك قبل أول إرسال إلى نموذج خارجي.</span></span>
          <input type="checkbox" role="switch" checked={user.externalConsent} onChange={(e) => save({ externalConsent: e.target.checked })} /></label>
        <label className="switch"><span><strong>اقتراح فيديوهات في لوحتي</strong><br /><span className="hint">عرض مختارات من المكتبة في الصفحة الرئيسية.</span></span>
          <input type="checkbox" role="switch" checked={user.personalize} onChange={(e) => save({ personalize: e.target.checked })} /></label>
        <p className="t-small muted">اللغة: العربية (النسخة الحالية بالعربية فقط). المظهر: يُبدَّل من زر الشمس/القمر في الشريط العلوي ويُحفظ في متصفحك.</p>
        <div className="row"><Link className="btn btn-secondary btn-sm" href="/consult?saved=1"><Icon name="bookmark" size={18} /> استشاراتي المحفوظة</Link></div>
      </section>

      <section className="card" aria-labelledby="p-del">
        <h2 id="p-del" className="t-h3">حذف الحساب</h2>
        <p className="t-small muted">يحذف حسابك وكل استشاراتك ومراجعاتك ومفضلاتك من قاعدة بيانات المنصة نهائيًا.</p>
        <div><button className="btn btn-danger btn-sm" onClick={() => setDel(true)}>احذف حسابي وبياناتي</button></div>
      </section>

      <Dialog open={del} onClose={() => setDel(false)} title="تأكيد حذف الحساب">
        <form onSubmit={async (e) => {
          e.preventDefault(); setDelErr("");
          const r = await api("/api/me", { method: "DELETE", body: { password: pw } });
          if (r.ok) { router.push("/"); router.refresh(); } else setDelErr(r.data.error ?? "تعذر الحذف.");
        }}>
          <div className="dialog-body">
            <p>هذا الإجراء نهائي ولا يمكن التراجع عنه. أدخل كلمة المرور للتأكيد.</p>
            <div className="field"><label className="label" htmlFor="del-pw">كلمة المرور</label>
              <input id="del-pw" className="input" type="password" dir="ltr" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} aria-invalid={!!delErr} />
              {delErr && <span className="field-error" role="alert"><Icon name="alert" size={16} /> {delErr}</span>}</div>
          </div>
          <div className="dialog-foot"><button className="btn btn-danger" disabled={!pw}>احذف نهائيًا</button><button type="button" className="btn btn-secondary" onClick={() => setDel(false)}>إلغاء</button></div>
        </form>
      </Dialog>
    </div>
  );
}

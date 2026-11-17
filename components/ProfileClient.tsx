"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { agentsFor } from "@/lib/catalog/agents";
import { api, useApp } from "./app";
import { Avatar, AVATAR_IDS } from "./bits";
import { Dialog } from "./Dialog";
import { Icon } from "./Icon";
import { useSwitchLang } from "./site/Nav";

export function ProfileClient() {
  const { user, setUser, models, toast, t, lang } = useApp();
  const router = useRouter();
  const switchLang = useSwitchLang();
  const [name, setName] = useState(user?.name ?? "");
  const [del, setDel] = useState(false);
  const [pw, setPw] = useState("");
  const [delErr, setDelErr] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light"), []);
  if (!user) return null;
  const save = async (body: Record<string, unknown>, msg = t("حُفظ التغيير.", "Change saved.")) => {
    const before = user;
    setUser({ ...user, ...body }); // تحديث متفائل: تستجيب المفاتيح فورًا ثم تُثبَّت أو تُعاد
    const r = await api<{ user: typeof user }>("/api/me", { method: "PATCH", body });
    if (r.ok) { setUser(r.data.user); toast(msg); router.refresh(); } else { setUser(before); toast(r.data.error ?? t("تعذر الحفظ.", "Could not save.")); }
  };
  const applyTheme = (next: "light" | "dark") => {
    document.documentElement.dataset.theme = next;
    document.cookie = `hs_theme=${next}; path=/; max-age=31536000; samesite=lax`;
    setTheme(next);
  };
  const usable = models.filter((m) => m.status !== "not_configured");
  const prefUnavailable = user.prefModel && !usable.some((m) => m.id === user.prefModel);

  return (
    <div className="stack-lg">
      <section className="card" aria-labelledby="p-id">
        <h2 id="p-id" className="t-h3">{t("الهوية", "Identity")}</h2>
        <div className="row" style={{ flexWrap: "nowrap", alignItems: "center" }}>
          <Avatar id={user.avatar} large label={t("صورتك الرمزية الحالية", "Your current avatar")} />
          <div><strong>{user.name}</strong><p className="t-caption ltr">{user.email}</p></div>
        </div>
        <form className="field" onSubmit={(e) => { e.preventDefault(); if (name.trim() && name !== user.name) save({ name }); }}>
          <label className="label" htmlFor="p-name">{t("الاسم", "Name")}</label>
          <div className="row" style={{ flexWrap: "nowrap" }}><input id="p-name" className="input" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <button className="btn btn-secondary" disabled={!name.trim() || name === user.name}>{t("احفظ", "Save")}</button></div>
        </form>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack-sm">
          <legend className="label">{t("الصورة الرمزية (اختيارية)", "Avatar (optional)")}</legend>
          <p className="hint">{t("أنماط ثنائية تجريدية لا ترتبط بأي صفة شخصية.", "Abstract binary patterns, unrelated to any personal trait.")}</p>
          <div className="row" role="radiogroup" aria-label={t("الصورة الرمزية", "Avatar")}>
            {AVATAR_IDS.map((id, i) => (
              <button key={id} type="button" role="radio" aria-checked={user.avatar === id} aria-label={t(`النمط ${i + 1}`, `Pattern ${i + 1}`)} onClick={() => save({ avatar: id })}
                style={{ background: "none", border: `2px solid ${user.avatar === id ? "var(--ink)" : "transparent"}`, borderRadius: "50%", padding: 3, cursor: "pointer", lineHeight: 0 }}>
                <span style={{ display: "block", width: "2.6rem", height: "2.6rem" }}><Avatar id={id} large /></span>
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="card" aria-labelledby="p-pref">
        <h2 id="p-pref" className="t-h3">{t("المستشار المفضل", "Favourite advisor")}</h2>
        {prefUnavailable && <p className="notice notice-warn"><Icon name="alert" /><span>{t("نموذجك المفضل لم يعد مهيّأً على الخادم. اختر نموذجًا آخر متاحًا.", "Your favourite model is no longer configured on the server. Choose another available model.")}</span></p>}
        <div className="field">
          <label className="label" htmlFor="p-model">{t("النموذج المفضل", "Favourite model")}</label>
          <select id="p-model" className="select" value={user.prefModel ?? ""} onChange={(e) => save({ prefModel: e.target.value || null }, t("حُدّث النموذج المفضل.", "Favourite model updated."))}>
            <option value="">{t("بدون تفضيل", "No preference")}</option>
            {models.map((m) => <option key={m.id} value={m.id} disabled={m.status === "not_configured"}>{m.name}{m.status === "not_configured" ? t(" — غير مهيّأ", " — not configured") : ""}</option>)}
          </select>
          <span className="hint">{t("يظهر بجانب اسمك في الشريط العلوي ويُختار تلقائيًا في كل استشارة جديدة. لا يغيّر نموذج محادثة جارية.", "It appears next to your name in the top bar and is chosen automatically in every new consultation. It does not change the model of a conversation in progress.")} <Link className="link" href="/models">{t("تصفّح النماذج", "Browse models")}</Link></span>
        </div>
        <div className="field">
          <label className="label" htmlFor="p-agent">{t("الوكيل المفضل", "Favourite agent")}</label>
          <select id="p-agent" className="select" value={user.prefAgent ?? ""} onChange={(e) => save({ prefAgent: e.target.value || null }, t("حُدّث الوكيل المفضل.", "Favourite agent updated."))}>
            <option value="">{t("بدون وكيل", "No agent")}</option>
            {agentsFor(lang).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </section>

      <section className="card" aria-labelledby="p-look">
        <h2 id="p-look" className="t-h3">{t("اللغة والمظهر", "Language and appearance")}</h2>
        <div className="field">
          <label className="label" htmlFor="p-lang">{t("لغة الواجهة", "Interface language")}</label>
          <select id="p-lang" className="select" value={lang} onChange={(e) => switchLang(e.target.value === "en" ? "en" : "ar")}>
            <option value="ar" lang="ar">العربية</option>
            <option value="en" lang="en">English</option>
          </select>
          <span className="hint">{t("تُحفظ في متصفحك. تجيب النماذج بلغة الواجهة ما لم تكتب لها بلغة أخرى.", "Saved in your browser. Models answer in the interface language unless you write to them in another.")}</span>
        </div>
        <label className="switch"><span><strong>{t("المظهر الداكن", "Dark mode")}</strong><br /><span className="hint">{t("المظهر الفاتح هو الافتراضي كما في هوية الموقع. يُحفظ اختيارك في متصفحك.", "Light is the default, as in the site's identity. Your choice is saved in your browser.")}</span></span>
          <input type="checkbox" role="switch" checked={theme === "dark"} onChange={(e) => applyTheme(e.target.checked ? "dark" : "light")} /></label>
      </section>

      <section className="card" aria-labelledby="p-rem">
        <h2 id="p-rem" className="t-h3">{t("تذكير الاستراحة", "Break reminder")}</h2>
        <label className="switch"><span><strong>{t("تذكير راحة العين", "Eye-rest reminder")}</strong><br /><span className="hint">{t("رسالة صغيرة بعد مدة من الاستخدام النشط. تذكير تنظيمي وليس توصية طبية.", "A small message after a period of active use. An organisational reminder, not medical advice.")}</span></span>
          <input type="checkbox" role="switch" checked={user.reminderEnabled} onChange={(e) => save({ reminderEnabled: e.target.checked })} /></label>
        <div className="field">
          <label className="label" htmlFor="p-min">{t("المدة بين التذكيرات", "Time between reminders")}</label>
          <select id="p-min" className="select" disabled={!user.reminderEnabled} value={user.reminderMinutes} onChange={(e) => save({ reminderMinutes: Number(e.target.value) })}>
            <option value={10}>{t("كل ١٠ دقائق (الافتراضي)", "Every 10 minutes (default)")}</option><option value={20}>{t("كل ٢٠ دقيقة", "Every 20 minutes")}</option><option value={30}>{t("كل ٣٠ دقيقة", "Every 30 minutes")}</option><option value={60}>{t("كل ٦٠ دقيقة", "Every 60 minutes")}</option>
          </select>
        </div>
      </section>

      <section className="card" aria-labelledby="p-priv">
        <h2 id="p-priv" className="t-h3">{t("الخصوصية", "Privacy")}</h2>
        <label className="switch"><span><strong>{t("الإرسال إلى مزوّدي النماذج الخارجيين", "Sending to external model providers")}</strong><br /><span className="hint">{t("عند التعطيل يُطلب إذنك قبل أول إرسال إلى نموذج خارجي.", "When off, your permission is requested before the first message to an external model.")}</span></span>
          <input type="checkbox" role="switch" checked={user.externalConsent} onChange={(e) => save({ externalConsent: e.target.checked })} /></label>
        <label className="switch"><span><strong>{t("اقتراح فيديوهات في لوحتي", "Suggest videos on my dashboard")}</strong><br /><span className="hint">{t("عرض مختارات من المكتبة في الصفحة الرئيسية.", "Show a selection from the library on your dashboard.")}</span></span>
          <input type="checkbox" role="switch" checked={user.personalize} onChange={(e) => save({ personalize: e.target.checked })} /></label>
        <div className="row"><Link className="btn btn-secondary btn-sm" href="/consult?saved=1"><Icon name="bookmark" size={18} /> {t("استشاراتي المحفوظة", "My saved consultations")}</Link></div>
      </section>

      <section className="card" aria-labelledby="p-del">
        <h2 id="p-del" className="t-h3">{t("حذف الحساب", "Delete account")}</h2>
        <p className="t-small muted">{t("يحذف حسابك وكل استشاراتك ومراجعاتك ومفضلاتك من قاعدة بيانات المنصة نهائيًا.", "Permanently deletes your account and all your consultations, reviews, and favourites from the platform's database.")}</p>
        <div><button className="btn btn-danger btn-sm" onClick={() => setDel(true)}>{t("احذف حسابي وبياناتي", "Delete my account and data")}</button></div>
      </section>

      <Dialog open={del} onClose={() => setDel(false)} title={t("تأكيد حذف الحساب", "Confirm account deletion")}>
        <form onSubmit={async (e) => {
          e.preventDefault(); setDelErr("");
          const r = await api("/api/me", { method: "DELETE", body: { password: pw } });
          if (r.ok) { router.push("/"); router.refresh(); } else setDelErr(r.data.error ?? t("تعذر الحذف.", "Could not delete."));
        }}>
          <div className="dialog-body">
            <p>{t("هذا الإجراء نهائي ولا يمكن التراجع عنه. أدخل كلمة المرور للتأكيد.", "This action is final and cannot be undone. Enter your password to confirm.")}</p>
            <div className="field"><label className="label" htmlFor="del-pw">{t("كلمة المرور", "Password")}</label>
              <input id="del-pw" className="input" type="password" dir="ltr" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} aria-invalid={!!delErr} />
              {delErr && <span className="field-error" role="alert"><Icon name="alert" size={16} /> {delErr}</span>}</div>
          </div>
          <div className="dialog-foot"><button className="btn btn-danger" disabled={!pw}>{t("احذف نهائيًا", "Delete permanently")}</button><button type="button" className="btn btn-secondary" onClick={() => setDel(false)}>{t("إلغاء", "Cancel")}</button></div>
        </form>
      </Dialog>
    </div>
  );
}

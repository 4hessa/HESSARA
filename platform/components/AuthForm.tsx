"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "./app";
import { Icon } from "./Icon";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const router = useRouter();
  const signup = mode === "signup";
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errs, setErrs] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");
    const name = String(f.get("name") || "").trim();
    const v: Record<string, string> = {};
    if (signup && !name) v.name = "اكتب اسمك.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) v.email = "اكتب بريدًا إلكترونيًا صحيحًا، مثل name@example.com";
    if (signup ? password.length < 8 : !password) v.password = signup ? "كلمة المرور يجب ألا تقل عن ٨ أحرف." : "اكتب كلمة المرور.";
    if (signup && !f.get("accept")) v.accept = "يلزم قبول الشروط وسياسة الخصوصية للمتابعة.";
    setErrs(v); setError("");
    if (Object.keys(v).length) { (e.currentTarget.querySelector("[aria-invalid=true]") as HTMLElement | null)?.focus(); return; }
    setBusy(true);
    const r = await api(`/api/auth/${mode}`, { body: { email, password, name, accept: !!f.get("accept") } });
    if (!r.ok) { setBusy(false); setError(r.data.error ?? "تعذر إتمام الطلب."); return; }
    router.push(next); router.refresh();
  }
  const q = next !== "/home" ? `?next=${encodeURIComponent(next)}` : "";
  const err = (k: string) => errs[k] && <span id={`${k}-err`} className="field-error"><Icon name="alert" size={16} /> {errs[k]}</span>;

  return (
    <form className="stack" onSubmit={onSubmit} noValidate>
      {error && <div className="notice notice-danger" role="alert"><Icon name="alert" /><span>{error}</span></div>}
      {signup && (
        <div className="field">
          <label className="label" htmlFor="name">الاسم</label>
          <input className="input" id="name" name="name" autoComplete="name" maxLength={60} aria-invalid={!!errs.name} aria-describedby={errs.name ? "name-err" : undefined} />
          {err("name")}
        </div>
      )}
      <div className="field">
        <label className="label" htmlFor="email">البريد الإلكتروني</label>
        <input className="input" id="email" name="email" type="email" dir="ltr" autoComplete="email" inputMode="email" placeholder="name@example.com" aria-invalid={!!errs.email} aria-describedby={errs.email ? "email-err" : undefined} />
        {err("email")}
      </div>
      <div className="field">
        <div className="row-between"><label className="label" htmlFor="password">كلمة المرور</label>
          {!signup && <Link href="/help#password" className="link t-small">نسيت كلمة المرور؟</Link>}</div>
        <div className="input-wrap">
          <input className="input" id="password" name="password" type={show ? "text" : "password"} dir="ltr" autoComplete={signup ? "new-password" : "current-password"} aria-invalid={!!errs.password} aria-describedby={errs.password ? "password-err" : signup ? "password-hint" : undefined} />
          <button type="button" className="btn btn-ghost btn-icon" aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} aria-pressed={show} onClick={() => setShow((s) => !s)}><Icon name={show ? "eyeOff" : "eye"} /></button>
        </div>
        {signup && !errs.password && <span id="password-hint" className="hint">٨ أحرف على الأقل.</span>}
        {err("password")}
      </div>
      {signup && (
        <div className="field">
          <label className="check"><input type="checkbox" name="accept" aria-invalid={!!errs.accept} aria-describedby={errs.accept ? "accept-err" : undefined} />
            <span className="t-small">أوافق على <Link className="link" href="/terms" target="_blank">شروط الاستخدام</Link> و<Link className="link" href="/privacy" target="_blank">سياسة الخصوصية</Link>، وأعلم أن الإجابات قد تكون مولَّدة بالذكاء الاصطناعي.</span></label>
          {err("accept")}
        </div>
      )}
      <button className="btn btn-primary btn-block" disabled={busy}>{busy && <span className="spinner" />}{signup ? "أنشئ الحساب" : "سجّل الدخول"}</button>
      <p className="t-small muted" style={{ textAlign: "center" }}>
        {signup ? <>لديك حساب؟ <Link className="link" href={`/login${q}`}>سجّل الدخول</Link></> : <>ليس لديك حساب؟ <Link className="link" href={`/login${q ? q + "&" : "?"}mode=signup`}>أنشئ حسابًا جديدًا</Link></>}
      </p>
    </form>
  );
}

"use client";
// نموذج «تواصل معنا» داخل الموقع: لمن لا يملك برنامج بريد مهيّأ على جهازه. تُحفظ الرسالة في قاعدة
// البيانات ويقرؤها صاحب المشروع في /admin/messages، ثم يرد على البريد المكتوب هنا.
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CONTACT } from "@/lib/contact-rules";
import { useApp } from "../app";
import { Icon } from "../Icon";

export function ContactForm() {
  const { t } = useApp();
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(j?.error ?? t("تعذر إرسال الرسالة. حاول مرة أخرى.", "The message could not be sent. Try again."));
        setState("idle");
        return;
      }
      form.reset();
      setState("sent");
    } catch {
      setError(t("تعذر الاتصال بالخادم. تحقق من اتصالك وحاول مرة أخرى.", "Could not reach the server. Check your connection and try again."));
      setState("idle");
    }
  }

  if (state === "sent")
    return (
      <div className="stack-sm">
        <div className="notice notice-ok" role="status">
          <Icon name="check" />
          <span>{t("وصلت رسالتك. سيصلك الرد على البريد الذي كتبته.", "Your message has arrived. The reply will come to the email you gave.")}</span>
        </div>
        <div><button type="button" className="btn btn--ghost" onClick={() => setState("idle")}>{t("أرسل رسالة أخرى", "Send another message")}</button></div>
      </div>
    );

  return (
    <form className="contact-form stack" onSubmit={submit} aria-labelledby="message-title">
      {error && <div className="notice notice-danger" role="alert"><Icon name="alert" /><span>{error}</span></div>}
      <div className="field">
        <label className="label" htmlFor="c-name">{t("الاسم (اختياري)", "Name (optional)")}</label>
        <input className="input" id="c-name" name="name" autoComplete="name" maxLength={CONTACT.name} />
      </div>
      <div className="field">
        <label className="label" htmlFor="c-email">{t("بريدك الإلكتروني، ليصلك الرد", "Your email, for the reply")}</label>
        <input className="input" id="c-email" name="email" type="email" dir="ltr" inputMode="email" autoComplete="email" required maxLength={CONTACT.email} placeholder="name@example.com" />
      </div>
      <div className="field">
        <label className="label" htmlFor="c-body">{t("رسالتك", "Your message")}</label>
        <textarea className="textarea" id="c-body" name="body" dir="auto" required minLength={CONTACT.minBody} maxLength={CONTACT.body} rows={6} aria-describedby="c-body-hint" />
        <span id="c-body-hint" className="hint">{t(`من ${CONTACT.minBody} أحرف إلى ${CONTACT.body} حرف.`, `Between ${CONTACT.minBody} and ${CONTACT.body} characters.`)}</span>
      </div>
      {/* حقل للبرامج الآلية فقط: مخفي عن الزائر وعن قارئ الشاشة ولوحة المفاتيح. */}
      <div hidden>
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="hint">
        {t("يُستخدم بريدك للرد عليك فقط. يقرأ الرسالة صاحب المشروع وحده، وتُحذف بعد سنة. التفاصيل في ", "Your email is used only to reply to you. Only the project owner reads the message, and it is deleted after a year. Details are in the ")}
        <Link className="link" href="/privacy">{t("سياسة الخصوصية", "Privacy Policy")}</Link>.
      </p>
      <div>
        <button type="submit" className="btn" disabled={state === "sending"}>
          {state === "sending" ? t("يُرسَل…", "Sending…") : t("أرسل الرسالة", "Send message")}
        </button>
      </div>
    </form>
  );
}

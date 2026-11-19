"use client";
// بريد التواصل خلف زر: لا يظهر العنوان نصًّا في الصفحة، ولا يوجد كاملًا في شيفرتها ولا في هذا الملف.
// يُركَّب عند الضغط فقط، فيفتح برنامج البريد لدى الزائر برسالة جديدة موضوعها جاهز. هذا يصدّ أدوات جمع
// العناوين الآلية، لا من يضغط الزر فعلًا: برنامج البريد يعرض له العنوان حين يكتب رسالته.
import { mailHref } from "@/lib/mail";
import { useApp } from "../app";

function openMail(subject: string) {
  window.location.href = mailHref(subject);
}

export function Envelope() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </svg>
  );
}

/** «icon» دائرة صغيرة في التذييل بجوار حساب X، و«button» زر بنص في صفحة التواصل (ثانوي الشكل مع ghost). */
export function MailButton({ variant = "icon", ghost = false }: { variant?: "icon" | "button"; ghost?: boolean }) {
  const { t } = useApp();
  const subject = t("رسالة من موقع هسّارة", "Message from the HESSARA website");
  const label = t("راسلنا بالبريد الإلكتروني (يفتح برنامج البريد لديك)", "Email us (opens your email app)");
  if (variant === "button") {
    return (
      <button type="button" className={`btn${ghost ? " btn--ghost" : ""} btn-mail`} onClick={() => openMail(subject)} aria-label={label}>
        <Envelope /> {t("راسلنا", "Email us")}
      </button>
    );
  }
  return (
    <button type="button" className="footer__icon" onClick={() => openMail(subject)} aria-label={label} title={t("راسلنا", "Email us")}>
      <Envelope />
    </button>
  );
}

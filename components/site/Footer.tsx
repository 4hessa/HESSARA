"use client";
// تذييل الموقع: كتلة العلامة (الاسم، والتعريف، وسطر الهوية الأكاديمية، وأيقونتا البريد وحساب X) بجوار أعمدة
// الروابط الأربعة، ثم سطر الحقوق ومبدّلا اللغة والمظهر، ثم تنبيه قصير. التفاصيل الكاملة للهوية في «من نحن» وحدها.
// لا تُضاف أيقونة تواصل إلا لحساب فعلي، والبريد لا يظهر نصًّا (انظر Mail.tsx).
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "../app";
import { MailButton } from "./Mail";
import { LangToggle } from "./Nav";

type Col = { title: [string, string]; links: [string, string, string][] };
const COLS: Col[] = [
  { title: ["المنصة", "Platform"], links: [["الوكلاء", "Agents", "/agents"], ["النماذج", "Models", "/models"], ["مختبر النقد", "Critique Lab", "/lab"], ["ميديا هسّارة", "Media", "/media"]] },
  { title: ["الموارد", "Resources"], links: [["رؤى", "Insights", "/insights"], ["المكتبة", "Library", "/resources"], ["البدء", "Getting Started", "/resources/getting-started"], ["قراءات مختارة", "Selected Reading", "/resources/ai-labs-reading-list"], ["مصادر عربية", "Arabic Sources", "/resources/arabic-ai-sources"], ["كيف بُنيت هسّارة", "How HESSARA Is Built", "/resources/how-hessara-is-built"], ["الأمان", "Security", "/resources/security"]] },
  { title: ["عن هسّارة", "Company"], links: [["من نحن", "About Us", "/about"], ["تواصل معنا", "Contact Us", "/contact"], ["المساعدة", "Help", "/help"]] },
  { title: ["السياسات", "Policies"], links: [["شروط الاستخدام", "Terms & Usability", "/terms"], ["سياسة الخصوصية", "Privacy Policy", "/privacy"]] },
];

// حساب المشروع على منصة X. الشعار بشكله الرسمي (مملوء) لا بخط الأيقونات، وبلون النص.
const X_URL = "https://x.com/4hessa";

function XLink() {
  const { t } = useApp();
  return (
    <a className="footer__icon" href={X_URL} target="_blank" rel="noopener noreferrer" title="@4hessa"
      aria-label={t("حساب ‎@4hessa على منصة X (يفتح في تبويب جديد)", "@4hessa on X (opens in a new tab)")}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
      </svg>
    </a>
  );
}

function ThemeToggle() {
  const { t } = useApp();
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.dataset.theme === "dark"), []);
  const flip = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.cookie = `hs_theme=${next}; path=/; max-age=31536000; samesite=lax`;
    setDark(!dark);
  };
  return (
    <button type="button" className="theme-btn" onClick={flip} aria-pressed={dark}>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><circle cx="8" cy="8" r="6" /><path d="M8 2a6 6 0 000 12z" fill="currentColor" /></svg>
      {t("المظهر الداكن", "Dark mode")}
    </button>
  );
}

export function Footer() {
  const { lang, t } = useApp();
  const i = lang === "ar" ? 0 : 1;
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <p className="footer__logo" lang="en">HESSARA</p>
          <p className="footer__tagline">{t("الاستشارات التقنية والمعرفة بالذكاء الاصطناعي", "AI-Powered Technical Consulting & Knowledge")}</p>
          <p className="footer__about">
            {t("مشروع تخرج أكاديمي للمهندسة حصة أحمد الزهراني، في كلية الذكاء الاصطناعي بجامعة ", "An academic graduation project by Eng. Hessa Ahmed Alzahrani, College of Artificial Intelligence, ")}
            <bdi>Smart University of Technical Sciences</bdi>
            {t("، العام الأكاديمي 2027. ", ", academic year 2027. ")}
            <Link href="/about">{t("عن المشروع", "About the project")}</Link>
          </p>
          <div className="footer__social"><MailButton /><XLink /></div>
        </div>
        <div className="footer__cols">
          {COLS.map((c) => (
            <div key={c.title[1]}>
              <h2 className="footer__title">{c.title[i]}</h2>
              <ul>{c.links.map((l) => <li key={l[2]}><Link href={l[2]}>{l[i]}</Link></li>)}</ul>
            </div>
          ))}
        </div>
      </div>
      <div className="footer__base">
        <p>© <span suppressHydrationWarning>{new Date().getFullYear()}</span> <span lang="en">HESSARA</span> · {t("المهندسة حصة أحمد الزهراني. جميع الحقوق محفوظة.", "Eng. Hessa Ahmed Alzahrani. All rights reserved.")}</p>
        <div><LangToggle /><ThemeToggle /></div>
      </div>
      <p className="footer__note">
        {t("منصة أكاديمية تجريبية؛ قد يحتاج المحتوى المولَّد بالذكاء الاصطناعي إلى تحقق مستقل. أسماء النماذج ملك لأصحابها، وذكرها لا يعني شراكة أو اعتمادًا.",
          "Experimental academic platform; AI-generated content may need independent verification. Model names belong to their owners, and mentioning them implies no partnership or endorsement.")}
      </p>
    </footer>
  );
}

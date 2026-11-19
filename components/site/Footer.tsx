"use client";
// تذييل الموقع المرجعي: أربعة أعمدة داخل العمود الأوسط، ثم هوية المشروع (المالك والجامعة والكلية والعام)،
// ثم سطر الحقوق وحساب المشروع على منصة X ومبدّلي اللغة والمظهر، ثم تنبيه المنصة التجريبية والانتماء الأكاديمي.
// لا تُضاف أيقونة تواصل إلا لحساب فعلي.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "../app";
import { LangToggle } from "./Nav";

type Col = { title: [string, string]; links: [string, string, string][] };
const COLS: Col[] = [
  { title: ["المنصة", "Platform"], links: [["المنصة", "Platform", "/platform"], ["النماذج اللغوية", "Language Models", "/models"], ["الاستشارات الذكية", "AI Consulting", "/consulting"], ["مختبر النقد", "Critique Lab", "/lab"]] },
  { title: ["الموارد", "Resources"], links: [["رؤى", "Insights", "/insights"], ["المكتبة", "Library", "/resources"], ["البدء", "Getting Started", "/resources/getting-started"], ["الأمان", "Security", "/resources/security"], ["مكتبة الفيديو", "Video Library", "/media"]] },
  { title: ["عن هسّارة", "Company"], links: [["من نحن", "About Us", "/about"], ["تواصل معنا", "Contact Us", "/contact"], ["المساعدة", "Help", "/help"]] },
  { title: ["السياسات", "Policies"], links: [["شروط الاستخدام", "Terms & Usability", "/terms"], ["سياسة الخصوصية", "Privacy Policy", "/privacy"]] },
];

// هوية المشروع كما اعتمدها صاحبه (١٩ نوفمبر ٢٠٢٦): [العنوان بالعربية، بالإنجليزية، القيمة أو [عربي، إنجليزي]].
// اسم الجامعة يبقى بصيغته الرسمية الإنجليزية في اللغتين إلى أن يُعتمد اسم عربي رسمي.
const IDENTITY: [string, string, string | [string, string]][] = [
  ["التأسيس والملكية والتطوير", "Founded, owned & developed by", ["م. حصة أحمد الزهراني", "Eng. Hessa Ahmed Alzahrani"]],
  ["الجامعة", "Academic institution", "Smart University of Technical Sciences"],
  ["الكلية", "College", ["كلية الذكاء الاصطناعي", "College of Artificial Intelligence"]],
  ["العام الأكاديمي", "Academic year", "2027"],
];

// حساب المشروع على منصة X. الشعار بشكله الرسمي (مملوء) لا بخط الأيقونات، وبلون النص.
const X_URL = "https://x.com/4hessa";

function XLink() {
  const { t } = useApp();
  return (
    <a className="footer__x" href={X_URL} target="_blank" rel="noopener noreferrer" title="@4hessa"
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
      <div className="footer__cols">
        {COLS.map((c) => (
          <div key={c.title[1]}>
            <h2 className="footer__title">{c.title[i]}</h2>
            <ul>{c.links.map((l) => <li key={l[2]}><Link href={l[2]}>{l[i]}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="footer__identity">
        <p className="footer__brand"><span lang="en">HESSARA</span> · {t("الاستشارات التقنية والمعرفة بالذكاء الاصطناعي", "AI-Powered Technical Consulting & Knowledge")}</p>
        <p>{t("مشروع تخرج أكاديمي يركّز على الاستشارة التقنية الذكية، والوكلاء المتخصصين، وربط الاستشارة بالمعرفة العلمية.",
          "An academic graduation project focused on intelligent technical consultation, specialised AI agents, and scientific knowledge integration.")}</p>
        <dl className="footer__facts">
          {IDENTITY.map(([ar, en, value]) => (
            <div key={en}><dt>{i === 0 ? ar : en}</dt><dd>{typeof value === "string" ? value : value[i]}</dd></div>
          ))}
        </dl>
      </div>
      <div className="footer__base">
        <div><span>© <span suppressHydrationWarning>{new Date().getFullYear()}</span> <span lang="en">HESSARA</span> · {t("م. حصة أحمد الزهراني. جميع الحقوق محفوظة.", "Eng. Hessa Ahmed Alzahrani. All rights reserved.")}</span><XLink /></div>
        <div><LangToggle /><ThemeToggle /></div>
      </div>
      <p className="footer__note">
        {t("منصة أكاديمية تجريبية: قد يحتاج المحتوى المولَّد بالذكاء الاصطناعي إلى تحقق مستقل قبل الاعتماد عليه. الانتماء الأكاديمي يبيّن المكان الذي طُوّر فيه المشروع، ولا يعني أن الجامعة تملك المنصة أو تعتمدها رسميًا أو تشغّلها. أسماء النماذج ملك لأصحابها، وذكرها لا يعني شراكة أو اعتمادًا رسميًا.",
          "Experimental academic platform: AI-generated content may need independent verification before you rely on it. The academic affiliation identifies where the project was developed; it does not imply that the university owns, officially endorses or operates the platform. Model names belong to their owners, and mentioning them implies no partnership or endorsement.")}
      </p>
    </footer>
  );
}

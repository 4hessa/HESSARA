"use client";
// شريط التنقل العائم من الموقع المرجعي. للزائر: أقسام الموقع التعريفية. للمستخدم المسجَّل: أقسام المنصة
// الخمسة وقائمة الحساب. على الهاتف تُجمع الروابط في قائمة منسدلة كما في المرجع.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { dirOf, LANG_COOKIE, other, type Lang } from "@/lib/i18n";
import { api, useApp } from "../app";
import { Avatar, VendorMark } from "../bits";
import { Icon } from "../Icon";

type Item = { href: string; ar: string; en: string };

export const SITE_LINKS: Item[] = [
  { href: "/platform", ar: "المنصة", en: "Platform" },
  { href: "/models", ar: "النماذج اللغوية", en: "Language Models" },
  { href: "/consulting", ar: "الاستشارات الذكية", en: "AI Consulting" },
  { href: "/insights", ar: "رؤى", en: "Insights" },
  { href: "/resources", ar: "الموارد", en: "Resources" },
];
export const APP_LINKS: Item[] = [
  { href: "/consult", ar: "الاستشارات", en: "Consultations" },
  { href: "/models", ar: "النماذج", en: "Models" },
  { href: "/agents", ar: "الوكلاء", en: "Agents" },
  { href: "/lab", ar: "مختبر النقد", en: "Critique Lab" },
  { href: "/media", ar: "ميديا هسّارة", en: "Media" },
];

export function useSwitchLang() {
  const router = useRouter();
  return (next: Lang) => {
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    document.documentElement.dir = dirOf(next);
    router.refresh();
  };
}

export function LangToggle({ className = "lang" }: { className?: string }) {
  const { lang } = useApp();
  const switchTo = useSwitchLang();
  const next = other(lang);
  return (
    <button type="button" className={className} lang={next} onClick={() => switchTo(next)}
      aria-label={next === "en" ? "Switch to English" : "التبديل إلى العربية"}>
      {next === "en" ? "EN" : "عربي"}
    </button>
  );
}

function AccountMenu() {
  const { user, models, t } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);
  if (!user) return null;
  const pref = models.find((m) => m.id === user.prefModel);
  return (
    <div ref={ref} className="account">
      <button className="account__btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        aria-label={t(`حساب ${user.name}${pref ? `، النموذج المفضل ${pref.name}` : ""}`, `${user.name}'s account${pref ? `, favourite model ${pref.name}` : ""}`)}>
        <Avatar id={user.avatar} />
        <span className="account__name">{user.name}</span>
        {pref && (
          <span className="account__model" title={t("النموذج المفضل", "Favourite model")}>
            <VendorMark vendorKey={pref.vendorKey} small />
            <bdi>{pref.name}</bdi>
          </span>
        )}
      </button>
      {open && (
        <div className="dropdown" role="menu">
          <div className="dropdown__head">
            <strong>{user.name}</strong>
            <span className="t-caption ltr" style={{ justifySelf: "start" }}>{user.email}</span>
            <span className="t-caption">{t("النموذج المفضل:", "Favourite model:")} {pref ? <bdi>{pref.name}</bdi> : t("لم يُحدَّد", "not set")}</span>
          </div>
          <Link role="menuitem" href="/home"><Icon name="panel" /> {t("لوحتي", "Dashboard")}</Link>
          <Link role="menuitem" href="/consult"><Icon name="history" /> {t("سجل الاستشارات", "Consultation history")}</Link>
          <Link role="menuitem" href="/consult?saved=1"><Icon name="bookmark" /> {t("المحفوظات", "Saved")}</Link>
          <Link role="menuitem" href="/profile"><Icon name="settings" /> {t("الملف الشخصي والإعدادات", "Profile & settings")}</Link>
          <Link role="menuitem" href="/help"><Icon name="help" /> {t("المساعدة", "Help")}</Link>
          <button role="menuitem" onClick={async () => { await api("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }}>
            <Icon name="logout" /> {t("تسجيل الخروج", "Sign out")}
          </button>
        </div>
      )}
    </div>
  );
}

export function Nav() {
  const { user, lang, t } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const menu = useRef<HTMLDetailsElement>(null);
  const switchTo = useSwitchLang();
  useEffect(() => { if (menu.current) menu.current.open = false; }, [pathname]);
  useEffect(() => {
    const close = (e: MouseEvent | KeyboardEvent) => {
      const d = menu.current;
      if (!d?.open) return;
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !d.contains(e.target as Node)) d.open = false;
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, []);

  const links = user ? APP_LINKS : SITE_LINKS;
  const current = (href: string) => (pathname === href || pathname.startsWith(href + "/") ? "page" : undefined);
  const cta = user
    ? { href: "/consult/new", label: t("استشارة جديدة", "New Consultation") }
    : pathname.startsWith("/consulting") || pathname.startsWith("/models")
      ? { href: "/consult/new", label: t("ابدأ استشارة", "Start Consultation") }
      : { href: "/consulting", label: t("تحدّث إلى مستشار", "Talk to an Advisor") };
  const label = (i: Item) => i[lang];

  return (
    <header className="nav">
      <Link className="brand" href={user ? "/home" : "/"} aria-label={t("هسّارة — الصفحة الرئيسية", "HESSARA home")} lang="en">HESSARA</Link>
      <nav className="nav__links" aria-label={t("الأقسام الرئيسية", "Primary")}>
        {links.map((n) => <Link key={n.href} href={n.href} aria-current={current(n.href)}>{label(n)}</Link>)}
      </nav>
      <div className="nav__end">
        <LangToggle />
        {user ? <AccountMenu /> : <Link className="nav__text" href="/login">{t("الدخول", "Sign in")}</Link>}
        <Link className="btn" href={cta.href}>{cta.label}</Link>
        <details className="menu" ref={menu}>
          <summary aria-label={t("فتح القائمة", "Open menu")}>{t("القائمة", "Menu")}</summary>
          <div className="menu__panel">
            {links.map((n) => <Link key={n.href} href={n.href} aria-current={current(n.href)}>{label(n)}</Link>)}
            <div className="menu__sep" role="separator" />
            {user ? (
              <>
                <Link href="/home">{t("لوحتي", "Dashboard")}</Link>
                <Link href="/profile">{t("الملف الشخصي والإعدادات", "Profile & settings")}</Link>
                <button type="button" onClick={async () => { await api("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }}>{t("تسجيل الخروج", "Sign out")}</button>
              </>
            ) : (
              <>
                <Link href="/login">{t("تسجيل الدخول", "Sign in")}</Link>
                <Link href="/login?mode=signup">{t("إنشاء حساب", "Create an account")}</Link>
              </>
            )}
            <button type="button" lang={other(lang)} onClick={() => switchTo(other(lang))}>{lang === "ar" ? "English" : "العربية"}</button>
          </div>
        </details>
      </div>
    </header>
  );
}

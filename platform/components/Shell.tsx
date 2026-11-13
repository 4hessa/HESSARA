"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, useApp } from "./app";
import { Avatar, Logo, VendorMark } from "./bits";
import { Icon } from "./Icon";

export const SECTIONS = [
  { href: "/consult", label: "الاستشارات", icon: "consult" },
  { href: "/models", label: "النماذج", icon: "models" },
  { href: "/agents", label: "الوكلاء", icon: "agents" },
  { href: "/lab", label: "مختبر النقد", icon: "lab" },
  { href: "/media", label: "ميديا هسّارة", icon: "media" },
];

function ThemeToggle({ initial }: { initial: string | null }) {
  const [theme, setTheme] = useState<string | null>(initial);
  useEffect(() => {
    if (!theme) setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, [theme]);
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      className="btn btn-ghost btn-icon"
      aria-label={next === "dark" ? "التبديل إلى المظهر الداكن" : "التبديل إلى المظهر الفاتح"}
      onClick={() => {
        document.documentElement.dataset.theme = next;
        document.cookie = `hs_theme=${next}; path=/; max-age=31536000; samesite=lax`;
        setTheme(next);
      }}
    >
      <Icon name={next === "dark" ? "moon" : "sun"} />
    </button>
  );
}

function AccountMenu() {
  const { user, models } = useApp();
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
    <div ref={ref} style={{ position: "relative" }}>
      <button className="account-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        aria-label={`حساب ${user.name}${pref ? `، النموذج المفضل ${pref.name}` : ""}`}>
        <Avatar id={user.avatar} />
        <span className="account-name">{user.name}</span>
        {pref && (
          <span className="account-model" title="النموذج المفضل">
            <VendorMark vendorKey={pref.vendorKey} small />
            <bdi>{pref.name}</bdi>
          </span>
        )}
      </button>
      {open && (
        <div className="menu" role="menu">
          <div className="menu-head">
            <strong>{user.name}</strong>
            <span className="t-caption ltr" style={{ justifySelf: "start" }}>{user.email}</span>
            <span className="t-caption">النموذج المفضل: {pref ? <bdi>{pref.name}</bdi> : "لم يُحدَّد"}</span>
          </div>
          <Link role="menuitem" href="/home"><Icon name="panel" /> لوحتي</Link>
          <Link role="menuitem" href="/consult"><Icon name="history" /> سجل الاستشارات</Link>
          <Link role="menuitem" href="/consult?saved=1"><Icon name="bookmark" /> المحفوظات</Link>
          <Link role="menuitem" href="/profile"><Icon name="settings" /> الملف الشخصي والإعدادات</Link>
          <Link role="menuitem" href="/help"><Icon name="help" /> المساعدة</Link>
          <button role="menuitem" onClick={async () => { await api("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }}>
            <Icon name="logout" /> تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}

export function Header({ theme }: { theme: string | null }) {
  const { user } = useApp();
  const pathname = usePathname();
  const current = (href: string) => (pathname === href || pathname.startsWith(href + "/") ? "page" : undefined);
  return (
    <>
      <a href="#main" className="btn btn-primary skip-link">تخطَّ إلى المحتوى</a>
      <header className="header">
        <div className="container header-inner">
          <Logo href={user ? "/home" : "/"} />
          <nav className="nav" aria-label="الأقسام الرئيسية">
            {SECTIONS.map((s) => <Link key={s.href} href={s.href} aria-current={current(s.href)}>{s.label}</Link>)}
          </nav>
          <div className="header-actions">
            <Link href="/consult/new" className="btn btn-primary btn-sm hide-mobile">ابدأ استشارة</Link>
            <ThemeToggle initial={theme} />
            {user ? <AccountMenu /> : <Link href="/login" className="btn btn-secondary btn-sm">تسجيل الدخول</Link>}
          </div>
        </div>
      </header>
      <nav className="tabbar" aria-label="التنقل السريع">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} aria-current={current(s.href)}>
            <Icon name={s.icon} size={22} />
            <span>{s.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container stack-lg">
        <div className="footer-grid">
          <div className="stack-sm">
            <Logo />
            <p className="t-small muted" style={{ maxWidth: "46ch" }}>
              منصة استشارية تجمع نماذج الذكاء الاصطناعي والوكلاء المتخصصين وأدوات النقد والتقييم في تجربة واحدة. مشروع تخرج في تخصص الذكاء الاصطناعي.
            </p>
          </div>
          <div>
            <h2>الأقسام</h2>
            <ul>{SECTIONS.map((s) => <li key={s.href}><Link href={s.href}>{s.label}</Link></li>)}</ul>
          </div>
          <div>
            <h2>المنصة</h2>
            <ul>
              <li><Link href="/help">المساعدة</Link></li>
              <li><Link href="/privacy">سياسة الخصوصية</Link></li>
              <li><Link href="/terms">شروط الاستخدام</Link></li>
            </ul>
          </div>
        </div>
        <hr className="divider" />
        <p className="t-caption">
          بعض الإجابات في هذه المنصة مولَّدة بالذكاء الاصطناعي وقد تحتوي أخطاء؛ تحقق منها قبل الاعتماد عليها. أسماء النماذج ملك لأصحابها، وذكرها لا يعني شراكة أو اعتمادًا رسميًا.
        </p>
      </div>
    </footer>
  );
}

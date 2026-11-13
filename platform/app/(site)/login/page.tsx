import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { Art } from "@/components/site/Art";
import { Footer } from "@/components/site/Footer";
import { currentUser } from "@/lib/auth";
import { makeT } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = makeT(await getLang());
  return { title: t("تسجيل الدخول", "Sign in") };
}

// يُقبل فقط مسار داخلي نسبي لمنع إعادة التوجيه المفتوح.
const safeNext = (n?: string) => (n && /^\/(?!\/)[\w\-/?=&%.]*$/.test(n) ? n : "/home");

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; mode?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await currentUser()) redirect(next);
  const t = makeT(await getLang());
  const signup = sp.mode === "signup";
  return (
    <>
      <div className="art-band"><Art name="home" kind="fade" fade={{ "--art-h": "30rem", "--f1": "25%", "--f2": "58%", "--f3": "100%" }} /></div>
      <section className="app-hero app-hero--art" style={{ "--app-top": "15rem" } as React.CSSProperties}>
        <div className="app-hero__inner">
          <p className="eyebrow">{signup ? t("حساب جديد", "New account") : t("الدخول", "Sign in")}</p>
          <h1>{signup ? t("أنشئ حسابك في هسّارة", "Create your HESSARA account") : t("مرحبًا بعودتك", "Welcome back")}</h1>
          <p className="copy">{signup ? t("حساب واحد لحفظ استشاراتك ومراجعاتها ونموذجك المفضل.", "One account to keep your consultations, their reviews, and your favourite model.") : t("سجّل الدخول لمتابعة استشاراتك من حيث توقفت.", "Sign in to continue your consultations where you left off.")}</p>
        </div>
      </section>
      <div className="auth">
        <div className="auth-card frame">
          <div>
            {next.startsWith("/consult/new") && <p className="notice notice-accent t-small" style={{ gridTemplateColumns: "1fr" }}>{t("نص استشارتك محفوظ مؤقتًا في متصفحك، وسيظهر لك مباشرة بعد الدخول.", "Your consultation text is kept temporarily in your browser and will be back as soon as you sign in.")}</p>}
            <AuthForm key={signup ? "s" : "l"} mode={signup ? "signup" : "login"} next={next} />
          </div>
        </div>
        <p className="t-caption" style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link className="link" href="/">{t("العودة إلى الصفحة الرئيسية", "Back to the home page")}</Link> · <Link className="link" href="/privacy">{t("الخصوصية", "Privacy")}</Link> · <Link className="link" href="/terms">{t("الشروط", "Terms")}</Link>
        </p>
      </div>
      <div className="sheet" style={{ marginTop: 0, flex: "0 0 auto" }}><Footer /></div>
    </>
  );
}

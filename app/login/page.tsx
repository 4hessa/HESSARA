import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/bits";
import { FlowArt } from "@/components/FlowArt";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "تسجيل الدخول" };

// يُقبل فقط مسار داخلي نسبي لمنع إعادة التوجيه المفتوح.
const safeNext = (n?: string) => (n && /^\/(?!\/)[\w\-/?=&%.]*$/.test(n) ? n : "/home");

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; mode?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await currentUser()) redirect(next);
  const signup = sp.mode === "signup";
  return (
    <div className="auth">
      <main className="auth-form" id="main">
        <div>
          <Logo large />
          <div className="stack-sm">
            <h1 className="t-h2">{signup ? "أنشئ حسابك في هسّارة" : "مرحبًا بعودتك"}</h1>
            <p className="muted">{signup ? "حساب واحد لحفظ استشاراتك ومراجعاتها ونموذجك المفضل." : "سجّل الدخول لمتابعة استشاراتك من حيث توقفت."}</p>
            {next.startsWith("/consult/new") && <p className="notice notice-accent t-small" style={{ gridTemplateColumns: "1fr" }}>نص استشارتك محفوظ مؤقتًا في متصفحك، وسيظهر لك مباشرة بعد الدخول.</p>}
          </div>
          <AuthForm key={signup ? "s" : "l"} mode={signup ? "signup" : "login"} next={next} />
          <p className="t-caption" style={{ textAlign: "center" }}>
            <Link className="link" href="/">العودة إلى الصفحة الرئيسية</Link> · <Link className="link" href="/privacy">الخصوصية</Link> · <Link className="link" href="/terms">الشروط</Link>
          </p>
        </div>
      </main>
      <aside className="auth-art" aria-hidden="true"><div style={{ width: "min(440px, 100%)" }}><FlowArt /></div></aside>
    </div>
  );
}

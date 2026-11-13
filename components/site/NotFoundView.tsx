// صفحة «غير موجودة» بأسلوب الموقع المرجعي (src/pages/404.astro).
import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { Cta } from "./Blocks";
import { MarketingPage } from "./Page";

export function NotFoundView({ lang }: { lang: Lang }) {
  const ar = lang === "ar";
  return (
    <MarketingPage
      art={{ name: "home" }}
      glow={false}
      hero={
        <>
          <h1>{ar ? "هذا الطريق لا يقود إلى شيء" : "This path leads nowhere"}</h1>
          <p className="hero__sub">{ar ? "خطأ 404 — الصفحة غير موجودة" : "Error 404 — Page Not Found"}</p>
          <div className="hero__copy"><p>{ar ? "الصفحة التي تبحث عنها نُقلت أو لم توجد أصلًا، أو أن الاستشارة حُذفت. طريق العودة أدناه." : "The page you were looking for has moved or never existed, or the consultation was deleted. The way back is below."}</p></div>
          <div className="btn-row">
            <Link className="btn" href="/">{ar ? "العودة إلى الرئيسية" : "Return Home"}</Link>
            <Link className="btn btn--ghost" href="/resources">{ar ? "تصفّح الموارد" : "Browse Resources"}</Link>
          </div>
        </>
      }
    >
      <Cta title={ar ? "تبحث عن إرشاد بدلًا من ذلك؟" : "Looking for guidance instead?"} actions={[{ label: ar ? "ابدأ استشارة" : "Start a Consultation", href: "/consult/new" }]} />
    </MarketingPage>
  );
}

// قالب الصفحات الطويلة من الموقع المرجعي (src/layouts/Prose.astro): رسمة متلاشية، عنوان وعنوان فرعي
// ووسم، ثم النص في العمود الأوسط، ثم دعوة إلى الإجراء.
import Link from "next/link";
import type { Doc } from "@/content/types";
import type { Lang } from "@/lib/i18n";
import { ArticleBody } from "./Article";
import { Cta } from "./Blocks";
import { MarketingPage } from "./Page";
import type { ArtProps } from "./Art";

const ARTS: Record<string, { art: ArtProps; heroTop?: string }> = {
  insights: { art: { name: "insights", kind: "fade", fade: { "--art-h": "26rem", "--f1": "40%", "--f2": "66%", "--f3": "94%" } }, heroTop: "29rem" },
  resources: { art: { name: "resources", kind: "fade" } },
  platform: { art: { name: "platform", kind: "fade" } },
  home: { art: { name: "home", kind: "fade", fade: { "--f1": "38%", "--f2": "60%", "--f3": "86%" } } },
};

export function ProsePage({ doc, lang, section }: { doc: Doc; lang: Lang; section?: "insights" | "resources" }) {
  const picked = ARTS[section ?? "home"];
  const ar = lang === "ar";
  const back = section === "insights" ? ["/insights", ar ? "كل الرؤى" : "All insights"] : section === "resources" ? ["/resources", ar ? "كل الموارد" : "All resources"] : null;
  return (
    <MarketingPage
      art={picked.art}
      heroTop={picked.heroTop}
      hero={
        <>
          <h1>{doc.title}</h1>
          {doc.sub && <p className="hero__sub">{doc.sub}</p>}
          {doc.kicker && <p className="hero__kicker">{doc.kicker}</p>}
        </>
      }
    >
      <article className="section article">
        {doc.note && <p className="note"><b>{ar ? "ملاحظة." : "Note."}</b> {doc.note}</p>}
        <ArticleBody md={doc.body} />
        {back && <p className="article__back"><Link href={back[0]}>{ar ? "→ " : "← "}{back[1]}</Link></p>}
      </article>
      <Cta
        title={doc.cta ?? (ar ? "مستعد لتفكيك المعقّد؟" : "Ready to navigate the complex?")}
        actions={[
          { label: ar ? "ابدأ استشارة" : "Start a Consultation", href: "/consult/new" },
          { label: ar ? "استكشف المنصة" : "Explore the Platform", href: "/platform", ghost: true },
        ]}
      />
    </MarketingPage>
  );
}

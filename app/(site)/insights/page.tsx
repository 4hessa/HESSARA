import type { Metadata } from "next";
import { FORMATS, formatList, INSIGHTS, publishedFormats } from "@/content/insights";
import { Cta, Rows, SectionHead, Tiles } from "@/components/site/Blocks";
import { MarketingPage } from "@/components/site/Page";
import { getLang } from "@/lib/i18n-server";
import type { Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";

// أنواع المقالات المعروضة تُستخرج من المقالات المنشورة فعلًا (content/insights.ts)، فلا تَعِد الصفحة بنوع
// لم يُنشر فيه شيء. أول «تقرير ميداني» يُنشر يُظهر بطاقته وحده.
const C = {
  en: {
    meta: "Insights", about: "on AI-assisted advisory, reasoning, and decision-making.",
    h1: "Insights That Light the Way",
    copy: "Considered writing on AI-assisted advisory: how specialized models reason, where they fall short, and how to turn their output into decisions you can defend.",
    b1: "Read the Latest",
    e1: "Formats", ways: ["", "One Way to Read HESSARA", "Two Ways to Read HESSARA", "Three Ways to Read HESSARA"],
    e2: "Latest", t2: "Recent Thinking",
    cta: "Ready to turn insight into action?", c1: "Start a Consultation", c2: "Meet the Agents",
  },
  ar: {
    meta: "رؤى", about: "في الاستشارة بمساعدة الذكاء الاصطناعي والاستدلال واتخاذ القرار.",
    h1: "رؤى تُنير الطريق",
    copy: "كتابة متأنية في الاستشارة بمساعدة الذكاء الاصطناعي: كيف تستدل النماذج، وأين تقصّر، وكيف تحوّل مخرجاتها إلى قرارات تستطيع الدفاع عنها.",
    b1: "اقرأ الأحدث",
    e1: "الأنواع", ways: ["", "طريقة واحدة لقراءة هسّارة", "طريقتان لقراءة هسّارة", "ثلاث طرق لقراءة هسّارة"],
    e2: "الأحدث", t2: "أحدث ما كتبنا",
    cta: "مستعد لتحويل الرؤية إلى فعل؟", c1: "ابدأ استشارة", c2: "تعرّف على الوكلاء",
  },
};

/** وصف الصفحة لمحركات البحث: الأنواع المنشورة في جملة تبدأ بحرف كبير بالإنجليزية. */
function description(lang: Lang) {
  const list = formatList(lang, publishedFormats(), "lower");
  return lang === "ar" ? `${list} ${C.ar.about}` : `${list.charAt(0).toUpperCase()}${list.slice(1)} ${C.en.about}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return pageMeta(lang, C[lang].meta, description(lang), "/insights");
}

export default async function InsightsPage() {
  const lang = await getLang();
  const c = C[lang];
  const formats = publishedFormats();
  const tiles = formats.map((f) => ({ icon: FORMATS[f].icon, title: FORMATS[f][lang].title, text: FORMATS[f][lang].text }));
  const rows = INSIGHTS.map((e) => ({ kind: e[lang].kicker ?? "", title: e[lang].title, text: e[lang].description, href: `/insights/${e.slug}` }));
  return (
    <MarketingPage
      art={{ name: "insights", kind: "fade", dark: true, y: "-18%", fade: { "--art-h": "24rem", "--f1": "62%", "--f2": "84%", "--f3": "100%" } }}
      hero={
        <>
          <h1>{c.h1}</h1>
          {formats.length > 0 && <p className="hero__sub">{formatList(lang, formats)}</p>}
          <div className="hero__copy"><p>{c.copy}</p></div>
          <div className="btn-row">
            <a className="btn" href="#latest">{c.b1}</a>
          </div>
        </>
      }
    >
      {tiles.length > 0 && (
        <section className="section" id="formats">
          <SectionHead eyebrow={c.e1} title={c.ways[tiles.length] ?? c.ways[3]} />
          <Tiles items={tiles} />
        </section>
      )}
      <section className="section" id="latest">
        <SectionHead eyebrow={c.e2} title={c.t2} />
        <Rows items={rows} rtl={lang === "ar"} />
      </section>
      <Cta title={c.cta} actions={[{ label: c.c1, href: "/consult/new" }, { label: c.c2, href: "/agents", ghost: true }]} />
    </MarketingPage>
  );
}

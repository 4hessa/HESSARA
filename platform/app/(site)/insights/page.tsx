import type { Metadata } from "next";
import { INSIGHTS } from "@/content/insights";
import { Cta, Rows, SectionHead, Tiles } from "@/components/site/Blocks";
import { MarketingPage } from "@/components/site/Page";
import { getLang } from "@/lib/i18n-server";

const C = {
  en: {
    meta: "Insights", desc: "Research notes, field reports, and briefings on AI-assisted advisory, reasoning, and decision-making.",
    h1: "Insights That Light the Way", sub: "Research Notes, Field Reports & Briefings",
    copy: "Considered writing on AI-assisted advisory: how specialized models reason, where they fall short, and how to turn their output into decisions you can defend.",
    b1: "Read the Latest", b2: "Browse by Format",
    e1: "Formats", t1: "Three Ways to Read HESSARA",
    tiles: [
      { icon: "quill", title: "Research Notes", text: "Longer studies of method, evidence, and limits." },
      { icon: "telescope", title: "Field Reports", text: "Practical notes on how models behave in real tasks." },
      { icon: "lantern", title: "Briefings", text: "Short guidance for leaders who must decide." },
    ],
    e2: "Latest", t2: "Recent Thinking",
    cta: "Ready to turn insight into action?", c1: "Start a Consultation", c2: "Explore the Platform",
  },
  ar: {
    meta: "رؤى", desc: "مذكرات بحثية وتقارير ميدانية وإحاطات في الاستشارة بمساعدة الذكاء الاصطناعي والاستدلال واتخاذ القرار.",
    h1: "رؤى تُنير الطريق", sub: "مذكرات بحثية وتقارير ميدانية وإحاطات",
    copy: "كتابة متأنية في الاستشارة بمساعدة الذكاء الاصطناعي: كيف تستدل النماذج، وأين تقصّر، وكيف تحوّل مخرجاتها إلى قرارات تستطيع الدفاع عنها.",
    b1: "اقرأ الأحدث", b2: "تصفّح حسب النوع",
    e1: "الأنواع", t1: "ثلاث طرق لقراءة هسّارة",
    tiles: [
      { icon: "quill", title: "مذكرات بحثية", text: "دراسات أطول في المنهج والدليل والحدود." },
      { icon: "telescope", title: "تقارير ميدانية", text: "ملاحظات عملية عن سلوك النماذج في المهام الحقيقية." },
      { icon: "lantern", title: "إحاطات", text: "إرشاد موجز لمن عليه أن يقرر." },
    ],
    e2: "الأحدث", t2: "أحدث ما كتبنا",
    cta: "مستعد لتحويل الرؤية إلى فعل؟", c1: "ابدأ استشارة", c2: "استكشف المنصة",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const c = C[await getLang()];
  return { title: c.meta, description: c.desc };
}

export default async function InsightsPage() {
  const lang = await getLang();
  const c = C[lang];
  const rows = INSIGHTS.map((e) => ({ kind: e[lang].kicker ?? "", title: e[lang].title, text: e[lang].description, href: `/insights/${e.slug}` }));
  return (
    <MarketingPage
      art={{ name: "insights", kind: "fade", fade: { "--art-h": "42rem", "--f1": "80%", "--f2": "90%", "--f3": "100%" } }}
      heroTop="44rem"
      hero={
        <>
          <h1>{c.h1}</h1>
          <p className="hero__sub">{c.sub}</p>
          <div className="hero__copy"><p>{c.copy}</p></div>
          <div className="btn-row">
            <a className="btn" href="#latest">{c.b1}</a>
            <a className="btn btn--ghost" href="#formats">{c.b2}</a>
          </div>
        </>
      }
    >
      <section className="section" id="formats">
        <SectionHead eyebrow={c.e1} title={c.t1} />
        <Tiles items={c.tiles} />
      </section>
      <section className="section" id="latest">
        <SectionHead eyebrow={c.e2} title={c.t2} />
        <Rows items={rows} rtl={lang === "ar"} />
      </section>
      <Cta title={c.cta} actions={[{ label: c.c1, href: "/consult/new" }, { label: c.c2, href: "/platform", ghost: true }]} />
    </MarketingPage>
  );
}

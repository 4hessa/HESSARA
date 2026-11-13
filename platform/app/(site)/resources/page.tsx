import type { Metadata } from "next";
import { RESOURCES } from "@/content/resources";
import { Cta, Rows, SectionHead, Steps, Tiles } from "@/components/site/Blocks";
import { MarketingPage } from "@/components/site/Page";
import { getLang } from "@/lib/i18n-server";

const C = {
  en: {
    meta: "Resources", desc: "Guides, references, and playbooks for working with HESSARA, its language models, and its agents.",
    h1: "A Library for Every Question", sub: "Documentation, References & Playbooks",
    copy: "Everything you need to work with HESSARA: a guide to your first consultation, a reference for the model registry, and a playbook for getting a second opinion.",
    b1: "Browse the Library", b2: "Start Here",
    e1: "Collections", t1: "Find Your Shelf",
    tiles: [
      { icon: "document", title: "Documentation", text: "Concepts, setup, and day-to-day use.", href: "#library" },
      { icon: "film", title: "Video Library", text: "Lessons from their original sources, with every link checked.", href: "/media" },
      { icon: "map", title: "Guides & Playbooks", text: "Step-by-step methods for real questions.", href: "#library" },
    ],
    e2: "Start Here", t2: "Three Steps to Your First Session",
    steps: [
      { title: "Prepare", text: "Gather the context your question depends on, minus any secrets." },
      { title: "Convene", text: "Choose the agent and model suited to the problem." },
      { title: "Review", text: "Read the reasoning, run a critical review, and decide." },
    ],
    e3: "Library", t3: "Popular Resources",
    cta: "Cannot find what you are looking for?", c1: "Talk to an Advisor", c2: "Read Insights",
  },
  ar: {
    meta: "الموارد", desc: "أدلة ومراجع وأدلة عملية للعمل مع هسّارة ونماذجها اللغوية ووكلائها.",
    h1: "مكتبة لكل سؤال", sub: "التوثيق والمراجع والأدلة العملية",
    copy: "كل ما تحتاجه للعمل مع هسّارة: دليل لاستشارتك الأولى، ومرجع لسجل النماذج، ودليل عملي للحصول على رأي ثانٍ.",
    b1: "تصفّح المكتبة", b2: "ابدأ من هنا",
    e1: "المجموعات", t1: "اعثر على رفّك",
    tiles: [
      { icon: "document", title: "التوثيق", text: "المفاهيم والإعداد والاستخدام اليومي.", href: "#library" },
      { icon: "film", title: "مكتبة الفيديو", text: "دروس من مصادرها الأصلية، وكل رابط فيها مفحوص.", href: "/media" },
      { icon: "map", title: "أدلة وخطط عمل", text: "مناهج خطوة بخطوة لأسئلة حقيقية.", href: "#library" },
    ],
    e2: "ابدأ من هنا", t2: "ثلاث خطوات إلى جلستك الأولى",
    steps: [
      { title: "جهِّز", text: "اجمع السياق الذي يعتمد عليه سؤالك، دون أي أسرار." },
      { title: "اجمَع", text: "اختر الوكيل والنموذج المناسبين للمشكلة." },
      { title: "راجِع", text: "اقرأ الاستدلال، وشغّل مراجعة نقدية، ثم قرّر." },
    ],
    e3: "المكتبة", t3: "الموارد الأكثر طلبًا",
    cta: "لم تجد ما تبحث عنه؟", c1: "تحدّث إلى مستشار", c2: "اقرأ الرؤى",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const c = C[await getLang()];
  return { title: c.meta, description: c.desc };
}

export default async function ResourcesPage() {
  const lang = await getLang();
  const c = C[lang];
  const rows = RESOURCES.map((e) => ({ kind: e[lang].kicker ?? "", title: e[lang].title, text: e[lang].description, href: `/resources/${e.slug}` }));
  return (
    <MarketingPage
      art={{ name: "resources" }}
      heroTop="37.5rem"
      hero={
        <>
          <h1>{c.h1}</h1>
          <p className="hero__sub">{c.sub}</p>
          <div className="hero__copy"><p>{c.copy}</p></div>
          <div className="btn-row">
            <a className="btn" href="#library">{c.b1}</a>
            <a className="btn btn--ghost" href="#start">{c.b2}</a>
          </div>
        </>
      }
    >
      <section className="section" id="shelves">
        <SectionHead eyebrow={c.e1} title={c.t1} />
        <Tiles items={c.tiles} />
      </section>
      <section className="section" id="start">
        <SectionHead eyebrow={c.e2} title={c.t2} />
        <Steps items={c.steps} />
      </section>
      <section className="section" id="library">
        <SectionHead eyebrow={c.e3} title={c.t3} />
        <Rows items={rows} rtl={lang === "ar"} />
      </section>
      <Cta title={c.cta} actions={[{ label: c.c1, href: "/consulting" }, { label: c.c2, href: "/insights", ghost: true }]} />
    </MarketingPage>
  );
}

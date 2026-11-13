import Link from "next/link";
import { redirect } from "next/navigation";
import { Cta, SectionHead, Steps, Tiles } from "@/components/site/Blocks";
import { Mock } from "@/components/site/Mock";
import { MarketingPage } from "@/components/site/Page";
import { currentUser } from "@/lib/auth";
import { getLang } from "@/lib/i18n-server";

const C = {
  en: {
    h1: <>Intelligence That Guides. <br />Insight That Matters</>,
    sub: "Your AI-Powered Advisory Platform",
    p1: "HESSARA connects you with AI models from several providers and with specialised agents, to work through complex challenges, explore solutions, and make informed decisions.",
    p2: "Every answer names the model that wrote it, and any answer can go through a critical review before you act on it.",
    b1: "Explore the Suite", b2: "Talk to an Advisor",
    e1: "Applications", t1: "Our Specialized Intelligence Suite",
    tiles: [
      { icon: "compass", title: "Guided Consultation", text: "Specialised agents that ask for the context your question needs.", href: "/consulting" },
      { icon: "chart", title: "Model Comparison", text: "Switch models within one consultation and compare their answers.", href: "/models" },
      { icon: "scales", title: "Critical Review", text: "Test an answer against stated criteria before you rely on it.", href: "/lab" },
    ],
    e2: "Process", t2: "Your Path to Action",
    steps: [
      { title: "Define", text: "Define the question, its constraints, and the context for analysis." },
      { title: "Align", text: "Choose the model and the agent suited to the question." },
      { title: "Insights", text: "Read the analysis, run a critical review, and keep what holds up." },
    ],
    fh: "Seamless, intuitive advisory at your command",
    fp: "HESSARA brings AI models, specialised agents, and critical review into one workspace, so a complex question can become a plan you have checked.",
    cta: "Ready to navigate the complex?", c1: "Start a Consultation", c2: "Explore Documentation",
  },
  ar: {
    h1: <>ذكاءٌ يُرشِد. <br />وبصيرةٌ تصنع الفرق</>,
    sub: "منصتك الاستشارية المدعومة بالذكاء الاصطناعي",
    p1: "تصلك هسّارة بنماذج ذكاء اصطناعي من عدة مزوّدين وبوكلاء متخصصين، لتفكّك التحديات المعقدة وتستكشف الحلول وتتخذ قرارات مدروسة.",
    p2: "كل إجابة تحمل اسم النموذج الذي كتبها، وأي إجابة يمكن إخضاعها لمراجعة نقدية قبل أن تبني عليها.",
    b1: "استكشف المنظومة", b2: "تحدّث إلى مستشار",
    e1: "التطبيقات", t1: "منظومة ذكاء متخصصة",
    tiles: [
      { icon: "compass", title: "استشارة موجَّهة", text: "وكلاء متخصصون يطلبون السياق الذي يحتاجه سؤالك.", href: "/consulting" },
      { icon: "chart", title: "مقارنة النماذج", text: "بدّل النموذج داخل الاستشارة نفسها وقارن بين إجاباته.", href: "/models" },
      { icon: "scales", title: "مراجعة نقدية", text: "اختبر الإجابة بمعايير معلنة قبل أن تعتمد عليها.", href: "/lab" },
    ],
    e2: "المنهج", t2: "طريقك إلى القرار",
    steps: [
      { title: "حدِّد", text: "حدّد السؤال وقيوده والسياق اللازم لتحليله." },
      { title: "اختَر", text: "اختر النموذج والوكيل المناسبين للسؤال." },
      { title: "استخلِص", text: "اقرأ التحليل، وشغّل مراجعة نقدية، واحتفظ بما يصمد منه." },
    ],
    fh: "استشارة سلسة وبديهية بين يديك",
    fp: "تجمع هسّارة نماذج الذكاء الاصطناعي والوكلاء المتخصصين والمراجعة النقدية في مساحة عمل واحدة، ليصير سؤالك المعقّد خطةً تحقّقتَ منها.",
    cta: "مستعد لتفكيك المعقّد؟", c1: "ابدأ استشارة", c2: "تصفّح التوثيق",
  },
};

export default async function Home() {
  if (await currentUser()) redirect("/home");
  const lang = await getLang();
  const c = C[lang];
  return (
    <MarketingPage
      art={{ name: "home" }}
      glow={false}
      hero={
        <>
          <h1 className="h1-split">{c.h1}</h1>
          <p className="hero__sub">{c.sub}</p>
          <div className="hero__copy"><p>{c.p1}</p><p>{c.p2}</p></div>
          <div className="btn-row">
            <a className="btn" href="#suite">{c.b1}</a>
            <Link className="btn btn--ghost" href="/consulting">{c.b2}</Link>
          </div>
        </>
      }
    >
      <section className="section" id="suite">
        <SectionHead eyebrow={c.e1} title={c.t1} />
        <Tiles items={c.tiles} />
      </section>
      <section className="section" id="process">
        <SectionHead eyebrow={c.e2} title={c.t2} />
        <Steps items={c.steps} />
      </section>
      <section className="section feature">
        <div>
          <h3>{c.fh}</h3>
          <p>{c.fp}</p>
        </div>
        <Mock variant="advisory" lang={lang} />
      </section>
      <Cta title={c.cta} actions={[{ label: c.c1, href: "/consult/new" }, { label: c.c2, href: "/resources", ghost: true }]} />
    </MarketingPage>
  );
}

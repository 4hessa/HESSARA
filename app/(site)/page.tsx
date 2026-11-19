import { redirect } from "next/navigation";
import { LandingPreview } from "@/components/LandingPreview";
import { ModelNotice } from "@/components/ModelNotice";
import { Cta, SectionHead, Steps, Tiles } from "@/components/site/Blocks";
import { Mock } from "@/components/site/Mock";
import { MarketingPage } from "@/components/site/Page";
import { currentUser } from "@/lib/auth";
import type { Metadata } from "next";
import { getLang } from "@/lib/i18n-server";
import { pageMeta } from "@/lib/meta";

const C = {
  en: {
    h1: <>Intelligence That Guides. <br />Insight That Matters</>,
    sub: "Your AI-Powered Advisory Platform",
    p1: "HESSARA connects you with AI models from several providers and with specialised agents, to work through complex challenges, explore solutions, and make informed decisions.",
    p2: "Every answer names the model that wrote it, and any answer can go through a critical review before you act on it.",
    b1: "Start a Consultation", b2: "Try It Without an Account",
    e0: "Try It", t0: "Ask a Question Now",
    lede0: "A live connection to the HESSARA server, with no account: send a sample question to the demo engine, then run the rule-based reviewer on its answer. With an account, the same path runs on the AI models.",
    e1: "What HESSARA Offers", t1: "Agents, Models and Review in One Workspace",
    tiles: [
      { icon: "compass", title: "Specialised Agents", text: "Six agents, each with written instructions, that ask for the context your question needs.", href: "/agents" },
      { icon: "layers", title: "Language Models", text: "Models from several providers behind one interface, each with its real status. Switch within a consultation and compare answers.", href: "/models" },
      { icon: "scales", title: "Critical Review", text: "Test an answer against stated criteria and see what is missing before you rely on it.", href: "/lab" },
    ],
    e2: "Method", t2: "From Question to Reviewed Answer",
    steps: [
      { title: "Define", text: "Write the question, its constraints, and the context it depends on. Text only in this version." },
      { title: "Choose", text: "Pick the model and the agent suited to it; every answer shows which one wrote it." },
      { title: "Review", text: "Run a critical review, compare the revised version, and keep what holds up." },
    ],
    fh: "One workspace for every consultation",
    fp: "Consultations, the model behind each answer, and their reviews stay together, so you can pick up any line of reasoning where you left it, then export or share it when you are done.",
    cta: "Have a question to work through?", c1: "Start a Consultation", c2: "Browse the Library",
  },
  ar: {
    h1: <>ذكاءٌ يُرشِد. <br />وبصيرةٌ تصنع الفرق</>,
    sub: "منصتك الاستشارية المدعومة بالذكاء الاصطناعي",
    p1: "تصلك هسّارة بنماذج ذكاء اصطناعي من عدة مزوّدين وبوكلاء متخصصين، لتفكّك التحديات المعقدة وتستكشف الحلول وتتخذ قرارات مدروسة.",
    p2: "كل إجابة تحمل اسم النموذج الذي كتبها، وأي إجابة يمكن إخضاعها لمراجعة نقدية قبل أن تبني عليها.",
    b1: "ابدأ استشارة", b2: "جرّبها دون حساب",
    e0: "جرّبها", t0: "اطرح سؤالًا الآن",
    lede0: "اتصال حي بخادم هسّارة دون حساب: أرسل سؤالًا تجريبيًا إلى المحرك التجريبي، ثم شغّل المراجع القاعدي على إجابته. ومع حساب يجري المسار نفسه بنماذج الذكاء الاصطناعي.",
    e1: "ما تقدّمه هسّارة", t1: "الوكلاء والنماذج والمراجعة في مساحة واحدة",
    tiles: [
      { icon: "compass", title: "وكلاء متخصصون", text: "ستة وكلاء، لكلٍّ منهم تعليمات مكتوبة، يطلبون السياق الذي يحتاجه سؤالك.", href: "/agents" },
      { icon: "layers", title: "نماذج لغوية", text: "نماذج من عدة مزوّدين خلف واجهة واحدة، كلٌّ بحالته الفعلية. بدّل بينها داخل الاستشارة وقارن إجاباتها.", href: "/models" },
      { icon: "scales", title: "مراجعة نقدية", text: "اختبر الإجابة بمعايير معلنة، واعرف ما ينقصها قبل أن تعتمد عليها.", href: "/lab" },
    ],
    e2: "المنهج", t2: "من السؤال إلى إجابة مراجَعة",
    steps: [
      { title: "حدِّد", text: "اكتب السؤال وقيوده والسياق الذي يعتمد عليه. نص فقط في هذه النسخة." },
      { title: "اختَر", text: "اختر النموذج والوكيل المناسبين، وكل إجابة تذكر من كتبها." },
      { title: "راجِع", text: "شغّل مراجعة نقدية، وقارن النسخة المنقّحة، واحتفظ بما يصمد منها." },
    ],
    fh: "مساحة عمل واحدة لكل استشارة",
    fp: "تبقى الاستشارات، والنموذج وراء كل إجابة، ومراجعاتها معًا، فتستأنف أي خط تفكير من حيث توقفت، ثم تصدّره أو تشاركه حين تنتهي.",
    cta: "لديك سؤال تريد تفكيكه؟", c1: "ابدأ استشارة", c2: "تصفّح المكتبة",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const m = lang === "ar"
    ? pageMeta(lang, "ذكاء يرشد، وبصيرة تصنع الفرق", "منصة أكاديمية للاستشارات التقنية بالذكاء الاصطناعي، تجمع وكلاء متخصصين ونماذج لغوية ومصادر علمية موثّقة. مشروع تخرج في كلية الذكاء الاصطناعي.", "/")
    : pageMeta(lang, "Intelligence That Guides. Insight That Matters", "An academic AI-powered technical consulting platform that brings together specialised agents, language models and cited scientific resources. A graduation project at a College of Artificial Intelligence.", "/");
  // عنوان الصفحة الرئيسية كاملًا دون قالب «— هسّارة» المضاف لبقية الصفحات.
  return { ...m, title: { absolute: lang === "ar" ? "هسّارة — ذكاء يرشد، وبصيرة تصنع الفرق" : "HESSARA — Intelligence That Guides. Insight That Matters" } };
}

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
            <a className="btn" href="/consult/new">{c.b1}</a>
            <a className="btn btn--ghost" href="#try">{c.b2}</a>
          </div>
          <ModelNotice className="model-notice--hero" />
        </>
      }
    >
      <section className="section section--wide" id="try">
        <div className="head"><SectionHead eyebrow={c.e0} title={c.t0} lede={c.lede0} /></div>
        <LandingPreview />
      </section>
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

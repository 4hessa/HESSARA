import type { Metadata } from "next";
import Link from "next/link";
import { Cta, SectionHead, Steps, Tiles } from "@/components/site/Blocks";
import { Mock } from "@/components/site/Mock";
import { MarketingPage } from "@/components/site/Page";
import { getLang } from "@/lib/i18n-server";

const C = {
  en: {
    meta: "The HESSARA Platform",
    desc: "One workspace for AI models from several providers, specialised agents, and critical review.",
    h1: "One Platform. Every Decision in Orbit",
    sub: "Models, Agents & Critical Review in One Place",
    copy: "HESSARA brings AI models from several providers, six specialised agents, and a critique lab into one workspace. Every answer is labelled with the model that wrote it, and every review states which engine produced it.",
    b1: "Explore the Platform", b2: "Read the Documentation",
    e1: "Core Systems", t1: "The Architecture of HESSARA",
    tiles: [
      { icon: "layers", title: "Model Layer", text: "Several providers behind one interface, each with its real status.", href: "/models" },
      { icon: "book", title: "Agent Playbooks", text: "Each agent follows written instructions and asks for the context its field needs.", href: "/agents" },
      { icon: "shield", title: "Critique & Review", text: "Test answers against stated criteria and see what is missing.", href: "/lab" },
    ],
    e2: "How It Fits Together", t2: "From Question to Reviewed Answer",
    steps: [
      { title: "Describe", text: "Write the problem and the context it depends on. Text only in this version." },
      { title: "Choose", text: "Pick the model and the agent suited to it; you always see which one answered." },
      { title: "Review", text: "Run a critical review, compare the revised version, and export the consultation." },
    ],
    fh: "A single workspace for every advisory thread",
    fp: "Consultations, the model behind each answer, and their reviews stay together, so you can pick up any line of reasoning where you left it.",
    cta: "Ready to try HESSARA?", c1: "Create an Account", c2: "Explore Language Models",
  },
  ar: {
    meta: "منصة هسّارة",
    desc: "مساحة عمل واحدة لنماذج ذكاء اصطناعي من عدة مزوّدين، ووكلاء متخصصين، ومراجعة نقدية.",
    h1: "منصة واحدة. وكل قرارٍ في مداره",
    sub: "النماذج والوكلاء والمراجعة النقدية في مكان واحد",
    copy: "تجمع هسّارة نماذج ذكاء اصطناعي من عدة مزوّدين، وستة وكلاء متخصصين، ومختبرًا للنقد في مساحة عمل واحدة. كل إجابة موسومة باسم النموذج الذي كتبها، وكل مراجعة تذكر المحرك الذي أنتجها.",
    b1: "استكشف المنصة", b2: "اقرأ التوثيق",
    e1: "الأنظمة الأساسية", t1: "بنية هسّارة",
    tiles: [
      { icon: "layers", title: "طبقة النماذج", text: "عدة مزوّدين خلف واجهة واحدة، كلٌّ بحالته الفعلية.", href: "/models" },
      { icon: "book", title: "أدلة الوكلاء", text: "كل وكيل يتبع تعليمات مكتوبة ويطلب السياق الذي يحتاجه مجاله.", href: "/agents" },
      { icon: "shield", title: "النقد والمراجعة", text: "اختبر الإجابات بمعايير معلنة واعرف ما ينقصها.", href: "/lab" },
    ],
    e2: "كيف تتكامل", t2: "من السؤال إلى إجابة مراجَعة",
    steps: [
      { title: "صِف", text: "اكتب المشكلة والسياق الذي تعتمد عليه. نص فقط في هذه النسخة." },
      { title: "اختَر", text: "اختر النموذج والوكيل المناسبين، وسترى دائمًا من أجاب." },
      { title: "راجِع", text: "شغّل مراجعة نقدية، وقارن النسخة المنقّحة، وصدّر الاستشارة." },
    ],
    fh: "مساحة عمل واحدة لكل مسار استشاري",
    fp: "تبقى الاستشارات، والنموذج وراء كل إجابة، ومراجعاتها معًا، فتستأنف أي خط تفكير من حيث توقفت.",
    cta: "مستعد لتجربة هسّارة؟", c1: "أنشئ حسابًا", c2: "استكشف النماذج اللغوية",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const c = C[await getLang()];
  return { title: c.meta, description: c.desc };
}

export default async function PlatformPage() {
  const lang = await getLang();
  const c = C[lang];
  return (
    <MarketingPage
      art={{ name: "platform" }}
      heroTop="37.5rem"
      hero={
        <>
          <h1>{c.h1}</h1>
          <p className="hero__sub">{c.sub}</p>
          <div className="hero__copy"><p>{c.copy}</p></div>
          <div className="btn-row">
            <a className="btn" href="#suite">{c.b1}</a>
            <Link className="btn btn--ghost" href="/resources">{c.b2}</Link>
          </div>
        </>
      }
    >
      <section className="section" id="suite">
        <SectionHead eyebrow={c.e1} title={c.t1} />
        <Tiles items={c.tiles} />
      </section>
      <section className="section">
        <SectionHead eyebrow={c.e2} title={c.t2} />
        <Steps items={c.steps} />
      </section>
      <section className="section feature">
        <div><h3>{c.fh}</h3><p>{c.fp}</p></div>
        <Mock variant="advisory" lang={lang} />
      </section>
      <Cta title={c.cta} actions={[{ label: c.c1, href: "/login?mode=signup" }, { label: c.c2, href: "/models", ghost: true }]} />
    </MarketingPage>
  );
}

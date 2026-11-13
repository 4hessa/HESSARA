import type { Metadata } from "next";
import { LandingPreview } from "@/components/LandingPreview";
import { Cta, SectionHead, Tiles } from "@/components/site/Blocks";
import { Mock } from "@/components/site/Mock";
import { MarketingPage } from "@/components/site/Page";
import { agentsFor } from "@/lib/catalog/agents";
import { getLang } from "@/lib/i18n-server";
import { pageMeta } from "@/lib/meta";

// أيقونات المرجع المقابلة لكل وكيل حقيقي في المنصة.
const AGENT_ICON: Record<string, string> = { coding: "code", systems: "network", ai: "astrolabe", research: "telescope", security: "shield", planning: "knight" };

const C = {
  en: {
    meta: "AI Consulting",
    desc: "Specialised agents built on general AI models, each with written instructions, intake questions, and a fixed answer structure, followed by critical review.",
    h1: "AI-Powered Technical Consulting",
    sub: "Specialised Agents & Critical Review",
    copy: "Work with specialised agents built on general AI models. Each one follows written instructions for its field, asks for the context it needs, and answers in a fixed structure you can check.",
    b1: "Launch Advisory Session", b2: "Select AI Specialist",
    e1: "Advisory Council", t1: "Select Your Advisory Council",
    lede: "Agents have no external tools in this version: no code execution, browsing, or file access. What they produce is text analysis for you to check.",
    e2: "Workspace", t2: "Interactive Consultation Workspace",
    fh: "Live Answers, Then Critical Review",
    fp: "Answers stream in as the model writes them, labelled with the model and the agent. Any answer can then be reviewed against stated criteria, and a revised version compared word by word.",
    li: [["Streaming answers", "read as the model writes; stop, regenerate, or switch models."], ["Critical review", "six review modes or your own criteria, with findings ranked by severity."]],
    e3: "Try It", t3: "Try the Whole Path Here",
    lede3: "A live connection to the HESSARA server, with no account: send a sample question to the demo engine, then run the rule-based reviewer on its answer.",
    cta: "Ready to consult with HESSARA intelligence?", c1: "Start a Consultation",
  },
  ar: {
    meta: "الاستشارات الذكية",
    desc: "وكلاء متخصصون مبنيون على نماذج ذكاء اصطناعي عامة، لكلٍّ منهم تعليمات مكتوبة وأسئلة إدخال وبنية إجابة ثابتة، تتبعها مراجعة نقدية.",
    h1: "استشارات تقنية بالذكاء الاصطناعي",
    sub: "وكلاء متخصصون ومراجعة نقدية",
    copy: "استشر وكلاء متخصصين مبنيين على نماذج ذكاء اصطناعي عامة. يتبع كلٌّ منهم تعليمات مكتوبة لمجاله، ويطلب السياق الذي يحتاجه، ويجيب ببنية ثابتة يمكنك التحقق منها.",
    b1: "ابدأ جلسة استشارية", b2: "اختر مستشارك",
    e1: "المجلس الاستشاري", t1: "اختر مجلسك الاستشاري",
    lede: "لا يملك الوكلاء أدوات خارجية في هذه النسخة: لا تنفيذ شفرة ولا تصفّح ولا وصول إلى ملفات. ما يقدّمونه تحليل نصي تتحقق منه أنت.",
    e2: "مساحة العمل", t2: "مساحة استشارة تفاعلية",
    fh: "إجابات حية، ثم مراجعة نقدية",
    fp: "تصل الإجابات مبثوثةً أثناء كتابة النموذج لها، موسومةً بالنموذج والوكيل. ثم يمكن مراجعة أي إجابة بمعايير معلنة، ومقارنة نسختها المنقّحة كلمةً بكلمة.",
    li: [["إجابات مبثوثة", "تقرؤها أثناء الكتابة، وتستطيع إيقافها أو إعادة توليدها أو تبديل النموذج."], ["مراجعة نقدية", "ستة أنماط مراجعة أو معاييرك الخاصة، والملاحظات مرتّبة بالخطورة."]],
    e3: "جرّبها", t3: "جرّب المسار كاملًا هنا",
    lede3: "اتصال حي بخادم هسّارة دون حساب: أرسل سؤالًا تجريبيًا إلى المحرك التجريبي، ثم شغّل المراجع القاعدي على إجابته.",
    cta: "مستعد للاستشارة مع ذكاء هسّارة؟", c1: "ابدأ استشارة",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const c = C[lang];
  return pageMeta(lang, c.meta, c.desc, "/consulting");
}

export default async function ConsultingPage() {
  const lang = await getLang();
  const c = C[lang];
  const tiles = agentsFor(lang).map((a) => ({ icon: AGENT_ICON[a.id] ?? "compass", title: a.name, text: a.scope, href: `/consult/new?agent=${a.id}` }));
  return (
    <MarketingPage
      art={{ name: "consulting", kind: "fade", y: "-10.1rem", fade: { "--art-h": "46.1rem", "--f1": "88%", "--f2": "95%", "--f3": "100%" } }}
      heroTop="40rem"
      hero={
        <>
          <h1>{c.h1}</h1>
          <p className="hero__sub">{c.sub}</p>
          <div className="hero__copy"><p>{c.copy}</p></div>
          <div className="btn-row">
            <a className="btn" href="/consult/new">{c.b1}</a>
            <a className="btn btn--ghost" href="#council">{c.b2}</a>
          </div>
        </>
      }
    >
      <section className="section" id="council">
        <SectionHead eyebrow={c.e1} title={c.t1} lede={c.lede} />
        <Tiles items={tiles} />
      </section>
      <section className="section section--tight" id="workspace">
        <SectionHead eyebrow={c.e2} title={c.t2} />
      </section>
      <section className="section feature feature--bleed">
        <div>
          <h3>{c.fh}</h3>
          <p>{c.fp}</p>
          <ul>{c.li.map(([b, x]) => <li key={b}><small><b>{b}</b> – {x}</small></li>)}</ul>
        </div>
        <Mock variant="consult" lang={lang} />
      </section>
      <section className="section section--wide" id="try">
        <div className="head"><SectionHead eyebrow={c.e3} title={c.t3} lede={c.lede3} /></div>
        <LandingPreview />
      </section>
      <Cta title={c.cta} actions={[{ label: c.c1, href: "/consult/new" }]} />
    </MarketingPage>
  );
}

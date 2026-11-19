import type { Metadata } from "next";
import { Cta, SectionHead, Tiles } from "@/components/site/Blocks";
import { MailButton } from "@/components/site/Mail";
import { MarketingPage } from "@/components/site/Page";
import { getLang } from "@/lib/i18n-server";
import { pageMeta } from "@/lib/meta";

// بريد التواصل خلف زر لا يُظهر العنوان نصًّا (components/site/Mail.tsx)، بطلب صاحب المشروع في ١٩ نوفمبر ٢٠٢٦.

const C = {
  en: {
    meta: "Contact", desc: "Get in touch with HESSARA about consultations, language models, or the project itself.",
    h1: "Start the Conversation", sub: "Tell us what you are trying to decide",
    copy: "Whether you want to run a consultation, ask about the language models, or discuss the project, we would like to hear from you.",
    e1: "How we can help", t1: "Choose Your Path",
    tiles: [
      { icon: "knight", title: "Advisory Sessions", text: "Bring a question to one of six specialised agents.", href: "/consulting" },
      { icon: "gem", title: "Language Models", text: "See which models are configured and how status works.", href: "/models" },
      { icon: "map", title: "About the Project", text: "What HESSARA is, what it offers, and what it believes.", href: "/about" },
    ],
    before: "Before you write", short: "A short note is enough. It helps if you include:",
    li: ["the question or decision you are working on", "your organisation and role, if relevant", "any timing that matters"],
    noconf: "Please do not send confidential documents in a first message.",
    cta: "Prefer to explore first?", c1: "Browse Resources", c2: "Read Insights",
  },
  ar: {
    meta: "تواصل معنا", desc: "تواصل مع هسّارة بشأن الاستشارات أو النماذج اللغوية أو المشروع نفسه.",
    h1: "ابدأ الحديث", sub: "أخبرنا بما تحاول أن تقرره",
    copy: "سواء أردت إجراء استشارة، أو السؤال عن النماذج اللغوية، أو مناقشة المشروع، يسعدنا أن نسمع منك.",
    e1: "كيف نساعدك", t1: "اختر طريقك",
    tiles: [
      { icon: "knight", title: "جلسات استشارية", text: "اعرض سؤالك على أحد ستة وكلاء متخصصين.", href: "/consulting" },
      { icon: "gem", title: "النماذج اللغوية", text: "اعرف النماذج المهيّأة وكيف تُحسب حالتها.", href: "/models" },
      { icon: "map", title: "عن المشروع", text: "ما هسّارة، وما تقدّمه، وما تؤمن به.", href: "/about" },
    ],
    before: "قبل أن تكتب", short: "تكفي رسالة قصيرة، ويفيد أن تذكر فيها:",
    li: ["السؤال أو القرار الذي تعمل عليه", "جهتك ودورك إن كان ذلك مهمًا", "أي توقيت يهم"],
    noconf: "نرجو ألا ترسل وثائق سرية في الرسالة الأولى.",
    cta: "تفضّل الاستكشاف أولًا؟", c1: "تصفّح الموارد", c2: "اقرأ الرؤى",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const c = C[lang];
  return pageMeta(lang, c.meta, c.desc, "/contact");
}

export default async function ContactPage() {
  const c = C[await getLang()];
  return (
    <MarketingPage
      art={{ name: "home", kind: "fade", fade: { "--f1": "38%", "--f2": "60%", "--f3": "86%" } }}
      hero={
        <>
          <h1>{c.h1}</h1>
          <p className="hero__sub">{c.sub}</p>
          <div className="hero__copy"><p>{c.copy}</p></div>
          <div className="btn-row"><MailButton variant="button" /></div>
        </>
      }
    >
      <section className="section">
        <SectionHead eyebrow={c.e1} title={c.t1} />
        <Tiles items={c.tiles} />
      </section>
      <section className="section article" style={{ paddingTop: 0 }}>
        <h2 style={{ marginTop: 0 }}>{c.before}</h2>
        <p style={{ fontFamily: "var(--sans)", fontSize: "1rem" }}>{c.short}</p>
        <ul>{c.li.map((l) => <li key={l}>{l}</li>)}</ul>
        <p>{c.noconf}</p>
      </section>
      <Cta title={c.cta} actions={[{ label: c.c1, href: "/resources" }, { label: c.c2, href: "/insights", ghost: true }]} />
    </MarketingPage>
  );
}

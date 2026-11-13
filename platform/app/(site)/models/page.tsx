import type { Metadata } from "next";
import { ModelsClient } from "@/components/ModelsClient";
import { Cta, SectionHead, Tiles } from "@/components/site/Blocks";
import { Mock } from "@/components/site/Mock";
import { MarketingPage } from "@/components/site/Page";
import { currentUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { getLang } from "@/lib/i18n-server";

const C = {
  en: {
    meta: "Language Models",
    desc: "The AI models HESSARA can use, each shown with its real status read from the server's configuration.",
    h1: "The Models Behind Every Answer",
    sub: "Models from Several Providers, One Honest Registry",
    copy: "HESSARA does not train its own models. It connects to models from established providers, and to a local model on its own server, and shows the real status of each one before you choose it.",
    b1: "Explore Model Registry", b2: "How Status Works",
    e1: "Architecture & Capabilities", t1: "The HESSARA Model Ecosystem",
    tiles: [
      { icon: "gem", title: "Cloud Models", text: "Claude, GPT, Gemini, DeepSeek, Qwen, and Llama through their providers' interfaces.", href: "#registry" },
      { icon: "astrolabe", title: "Local Model", text: "A model on the platform's own server, such as Ollama, with no per-request fee.", href: "#local" },
      { icon: "key", title: "Demo Engine", text: "Rules, not AI: it runs without keys so the whole path can be tried.", href: "#hessara-demo" },
    ],
    e2: "Model Registry", t2: "Every Model, With Its Real Status",
    lede: "Status is read from the server's settings when the page opens. “Not configured” means the service key or version is not set, so the model cannot be chosen for a conversation.",
    e3: "How Status Works", t3: "Status You Can Check",
    fh: "Honest model status",
    fp: "Each model's status comes from the server's configuration and its last connection test. A model is never shown as available unless its key and version are set.",
    li: ["Text input in this version: no files or images", "No invented benchmarks: compare models in your own consultations", "Prices quoted only with their source and date"],
    cta: "Ready to put a model to work?", c1: "Start a Consultation",
  },
  ar: {
    meta: "النماذج اللغوية",
    desc: "نماذج الذكاء الاصطناعي التي تستطيع هسّارة استخدامها، كلٌّ بحالته الفعلية المقروءة من إعدادات الخادم.",
    h1: "النماذج وراء كل إجابة",
    sub: "نماذج من عدة مزوّدين، في سجلٍّ صادق واحد",
    copy: "لا تدرّب هسّارة نماذجها الخاصة. إنها تتصل بنماذج مزوّدين معروفين، وبنموذج محلي على خادمها، وتعرض الحالة الفعلية لكلٍّ منها قبل أن تختاره.",
    b1: "استكشف سجل النماذج", b2: "كيف تُحسب الحالة",
    e1: "البنية والقدرات", t1: "منظومة النماذج في هسّارة",
    tiles: [
      { icon: "gem", title: "نماذج سحابية", text: "Claude و GPT و Gemini و DeepSeek و Qwen و Llama عبر واجهات مزوّديها.", href: "#registry" },
      { icon: "astrolabe", title: "نموذج محلي", text: "نموذج على خادم المنصة نفسه، مثل Ollama، بلا رسوم لكل طلب.", href: "#local" },
      { icon: "key", title: "المحرك التجريبي", text: "قواعد لا ذكاء اصطناعي: يعمل دون مفاتيح لتجربة المسار كاملًا.", href: "#hessara-demo" },
    ],
    e2: "سجل النماذج", t2: "كل نموذج بحالته الفعلية",
    lede: "تُقرأ الحالة من إعدادات الخادم لحظة فتح الصفحة. «غير مهيّأ» تعني أن مفتاح الخدمة أو اسم الإصدار غير مضبوط، فلا يمكن اختياره للمحادثة.",
    e3: "كيف تُحسب الحالة", t3: "حالة يمكنك التحقق منها",
    fh: "حالة النماذج بلا تجميل",
    fp: "تأتي حالة كل نموذج من إعدادات الخادم ومن آخر اختبار اتصال. لا يُعرض نموذج متاحًا ما لم يكن مفتاحه وإصداره مضبوطين.",
    li: ["مدخلات نصية في هذه النسخة: لا ملفات ولا صور", "لا مقاييس أداء مختلَقة: قارن النماذج في استشاراتك أنت", "الأسعار تُذكر فقط مع مصدرها وتاريخها"],
    cta: "مستعد لتشغيل نموذج على سؤالك؟", c1: "ابدأ استشارة",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const c = C[await getLang()];
  return { title: c.meta, description: c.desc };
}

export default async function ModelsPage() {
  const lang = await getLang();
  const c = C[lang];
  const user = await currentUser();
  const favs = user ? (await all<{ ref: string }>("SELECT ref FROM favorites WHERE user_id = ? AND kind = 'model'", user.id)).map((f) => f.ref) : [];
  return (
    <MarketingPage
      art={{ name: "models", kind: "fade", fade: { "--art-h": "52.66rem", "--f1": "88%", "--f2": "94%", "--f3": "100%" } }}
      heroTop="45rem"
      hero={
        <>
          <h1>{c.h1}</h1>
          <p className="hero__sub">{c.sub}</p>
          <div className="hero__copy"><p>{c.copy}</p></div>
          <div className="btn-row">
            <a className="btn" href="#registry">{c.b1}</a>
            <a className="btn btn--ghost" href="#status">{c.b2}</a>
          </div>
        </>
      }
    >
      <section className="section" id="ecosystem">
        <SectionHead eyebrow={c.e1} title={c.t1} />
        <Tiles items={c.tiles} />
      </section>
      <section className="section section--wide" id="registry" aria-labelledby="registry-title">
        <div className="head"><SectionHead eyebrow={c.e2} title={c.t2} lede={c.lede} id="registry-title" /></div>
        <ModelsClient favs={favs} />
      </section>
      <section className="section section--tight" id="status">
        <SectionHead eyebrow={c.e3} title={c.t3} />
      </section>
      <section className="section feature feature--bleed">
        <div>
          <h3>{c.fh}</h3>
          <p>{c.fp}</p>
          <ul>{c.li.map((l) => <li key={l}>{l}</li>)}</ul>
        </div>
        <Mock variant="models" lang={lang} />
      </section>
      <Cta title={c.cta} actions={[{ label: c.c1, href: "/consult/new" }]} />
    </MarketingPage>
  );
}

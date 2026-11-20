import type { Metadata } from "next";
import Link from "next/link";
import { AppPage } from "@/components/site/Page";
import { makeT } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { pageMeta } from "@/lib/meta";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const t = makeT(lang);
  return pageMeta(lang, t("المساعدة", "Help"), t("إجابات صريحة عمّا تفعله المنصة وما لا تفعله في نسختها الحالية.", "Plain answers about what the platform does, and does not do, in its current version."), "/help");
}

type QA = { id: string; ar: [string, string]; en: [string, string] };
const QAS: QA[] = [
  { id: "start", ar: ["كيف أبدأ استشارة؟", "اكتب مشكلتك في حقل البدء، واختر النموذج أو الوكيل من الزر أسفل الحقل، ثم أرسل. تظهر الإجابة مبثوثة مع اسم النموذج الذي كتبها."],
    en: ["How do I start a consultation?", "Write your problem in the starting field, choose the model or agent from the button under the field, then send. The answer streams in with the name of the model that wrote it."] },
  { id: "demo", ar: ["ما «المحرك التجريبي»؟", "محرك قواعد محلي يعمل دون مفاتيح خدمات. يطابق كلمات مفتاحية في سؤالك ويعرض قالبًا ثابتًا. ليس نموذج ذكاء اصطناعي ولا يتابع سياق المحادثة، ووظيفته إثبات المسار الكامل للمنصة."],
    en: ["What is the “demo engine”?", "A local rule engine that runs without service keys. It matches keywords in your question and shows a fixed template. It is not an AI model and does not follow the conversation's context; its job is to prove the platform's whole path."] },
  { id: "status", ar: ["لماذا يظهر نموذج «غير مهيّأ» أو «فشل آخر اختبار»؟", "«غير مهيّأ»: لم يُضبط مفتاح خدمته على المنصة بعد، فلا يُعرض للاستشارة. «فشل آخر اختبار»: لم ينجح آخر اتصال به؛ اختر نموذجًا حالته «يعمل»، أو اضغط «اختبر الاتصال» في صفحة النماذج لإعادة فحصه. وإن فشل نموذج أثناء استشارة عُرض عليك إعادة المحاولة بنموذج آخر يعمل."],
    en: ["Why does a model show as “Not configured” or “Last test failed”?", "“Not configured”: its service key has not been set on the platform yet, so it is not offered for consultations. “Last test failed”: the last connection to it did not succeed; choose a model whose status is “Ready”, or press “Test connection” on the models page to check it again. If a model fails during a consultation, you are offered a retry with another working model."] },
  { id: "review", ar: ["ما الفرق بين المراجع القاعدي والمراجعة بنموذج لغوي؟", "المراجع القاعدي فحوص نمطية حتمية تكشف غياب عناصر بنيوية (قياس، تحقق، مصادر، خطة تراجع) ولا تفهم المعنى. المراجعة بنموذج لغوي تحكم وفق المعايير نفسها بفهم للنص، وتتطلب نموذجًا مهيّأً. تُذكر هوية المحرك مع كل نتيجة."],
    en: ["What is the difference between the rule-based reviewer and a language-model review?", "The rule-based reviewer runs deterministic pattern checks that detect missing structural elements (measurement, verification, sources, a rollback plan); it does not understand meaning. A language-model review judges against the same criteria with an understanding of the text, and needs a configured model. Every result names the engine that produced it."] },
  { id: "sources", ar: ["هل تعرض الإجابات مصادر؟", "لا في هذه النسخة: النماذج لا تملك أدوات بحث أو تصفّح، فلا مصادر حقيقية تُعرض. أي مرجع يرد في نص إجابة يجب التحقق منه بنفسك."],
    en: ["Do answers show sources?", "Not in this version: the models have no search or browsing tools, so no real sources are shown. Check yourself any reference that appears in an answer."] },
  { id: "language", ar: ["كيف أبدّل لغة الواجهة؟", "من زر «EN» أو «عربي» في الشريط العلوي أو في التذييل، أو من الملف الشخصي. تجيب النماذج بلغة الواجهة ما لم تكتب لها بلغة أخرى. المحادثات السابقة تبقى بلغتها."],
    en: ["How do I switch the interface language?", "With the “EN” or “عربي” button in the top bar or the footer, or from your profile. Models answer in the interface language unless you write to them in another. Earlier conversations stay in their own language."] },
  { id: "sensitive", ar: ["هل أعتمد على المنصة في مسائل طبية أو قانونية أو مالية؟", "لا. الإجابات في هذه المجالات معلومات عامة لا تغني عن مختص مرخّص، والمنصة لا تنتحل صفة مختص ولا تقدّم ضمانات."],
    en: ["Can I rely on the platform for medical, legal, or financial matters?", "No. Answers in these fields are general information and no substitute for a licensed professional; the platform does not pose as one and gives no guarantees."] },
  { id: "password", ar: ["نسيت كلمة المرور", "استعادة كلمة المرور بالبريد غير منفّذة في هذه النسخة لأنها تتطلب خدمة إرسال بريد غير مهيّأة. إن فقدت كلمة المرور فالحل الحالي إنشاء حساب جديد، أو طلب إعادة الضبط من مشغّل المنصة."],
    en: ["I forgot my password", "Password recovery by email is not implemented in this version, because it needs an email service that is not configured. If you lose your password, the current options are to create a new account or to ask the platform operator for a reset."] },
  { id: "files", ar: ["هل أستطيع إرفاق ملفات؟", "ليس بعد. الإدخال نص فقط في هذه النسخة، بالكتابة أو بالصوت؛ يمكنك لصق الشفرة أو النص مباشرة."],
    en: ["Can I attach files?", "Not yet. Input is text only in this version, typed or dictated; you can paste code or text directly."] },
  { id: "voice", ar: ["كيف أكتب بالصوت؟", "زر الميكروفون في حقل الاستشارة يسجّل حتى دقيقتين، ثم يضع النص في الحقل لتراجعه وتعدّله قبل الإرسال؛ لا يُرسل شيء تلقائيًا. يُرسَل التسجيل بعد موافقتك إلى خدمة خارجية لتحويل الكلام إلى نص، ولا تحفظه المنصة. وإن لم يكن في التسجيل كلام واضح تظهر رسالة «لم يُتعرَّف على كلام» بدل نص لم تقله."],
    en: ["How do I dictate with my voice?", "The microphone button in the consultation field records up to two minutes, then puts the text in the field for you to review and edit before sending; nothing is sent by itself. With your consent, the recording goes to an external speech-to-text service, and the platform does not keep it. If the recording has no clear speech, you see “No speech was recognised” instead of words you did not say."] },
  { id: "share", ar: ["كيف أطبع استشارة أو أشاركها؟", "زر الطباعة أعلى المحادثة يفتح تقريرًا يمكن حفظه ملفًا من نافذة الطباعة في المتصفح. وزر المشاركة ينشئ رابطًا للقراءة فقط، يمكنك إيقافه متى شئت من الزر نفسه."],
    en: ["How do I print or share a consultation?", "The print button at the top of the conversation opens a report you can save as a file from the browser's print window. The share button creates a read-only link, which you can stop at any time from the same button."] },
  { id: "rate", ar: ["ما فائدة تقييم الإجابة؟", "زرّا «مفيدة» و«غير مفيدة» تحت كل إجابة يسجّلان رأيك، ومع «غير مفيدة» يمكنك ذكر السبب. يرى صاحب المشروع التقييمات مجمّعة حسب النموذج، ليعرف أي النماذج أنفع للمستخدمين."],
    en: ["Why rate an answer?", "The “helpful” and “not helpful” buttons under each answer record your view, and with “not helpful” you can give a reason. The project owner sees the ratings totalled by model, to learn which models serve users best."] },
  { id: "contact", ar: ["كيف أراسل صاحب المشروع؟", "من صفحة «تواصل معنا»: نموذج داخل الموقع يكفيه بريدك ورسالتك، أو زر «راسلنا» إن كان لديك برنامج بريد. يقرأ صاحب المشروع الرسائل ويرد بالبريد."],
    en: ["How do I contact the project owner?", "From the Contact page: a form on the site that needs only your email and message, or the “Email us” button if you have an email program. The project owner reads the messages and replies by email."] },
  { id: "eye", ar: ["كيف يعمل تذكير راحة العين؟", "يحسب المتصفح وقت استخدامك النشط، وبعد المدة التي تختارها (عشر دقائق افتراضيًا) تظهر رسالة صغيرة لا تقاطع الكتابة. يمكنك تأجيلها أو تعطيلها أو تغيير المدة من الملف الشخصي. هو تذكير تنظيمي وليس توصية طبية."],
    en: ["How does the eye-rest reminder work?", "The browser counts your active time, and after the interval you choose (ten minutes by default) a small message appears without interrupting your typing. You can snooze it, turn it off, or change the interval in your profile. It is an organisational reminder, not medical advice."] },
  { id: "delete", ar: ["كيف أحذف بياناتي؟", "احذف أي استشارة من زر سلة المهملات أعلى المحادثة، أو احذف الحساب كاملًا من الملف الشخصي فتُحذف معه كل بياناتك."],
    en: ["How do I delete my data?", "Delete any consultation with the bin button at the top of the conversation, or delete your whole account from your profile, which removes all your data with it."] },
];

export default async function Help() {
  const lang = await getLang();
  const t = makeT(lang);
  return (
    <AppPage
      art={{ name: "resources", kind: "fade", fade: { "--art-h": "26rem", "--f1": "30%", "--f2": "62%", "--f3": "100%" } }}
      top="15rem"
      eyebrow={t("الأسئلة الشائعة", "Questions")}
      title={t("المساعدة", "Help")}
      copy={t("إجابات صريحة عمّا تفعله المنصة وما لا تفعله في نسختها الحالية.", "Plain answers about what the platform does, and does not do, in its current version.")}
      narrow
    >
      <div className="rows" style={{ marginTop: 0 }}>
        {QAS.map((q) => (
          <section key={q.id} id={q.id} className="entry" style={{ gridTemplateColumns: "1fr" }}>
            <h2 className="entry__t">{q[lang][0]}</h2>
            <p className="entry__d" style={{ fontSize: "0.86rem" }}>{q[lang][1]}</p>
          </section>
        ))}
      </div>
      <p className="t-small muted" style={{ marginTop: "1.5rem" }}>
        {t("راجع أيضًا", "See also the")} <Link className="link" href="/privacy">{t("سياسة الخصوصية", "Privacy Policy")}</Link> {t("و", "and the")} <Link className="link" href="/terms">{t("شروط الاستخدام", "Terms of Use")}</Link>.
      </p>
    </AppPage>
  );
}

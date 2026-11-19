// صفحات تعريفية طويلة: من نحن، الخصوصية، الشروط.
// «من نحن» تعرض هوية المشروع كما اعتمدها صاحبه في ١٩ نوفمبر ٢٠٢٦ (مشروع تخرج، لا شركة)، مع ما تقدّمه المنصة فعلًا اليوم. صفحتا «الوظائف» و«البرامج» حُذفتا، وتحوّلان إلى «من نحن».
// الخصوصية والشروط مأخوذة من نسختي المنصة الدقيقتين، لا من القالبين العامّين في المرجع.
import type { Doc } from "./types";

export const PAGES: Record<"about" | "privacy" | "terms", { ar: Doc; en: Doc }> = {
  about: {
    en: {
      title: "About HESSARA",
      sub: "AI-powered technical consulting and knowledge",
      description: "HESSARA is an academic AI-powered technical consulting platform, founded, owned and developed by Eng. Hessa Ahmed Alzahrani as a graduation project at the Smart University of Technical Sciences, College of Artificial Intelligence.",
      note: "HESSARA is an experimental academic platform, still under development. The academic affiliation identifies where the project was developed; it does not imply that the university owns, officially endorses or operates the platform.",
      cta: "Want to see how HESSARA works?",
      body: `HESSARA is an academic platform for AI-powered technical consulting. Consultation is its central service; the articles, research resources and videos support it.

## Project identity

| Item | Details |
| --- | --- |
| Founder, owner and developer | Eng. Hessa Ahmed Alzahrani |
| Project type | Academic graduation project |
| Category | AI-powered technical consulting and knowledge platform |
| University | Smart University of Technical Sciences |
| College | College of Artificial Intelligence |
| Academic year | 2027 |
| Status | Experimental platform, under development |

## Vision and mission

**Vision.** An accessible, intelligent and knowledge-driven platform that enhances technical decision-making through artificial intelligence, specialised consultation and reliable scientific resources.

**Mission.** An integrated consulting environment that helps users understand technical challenges, evaluate alternative solutions, get specialised AI assistance, and build their technical knowledge from credible academic and educational content.

## What the platform offers

- **[AI consulting](/agents)** through six specialised agents, each with written instructions and a fixed answer structure.
- **[Language models](/models)** from several providers, each shown with its real status.
- **[A critique lab](/lab)** that tests answers against stated criteria and keeps a record of each review.
- **[Articles](/insights)** that cite their sources, and a [reading list](/resources/ai-labs-reading-list) of primary sources from AI labs.
- **[HESSARA Media](/media):** curated educational videos, each credited to its channel and linked to the original.

It is meant for university students, researchers, software developers, AI engineers, technology professionals, independent learners and technical project teams.

## Project objectives

1. Develop an accessible AI-powered technical consulting platform.
2. Integrate specialised AI agents for different technical disciplines.
3. Provide personalised AI consulting experiences.
4. Support technical problem-solving and analytical decision-making.
5. Connect AI-generated consultation with reliable scientific references.
6. Organise educational media and technical learning resources.
7. Promote responsible and transparent use of artificial intelligence.
8. Evaluate the effectiveness, usability and practical value of AI-assisted technical consultation.

## Core values

- **Accuracy and reliability:** technically sound information and credible sources.
- **Transparency:** AI-generated answers, external material and verified information kept clearly apart.
- **Accessibility:** technical knowledge and consultation that are easier to reach and to understand.
- **Responsible AI:** careful handling of data and awareness of model limits; models inform decisions, and a person remains responsible for them.
- **Continuous improvement:** testing, evaluation and user feedback.
- **Knowledge integration:** consultation connected to research, educational media and practical learning.

## Current limits

- Connecting real language models is still in progress. Until one is confirmed working, answers come from a clearly labelled demo engine.
- AI-generated answers support exploration, learning and decisions; they are not independently verified expert judgments.
- This version handles text only, its agents have no external tools, and its reviews do not verify facts.
- Articles, research and videos remain attributable to their original authors, publishers and creators.

## Find out more

- [Insights](/insights) on AI-assisted consultation
- The [resource library](/resources)
- [Contact](/contact)`,
    },
    ar: {
      title: "عن هسّارة",
      sub: "الاستشارات التقنية والمعرفة بالذكاء الاصطناعي",
      description: "هسّارة منصة أكاديمية للاستشارات التقنية بالذكاء الاصطناعي، ومشروع تخرج في كلية الذكاء الاصطناعي بجامعة Smart University of Technical Sciences. التأسيس والملكية والتطوير: المهندسة حصة أحمد الزهراني.",
      note: "هسّارة منصة أكاديمية تجريبية ما تزال قيد التطوير. والانتماء الأكاديمي يبيّن المكان الذي طُوّر فيه المشروع، ولا يعني أن الجامعة تملك المنصة أو تعتمدها رسميًا أو تشغّلها.",
      cta: "تريد أن ترى كيف تعمل هسّارة؟",
      body: `هسّارة منصة أكاديمية للاستشارات التقنية بالذكاء الاصطناعي. الاستشارة خدمتها الأساسية، والمقالات والمصادر البحثية والفيديوهات تدعمها.

## هوية المشروع

| البند | التفاصيل |
| --- | --- |
| التأسيس والملكية والتطوير | المهندسة حصة أحمد الزهراني |
| نوع المشروع | مشروع تخرج أكاديمي |
| التصنيف | منصة للاستشارات التقنية والمعرفة بالذكاء الاصطناعي |
| الجامعة | Smart University of Technical Sciences |
| الكلية | كلية الذكاء الاصطناعي |
| العام الأكاديمي | 2027 |
| الحالة | منصة تجريبية قيد التطوير |

## الرؤية والرسالة

**الرؤية:** منصة ذكية في متناول الجميع، قائمة على المعرفة، تحسّن اتخاذ القرار التقني بالذكاء الاصطناعي والاستشارة المتخصصة والمصادر العلمية الموثوقة.

**الرسالة:** بيئة استشارية متكاملة تساعد المستخدم على فهم التحديات التقنية، وتقييم الحلول البديلة، والوصول إلى مساعدة ذكية متخصصة، وتعزيز معرفته التقنية بمحتوى أكاديمي وتعليمي موثوق.

## ما تقدّمه المنصة

- **[استشارات ذكية](/agents)** عبر ستة وكلاء متخصصين، لكلٍّ منهم تعليمات مكتوبة وبنية إجابة ثابتة.
- **[نماذج لغوية](/models)** من عدة مزوّدين، كلٌّ بحالته الفعلية.
- **[مختبر للنقد](/lab)** يختبر الإجابات بمعايير معلنة ويحتفظ بسجل لكل مراجعة.
- **[مقالات](/insights)** تذكر مصادرها، و[قائمة قراءة](/resources/ai-labs-reading-list) من مصادر أولية لمختبرات الذكاء الاصطناعي.
- **[ميديا هسّارة](/media):** فيديوهات تعليمية مختارة، كلٌّ منها منسوب إلى قناته ومربوط بمصدره الأصلي.

وهي موجّهة إلى طلاب الجامعات، والباحثين، ومطوّري البرمجيات، ومهندسي الذكاء الاصطناعي، والمهنيين في التقنية، والمتعلمين الذاتيين، وفرق المشاريع التقنية.

## أهداف المشروع

1. تطوير منصة استشارات تقنية بالذكاء الاصطناعي في متناول الجميع.
2. دمج وكلاء ذكاء اصطناعي متخصصين في مجالات تقنية مختلفة.
3. تقديم تجارب استشارية شخصية بالذكاء الاصطناعي.
4. دعم حل المشكلات التقنية واتخاذ القرار التحليلي.
5. ربط الاستشارة المولَّدة بالذكاء الاصطناعي بمراجع علمية موثوقة.
6. تنظيم المواد التعليمية وموارد التعلم التقني.
7. تعزيز الاستخدام المسؤول والشفاف للذكاء الاصطناعي.
8. تقييم فاعلية الاستشارة التقنية بمساعدة الذكاء الاصطناعي، وسهولة استخدامها، وقيمتها العملية.

## القيم الأساسية

- **الدقة والموثوقية:** معلومات سليمة تقنيًا ومصادر موثوقة.
- **الشفافية:** فصل واضح بين ما يولّده الذكاء الاصطناعي، والمواد الخارجية، والمعلومات المتحقق منها.
- **سهولة الوصول:** معرفة تقنية واستشارة أسهل منالًا وأوضح فهمًا.
- **الذكاء الاصطناعي المسؤول:** تعامل حريص مع البيانات ووعي بحدود النماذج؛ فالنماذج تُغني القرار، ويبقى الإنسان مسؤولًا عنه.
- **التحسين المستمر:** اختبار وتقييم وآراء المستخدمين.
- **تكامل المعرفة:** استشارة موصولة بالبحث العلمي والمواد التعليمية والتعلم العملي.

## الحدود الحالية

- ربط النماذج اللغوية الحقيقية ما يزال جاريًا، وإلى أن يُتأكد من عمل أحدها تأتي الإجابات من محرك تجريبي موسوم بوضوح.
- الإجابات المولَّدة بالذكاء الاصطناعي تدعم الاستكشاف والتعلم واتخاذ القرار، وليست أحكام خبراء متحققًا منها بشكل مستقل.
- هذه النسخة تتعامل مع النص فقط، ووكلاؤها بلا أدوات خارجية، ومراجعاتها لا تتحقق من صحة المعلومات.
- المقالات والأبحاث والفيديوهات تبقى منسوبة إلى مؤلفيها وناشريها وصنّاعها الأصليين.

## اعرف المزيد

- [رؤانا](/insights) في الاستشارة بمساعدة الذكاء الاصطناعي
- [مكتبة الموارد](/resources)
- [تواصل معنا](/contact)`,
    },
  },
  privacy: {
    en: {
      title: "Privacy Policy",
      sub: "What HESSARA collects, where it goes, and the choices you have",
      description: "What personal data HESSARA collects, where it is stored, what is sent to model providers, and your rights.",
      note: "HESSARA is a university graduation project. This policy describes what the system actually does; it is not a legal document reviewed by a professional.",
      body: `This policy describes the personal data HESSARA handles and what happens to it. The [security page](/resources/security) describes the technical controls behind it.

## What we collect

- Your name, your email address, and a hashed password; the password itself is not stored.
- The text of your consultations and their answers, reviews, favourites, and preferences.
- Your ratings of answers, and the reason if you choose one from the list.
- A daily count of your calls to real AI models, to apply the daily limit.
- How many times each page was opened each day, with no visitor identifier: no address and no cookie. Nothing is counted when your browser asks sites not to track it.
- Your answers to the usability questionnaire, if you choose to fill it in. The project owner sees them only aggregated with others, without your name or email.
- Technical errors: when something fails on the server or in your browser, the type of error, a cleaned message, and the page template are counted per day, with no visitor identifier and no text you wrote. They are deleted after 30 days.
- Messages you send through the contact form: your name if you give it, your email, the message, the interface language and the time. Only the project owner reads them, to reply to you. They are not linked to any account, and are deleted automatically after a year, or sooner if you ask.
- We collect no location data and use no tracking or advertising tools.

## Where it is stored

In the platform's database on its server. Each account's consultations are isolated from the others, and only their owner can reach them after signing in.

## Sending to third parties

- When you choose a model run by a third party, the consultation's text and conversation history are sent to that model's provider and processed under its policies. Your explicit consent is requested before the first such message, and you can withdraw it from your profile.
- The demo engine and the rule-based reviewer run on the platform's server and send nothing out.
- Video thumbnails load directly from YouTube's servers when you open HESSARA Media, and on your dashboard if you have saved videos or switched on video suggestions.
- If you create a share link for a consultation, anyone with the link can read that consultation and its reviews, without your name or email, until you stop sharing it.

## Cookies and local storage

- A session cookie that JavaScript cannot read, a cookie for your theme, a cookie for your language, and a cookie with your time zone so that times are shown in your local time.
- The browser's local storage holds the break-reminder timer, whether you have dismissed the getting-started card, and a temporary draft of your consultation while you sign in.

## Your rights

- Delete any single consultation, or delete your account and all its data permanently, from your profile.
- Download a copy of everything the platform stores about you, in one file, from your profile.
- Export any consultation as a text file, or print its report, from the top of the conversation.
- Stop any share link at any time; it stops working at once.`,
    },
    ar: {
      title: "سياسة الخصوصية",
      sub: "ما تجمعه هسّارة، وأين يذهب، والخيارات المتاحة لك",
      description: "البيانات الشخصية التي تجمعها هسّارة، وأين تُخزَّن، وما يُرسَل إلى مزوّدي النماذج، وحقوقك.",
      note: "هسّارة مشروع تخرج جامعي. تصف هذه السياسة ما ينفّذه النظام فعلًا، وليست وثيقة قانونية مراجَعة من مختص.",
      body: `تصف هذه السياسة البيانات الشخصية التي تتعامل معها هسّارة وما يحدث لها، وتصف [صفحة الأمان](/resources/security) الضوابط التقنية وراءها.

## ما نجمعه

- الاسم والبريد الإلكتروني وكلمة مرور مجزّأة، ولا تُخزَّن كلمة المرور نفسها.
- نصوص استشاراتك وإجاباتها والمراجعات والمفضلات والتفضيلات.
- تقييمك للإجابات، وسبب التقييم إن اخترته من القائمة.
- عدد استدعاءاتك اليومية لنماذج الذكاء الاصطناعي الحقيقية، لتطبيق الحد اليومي.
- عدد مرات فتح كل صفحة في كل يوم، دون أي معرّف للزائر: لا عنوان ولا ملف ارتباط. ولا يُحتسب شيء إن طلب متصفحك من المواقع عدم تتبّعه.
- إجاباتك عن استبيان سهولة الاستخدام إن اخترت ملأه. لا يراها صاحب المشروع إلا مجمّعة مع غيرها، دون اسمك أو بريدك.
- الأخطاء التقنية: حين يتعطل شيء في الخادم أو في متصفحك يُحصى في كل يوم نوع الخطأ ورسالته بعد تنقيتها وقالب الصفحة، دون أي معرّف للزائر ودون أي نص كتبته. تُحذف بعد ٣٠ يومًا.
- رسائل نموذج «تواصل معنا»: الاسم إن كتبته، والبريد، ونص الرسالة، ولغة الواجهة، ووقت الإرسال. يقرؤها صاحب المشروع وحده ليرد عليك، ولا تُربط بأي حساب، وتُحذف تلقائيًا بعد سنة، أو قبل ذلك إن طلبت.
- لا نجمع بيانات موقع، ولا نستخدم أدوات تتبّع أو إعلانات.

## أين تُخزَّن

في قاعدة بيانات المنصة على خادمها. استشارات كل حساب معزولة عن غيرها، ولا يصل إليها إلا صاحبها بعد تسجيل الدخول.

## الإرسال إلى جهات خارجية

- عند اختيار نموذج تشغّله جهة خارجية يُرسَل نص الاستشارة وسجل محادثتها إلى مزوّد ذلك النموذج لمعالجته وفق سياساته. يُطلب إذنك الصريح قبل أول إرسال، ويمكنك سحبه من الملف الشخصي.
- المحرك التجريبي والمراجع القاعدي يعملان على خادم المنصة ولا يرسلان شيئًا إلى الخارج.
- الصور المصغّرة للفيديوهات تُحمَّل من خوادم يوتيوب مباشرة عند فتح ميديا هسّارة، وفي لوحتك إن حفظت فيديوهات أو فعّلت اقتراحها.
- إن أنشأت رابط مشاركة لاستشارة، يستطيع كل من يملك الرابط قراءة تلك الاستشارة ومراجعاتها، دون اسمك أو بريدك، حتى توقف المشاركة.

## ملفات الارتباط والتخزين المحلي

- ملف ارتباط للجلسة لا يقرؤه JavaScript، وآخر لتفضيل المظهر، وثالث للغة الواجهة، ورابع بمنطقتك الزمنية لعرض الأوقات بتوقيتك.
- يُستخدم التخزين المحلي في المتصفح لمؤقت تذكير الاستراحة، ولتذكّر إخفائك لوحة البداية، ولحفظ مسودة استشارتك مؤقتًا أثناء تسجيل الدخول.

## حقوقك

- حذف أي استشارة منفردة، أو حذف الحساب وكل بياناته نهائيًا من الملف الشخصي.
- تنزيل نسخة من كل ما تحفظه المنصة عنك في ملف واحد، من الملف الشخصي.
- تصدير أي استشارة ملفًا نصيًا، أو طباعة تقريرها، من أعلى المحادثة.
- إيقاف أي رابط مشاركة في أي وقت، فيتوقف عن العمل فورًا.`,
    },
  },
  terms: {
    en: {
      title: "Terms of Use",
      sub: "The conditions for using HESSARA",
      description: "The terms under which HESSARA is provided: the nature of the service, AI-generated answers, sensitive topics, and acceptable use.",
      note: "HESSARA is a university graduation project. These terms describe how the service is offered; they are not a legal document reviewed by a professional.",
      body: `## Nature of the service

HESSARA is an educational and research advisory platform within a university graduation project. It is provided as is, without any guarantee of availability or accuracy.

## Generated answers

Some answers are generated by AI models and may be wrong, incomplete, or out of date. You are responsible for checking them before relying on them. Critical review is a helping tool, not proof of correctness.

## Sensitive consultations

The platform does not give binding medical, legal, or financial advice, and does not pose as a licensed professional. Consult a professional on these matters.

## Acceptable use

Do not use the platform to harm others or to break into systems you are not authorised to examine. Do not paste secrets or other people's personal data.

## Marks and names

The names of models and companies belong to their owners and are mentioned for identification only; mentioning them implies no partnership or endorsement. The platform uses no provider's official logo.

## Visual content

HESSARA Media's videos are links to their original sources on YouTube; the platform does not host or republish them.`,
    },
    ar: {
      title: "شروط الاستخدام",
      sub: "الشروط التي تُقدَّم بها هسّارة",
      description: "الشروط التي تُقدَّم بها هسّارة: طبيعة الخدمة، والإجابات المولَّدة، والموضوعات الحساسة، والاستخدام المقبول.",
      note: "هسّارة مشروع تخرج جامعي. تصف هذه الشروط طريقة تقديم الخدمة، وليست وثيقة قانونية مراجَعة من مختص.",
      body: `## طبيعة الخدمة

هسّارة منصة استشارية تعليمية وبحثية ضمن مشروع تخرج جامعي، تُقدَّم كما هي دون ضمان توافر أو دقة.

## الإجابات المولَّدة

بعض الإجابات تولّدها نماذج ذكاء اصطناعي وقد تكون خاطئة أو ناقصة أو قديمة. أنت مسؤول عن التحقق منها قبل الاعتماد عليها، والمراجعة النقدية أداة مساعدة وليست إثباتًا للصحة.

## الاستشارات الحساسة

لا تقدّم المنصة استشارات طبية أو قانونية أو مالية ملزمة، ولا تنتحل صفة مختص مرخّص. راجع مختصًا في هذه المسائل.

## الاستخدام المقبول

لا تستخدم المنصة لإلحاق ضرر بالغير أو لاختراق أنظمة لا تملك تصريحًا بفحصها، ولا تلصق أسرارًا أو بيانات شخصية لآخرين.

## العلامات والأسماء

أسماء النماذج والشركات المذكورة ملك لأصحابها، وذكرها للتعريف فقط ولا يعني شراكة أو اعتمادًا رسميًا. لا تستخدم المنصة شعارًا رسميًا لأي مزوّد.

## المحتوى المرئي

فيديوهات ميديا هسّارة روابط إلى مصادرها الأصلية على يوتيوب؛ لا تستضيفها المنصة ولا تعيد نشرها.`,
    },
  },
};

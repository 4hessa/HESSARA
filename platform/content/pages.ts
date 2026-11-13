// صفحات تعريفية طويلة: من نحن، الوظائف، البرامج، الخصوصية، الشروط.
// «من نحن» و«الوظائف» و«البرامج» مكيّفة من الموقع المرجعي لتطابق الواقع (مشروع تخرج، لا شركة ولا توظيف).
// الخصوصية والشروط مأخوذة من نسختي المنصة الدقيقتين، لا من القالبين العامّين في المرجع.
import type { Doc } from "./types";

export const PAGES: Record<"about" | "careers" | "programs" | "privacy" | "terms", { ar: Doc; en: Doc }> = {
  about: {
    en: {
      title: "About HESSARA",
      sub: "Intelligence that guides. Insight that matters",
      description: "HESSARA is an AI advisory platform built as a university graduation project: models from several providers, specialised agents, and a critique lab in one workspace.",
      cta: "Want to see how HESSARA works?",
      body: `HESSARA is an AI advisory platform, built as a graduation project in artificial intelligence. It connects people facing complex technical questions with AI models from several providers and with specialised agents, and it rests on a simple conviction: guidance is only useful if you can see where it came from and check it.

## What we do

We bring three things together in one workspace:

- **[Language models](/models)** from several providers, each shown with its real status
- **[AI consulting](/consulting)** through six specialised agents, each with written instructions and a fixed answer structure
- **[A critique lab](/lab)** that tests answers against stated criteria and keeps a record of each review

## What we believe

### Evidence before fluency

An answer that sounds right and cannot be checked is a liability. We would rather show a gap than fill it.

### Disagreement is useful

The strongest objection to a plan should be heard before the decision, not after. The critique lab exists to look for it.

### People decide

Models inform decisions. They do not make them. Every answer is offered to a person who remains responsible for the choice.

### Limits stated plainly

We try to say what our tools cannot do as clearly as what they can. This version handles text only, its agents have no external tools, and its reviews do not verify facts.

## How we work

Every consultation follows the same path, described on the [home page](/): define the question, choose the model and agent suited to it, and review the answer before you act on it.

## Find out more

- Read our [insights](/insights) on AI-assisted advisory
- Browse the [resource library](/resources)
- [Get in touch](/contact)`,
    },
    ar: {
      title: "عن هسّارة",
      sub: "ذكاءٌ يُرشِد، وبصيرةٌ تصنع الفرق",
      description: "هسّارة منصة استشارية بالذكاء الاصطناعي، بُنيت مشروعَ تخرج جامعي: نماذج من عدة مزوّدين، ووكلاء متخصصون، ومختبر نقد في مساحة عمل واحدة.",
      cta: "تريد أن ترى كيف تعمل هسّارة؟",
      body: `هسّارة منصة استشارية بالذكاء الاصطناعي، بُنيت مشروعَ تخرج في تخصص الذكاء الاصطناعي. تصل من يواجه أسئلة تقنية معقدة بنماذج ذكاء اصطناعي من عدة مزوّدين وبوكلاء متخصصين، وتقوم على قناعة بسيطة: الإرشاد لا ينفع إلا إذا رأيت من أين جاء واستطعت التحقق منه.

## ما نفعله

نجمع ثلاثة أشياء في مساحة عمل واحدة:

- **[نماذج لغوية](/models)** من عدة مزوّدين، كلٌّ بحالته الفعلية
- **[استشارات ذكية](/consulting)** عبر ستة وكلاء متخصصين، لكلٍّ منهم تعليمات مكتوبة وبنية إجابة ثابتة
- **[مختبر للنقد](/lab)** يختبر الإجابات بمعايير معلنة ويحتفظ بسجل لكل مراجعة

## ما نؤمن به

### الدليل قبل الطلاقة

الإجابة التي تبدو صحيحة ولا يمكن التحقق منها عبء. نفضّل أن نُظهر الفجوة على أن نملأها.

### الخلاف مفيد

ينبغي أن يُسمع أقوى اعتراض على الخطة قبل القرار لا بعده، ومختبر النقد موجود ليبحث عنه.

### الإنسان يقرر

النماذج تُغني القرار ولا تتخذه. كل إجابة تُقدَّم لإنسان يبقى مسؤولًا عن الاختيار.

### الحدود معلنة بوضوح

نحاول أن نقول ما لا تستطيعه أدواتنا بوضوح ما نقوله عمّا تستطيعه: هذه النسخة تتعامل مع النص فقط، ووكلاؤها بلا أدوات خارجية، ومراجعاتها لا تتحقق من صحة المعلومات.

## كيف نعمل

تتبع كل استشارة المسار نفسه الموصوف في [الصفحة الرئيسية](/): حدّد السؤال، واختر النموذج والوكيل المناسبين له، وراجِع الإجابة قبل أن تعمل بها.

## اعرف المزيد

- اقرأ [رؤانا](/insights) في الاستشارة بمساعدة الذكاء الاصطناعي
- تصفّح [مكتبة الموارد](/resources)
- [تواصل معنا](/contact)`,
    },
  },
  careers: {
    en: {
      title: "Careers at HESSARA",
      sub: "Work on the tools people use to think through hard decisions",
      description: "HESSARA is a graduation project and is not hiring. How to give feedback or discuss the project.",
      note: "HESSARA is a university graduation project, not a company. It has no staff and no paid positions.",
      cta: "Curious about what we are building?",
      body: `HESSARA builds advisory tools for people who have to make difficult decisions and explain them afterwards. As a graduation project it has no open positions, but it welcomes people who care about the same problem.

## What the work involves

- **Reasoning:** agents that state their limits and admit uncertainty
- **Evaluation:** reviewers that test answers against criteria instead of trusting fluency
- **Product and design:** interfaces that make reasoning legible to the person relying on it, in Arabic and English
- **Accessibility and security:** a platform that works for everyone and protects what they share

## What we value

- Care for accuracy over impressiveness
- The habit of stating what you do not know
- Clear writing
- Respect for the person on the other side of the screen

## Open roles

There are no open roles. If that changes, it will be stated on this page.

## Feedback and collaboration

If you would like to give feedback or discuss the project, please use the [contact page](/contact).`,
    },
    ar: {
      title: "الوظائف في هسّارة",
      sub: "اعمل على أدوات يستعين بها الناس في القرارات الصعبة",
      description: "هسّارة مشروع تخرج ولا توظّف. كيف تقدّم ملاحظاتك أو تناقش المشروع.",
      note: "هسّارة مشروع تخرج جامعي وليست شركة؛ لا موظفين فيها ولا وظائف مدفوعة.",
      cta: "تريد أن تعرف ما الذي نبنيه؟",
      body: `تبني هسّارة أدوات استشارية لمن عليهم أن يتخذوا قرارات صعبة ثم يشرحوها. ولأنها مشروع تخرج فلا وظائف شاغرة فيها، لكنها ترحّب بكل من يهتم بالمشكلة نفسها.

## ما يتضمنه العمل

- **الاستدلال:** وكلاء يعلنون حدودهم ويقرّون بعدم اليقين
- **التقييم:** مراجعون يختبرون الإجابات بمعايير بدل الوثوق بطلاقتها
- **المنتج والتصميم:** واجهات تجعل الاستدلال مقروءًا لمن يعتمد عليه، بالعربية والإنجليزية
- **الإتاحة والأمان:** منصة تعمل للجميع وتحمي ما يشاركونه

## ما نقدّره

- الحرص على الدقة قبل الإبهار
- عادة التصريح بما لا تعرفه
- الكتابة الواضحة
- احترام الإنسان على الجانب الآخر من الشاشة

## الوظائف الشاغرة

لا توجد وظائف شاغرة، وإن تغيّر ذلك فسيُذكر في هذه الصفحة.

## الملاحظات والتعاون

إن أردت تقديم ملاحظات أو مناقشة المشروع، فاستخدم [صفحة التواصل](/contact).`,
    },
  },
  programs: {
    en: {
      title: "Programs",
      sub: "Ways to work with HESSARA beyond the platform",
      description: "Ideas for programs through which researchers and organisations might work with HESSARA. None is open.",
      note: "No program is open. The outlines below are ideas under consideration for after the project is assessed; nothing here is an offer.",
      cta: "Interested in one of these ideas?",
      body: `Programs would be the routes by which researchers and organisations could work with HESSARA more closely than through the platform alone. None of them exists yet.

## Early access

For teams that want to try new agents and review modes before they reach the platform, in return for structured feedback.

**Would suit:** teams with a concrete technical question and the time to evaluate tools properly.

## Research collaboration

For students and researchers studying reasoning, evaluation, and the use of AI in decision-making, especially in Arabic.

**Would suit:** researchers with a defined question and a plan to publish their findings.

## Partner program

For instructors and organisations that want to use HESSARA in teaching or internal training.

**Would suit:** courses and teams with a clear use and a person responsible for it.

## How to express interest

Tell us which idea interests you, and what you hope to do, through the [contact page](/contact). Nothing will be promised before terms exist.

## Related

- [About HESSARA](/about)
- [Resources](/resources)`,
    },
    ar: {
      title: "البرامج",
      sub: "طرق للعمل مع هسّارة أبعد من المنصة",
      description: "أفكار لبرامج قد يعمل عبرها الباحثون والمؤسسات مع هسّارة. لا شيء منها مفتوح.",
      note: "لا يوجد برنامج مفتوح. المخططات أدناه أفكار قيد الدراسة لما بعد تقييم المشروع، ولا شيء هنا عرضٌ قائم.",
      cta: "تهمّك إحدى هذه الأفكار؟",
      body: `البرامج هي الطرق التي يمكن أن يعمل عبرها الباحثون والمؤسسات مع هسّارة عن قرب أكثر مما تتيحه المنصة وحدها، ولا يوجد أيٌّ منها بعد.

## الوصول المبكر

للفرق التي تريد تجربة وكلاء وأنماط مراجعة جديدة قبل وصولها إلى المنصة، مقابل ملاحظات منظمة.

**يناسب:** فرقًا لديها سؤال تقني محدد ووقت لتقييم الأدوات كما ينبغي.

## التعاون البحثي

للطلاب والباحثين الذين يدرسون الاستدلال والتقييم واستخدام الذكاء الاصطناعي في اتخاذ القرار، ولا سيما بالعربية.

**يناسب:** باحثين لديهم سؤال محدد وخطة لنشر نتائجهم.

## برنامج الشركاء

للمدرّسين والمؤسسات الذين يريدون استخدام هسّارة في التعليم أو التدريب الداخلي.

**يناسب:** مقررات وفرقًا لها استخدام واضح وشخص مسؤول عنه.

## كيف تُبدي اهتمامك

أخبرنا أي فكرة تهمّك وما تأمل أن تفعله عبر [صفحة التواصل](/contact). لن يُوعَد بشيء قبل أن توجد شروط.

## ذو صلة

- [عن هسّارة](/about)
- [الموارد](/resources)`,
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
- We collect no location data and use no tracking or advertising tools.

## Where it is stored

In the platform's database on its server. Each account's consultations are isolated from the others, and only their owner can reach them after signing in.

## Sending to third parties

- When you choose a model run by a third party, the consultation's text and conversation history are sent to that model's provider and processed under its policies. Your explicit consent is requested before the first such message, and you can withdraw it from your profile.
- The demo engine and the rule-based reviewer run on the platform's server and send nothing out.
- Video thumbnails load directly from YouTube's servers when you open the library pages.

## Cookies and local storage

- A session cookie that JavaScript cannot read, a cookie for your theme, and a cookie for your language.
- The browser's local storage holds the break-reminder timer, and a temporary draft of your consultation while you sign in.

## Your rights

- Delete any single consultation, or delete your account and all its data permanently, from your profile.
- Export any consultation as a text file from the top of the conversation.`,
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
- لا نجمع بيانات موقع، ولا نستخدم أدوات تتبّع أو إعلانات.

## أين تُخزَّن

في قاعدة بيانات المنصة على خادمها. استشارات كل حساب معزولة عن غيرها، ولا يصل إليها إلا صاحبها بعد تسجيل الدخول.

## الإرسال إلى جهات خارجية

- عند اختيار نموذج تشغّله جهة خارجية يُرسَل نص الاستشارة وسجل محادثتها إلى مزوّد ذلك النموذج لمعالجته وفق سياساته. يُطلب إذنك الصريح قبل أول إرسال، ويمكنك سحبه من الملف الشخصي.
- المحرك التجريبي والمراجع القاعدي يعملان على خادم المنصة ولا يرسلان شيئًا إلى الخارج.
- الصور المصغّرة للفيديوهات تُحمَّل من خوادم يوتيوب مباشرة عند فتح صفحات المكتبة.

## ملفات الارتباط والتخزين المحلي

- ملف ارتباط للجلسة لا يقرؤه JavaScript، وآخر لتفضيل المظهر، وثالث للغة الواجهة.
- يُستخدم التخزين المحلي في المتصفح لمؤقت تذكير الاستراحة، ولحفظ مسودة استشارتك مؤقتًا أثناء تسجيل الدخول.

## حقوقك

- حذف أي استشارة منفردة، أو حذف الحساب وكل بياناته نهائيًا من الملف الشخصي.
- تصدير أي استشارة ملفًا نصيًا من أعلى المحادثة.`,
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

The library's videos are links to their original sources on YouTube; the platform does not host or republish them.`,
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

فيديوهات المكتبة روابط إلى مصادرها الأصلية على يوتيوب؛ لا تستضيفها المنصة ولا تعيد نشرها.`,
    },
  },
};

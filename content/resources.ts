// قسم «الموارد»: أُعيدت كتابة الوثائق الأربع لتصف المنصة كما هي فعلًا. النسخ المرجعية كانت تصف
// نماذج وأدوارًا ومداولة جماعية وإسنادًا بالوثائق غير موجودة في هسّارة.
import type { Entry } from "./types";

export const RESOURCES: Entry[] = [
  {
    slug: "getting-started",
    en: {
      kicker: "Guide",
      title: "Getting started with your first consultation",
      sub: "Create an account, frame a question, and choose your first agent",
      description: "A step-by-step guide to preparing and running a first consultation on HESSARA.",
      cta: "Ready to run your first session?",
      body: `A first consultation goes well when the preparation is done before the conversation begins. This guide walks through four stages: prepare, frame, choose, and review.

## 1. Prepare your account

Create an account from the [sign-up page](/login?mode=signup). Then, in your [profile](/profile):

- **Choose a favourite model.** It is selected automatically in every new consultation. The [Language Models](/models) page shows which models are configured on this server.
- **Decide about external providers.** Most models are run by third parties. Before the first message to such a model, HESSARA asks for your consent to send the consultation's text to that provider. You can withdraw consent at any time.
- **Leave out anything sensitive.** HESSARA works with text only in this version. Do not paste passwords, keys, or other people's personal data.

## 2. Frame the question

Write the question as a single sentence, then add:

- **The decision it serves** and when that decision is due
- **Constraints** that are not open for discussion
- **What a useful answer looks like:** a recommendation, a comparison, a list of risks

A vague question produces a general answer. "Is my app slow?" is weaker than "Which stage of my LLM-based app should I measure first, given that responses take eight seconds and I have one week?"

## 3. Choose a model and an agent

A model on its own answers as a general technical advisor. An agent adds written instructions for its field, asks for the context it needs, and answers under fixed headings:

| Agent | Brings |
| --- | --- |
| Coding agent | A diagnosis from the error text, a proposed fix, and a test |
| Systems engineering agent | Options, trade-offs, and a rollback plan |
| AI agent | A baseline, ordered hypotheses, and an experiment design |
| Scientific research agent | A falsifiable hypothesis and threats to validity, without invented references |
| Information security agent | Threats ranked by severity and defensive controls, for systems you are authorised to examine |
| Technical planning agent | The smallest version that proves the idea, phases, and acceptance criteria |

The [Agents](/agents) page lists each one's limits. None of them can run code, browse, or open files.

## 4. Review the answer

Read the answer as you would read a colleague's draft:

1. Check which model wrote it; the label sits above every answer.
2. Separate what is stated as fact from what is inferred.
3. Press **Critical review** under the answer, or paste the text into the [Critique Lab](/lab).
4. Note what is missing, and ask a follow-up question.

Every review states which engine produced it: a language model when one is configured, or the rule-based reviewer, which detects missing structural elements but does not verify facts.

## Common first-consultation mistakes

- Asking several questions at once
- Pasting secrets or personal data
- Treating the first answer as final instead of as the start of a conversation

## Next steps

- [Model registry and status reference](/resources/model-registry)
- [Getting a second opinion: agents, models, and review](/resources/multi-agent-playbook)
- [Security, privacy, and data handling](/resources/security)`,
    },
    ar: {
      kicker: "دليل",
      title: "البدء باستشارتك الأولى",
      sub: "أنشئ حسابًا، وصُغ سؤالًا، واختر وكيلك الأول",
      description: "دليل خطوة بخطوة لإعداد استشارتك الأولى في هسّارة وإجرائها.",
      cta: "مستعد لجلستك الأولى؟",
      body: `تنجح الاستشارة الأولى حين يُنجَز الإعداد قبل أن تبدأ المحادثة. يمرّ بك هذا الدليل على أربع مراحل: الإعداد، والصياغة، والاختيار، والمراجعة.

## ١. جهّز حسابك

أنشئ حسابًا من [صفحة التسجيل](/login?mode=signup)، ثم من [ملفك الشخصي](/profile):

- **اختر نموذجًا مفضلًا.** يُختار تلقائيًا في كل استشارة جديدة، وتعرض صفحة [النماذج اللغوية](/models) النماذج المهيّأة على هذا الخادم.
- **قرّر بشأن المزوّدين الخارجيين.** أغلب النماذج تشغّلها جهات خارجية، وقبل أول رسالة إلى نموذج كهذا تطلب هسّارة موافقتك على إرسال نص الاستشارة إلى مزوّده. يمكنك سحب الموافقة في أي وقت.
- **أبعِد كل ما هو حساس.** تعمل هسّارة بالنص فقط في هذه النسخة؛ لا تلصق كلمات مرور أو مفاتيح أو بيانات شخصية لآخرين.

## ٢. صُغ السؤال

اكتب السؤال في جملة واحدة، ثم أضف:

- **القرار الذي يخدمه** وموعد اتخاذه
- **القيود** غير القابلة للنقاش
- **شكل الإجابة المفيدة:** توصية، أو مقارنة، أو قائمة مخاطر

السؤال المبهم ينتج إجابة عامة. «هل تطبيقي بطيء؟» أضعف من «أي مرحلة في تطبيقي المعتمد على نموذج لغوي أقيس أولًا، علمًا بأن الاستجابة تستغرق ثماني ثوانٍ ولديّ أسبوع واحد؟».

## ٣. اختر نموذجًا ووكيلًا

النموذج وحده يجيب بصفته مستشارًا تقنيًا عامًا. أما الوكيل فيضيف تعليمات مكتوبة لمجاله، ويطلب السياق الذي يحتاجه، ويجيب تحت عناوين ثابتة:

| الوكيل | ما يقدّمه |
| --- | --- |
| وكيل البرمجة | تشخيص من نص الخطأ، وإصلاح مقترح، واختبار |
| وكيل هندسة الأنظمة | بدائل ومقايضاتها، وخطة تراجع |
| وكيل الذكاء الاصطناعي | خط أساس، وفرضيات مرتّبة، وتصميم تجربة |
| وكيل البحث العلمي | فرضية قابلة للدحض وتهديدات الصدق، دون مراجع مختلَقة |
| وكيل أمن المعلومات | تهديدات مرتّبة بالخطورة وضوابط دفاعية، لأنظمة مصرَّح لك بفحصها |
| وكيل التخطيط التقني | أصغر نسخة تثبت الفكرة، ومراحل، ومعايير قبول |

تسرد صفحة [الوكلاء](/agents) حدود كلٍّ منهم، ولا يستطيع أيٌّ منهم تشغيل شفرة أو تصفّح الإنترنت أو فتح ملفات.

## ٤. راجِع الإجابة

اقرأ الإجابة كما تقرأ مسودة زميل:

1. تحقق من النموذج الذي كتبها؛ الوسم فوق كل إجابة.
2. افصل ما يُقدَّم على أنه حقيقة عمّا هو استنتاج.
3. اضغط **مراجعة نقدية** أسفل الإجابة، أو الصق النص في [مختبر النقد](/lab).
4. دوّن ما ينقص، واطرح سؤال متابعة.

كل مراجعة تذكر المحرك الذي أنتجها: نموذج لغوي إن كان مهيّأً، أو المراجع القاعدي الذي يكشف غياب العناصر البنيوية ولا يتحقق من صحة المعلومات.

## أخطاء شائعة في الاستشارة الأولى

- طرح عدة أسئلة دفعة واحدة
- لصق أسرار أو بيانات شخصية
- معاملة الإجابة الأولى على أنها نهائية بدل أنها بداية محادثة

## الخطوات التالية

- [سجل النماذج ومعاني الحالات](/resources/model-registry)
- [رأي ثانٍ: الوكلاء والنماذج والمراجعة](/resources/multi-agent-playbook)
- [الأمان والخصوصية والتعامل مع البيانات](/resources/security)`,
    },
  },
  {
    slug: "model-registry",
    en: {
      kicker: "Reference",
      title: "Model registry and status reference",
      sub: "What the registry shows about each model, and how to choose between them",
      description: "How HESSARA lists its AI models, what each status means, and guidance on choosing a model.",
      body: `The [Language Models](/models) page lists every model HESSARA can use. HESSARA does not train models of its own: it connects to models run by their providers, to a model on its own server, and to a demo engine that is not AI at all. This reference explains what the registry shows.

## What each entry shows

- **Provider and category:** cloud, local on the server, or demo.
- **Version:** the exact model identifier sent to the provider, when it is fixed in the catalogue or set by the operator. HESSARA does not guess a version.
- **Supported input:** text only in this version.
- **Cost:** quoted only where a source exists, with the date it was recorded.

## What each status means

| Status | Meaning |
| --- | --- |
| Ready | Configured, and the last call to it succeeded (a connection test or a consultation) |
| Configured, not yet tested | The key and version are set; no call has been recorded since the server started |
| Not configured | A key, version, or address is missing on the server, so the model cannot be chosen |
| Last test failed | The provider rejected or did not answer the last call; the reason is shown to signed-in users |
| Demo | The rule engine: it runs without keys, and its answers are prepared templates |

Signed-in users can run a connection test from a model's details. A test sends one very short request to the provider.

## Choosing a model

| If your question needs | Start with |
| --- | --- |
| Complex analysis, programming, multi-step tasks | Claude Opus 5.5 |
| Everyday consultations, balancing speed and capability | Claude Sonnet 5.5 |
| Quick questions and classification | Claude Haiku 5.5 |
| A model from another provider | GPT, Gemini, DeepSeek, Qwen, or Llama, if the operator has configured it |
| No cost per request, with the data kept on the server | The local model, if one is running |

These starting points come from each provider's own description, not from tests run by HESSARA. The note on [general and domain-tuned models](/insights/general-vs-domain-models) gives a broader framework.

## What the registry does not do

- It publishes no benchmarks: no documented comparison tests have been run.
- It does not route a question between models automatically. You choose, and you can switch models within a consultation.
- It does not ground answers in your documents.

## Evaluating a model for your use

1. Collect twenty to fifty real questions from your own work.
2. Write down what a good answer to each would contain.
3. Run each candidate model on the set and score the results.
4. Keep the set, and re-run it whenever a model or your data changes.

## For operators

Models are enabled by environment variables on the server, such as \`ANTHROPIC_API_KEY\`, \`OPENAI_API_KEY\` with \`OPENAI_MODEL\`, \`GEMINI_API_KEY\` with \`GEMINI_MODEL\`, or \`LOCAL_BASE_URL\` with \`LOCAL_MODEL\`. The project's README lists them all.

## Related

- [Getting started with your first consultation](/resources/getting-started)
- [Security, privacy, and data handling](/resources/security)`,
    },
    ar: {
      kicker: "مرجع",
      title: "سجل النماذج ومعاني الحالات",
      sub: "ما يعرضه السجل عن كل نموذج، وكيف تختار بينها",
      description: "كيف تعرض هسّارة نماذج الذكاء الاصطناعي، وماذا تعني كل حالة، وإرشادات لاختيار النموذج.",
      body: `تسرد صفحة [النماذج اللغوية](/models) كل نموذج تستطيع هسّارة استخدامه. لا تدرّب هسّارة نماذجها الخاصة؛ إنها تتصل بنماذج يشغّلها مزوّدوها، وبنموذج على خادمها، وبمحرك تجريبي ليس ذكاءً اصطناعيًا أصلًا. يشرح هذا المرجع ما يعرضه السجل.

## ما يعرضه كل نموذج

- **المزوّد والفئة:** سحابي، أو محلي على الخادم، أو تجريبي.
- **الإصدار:** معرّف النموذج الدقيق المرسَل إلى المزوّد، حين يكون مثبتًا في الفهرس أو يحدده مشغّل المنصة. لا تخمّن هسّارة إصدارًا.
- **المدخلات المدعومة:** نص فقط في هذه النسخة.
- **التكلفة:** تُذكر فقط حين يوجد مصدر، مع تاريخ تسجيلها.

## ماذا تعني كل حالة

| الحالة | المعنى |
| --- | --- |
| يعمل | مهيّأ، ونجح آخر استدعاء له (اختبار اتصال أو استشارة) |
| مهيّأ — لم يُختبر بعد | المفتاح والإصدار مضبوطان، ولم يُسجَّل أي استدعاء منذ بدء تشغيل الخادم |
| غير مهيّأ | ينقص الخادمَ مفتاحٌ أو إصدار أو عنوان، فلا يمكن اختيار النموذج |
| فشل آخر اختبار | رفض المزوّد آخر استدعاء أو لم يُجب عنه، ويظهر السبب للمستخدمين المسجَّلين |
| تجريبي | محرك القواعد: يعمل دون مفاتيح، وإجاباته قوالب معدّة سلفًا |

يستطيع المستخدم المسجَّل تشغيل اختبار اتصال من تفاصيل النموذج، ويرسل الاختبار طلبًا قصيرًا جدًا إلى المزوّد.

## اختيار النموذج

| إن كان سؤالك يحتاج | ابدأ بـ |
| --- | --- |
| تحليلًا معقدًا أو برمجة أو مهام متعددة الخطوات | Claude Opus 5.5 |
| استشارات يومية بتوازن بين السرعة والقدرة | Claude Sonnet 5.5 |
| أسئلة سريعة وتصنيفًا | Claude Haiku 5.5 |
| نموذجًا من مزوّد آخر | GPT أو Gemini أو DeepSeek أو Qwen أو Llama، إن هيّأه مشغّل المنصة |
| بلا تكلفة لكل طلب، مع بقاء البيانات على الخادم | النموذج المحلي، إن كان يعمل |

هذه نقاط بداية مأخوذة من وصف كل مزوّد لنموذجه، لا من اختبارات أجرتها هسّارة. وتقدّم مذكرة [النموذج العام والنموذج المضبوط لمجال](/insights/general-vs-domain-models) إطارًا أوسع.

## ما لا يفعله السجل

- لا ينشر مقاييس أداء؛ إذ لم تُجرَ اختبارات مقارنة موثّقة.
- لا يوزّع السؤال بين النماذج آليًا. أنت تختار، ويمكنك تبديل النموذج داخل الاستشارة.
- لا يربط الإجابات بوثائقك.

## تقييم نموذج لاستخدامك

1. اجمع من عشرين إلى خمسين سؤالًا حقيقيًا من عملك.
2. دوّن ما ينبغي أن تحتويه الإجابة الجيدة عن كلٍّ منها.
3. شغّل كل نموذج مرشّح على المجموعة وقيّم النتائج.
4. احتفظ بالمجموعة، وأعد تشغيلها كلما تغيّر نموذج أو تغيّرت بياناتك.

## لمشغّلي المنصة

تُفعَّل النماذج بمتغيرات بيئة على الخادم، مثل \`ANTHROPIC_API_KEY\`، و\`OPENAI_API_KEY\` مع \`OPENAI_MODEL\`، و\`GEMINI_API_KEY\` مع \`GEMINI_MODEL\`، و\`LOCAL_BASE_URL\` مع \`LOCAL_MODEL\`. ويسردها ملف README في المشروع كاملة.

## ذو صلة

- [البدء باستشارتك الأولى](/resources/getting-started)
- [الأمان والخصوصية والتعامل مع البيانات](/resources/security)`,
    },
  },
  {
    slug: "multi-agent-playbook",
    en: {
      kicker: "Playbook",
      title: "Getting a second opinion: agents, models, and review",
      sub: "Roles, hand-offs, and review points for a structured check of an important answer",
      description: "A playbook for testing an important answer on HESSARA with a second agent or model and the Critique Lab, from brief to decision record.",
      body: `HESSARA runs one agent per consultation; it does not stage a debate between agents automatically. For an important decision you can still build a structured second opinion by hand. This playbook sets out the roles, the sequence, and the points at which you should step in.

## When to use it

Use it for decisions with real tension: competing goals, uncertain outcomes, or a costly mistake. For routine questions, one consultation and a quick review are enough. The reasoning is set out in [How multi-agent deliberation changes the shape of a strategy review](/insights/multi-agent-deliberation).

## Roles

| Role | Responsibility |
| --- | --- |
| You | Own the question, the constraints, and the final decision |
| First agent | Answers within its field, under its fixed headings |
| Second agent or model | Answers the same brief independently, from a different angle |
| Critique Lab | Tests each answer against stated criteria |

## The sequence

### 1. Brief

Write the question in one sentence with its constraints, and keep the text: you will paste the same brief twice.

### 2. Independent answers

Start two consultations with the same brief: for example the Systems engineering agent and then the Information security agent, or the same agent with two different models. Do not show either answer to the other.

### 3. Challenge

In each consultation, ask: what would have to be true for the opposite recommendation to be right?

### 4. Review

Run a critical review on each final answer. Use the mode that fits the risk, or the Structured judge with your own criteria, and compare the revised versions word by word.

### 5. Decision

You decide. Record the decision, the reasons, and the conditions under which you would revisit it. Export both consultations if you need a record.

## Review points

Stop and read carefully at three moments:

- **After the brief:** is this the real question?
- **After the independent answers:** do they differ for substantive reasons?
- **Before the decision:** have you checked the claims you are relying on?

## Signs it is going wrong

- Both answers agree at once, on the first pass
- The discussion drifts from the question in the brief
- Claims appear with no way to check them
- The final plan reads as a compromise that neither answer argued for

## Related

- [Getting started with your first consultation](/resources/getting-started)
- [Model registry and status reference](/resources/model-registry)`,
    },
    ar: {
      kicker: "دليل عملي",
      title: "رأي ثانٍ: الوكلاء والنماذج والمراجعة",
      sub: "الأدوار والتسليم ونقاط المراجعة لفحص منظّم لإجابة مهمة",
      description: "دليل عملي لاختبار إجابة مهمة في هسّارة بوكيل أو نموذج ثانٍ وبمختبر النقد، من الموجز إلى سجل القرار.",
      body: `تشغّل هسّارة وكيلًا واحدًا في كل استشارة، ولا تُجري مناظرة آلية بين الوكلاء. ومع ذلك تستطيع في القرار المهم أن تبني رأيًا ثانيًا منظمًا بنفسك. يحدد هذا الدليل الأدوار والتسلسل والمواضع التي ينبغي أن تتدخل فيها.

## متى تستخدمه

استخدمه للقرارات التي تحمل توترًا حقيقيًا: أهداف متنافسة، أو نتائج غير مؤكدة، أو خطأ مكلف. أما الأسئلة الروتينية فتكفيها استشارة واحدة ومراجعة سريعة. وتجد الحجة وراء ذلك في مقالة [كيف تغيّر المداولة متعددة الوكلاء شكل المراجعة الاستراتيجية](/insights/multi-agent-deliberation).

## الأدوار

| الدور | المسؤولية |
| --- | --- |
| أنت | تملك السؤال والقيود والقرار النهائي |
| الوكيل الأول | يجيب ضمن مجاله وتحت عناوينه الثابتة |
| وكيل أو نموذج ثانٍ | يجيب عن الموجز نفسه مستقلًا ومن زاوية مختلفة |
| مختبر النقد | يختبر كل إجابة بمعايير معلنة |

## التسلسل

### ١. الموجز

اكتب السؤال في جملة واحدة مع قيوده، واحتفظ بالنص؛ ستلصق الموجز نفسه مرتين.

### ٢. إجابات مستقلة

ابدأ استشارتين بالموجز نفسه: مثلًا وكيل هندسة الأنظمة ثم وكيل أمن المعلومات، أو الوكيل نفسه بنموذجين مختلفين. لا تعرض أيًّا من الإجابتين على الأخرى.

### ٣. التحدي

اسأل في كل استشارة: ما الذي يجب أن يكون صحيحًا لتكون التوصية المعاكسة هي الصائبة؟

### ٤. المراجعة

شغّل مراجعة نقدية على كل إجابة نهائية، بالنمط الملائم للمخاطر أو بـ«المحكّم المنظّم» مع معاييرك الخاصة، وقارن النسختين المنقّحتين كلمةً بكلمة.

### ٥. القرار

القرار لك. دوّن القرار وأسبابه والشروط التي ستعيد فيها النظر فيه، وصدّر الاستشارتين إن احتجت إلى سجل.

## نقاط المراجعة

توقّف واقرأ بعناية في ثلاث لحظات:

- **بعد الموجز:** هل هذا هو السؤال الحقيقي؟
- **بعد الإجابات المستقلة:** هل تختلفان لأسباب جوهرية؟
- **قبل القرار:** هل تحققت من الادعاءات التي تعتمد عليها؟

## علامات أن المسار ينحرف

- تتفق الإجابتان فورًا من المحاولة الأولى
- يبتعد النقاش عن السؤال الوارد في الموجز
- تظهر ادعاءات لا سبيل إلى التحقق منها
- تبدو الخطة النهائية حلًا وسطًا لم تدافع عنه أيٌّ من الإجابتين

## ذو صلة

- [البدء باستشارتك الأولى](/resources/getting-started)
- [سجل النماذج ومعاني الحالات](/resources/model-registry)`,
    },
  },
  {
    slug: "security",
    en: {
      kicker: "Policy",
      title: "Security, privacy, and data handling",
      sub: "What the system actually does with your data, and what it does not yet do",
      description: "How HESSARA stores and protects account data and consultations, what is sent to model providers, and the limits of these measures.",
      note: "HESSARA is a university graduation project. This page describes controls implemented in its code; it is not a certification or an audited statement.",
      body: `Consultations can contain sensitive material. This page describes what HESSARA does with it, based on the controls in its code. The [Privacy Policy](/privacy) covers personal data in more detail.

## What is stored

- Your name, your email address, and a password hash (scrypt with a random salt for each password). The password itself is never stored.
- The text of your consultations, the answers, reviews, favourites, and preferences.
- Session tokens, stored only as hashes. The session cookie cannot be read by JavaScript.

Data stays in the platform's database until you delete a consultation or your account. Deleting the account removes its data.

## What leaves the platform

- **Model providers.** When you choose a model run by a third party, the consultation's text and conversation history are sent to that provider and processed under its policies. HESSARA asks for your explicit consent before the first such message. Your name and email address are not sent.
- **The demo engine and the rule-based reviewer** run on the platform's server and send nothing out.
- **Video thumbnails** load directly from YouTube when you open the media library.

## Protections in the code

- Requests that change data must come from the site's own origin.
- A content security policy limits scripts and connections to the site itself.
- Request bodies are size-limited, and after repeated failed sign-ins an account's email is blocked for fifteen minutes.
- Every consultation is visible only to the account that owns it.

## Questions to settle before you rely on any platform

| Topic | Question | HESSARA's answer |
| --- | --- | --- |
| Storage | Where is data stored? | In the database of whoever operates the deployment; the code does not fix a location |
| Retention | How long is data kept? | Until you delete it; there is no automatic expiry |
| Training | Is your data used to train models? | HESSARA trains no models; each provider's API terms govern what is sent to it |
| Access | Who can reach your data? | You, after signing in, and the operator with access to the database |
| Encryption | How is data protected? | HTTPS in transit when deployed behind TLS; protection at rest depends on the database host |
| Incidents | How are users told of an incident? | No formal process exists yet |

## Your part

- Paste only the text a question needs: never passwords, keys, or other people's personal data.
- Withdraw consent for external providers in your profile if you no longer want text sent out.
- Treat exported consultations as confidential documents.

## Reporting a concern

If you believe you have found a security issue, please use the [contact page](/contact).

## Related

- [Privacy Policy](/privacy)
- [Terms & Usability](/terms)`,
    },
    ar: {
      kicker: "سياسة",
      title: "الأمان والخصوصية والتعامل مع البيانات",
      sub: "ما يفعله النظام فعلًا ببياناتك، وما لا يفعله بعد",
      description: "كيف تخزّن هسّارة بيانات الحساب والاستشارات وتحميها، وما الذي يُرسَل إلى مزوّدي النماذج، وحدود هذه الإجراءات.",
      note: "هسّارة مشروع تخرج جامعي. تصف هذه الصفحة ضوابط منفّذة في شفرتها، وليست شهادة اعتماد ولا بيانًا مدقَّقًا.",
      body: `قد تحتوي الاستشارات على مواد حساسة. تصف هذه الصفحة ما تفعله هسّارة بها استنادًا إلى الضوابط الموجودة في شفرتها، وتتناول [سياسة الخصوصية](/privacy) البيانات الشخصية بتفصيل أكبر.

## ما يُخزَّن

- اسمك وبريدك الإلكتروني وتجزئة لكلمة المرور (scrypt بملح عشوائي لكل كلمة مرور)، ولا تُخزَّن كلمة المرور نفسها أبدًا.
- نصوص استشاراتك وإجاباتها والمراجعات والمفضلات والتفضيلات.
- رموز الجلسات، وتُخزَّن تجزئاتها فقط، ولا يستطيع JavaScript قراءة ملف ارتباط الجلسة.

تبقى البيانات في قاعدة بيانات المنصة حتى تحذف الاستشارة أو الحساب، وحذف الحساب يزيل بياناته.

## ما يغادر المنصة

- **مزوّدو النماذج.** حين تختار نموذجًا تشغّله جهة خارجية يُرسَل نص الاستشارة وسجل محادثتها إلى ذلك المزوّد ويُعالَج وفق سياساته. تطلب هسّارة موافقتك الصريحة قبل أول رسالة من هذا النوع، ولا يُرسَل اسمك ولا بريدك.
- **المحرك التجريبي والمراجع القاعدي** يعملان على خادم المنصة ولا يرسلان شيئًا إلى الخارج.
- **الصور المصغّرة للفيديوهات** تُحمَّل من يوتيوب مباشرة عند فتح مكتبة الميديا.

## الحماية في الشفرة

- الطلبات التي تغيّر البيانات يجب أن تأتي من أصل الموقع نفسه.
- سياسة أمان المحتوى تقصر السكربتات والاتصالات على الموقع نفسه.
- أجسام الطلبات محدودة الحجم، وبعد محاولات دخول فاشلة متكررة يُحظر بريد الحساب خمس عشرة دقيقة.
- لا يرى أي استشارة إلا الحساب الذي يملكها.

## أسئلة تحسمها قبل الاعتماد على أي منصة

| الموضوع | السؤال | إجابة هسّارة |
| --- | --- | --- |
| التخزين | أين تُخزَّن البيانات؟ | في قاعدة بيانات من يشغّل النسخة المنشورة؛ الشفرة لا تحدد موقعًا |
| الاحتفاظ | كم تُحفظ البيانات؟ | حتى تحذفها؛ لا انتهاء تلقائي |
| التدريب | هل تُستخدم بياناتك لتدريب النماذج؟ | لا تدرّب هسّارة أي نموذج، وشروط واجهة كل مزوّد تحكم ما يُرسَل إليه |
| الوصول | من يصل إلى بياناتك؟ | أنت بعد تسجيل الدخول، ومشغّل المنصة الذي يصل إلى قاعدة البيانات |
| التشفير | كيف تُحمى البيانات؟ | HTTPS أثناء النقل حين تُنشر خلف TLS، والحماية أثناء التخزين تعتمد على مستضيف قاعدة البيانات |
| الحوادث | كيف يُبلَّغ المستخدمون بحادثة؟ | لا توجد إجراءات رسمية بعد |

## دورك

- الصق النص الذي يحتاجه السؤال فقط، ولا تلصق كلمات مرور أو مفاتيح أو بيانات شخصية لآخرين.
- اسحب موافقتك على المزوّدين الخارجيين من ملفك الشخصي إن لم تعد تريد إرسال النصوص.
- عامل الاستشارات المصدَّرة معاملة الوثائق السرية.

## الإبلاغ عن مشكلة

إن ظننت أنك وجدت مشكلة أمنية، فاستخدم [صفحة التواصل](/contact).

## ذو صلة

- [سياسة الخصوصية](/privacy)
- [شروط الاستخدام](/terms)`,
    },
  },
];

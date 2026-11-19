// قسم «الموارد»: أُعيدت كتابة الوثائق الأربع الأولى لتصف المنصة كما هي فعلًا. النسخ المرجعية كانت تصف
// نماذج وأدوارًا ومداولة جماعية وإسنادًا بالوثائق غير موجودة في هسّارة. الخامسة نظرة تقنية في بناء المنصة،
// والسادسة قائمة قراءة من مصادر أولية، والسابعة مصادر عربية من جهات رسمية ودولية.
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
| A model from another provider | GPT, GPT-OSS, Gemini, DeepSeek, Qwen, or Llama, if the operator has configured it |
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
| نموذجًا من مزوّد آخر | GPT أو GPT-OSS أو Gemini أو DeepSeek أو Qwen أو Llama، إن هيّأه مشغّل المنصة |
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
  {
    // وثيقة تقنية للجنة التقييم ولمن يريد أن يعرف ما وراء الواجهة. حلّت محل صفحة «المنصة» التسويقية (٢٠٢٦-١١-١٩)،
    // وكل ما فيها مأخوذ من الشيفرة كما هي: إن تغيّر جزء في الشيفرة فليتغيّر هنا.
    slug: "how-hessara-is-built",
    en: {
      kicker: "Technical overview",
      title: "How HESSARA is built",
      sub: "Architecture, models, agents, review, data, security and testing, as implemented",
      description: "A technical overview of how HESSARA is built: the model layer, the agents, critical review, data handling, security and testing.",
      note: "This document describes the code as it stands. Where a part depends on something outside the project, such as provider credit, it says so.",
      body: `HESSARA is one web application that serves both the public pages and the consulting workspace, in Arabic and English from the same pages.

## Building blocks

| Layer | What it uses |
| --- | --- |
| Web application | Next.js (App Router) and React, rendered on the server |
| Hosting | Vercel |
| Database | PostgreSQL (Neon) in production; SQLite on a local machine |
| Model access | The provider's own key when it is set, otherwise the Vercel AI Gateway |
| Languages | Arabic from right to left and English from left to right, on the same pages |

## The model layer

- One interface over models from several providers, listed in the [model registry](/resources/model-registry) with their real status: ready, configured but untested, last test failed, or not configured.
- Every answer is labelled with the model that wrote it.
- A demo engine answers when no real model is confirmed working, and each of its answers says so.
- A daily limit for each user, and one shared daily cap for the whole platform, keep the cost of real model calls bounded.
- Optional voice input: a recording of up to two minutes is turned into text by a speech-to-text service (Whisper on Groq), and the user reviews the text before sending. The recording is not stored, and it has its own consent and daily limits.

## Agents

Each of the six agents is a written playbook on top of a general model, not a separately trained model. It has instructions for its field, an intake form that asks for what the field needs, a fixed answer structure, stated limits and a default review mode. No agent has external tools in this version. See the [multi-agent playbook](/resources/multi-agent-playbook).

## Critical review

- Six review modes: technical critic, evidence checker, risk analyst, logic reviewer, delivery reviewer, and structured judge.
- The structured judge uses the Jev evaluation model from TypeSafe AI when it is available. The other modes use a language model when one is available, and a rule-based reviewer otherwise. Each review states which engine produced it.
- Findings are ranked by severity, and a revised version can be compared with the original word by word.

## Data and privacy

- Stored: name, email, a password hash, consultations, answers, reviews, favourites and preferences.
- Passwords are hashed with scrypt, and session tokens are random and stored hashed.
- Each user can download all their data, or delete the account together with its consultations.
- Contact-form messages (an optional name, the email and the message) are kept apart from accounts, read only by the project owner, and deleted after a year.
- Visit counts keep no visitor identifier, and the statistics page shows aggregate numbers only. Details are in [Security, privacy, and data handling](/resources/security).

## Security

- Session cookies are HttpOnly and SameSite=Lax, and requests that change data are refused when they come from another origin.
- Every page is sent with a Content-Security-Policy and with nosniff and frame headers.
- Sign-in, sign-up, account deletion and the contact form are rate-limited, with the counters shared in the database.
- Read-only share links use random tokens, and the owner can revoke them at any time.

## Testing

- Unit tests for the database layer, limits, providers, review engines and content, on Node's built-in test runner.
- An end-to-end suite that drives the site in a real browser: sign-up, consultation, review, sharing, privacy checks, automated accessibility checks with axe, and no horizontal scrolling on phone, tablet and desktop.
- On every change, continuous integration runs the unit tests on Node 22 and 26, and the end-to-end suite on Chromium, Firefox and WebKit.

## Known limits

- Answers come from the demo engine until a real model is confirmed working.
- Text only: no file uploads, browsing or code execution.
- Reviews check structure and stated criteria; they do not verify facts.

## Related

- [About HESSARA](/about)
- [Getting started](/resources/getting-started)`,
    },
    ar: {
      kicker: "نظرة تقنية",
      title: "كيف بُنيت هسّارة",
      sub: "البنية والنماذج والوكلاء والمراجعة والبيانات والأمان والاختبار، كما هي في الشيفرة",
      description: "نظرة تقنية في بناء هسّارة: طبقة النماذج، والوكلاء، والمراجعة النقدية، والتعامل مع البيانات، والأمان، والاختبار.",
      note: "تصف هذه الوثيقة الشيفرة كما هي. وحيث يعتمد جزء على شيء خارج المشروع، كرصيد المزوّدين، تقول ذلك.",
      body: `هسّارة تطبيق ويب واحد يقدّم الصفحات العامة ومساحة الاستشارة معًا، بالعربية والإنجليزية من الصفحات نفسها.

## المكوّنات الأساسية

| الطبقة | ما تستخدمه |
| --- | --- |
| تطبيق الويب | Next.js (موجّه التطبيق) و React، مع العرض من الخادم |
| الاستضافة | Vercel |
| قاعدة البيانات | PostgreSQL (Neon) في الإنتاج، و SQLite على الجهاز المحلي |
| الوصول إلى النماذج | مفتاح المزوّد مباشرة متى ضُبط، وإلا بوابة Vercel للذكاء الاصطناعي |
| اللغتان | العربية من اليمين والإنجليزية من اليسار، في الصفحات نفسها |

## طبقة النماذج

- واجهة واحدة لنماذج من عدة مزوّدين، مدرجة في [سجل النماذج](/resources/model-registry) بحالتها الفعلية: يعمل، أو مهيّأ لم يُختبر، أو فشل آخر اختبار، أو غير مهيّأ.
- كل إجابة موسومة باسم النموذج الذي كتبها.
- يجيب محرك تجريبي حين لا يوجد نموذج حقيقي مؤكَّد العمل، وكل إجابة منه تقول ذلك.
- حد يومي لكل مستخدم، وسقف يومي واحد للمنصة كلها، يُبقيان كلفة استدعاء النماذج الحقيقية محدودة.
- إدخال صوتي اختياري: تسجيل حتى دقيقتين تحوّله خدمة لتحويل الكلام إلى نص (Whisper لدى Groq)، ويراجع المستخدم النص قبل الإرسال. لا يُحفظ التسجيل، وله موافقة وحدود يومية خاصة به.

## الوكلاء

كل وكيل من الستة دليل عمل مكتوب فوق نموذج عام، لا نموذج مدرَّب على حدة. لكلٍّ منهم تعليمات لمجاله، ونموذج إدخال يطلب ما يحتاجه المجال، وبنية إجابة ثابتة، وحدود معلنة، ونمط مراجعة افتراضي. ولا يملك أي وكيل أدوات خارجية في هذه النسخة. انظر [دليل الوكلاء المتعددين](/resources/multi-agent-playbook).

## المراجعة النقدية

- ستة أنماط مراجعة: الناقد التقني، ومدقق الأدلة، ومحلل المخاطر، والمراجع المنطقي، ومراجع التنفيذ، والمحكّم المنظّم.
- يحكم المحكّم المنظّم بنموذج التقييم Jev من TypeSafe AI حين يتاح. وتعمل بقية الأنماط بنموذج لغوي إن وُجد، وإلا بالمراجع القاعدي. وكل مراجعة تذكر المحرك الذي أنتجها.
- الملاحظات مرتّبة بالخطورة، ويمكن مقارنة النسخة المنقّحة بالأصل كلمةً بكلمة.

## البيانات والخصوصية

- ما يُخزَّن: الاسم والبريد وكلمة مرور مجزّأة، والاستشارات والإجابات والمراجعات والمفضلات والتفضيلات.
- كلمات المرور مجزّأة بـ scrypt، ورموز الجلسات عشوائية وتُخزَّن مجزّأة.
- يستطيع كل مستخدم تنزيل بياناته كلها، أو حذف حسابه مع استشاراته.
- رسائل نموذج «تواصل معنا» (الاسم اختياريًا، والبريد، والنص) منفصلة عن الحسابات، يقرؤها صاحب المشروع وحده، وتُحذف بعد سنة.
- عدّاد الزيارات لا يحفظ أي معرّف للزائر، وصفحة الإحصاءات تعرض أعدادًا مجمّعة فقط. التفاصيل في [الأمان والخصوصية والتعامل مع البيانات](/resources/security).

## الأمان

- ملفات ارتباط الجلسة HttpOnly و SameSite=Lax، والطلبات التي تغيّر البيانات تُرفض إن جاءت من أصل آخر.
- تُرسل كل صفحة بسياسة أمان المحتوى (Content-Security-Policy) وبترويستي nosniff ومنع التأطير.
- الدخول والتسجيل وحذف الحساب ونموذج التواصل محدودة المحاولات، وعدّاداتها مشتركة في قاعدة البيانات.
- روابط المشاركة للقراءة فقط برموز عشوائية، ويستطيع صاحب الاستشارة إيقافها متى شاء.

## الاختبار

- اختبارات وحدة لطبقة البيانات والحدود والمزوّدين ومحركات المراجعة والمحتوى، بمشغّل الاختبارات المدمج في Node.
- مجموعة اختبارات شاملة تقود الموقع في متصفح حقيقي: التسجيل، والاستشارة، والمراجعة، والمشاركة، وفحوص الخصوصية، وفحص سهولة الوصول الآلي بأداة axe، وغياب التمرير الأفقي على الهاتف واللوحي والحاسب.
- مع كل تعديل يشغّل التكامل المستمر اختبارات الوحدة على Node 22 و 26، والاختبارات الشاملة على Chromium و Firefox و WebKit.

## الحدود المعروفة

- الإجابات من المحرك التجريبي إلى أن يُتأكد من عمل نموذج حقيقي.
- النص فقط: لا رفع ملفات ولا تصفّح ولا تنفيذ شفرة.
- المراجعات تفحص البنية والمعايير المعلنة، ولا تتحقق من صحة المعلومات.

## ذو صلة

- [عن هسّارة](/about)
- [البدء](/resources/getting-started)`,
    },
  },
  {
    // قائمة قراءة من مصادر أولية: كل رابط يقود إلى منشور صاحبه أو إلى arXiv. تحقّقنا من وجود كل مصدر وعنوانه
    // وتاريخه في ١٩ نوفمبر ٢٠٢٦. الوصف المرافق يلخّص ما في المصدر نفسه، لا رأي هسّارة فيه.
    slug: "ai-labs-reading-list",
    en: {
      kicker: "Reading list",
      title: "Selected reading from AI labs",
      sub: "Primary sources from Google, OpenAI, Anthropic, DeepSeek, Moonshot AI, Alibaba and others",
      description: "Papers, guides and frameworks published by the companies and institutions that build or assess today's AI models, each linked to its original source.",
      note: "These are external links to their owners' sites or to arXiv, mostly in English. Each source and its title were checked on 19 November 2026; pages can move or change after that date. HESSARA has no affiliation with these organisations.",
      body: `This list gathers primary material from the organisations that build or assess today's AI models. Each entry links to the original publication. The items were chosen because they explain how models work, how to build with them, or how to judge their risks. The insights articles on this site cite several of them.

## Google and Google DeepMind

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) (2017). The paper that introduced the Transformer, the architecture behind today's large language models.
- [Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903) (2022). Shows that a few worked, step-by-step examples in a prompt improve reasoning in large models.
- [Gemini 2.5: Pushing the Frontier with Advanced Reasoning, Multimodality, Long Context, and Next Generation Agentic Capabilities](https://arxiv.org/abs/2507.06261) (2025). Technical report on the Gemini 2.5 family, including its safety evaluations.
- [Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies). Practical guidance on instructions, examples, constraints and structured output.

## OpenAI

- [Why language models hallucinate](https://openai.com/index/why-language-models-hallucinate/) (2025). Argues that training and evaluation reward guessing over admitting uncertainty, and proposes scoring that penalises confident errors.
- [A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf) (2025). When an agent is worth building, its components, single- and multi-agent designs, and guardrails.
- [Optimizing LLM Accuracy](https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy). How to choose between prompting, retrieval and fine-tuning, starting with prompting.
- [GPT-4 Technical Report](https://arxiv.org/abs/2303.08774) (2023). Capabilities, limitations and safety work for GPT-4.

## Anthropic (Claude)

- [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) (2024). Favours simple, composable patterns, and separates fixed workflows from autonomous agents.
- [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) (2025). Lessons from a lead agent that coordinates sub-agents working in parallel.
- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (2025). Keeping what a model sees small and relevant over long tasks.
- [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval) (2024). Adding context to document chunks before indexing them, to reduce retrieval failures.
- [Introducing Citations on the Anthropic API](https://www.anthropic.com/news/introducing-citations-api) (2025). Answers that point to the exact sentences and passages they rely on.
- [Constitutional AI: Harmlessness from AI Feedback](https://arxiv.org/abs/2212.08073) (2022). Training a model against a written list of principles, with AI feedback in place of human labels for harmfulness.
- [Tracing the thoughts of a large language model](https://www.anthropic.com/research/tracing-thoughts-language-model) (2025). Interpretability research that traces part of a model's internal computation, with its limits stated.

## DeepSeek

- [DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning](https://arxiv.org/abs/2501.12948) (2025). Reasoning developed through reinforcement learning without human-written reasoning examples; later published in [Nature](https://doi.org/10.1038/s41586-025-09422-z).
- [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437) (2024). A mixture-of-experts model with 671 billion parameters, 37 billion of them active for each token, and the details of its training.

## Moonshot AI (Kimi)

- [Kimi k1.5: Scaling Reinforcement Learning with LLMs](https://arxiv.org/abs/2501.12599) (2025). Scaling reinforcement learning with long context, without tree search or value functions.
- [Kimi K2: Open Agentic Intelligence](https://arxiv.org/abs/2507.20534) (2025). An open mixture-of-experts model built for agentic tasks, with 32 billion active parameters.

## Alibaba (Qwen)

- [Qwen3 Technical Report](https://arxiv.org/abs/2505.09388) (2025). Open dense and mixture-of-experts models that combine a thinking and a non-thinking mode, with a budget for reasoning effort.
- [Qwen2.5 Technical Report](https://arxiv.org/abs/2412.15115) (2024). The previous Qwen generation, from 0.5 to 72 billion parameters.

## Meta

- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) (2020). The paper that introduced retrieval-augmented generation (RAG).
- [The Llama 3 Herd of Models](https://arxiv.org/abs/2407.21783) (2024). Open models of up to 405 billion parameters, released with a safety model for inputs and outputs.

## Microsoft

- [Can Generalist Foundation Models Outcompete Special-Purpose Tuning? Case Study in Medicine](https://arxiv.org/abs/2311.16452) (2023). How far prompting alone takes a general model in a specialised field.
- [Fine-Tuning or Retrieval? Comparing Knowledge Injection in LLMs](https://arxiv.org/abs/2312.05934) (2023). Retrieval outperformed unsupervised fine-tuning for adding knowledge to a model.

## Standards and independent references

- [Artificial Intelligence Risk Management Framework (AI RMF 1.0)](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf), NIST (2023). A voluntary framework built on four functions: govern, map, measure and manage.
- [Generative Artificial Intelligence Profile (NIST AI 600-1)](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf), NIST (2024). Risks specific to generative AI, such as confabulation, with suggested actions.
- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/). The main security risks in applications built on language models, starting with prompt injection.
- [The 2026 AI Index Report](https://hai.stanford.edu/ai-index/2026-ai-index-report), Stanford HAI. An annual, data-based account of progress in AI and its effects.

## Related

- [Trusted Arabic sources on AI](/resources/arabic-ai-sources): Arabic publications from official and international bodies.
- [Insights](/insights): four method notes that cite their sources.
- [Security, privacy, and data handling](/resources/security)`,
    },
    ar: {
      kicker: "قائمة قراءة",
      title: "قراءات مختارة من مختبرات الذكاء الاصطناعي",
      sub: "مصادر أولية من Google وOpenAI وAnthropic وDeepSeek وMoonshot AI وAlibaba وجهات أخرى",
      description: "أوراق وأدلة وأُطر نشرتها الشركات والجهات التي تبني نماذج الذكاء الاصطناعي اليوم أو تقيّمها، وكلٌّ منها مربوط بمصدره الأصلي.",
      note: "روابط خارجية إلى مواقع أصحابها أو إلى arXiv، وأغلبها بالإنجليزية. تحقّقنا من وجود كل مصدر وعنوانه في 19 نوفمبر 2026، وقد تنتقل الصفحات أو تتغير بعد ذلك. لا تربط هسّارة بهذه الجهات أي صلة.",
      body: `تجمع هذه القائمة مواد أولية من الجهات التي تبني نماذج الذكاء الاصطناعي اليوم أو تقيّمها، وكل عنصر فيها يقود إلى المنشور الأصلي. اختيرت لأنها تشرح كيف تعمل النماذج، أو كيف يُبنى بها، أو كيف تُقدَّر مخاطرها. وتستشهد مقالات «رؤى» في هذا الموقع بعدد منها.

## جوجل وجوجل ديب مايند (Google)

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) (2017). الورقة التي قدّمت بنية المحوِّل (Transformer)، وهي البنية التي تقوم عليها النماذج اللغوية الكبيرة اليوم.
- [Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903) (2022). تُظهر أن أمثلة قليلة محلولة خطوة بخطوة في الطلب تحسّن الاستدلال في النماذج الكبيرة.
- [Gemini 2.5: Pushing the Frontier with Advanced Reasoning, Multimodality, Long Context, and Next Generation Agentic Capabilities](https://arxiv.org/abs/2507.06261) (2025). التقرير التقني لعائلة Gemini 2.5، ومعه تقييمات السلامة.
- [Prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies). دليل عملي لصياغة التعليمات والأمثلة والقيود والمخرجات المنظّمة.

## أوبن إيه آي (OpenAI)

- [Why language models hallucinate](https://openai.com/index/why-language-models-hallucinate/) (2025). تحاجّ بأن التدريب والتقييم يكافئان التخمين أكثر من الاعتراف بعدم اليقين، وتقترح تقييمًا يعاقب الخطأ الواثق.
- [A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf) (2025). متى يستحق بناء وكيل، ومكوّناته، والفرق بين الوكيل الواحد وتعدد الوكلاء، وضوابط الحماية.
- [Optimizing LLM Accuracy](https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy). كيف تختار بين صياغة الطلبات والاسترجاع والضبط الدقيق، بدءًا بصياغة الطلبات.
- [GPT-4 Technical Report](https://arxiv.org/abs/2303.08774) (2023). قدرات GPT-4 وحدوده وأعمال السلامة عليه.

## أنثروبيك (Anthropic، مطوّرة Claude)

- [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) (2024). تفضّل الأنماط البسيطة القابلة للتركيب، وتميّز بين مسارات العمل الثابتة والوكلاء المستقلين.
- [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) (2025). دروس من وكيل قائد ينسّق وكلاء فرعيين يعملون بالتوازي.
- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (2025). كيف يبقى ما يراه النموذج صغيرًا وذا صلة في المهام الطويلة.
- [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval) (2024). إضافة سياق إلى مقاطع الوثائق قبل فهرستها لتقليل إخفاقات الاسترجاع.
- [Introducing Citations on the Anthropic API](https://www.anthropic.com/news/introducing-citations-api) (2025). إجابات تشير إلى الجمل والمقاطع التي استندت إليها.
- [Constitutional AI: Harmlessness from AI Feedback](https://arxiv.org/abs/2212.08073) (2022). تدريب النموذج على قائمة مكتوبة من المبادئ، بتقييم من نموذج بدل التصنيف البشري للضرر.
- [Tracing the thoughts of a large language model](https://www.anthropic.com/research/tracing-thoughts-language-model) (2025). بحث في التفسير يتتبّع جزءًا من الحسابات الداخلية لنموذج، مع بيان حدود الطريقة.

## ديب سيك (DeepSeek)

- [DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning](https://arxiv.org/abs/2501.12948) (2025). تطوير الاستدلال بالتعلم المعزَّز دون أمثلة استدلال يكتبها البشر، ونُشرت لاحقًا في مجلة [Nature](https://doi.org/10.1038/s41586-025-09422-z).
- [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437) (2024). نموذج من نوع «خليط الخبراء» بـ 671 مليار معامل، يعمل منها 37 مليارًا لكل رمز، مع تفاصيل تدريبه.

## مونشوت (Moonshot AI، مطوّرة Kimi)

- [Kimi k1.5: Scaling Reinforcement Learning with LLMs](https://arxiv.org/abs/2501.12599) (2025). توسيع التعلم المعزَّز مع سياق طويل، دون بحث شجري ولا دوال قيمة.
- [Kimi K2: Open Agentic Intelligence](https://arxiv.org/abs/2507.20534) (2025). نموذج مفتوح من نوع «خليط الخبراء» صُمّم للمهام الوكيلية، يعمل منه 32 مليار معامل.

## علي بابا (Alibaba، مطوّرة Qwen)

- [Qwen3 Technical Report](https://arxiv.org/abs/2505.09388) (2025). نماذج مفتوحة كثيفة ومن نوع «خليط الخبراء»، تجمع وضع التفكير ووضع الإجابة المباشرة، مع ميزانية لجهد الاستدلال.
- [Qwen2.5 Technical Report](https://arxiv.org/abs/2412.15115) (2024). الجيل السابق من Qwen، من 0.5 إلى 72 مليار معامل.

## ميتا (Meta)

- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) (2020). الورقة التي قدّمت التوليد المعزَّز بالاسترجاع (RAG).
- [The Llama 3 Herd of Models](https://arxiv.org/abs/2407.21783) (2024). نماذج مفتوحة حتى 405 مليارات معامل، صدرت مع نموذج سلامة لفحص المدخلات والمخرجات.

## مايكروسوفت (Microsoft)

- [Can Generalist Foundation Models Outcompete Special-Purpose Tuning? Case Study in Medicine](https://arxiv.org/abs/2311.16452) (2023). إلى أي حد تكفي صياغة الطلبات وحدها نموذجًا عامًا في مجال متخصص.
- [Fine-Tuning or Retrieval? Comparing Knowledge Injection in LLMs](https://arxiv.org/abs/2312.05934) (2023). الاسترجاع تفوّق على الضبط الدقيق غير الموجَّه في إضافة المعرفة إلى النموذج.

## معايير ومراجع مستقلة

- [Artificial Intelligence Risk Management Framework (AI RMF 1.0)](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf)، المعهد الوطني الأمريكي للمعايير NIST (2023). إطار طوعي يقوم على أربع وظائف: الحوكمة، والتحديد، والقياس، والإدارة.
- [Generative Artificial Intelligence Profile (NIST AI 600-1)](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)، NIST (2024). مخاطر خاصة بالذكاء الاصطناعي التوليدي، منها اختلاق المعلومات، مع إجراءات مقترحة.
- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/). أهم المخاطر الأمنية في التطبيقات المبنية على النماذج اللغوية، وأولها حقن التعليمات.
- [The 2026 AI Index Report](https://hai.stanford.edu/ai-index/2026-ai-index-report)، معهد ستانفورد للذكاء الاصطناعي المتمحور حول الإنسان (Stanford HAI). تقرير سنوي قائم على البيانات عن تقدّم الذكاء الاصطناعي وآثاره.

## ذو صلة

- [مصادر عربية موثوقة في الذكاء الاصطناعي](/resources/arabic-ai-sources): إصدارات عربية من جهات رسمية ودولية.
- [رؤى](/insights): أربع مذكرات منهجية تذكر مصادرها.
- [الأمان والخصوصية والتعامل مع البيانات](/resources/security)`,
    },
  },
  {
    slug: "arabic-ai-sources",
    en: {
      kicker: "Reading list",
      title: "Trusted Arabic sources on AI",
      sub: "Arabic publications from SDAIA, the United Nations, UNESCO and ESCWA",
      description: "Arabic documents on AI ethics and governance, generative AI, adoption and terminology from official and international bodies, each linked to its original source.",
      note: "External links to the publishers' sites, mostly PDF files in Arabic. Each link and its title were found in search results limited to the publisher's own site on 19 November 2026; files can move, and newer editions can appear after that date. HESSARA has no affiliation with these organisations.",
      body: `Most primary sources on AI are in English. This list gathers documents written in Arabic, or published officially in Arabic, by bodies that answer for what they publish: the Saudi Data and AI Authority (SDAIA), the United Nations, UNESCO, and the UN Economic and Social Commission for Western Asia (ESCWA). Most are PDF files in Arabic.

## Ethics and governance

- [AI Ethics Principles](https://sdaia.gov.sa/ar/SDAIA/about/Documents/ai-principles.pdf), SDAIA. The seven principles SDAIA uses as its reference for organisations in Saudi Arabia: fairness, privacy and security, humanity, social and environmental benefits, reliability and safety, transparency and explainability, and accountability and responsibility.
- [UNESCO Recommendation on the Ethics of Artificial Intelligence](https://unesdoc.unesco.org/ark:/48223/pf0000380455), UNESCO (2021). The first global standard on AI ethics, adopted by UNESCO's member states in November 2021. The Arabic text is available from the document's page by choosing the language.
- [Governing AI for Humanity](https://www.un.org/sites/un2.un.org/files/governing_ai_for_humanity_final_report_ar.pdf), United Nations (2024). Final report of the Secretary-General's High-level Advisory Body on AI, with seven recommendations to close gaps in international AI governance, among them an independent international scientific panel and a global policy dialogue.
- [AI biases: a reference guide](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/AR-AI-BIAS.pdf), SDAIA (first edition, 2026). A reference guide to the kinds of bias found in AI systems.
- [Deepfake principles](https://sdaia.gov.sa/ar/SDAIA/eParticipation/consulting/SDAIADeepfakesGuidelinesAr.pdf), SDAIA (2024). Proposed principles for using deepfake technology, published for public consultation.

## Generative AI

- [Generative AI principles for the public](https://sdaia.gov.sa/ar/SDAIA/about/Files/GenerativeAIPublicAR.pdf), SDAIA (2025). Written for the general public: the risks of generative AI tools and how to reduce them, including disclosing their use and keeping human oversight of their output.
- [Generative AI series (1)](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/Generative-AI.pdf), SDAIA (2023). Good practice in developing models, risks such as biased output, and the factors in choosing how to adopt generative AI, such as cost, security, privacy and output quality.
- [Generative AI: promising prospects for a better future](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/GenerativeAI.pdf), SDAIA (2025). An overview of generative AI and what it makes possible.
- [Generative AI in education](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/GenAIE.pdf), SDAIA (2023). Recommendations for educational institutions: define the purpose of using it in a course, require students to declare its use in assignments, and check its output rather than relying on it.
- [Foresight on the governance of artificial general intelligence](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/Foresight.pdf), SDAIA. The current state of, and outlook for, governing artificial general intelligence.

## Adoption and standards

- [AI Adoption Framework](https://sdaia.gov.sa/ar/SDAIA/about/Files/AIAdoptionFramework.pdf), SDAIA (2025). Guidance for government and private organisations on adopting AI.
- [Global AI standards: efforts and challenges](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D9%8A%D9%8A%D8%B1%20%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%85%D9%8A%D8%A9%20%D9%84%D9%84%D8%B0%D9%83%D8%A7%D8%A1%20%D8%A7%D9%84%D8%A7%D8%B5%D8%B7%D9%86%D8%A7%D8%B9%D9%8A.pdf), SDAIA (2023). International efforts to set standards for AI, and the challenges they face.
- [AI ethics: AI for executives series (3)](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/SDAIAPublications07.pdf), SDAIA (second edition). A short guide for decision-makers that summarises the principles of AI ethics.

## The Arab region

- [Is the Arab region missing the Fourth Industrial Revolution?](https://www.unescwa.org/sites/default/files/pubs/pdf/arab-region-missing-fourth-industrial-revoloution-arabic.pdf), ESCWA. How AI and other Fourth Industrial Revolution technologies affect jobs and skills in the Arab region.

## Terminology

- [Data and AI: an Arabic–English glossary](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/SDAIAPublications15.pdf), SDAIA with the King Salman Global Academy for Arabic Language (second edition, 2024). Standard Arabic terms for data and AI with their English equivalents; the second edition adds terms for generative AI.
- [SDAIA publications](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/Pages/SDAIAPublications.aspx). The full index of SDAIA's publications, including newer editions of the documents above.

## Related

- [Selected reading from AI labs](/resources/ai-labs-reading-list): primary sources, mostly in English.
- [How HESSARA is built](/resources/how-hessara-is-built)`,
    },
    ar: {
      kicker: "قائمة قراءة",
      title: "مصادر عربية موثوقة في الذكاء الاصطناعي",
      sub: "إصدارات عربية من سدايا والأمم المتحدة واليونسكو والإسكوا",
      description: "وثائق عربية في أخلاقيات الذكاء الاصطناعي وحوكمته، والذكاء الاصطناعي التوليدي، والتبنّي، والمصطلحات، من جهات رسمية ودولية، وكلٌّ منها مربوط بمصدره الأصلي.",
      note: "روابط خارجية إلى مواقع الجهات المصدِرة، وأغلبها ملفات PDF بالعربية. وُجد كل رابط وعنوانه في نتائج بحث مقصورة على موقع الجهة نفسها في 19 نوفمبر 2026، وقد تنتقل الملفات أو تصدر طبعات أحدث بعد ذلك. لا تربط هسّارة بهذه الجهات أي صلة.",
      body: `أغلب المصادر الأولية في الذكاء الاصطناعي بالإنجليزية. تجمع هذه القائمة وثائق كُتبت بالعربية أو نُشرت بها رسميًا، من جهات تُحاسَب على ما تنشر: الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)، والأمم المتحدة، واليونسكو، ولجنة الأمم المتحدة الاقتصادية والاجتماعية لغربي آسيا (الإسكوا). أغلبها ملفات PDF.

## الأخلاقيات والحوكمة

- [مبادئ أخلاقيات الذكاء الاصطناعي](https://sdaia.gov.sa/ar/SDAIA/about/Documents/ai-principles.pdf)، سدايا. المبادئ السبعة التي تعتمدها الهيئة مرجعًا للجهات في المملكة: النزاهة والإنصاف، والخصوصية والأمن، والإنسانية، والمنافع الاجتماعية والبيئية، والموثوقية والسلامة، والشفافية والقابلية للتفسير، والمساءلة والمسؤولية.
- [توصية اليونسكو بشأن أخلاقيات الذكاء الاصطناعي](https://unesdoc.unesco.org/ark:/48223/pf0000380455)، اليونسكو (2021). أول معيار عالمي لأخلاقيات الذكاء الاصطناعي، اعتمدته الدول الأعضاء في نوفمبر 2021. النص العربي متاح من صفحة الوثيقة باختيار اللغة.
- [حوكمة الذكاء الاصطناعي من أجل الإنسانية](https://www.un.org/sites/un2.un.org/files/governing_ai_for_humanity_final_report_ar.pdf)، الأمم المتحدة (2024). التقرير النهائي للهيئة الاستشارية الرفيعة المستوى المعنية بالذكاء الاصطناعي، وفيه سبع توصيات لسد ثغرات الحوكمة الدولية، منها فريق علمي دولي مستقل وحوار عالمي للسياسات.
- [تحيزات الذكاء الاصطناعي: دليل مرجعي](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/AR-AI-BIAS.pdf)، سدايا (النسخة الأولى، 2026). دليل مرجعي لأنواع التحيز في أنظمة الذكاء الاصطناعي.
- [مبادئ التزييف العميق](https://sdaia.gov.sa/ar/SDAIA/eParticipation/consulting/SDAIADeepfakesGuidelinesAr.pdf)، سدايا (2024). مبادئ مقترحة لاستخدام تقنيات التزييف العميق، طُرحت للاستشارة العامة.

## الذكاء الاصطناعي التوليدي

- [مبادئ الذكاء الاصطناعي التوليدي للعموم](https://sdaia.gov.sa/ar/SDAIA/about/Files/GenerativeAIPublicAR.pdf)، سدايا (2025). موجّهة للجمهور: مخاطر أدوات الذكاء الاصطناعي التوليدي وطرق تخفيفها، ومنها الإفصاح عن استخدامها والإشراف البشري على مخرجاتها.
- [سلسلة الذكاء الاصطناعي التوليدي (1)](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/Generative-AI.pdf)، سدايا (2023). أفضل الممارسات في تطوير النماذج، ومخاطر مثل تحيز المخرجات، وعوامل اختيار طريقة التبني كالتكلفة والأمن والخصوصية وجودة المخرجات.
- [الذكاء الاصطناعي التوليدي: آفاق واعدة لمستقبل أفضل](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/GenerativeAI.pdf)، سدايا (2025). نظرة عامة في الذكاء الاصطناعي التوليدي وما يتيحه.
- [الذكاء الاصطناعي التوليدي في التعليم](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/GenAIE.pdf)، سدايا (2023). توصيات للمؤسسات التعليمية: تحديد الهدف من استخدامه في المقرر، والتصريح باستخدامه في الواجبات، والتحقق من مخرجاته وعدم الاعتماد عليها.
- [استشراف حوكمة الذكاء الاصطناعي العام](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/Foresight.pdf)، سدايا. الوضع الحالي والتطلعات المستقبلية لحوكمة الذكاء الاصطناعي العام.

## التبنّي والمعايير

- [إطار تبني الذكاء الاصطناعي](https://sdaia.gov.sa/ar/SDAIA/about/Files/AIAdoptionFramework.pdf)، سدايا (2025). إطار إرشادي للجهات الحكومية والخاصة لتبني تقنيات الذكاء الاصطناعي.
- [معايير الذكاء الاصطناعي العالمية: جهود وتحديات](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D9%8A%D9%8A%D8%B1%20%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%85%D9%8A%D8%A9%20%D9%84%D9%84%D8%B0%D9%83%D8%A7%D8%A1%20%D8%A7%D9%84%D8%A7%D8%B5%D8%B7%D9%86%D8%A7%D8%B9%D9%8A.pdf)، سدايا (2023). الجهود الدولية لوضع معايير للذكاء الاصطناعي، وما تواجهه من تحديات.
- [أخلاقيات الذكاء الاصطناعي: سلسلة الذكاء الاصطناعي للتنفيذيين (3)](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/SDAIAPublications07.pdf)، سدايا (الطبعة الثانية). دليل مختصر لصنّاع القرار يلخّص مبادئ أخلاقيات الذكاء الاصطناعي.

## المنطقة العربية

- [أتُفوِّت المنطقة العربية قطار الثورة الصناعية الرابعة؟](https://www.unescwa.org/sites/default/files/pubs/pdf/arab-region-missing-fourth-industrial-revoloution-arabic.pdf)، الإسكوا. أثر الذكاء الاصطناعي وتقنيات الثورة الصناعية الرابعة في الوظائف والمهارات بالمنطقة العربية.

## المصطلحات

- [البيانات والذكاء الاصطناعي: معجم عربي إنجليزي](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/ResearchLibrary/SDAIAPublications15.pdf)، سدايا بالتعاون مع مجمع الملك سلمان العالمي للغة العربية (الطبعة الثانية، 2024). مصطلحات عربية موحّدة في البيانات والذكاء الاصطناعي ومقابلاتها الإنجليزية، وتضيف الطبعة الثانية مصطلحات الذكاء الاصطناعي التوليدي.
- [إصدارات سدايا](https://sdaia.gov.sa/ar/MediaCenter/KnowledgeCenter/Pages/SDAIAPublications.aspx). الفهرس الكامل لإصدارات الهيئة، وفيه الطبعات الأحدث من الوثائق أعلاه.

## ذو صلة

- [قراءات مختارة من مختبرات الذكاء الاصطناعي](/resources/ai-labs-reading-list): مصادر أولية أغلبها بالإنجليزية.
- [كيف بُنيت هسّارة](/resources/how-hessara-is-built)`,
    },
  },
];

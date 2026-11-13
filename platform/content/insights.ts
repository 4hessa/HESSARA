// قسم «رؤى»: أربع مقالات منهجية من الموقع المرجعي. النص الإنجليزي كما هو، مع ملاحظة توضّح
// ما لا تقدّمه هسّارة فعلًا من الأساليب الموصوفة، وترجمة عربية كاملة.
import type { Entry } from "./types";

export const INSIGHTS: Entry[] = [
  {
    slug: "multi-agent-deliberation",
    en: {
      kicker: "Research Note",
      title: "How multi-agent deliberation changes the shape of a strategy review",
      sub: "Where a council of specialist models helps, and where one careful analyst is still the better tool",
      description: "When several specialist AI models argue a question from different positions, the review changes shape. A look at where that helps and where it does not.",
      note: "HESSARA runs one agent per consultation; it does not stage a debate between agents automatically. The method below can be applied by running the same brief in separate consultations and comparing the answers.",
      body: `A strategy review usually has one voice. Someone writes the paper, others react to it, and the paper's framing quietly decides which objections are ever raised. Multi-agent deliberation changes that starting point: several specialist models are given the same brief and asked to argue it from different positions before anyone writes a conclusion.

## What actually changes

The value is not that more models produce more text. It is that disagreement appears early, while it is still cheap to act on.

- **Assumptions are stated, not implied.** A strategist model and a risk model asked the same question will rest on different premises. Placing their answers side by side exposes the premises.
- **Objections arrive before commitment.** In a single-author review, the strongest objection often surfaces in the meeting, after positions have hardened.
- **The record is richer.** A deliberation leaves behind who argued what and why. That is more useful six months later than a polished recommendation.

## Where it helps

Deliberation earns its cost when the question has real tension in it: growth against resilience, speed against control, one market against another. It also helps when the people deciding hold different views and need those views represented fairly rather than averaged away.

## Where it does not

Many questions have no tension worth staging. If the task is to summarise a contract, reconcile figures, or check a calculation, a council adds delay and the appearance of rigour without the substance. A single careful pass, checked by a person, is the better tool.

There is a second limit. Models that share training data and a brief can agree for the wrong reasons. Three confident answers that rest on the same unexamined assumption are one answer, not three. Agreement between agents is weak evidence unless they were given different information or different roles.

## A working pattern

1. **Frame the question in one sentence** and list the constraints that are not negotiable.
2. **Assign roles that genuinely conflict.** A strategist, a risk voice, and a systems voice will disagree about different things.
3. **Ask for positions before discussion,** so that later convergence can be seen for what it is.
4. **Have a person decide.** The deliberation informs the decision. It does not make it.

> A council is worth convening when you would otherwise hear only one side of an argument you need to have.

## What to take away

Use deliberation for decisions with real tension, keep it away from routine analysis, and treat agreement between agents with the same suspicion you would apply to agreement in a room where everyone read the same briefing.`,
    },
    ar: {
      kicker: "مذكرة بحثية",
      title: "كيف تغيّر المداولة متعددة الوكلاء شكل المراجعة الاستراتيجية",
      sub: "أين يفيد مجلس من النماذج المتخصصة، وأين يبقى محلل واحد متأنٍّ هو الأداة الأفضل",
      description: "حين تتناول عدة نماذج متخصصة سؤالًا واحدًا من مواقع مختلفة يتغير شكل المراجعة. نظرة في مواضع النفع وحدوده.",
      note: "تشغّل هسّارة وكيلًا واحدًا في كل استشارة، ولا تُجري مناظرة آلية بين الوكلاء. يمكن تطبيق المنهج أدناه بتشغيل الموجز نفسه في استشارات منفصلة ثم مقارنة الإجابات.",
      body: `المراجعة الاستراتيجية في العادة صوتٌ واحد: يكتب أحدهم الورقة، ويتفاعل الآخرون معها، ويحدّد إطارها بهدوء أيَّ الاعتراضات سيُطرح أصلًا. والمداولة متعددة الوكلاء تغيّر نقطة البداية هذه؛ إذ تُعطى عدة نماذج متخصصة الموجزَ نفسه، ويُطلب منها أن تحاجّ فيه من مواقع مختلفة قبل أن يكتب أحدٌ خلاصة.

## ما الذي يتغير فعلًا

ليست القيمة في أن مزيدًا من النماذج ينتج مزيدًا من النص، بل في أن الخلاف يظهر مبكرًا، حين يكون التصرف بناءً عليه ما يزال قليل الكلفة.

- **تُعلَن الافتراضات بدل أن تُضمَر.** نموذج استراتيجي ونموذج للمخاطر يُسألان السؤال نفسه سيبنيان على مقدمات مختلفة، ووضع إجابتيهما جنبًا إلى جنب يكشف تلك المقدمات.
- **تصل الاعتراضات قبل الالتزام.** في المراجعة ذات الكاتب الواحد يظهر أقوى اعتراض غالبًا في الاجتماع، بعد أن تكون المواقف قد تصلّبت.
- **يصبح السجل أغنى.** تترك المداولة وراءها من حاجّ بماذا ولماذا، وهذا أنفع بعد ستة أشهر من توصية مصقولة.

## أين تفيد

تستحق المداولة كلفتها حين يحمل السؤال توترًا حقيقيًا: النمو مقابل المرونة، والسرعة مقابل السيطرة، وسوقٌ مقابل أخرى. وتفيد كذلك حين يحمل أصحاب القرار آراء مختلفة ويحتاجون إلى تمثيلها بإنصاف بدل أن تذوب في متوسطٍ يرضي الجميع.

## أين لا تفيد

كثير من الأسئلة لا يحمل توترًا يستحق أن يُمثَّل. إن كانت المهمة تلخيص عقد أو مطابقة أرقام أو التحقق من حساب، فالمجلس يضيف تأخيرًا ومظهرًا من الصرامة بلا جوهر. مرورٌ واحد متأنٍّ يراجعه إنسان هو الأداة الأفضل.

وثمة حدّ ثانٍ: النماذج التي تتشارك بيانات التدريب والموجز قد تتفق لأسباب خاطئة. ثلاث إجابات واثقة تقوم على الافتراض نفسه غير المفحوص هي إجابة واحدة لا ثلاث. واتفاق الوكلاء دليل ضعيف ما لم يُعطَوا معلومات مختلفة أو أدوارًا مختلفة.

## نمط عمل

1. **صُغ السؤال في جملة واحدة** واذكر القيود غير القابلة للتفاوض.
2. **وزّع أدوارًا تتعارض فعلًا.** صوت استراتيجي وصوت للمخاطر وصوت للأنظمة سيختلفون حول أشياء مختلفة.
3. **اطلب المواقف قبل النقاش،** ليُرى التقارب اللاحق على حقيقته.
4. **دع إنسانًا يقرر.** المداولة تُغني القرار ولا تتخذه.

> يستحق المجلس أن يُعقد حين كنت ستسمع، لولاه، طرفًا واحدًا فقط من جدال تحتاج إلى خوضه.

## الخلاصة

استخدم المداولة للقرارات التي تحمل توترًا حقيقيًا، وأبعدها عن التحليل الروتيني، وعامل اتفاق الوكلاء بالريبة نفسها التي تعامل بها اتفاقًا في غرفة قرأ فيها الجميع الإحاطة نفسها.`,
    },
  },
  {
    slug: "citation-first-reasoning",
    en: {
      kicker: "Field Report",
      title: "Grounding answers in evidence: what citation-first reasoning looks like",
      sub: "Tracing each claim in a recommendation back to the document it came from",
      description: "A practical look at citation-first reasoning, where every claim in an AI-assisted recommendation can be traced to its source.",
      note: "This version of HESSARA works with the text you type or paste; it does not retrieve documents or attach citations. The note describes a method for judging any AI answer, HESSARA's included.",
      body: `Most disappointing AI answers share one fault: they sound right and cannot be checked. Citation-first reasoning reverses the usual order. The system finds the evidence first, and is only then allowed to make a claim that the evidence supports.

## The difference in practice

A conventional answer is written and then decorated with references. A citation-first answer is assembled from passages that were retrieved before a word of the answer existed. The practical test is simple: pick any sentence in the answer and ask where it came from. If the reply is a specific passage in a specific document, the answer is grounded. If the reply is "the model knows this", it is not.

## What a grounded answer contains

- **Claims tied to passages,** not to whole documents. "See the annual report" is not a citation.
- **Visible gaps.** Where the sources are silent, the answer says so instead of filling the space.
- **Conflicts shown, not resolved in secret.** When two sources disagree, the reader sees both.
- **A clear line between evidence and inference.** What the sources say and what the system concluded from them are labelled differently.

## What grounding does not do

Grounding reduces a particular failure: statements with no basis. It does not make an answer correct. A model can quote a passage accurately and still draw the wrong conclusion from it, cite a source that is itself mistaken, or miss the one document that mattered because it was never retrieved.

For that reason, no honest system should promise that errors are impossible. What it can promise is that every claim is open to inspection, which turns checking from guesswork into a short, bounded task.

## How to review a grounded answer

1. **Sample the citations.** Open three at random and confirm the passage says what the answer claims.
2. **Look for what is missing.** Ask which document you expected to see and did not.
3. **Read the inferences separately.** These are where judgment entered, and where yours is needed.
4. **Check the dates.** A well-cited answer built on last year's figures is still out of date.

## What to take away

Citation-first reasoning does not remove the need for review. It makes review possible in minutes instead of hours, and it makes the limits of an answer visible to the person who has to rely on it.`,
    },
    ar: {
      kicker: "تقرير ميداني",
      title: "ربط الإجابات بالأدلة: كيف يبدو الاستدلال القائم على الاستشهاد أولًا",
      sub: "تتبّع كل ادعاء في التوصية إلى الوثيقة التي جاء منها",
      description: "نظرة عملية في الاستدلال القائم على الاستشهاد أولًا، حيث يمكن تتبّع كل ادعاء في توصية مدعومة بالذكاء الاصطناعي إلى مصدره.",
      note: "تعمل هذه النسخة من هسّارة على النص الذي تكتبه أو تلصقه، ولا تسترجع وثائق ولا ترفق استشهادات. تصف المقالة منهجًا للحكم على أي إجابة من الذكاء الاصطناعي، ومنها إجابات هسّارة.",
      body: `تشترك أغلب إجابات الذكاء الاصطناعي المخيِّبة في عيب واحد: تبدو صحيحة ولا يمكن التحقق منها. والاستدلال القائم على الاستشهاد أولًا يقلب الترتيب المعتاد؛ فيجد النظام الدليل أولًا، ثم لا يُسمح له إلا بادعاء يدعمه ذلك الدليل.

## الفرق في التطبيق

الإجابة التقليدية تُكتب ثم تُزيَّن بالمراجع. أما إجابة الاستشهاد أولًا فتُجمَع من مقاطع استُرجعت قبل أن توجد كلمة واحدة من الإجابة. والاختبار العملي بسيط: اختر أي جملة في الإجابة واسأل من أين جاءت. إن كان الجواب مقطعًا محددًا في وثيقة محددة فالإجابة مسنودة، وإن كان «النموذج يعرف هذا» فليست كذلك.

## ما تحتويه الإجابة المسنودة

- **ادعاءات مربوطة بمقاطع** لا بوثائق كاملة. عبارة «انظر التقرير السنوي» ليست استشهادًا.
- **فجوات ظاهرة.** حيث تصمت المصادر تقول الإجابة ذلك بدل أن تملأ الفراغ.
- **تعارضات معروضة لا محسومة في الخفاء.** حين يختلف مصدران يرى القارئ كليهما.
- **خط واضح بين الدليل والاستنتاج.** ما تقوله المصادر وما استنتجه النظام منها موسومان بشكل مختلف.

## ما لا يفعله الإسناد

يقلّل الإسناد نوعًا محددًا من الإخفاق: عبارات بلا أساس. لكنه لا يجعل الإجابة صحيحة؛ فقد يقتبس النموذج مقطعًا بدقة ثم يستخلص منه نتيجة خاطئة، أو يستشهد بمصدر هو نفسه مخطئ، أو يفوّت الوثيقة الوحيدة المهمة لأنها لم تُسترجَع أصلًا.

لذلك لا ينبغي لأي نظام صادق أن يعد بأن الأخطاء مستحيلة. ما يستطيع أن يعد به هو أن يكون كل ادعاء قابلًا للفحص، فيتحول التحقق من تخمين إلى مهمة قصيرة محدودة.

## كيف تراجع إجابة مسنودة

1. **اختر عيّنة من الاستشهادات.** افتح ثلاثة عشوائيًا وتأكد أن المقطع يقول ما تدّعيه الإجابة.
2. **ابحث عمّا هو غائب.** اسأل: أي وثيقة توقعت أن تراها ولم ترها؟
3. **اقرأ الاستنتاجات منفصلة.** هنا دخل الحكم، وهنا يُحتاج حكمك أنت.
4. **تحقق من التواريخ.** إجابة موثّقة جيدًا مبنية على أرقام العام الماضي تبقى قديمة.

## الخلاصة

لا يلغي الاستدلال القائم على الاستشهاد أولًا الحاجة إلى المراجعة، لكنه يجعلها ممكنة في دقائق بدل ساعات، ويُظهر حدود الإجابة لمن سيعتمد عليها.`,
    },
  },
  {
    slug: "scenario-simulation",
    en: {
      kicker: "Briefing",
      title: "Scenario simulation for leadership teams: a working method",
      sub: "Framing assumptions, ranges, and decision points before any model is asked to forecast",
      description: "A short working method for leadership teams using AI-assisted scenario simulation, starting with assumptions and decision points.",
      note: "HESSARA does not run simulations or assign probabilities to scenarios. The method below uses a model as a sparring partner, not as a forecaster.",
      body: `Scenario work fails most often before any modelling begins. A team asks for a forecast, receives a confident number, and argues about the number instead of the assumptions behind it. The method below puts the assumptions first.

## Start with the decision, not the forecast

Write down the decision the scenarios are meant to inform and the date by which it must be made. If no decision depends on the outcome, the exercise is research, and should be scoped as research.

## Name the few things that matter

Most outcomes are driven by a small number of uncertainties. Choose the two or three that would change the decision if they moved, and set the rest aside. For each one, record:

- the range you consider plausible, with a low and a high case
- what you would expect to observe first if it began to move
- who in the organisation is closest to that signal

## Build scenarios as stories with numbers

A scenario is a consistent account of how the chosen uncertainties resolve together. Three or four are enough. Each should be plausible, distinct from the others, and uncomfortable in a different way. Avoid a "base case" that everyone quietly treats as the prediction.

## Where models help

| Task | A model is useful for | A person must still |
| --- | --- | --- |
| Framing | Listing uncertainties you had not considered | Choose which ones matter |
| Consistency | Checking that a scenario's parts fit together | Judge whether it is plausible |
| Stress-testing | Arguing against your preferred plan | Decide what risk is acceptable |
| Monitoring | Summarising signals as they arrive | Decide when to act |

Treat any probability a model attaches to a scenario as a prompt for discussion. It reflects the framing it was given, not a measurement of the world.

## Turn scenarios into decision points

For each scenario, agree in advance what you would do and what observation would trigger it. This is the part that pays for the exercise: when the signal appears, the argument has already been had.

## What to take away

Fix the decision, limit the uncertainties, write scenarios that disagree with each other, and agree your triggers before you need them. The simulation is only as good as the framing a leadership team gives it.`,
    },
    ar: {
      kicker: "إحاطة",
      title: "محاكاة السيناريوهات لفرق القيادة: منهج عملي",
      sub: "صياغة الافتراضات والنطاقات ونقاط القرار قبل أن يُطلب من أي نموذج أن يتنبأ",
      description: "منهج عملي قصير لفرق القيادة في محاكاة السيناريوهات بمساعدة الذكاء الاصطناعي، يبدأ بالافتراضات ونقاط القرار.",
      note: "لا تُجري هسّارة محاكاة ولا تمنح السيناريوهات احتمالات. المنهج أدناه يستخدم النموذج محاورًا ناقدًا، لا متنبئًا.",
      body: `يفشل العمل على السيناريوهات غالبًا قبل أن تبدأ أي نمذجة: يطلب الفريق تنبؤًا، فيتلقى رقمًا واثقًا، ثم يتجادل حول الرقم بدل الافتراضات التي وراءه. والمنهج أدناه يضع الافتراضات أولًا.

## ابدأ بالقرار لا بالتنبؤ

اكتب القرار الذي يُفترض أن تُغنيه السيناريوهات، والتاريخ الذي يجب أن يُتخذ فيه. إن لم يكن هناك قرار يتوقف على النتيجة، فالتمرين بحث، وينبغي تحديد نطاقه على أنه بحث.

## سمِّ القليل الذي يهم

تحرّك أغلبَ النتائج قلةٌ من أوجه عدم اليقين. اختر اثنين أو ثلاثة منها لو تحركت لتغيّر القرار، وضع الباقي جانبًا. ولكلٍّ منها سجّل:

- النطاق الذي تراه معقولًا، بحالة دنيا وحالة عليا
- ما تتوقع أن تلاحظه أولًا إن بدأ يتحرك
- من في المؤسسة هو الأقرب إلى تلك الإشارة

## ابنِ السيناريوهات قصصًا بأرقام

السيناريو رواية متسقة لكيفية حسم أوجه عدم اليقين المختارة معًا، وثلاثة أو أربعة منها تكفي. ينبغي أن يكون كلٌّ منها معقولًا، ومتميزًا عن غيره، ومزعجًا بطريقة مختلفة. وتجنّب «حالة أساس» يعاملها الجميع بصمت على أنها التنبؤ.

## أين تفيد النماذج

| المهمة | النموذج مفيد في | ويبقى على الإنسان أن |
| --- | --- | --- |
| الصياغة | سرد أوجه عدم يقين لم تخطر لك | يختار ما يهم منها |
| الاتساق | التحقق من تلاؤم أجزاء السيناريو | يحكم على معقوليته |
| اختبار الضغط | المحاجّة ضد خطتك المفضلة | يقرر أي خطر مقبول |
| الرصد | تلخيص الإشارات عند وصولها | يقرر متى يتصرف |

عامِل أي احتمال يلصقه نموذج بسيناريو على أنه مدخل للنقاش؛ فهو يعكس الإطار الذي أُعطي له، لا قياسًا للعالم.

## حوّل السيناريوهات إلى نقاط قرار

لكل سيناريو اتفقوا مسبقًا على ما ستفعلونه، وعلى الملاحظة التي ستطلق ذلك الفعل. هذا هو الجزء الذي يسدّد كلفة التمرين: حين تظهر الإشارة يكون الجدال قد حُسم مسبقًا.

## الخلاصة

ثبّت القرار، وقلّل أوجه عدم اليقين، واكتب سيناريوهات يخالف بعضها بعضًا، واتفق على محفّزاتك قبل أن تحتاجها. المحاكاة لا تكون أفضل من الإطار الذي يعطيها إياه فريق القيادة.`,
    },
  },
  {
    slug: "general-vs-domain-models",
    en: {
      kicker: "Research Note",
      title: "Choosing between a general model and a domain-tuned one",
      sub: "Matching the model to the question, the stakes, and the data at hand",
      description: "A short framework for deciding when a general-purpose language model is enough and when a domain-tuned model is worth the effort.",
      note: "HESSARA does not train or tune models of its own; it uses general models from several providers.",
      body: `The choice between a general model and a domain-tuned one is often presented as a contest. It is better treated as a matching problem: what does this question need, what does a mistake cost, and what evidence is available to work from?

## Three questions to ask

### How specialised is the language?

General models handle everyday business reasoning well. They become less reliable where terms carry a precise meaning that differs from ordinary use, as in regulation, clinical practice, or financial instruments. The more a field's vocabulary departs from common usage, the stronger the case for tuning or for supplying the definitions directly.

### What does an error cost?

For a first draft that a person will rewrite, breadth and speed matter most. For an output that feeds a decision with legal or financial weight, consistency matters more than fluency, and a narrower model with predictable behaviour is easier to trust and to audit.

### Where does the knowledge live?

If the answer depends on your own documents, the deciding factor is usually retrieval, not the model. A general model given the right passages will often outperform a specialised model given none. Tuning helps most with style, format, and judgement that cannot be supplied as a document.

## A simple guide

| Situation | Usually sufficient |
| --- | --- |
| Broad reasoning, varied topics, low cost of error | A general model |
| Answers must come from your own material | A general model with strong retrieval |
| Specialised vocabulary and fixed output formats | A domain-tuned model |
| High stakes and a need for consistent behaviour | A domain-tuned model with human review |

## Common mistakes

- **Tuning to fix a retrieval problem.** If the model lacks the facts, teaching it a style will not help.
- **Judging on a handful of examples.** Build a small test set from real questions and score both options on it.
- **Ignoring maintenance.** A tuned model must be re-evaluated whenever the underlying model or your data changes.

## What to take away

Start with a general model and good retrieval. Move to a domain-tuned model when you can point to a measured gap on your own test questions, and keep that test set so the decision can be revisited.`,
    },
    ar: {
      kicker: "مذكرة بحثية",
      title: "الاختيار بين نموذج عام ونموذج مضبوط لمجال",
      sub: "مواءمة النموذج مع السؤال والمخاطر والبيانات المتاحة",
      description: "إطار قصير لتحديد متى يكفي نموذج لغوي عام، ومتى يستحق النموذجُ المضبوط لمجالٍ الجهدَ المبذول فيه.",
      note: "لا تدرّب هسّارة نماذجها الخاصة ولا تضبطها؛ إنها تستخدم نماذج عامة من عدة مزوّدين.",
      body: `يُعرض الاختيار بين نموذج عام ونموذج مضبوط لمجال كثيرًا على أنه منافسة، والأفضل أن يُعامل مسألة مواءمة: ماذا يحتاج هذا السؤال، وكم يكلّف الخطأ، وما الأدلة المتاحة للعمل عليها؟

## ثلاثة أسئلة تطرحها

### ما مدى تخصص اللغة؟

تتعامل النماذج العامة جيدًا مع الاستدلال اليومي في الأعمال، وتقلّ موثوقيتها حيث تحمل المصطلحات معنى دقيقًا يختلف عن الاستعمال الشائع، كما في التنظيمات والممارسة السريرية والأدوات المالية. وكلما ابتعدت مفردات المجال عن الاستعمال العام قويت الحجة للضبط، أو لتزويد النموذج بالتعريفات مباشرة.

### كم يكلّف الخطأ؟

في مسودة أولى سيعيد إنسان كتابتها، الأهم هو الاتساع والسرعة. أما في مخرَج يغذّي قرارًا له وزن قانوني أو مالي، فيصبح الاتساق أهم من الطلاقة، ويكون النموذج الأضيق ذو السلوك المتوقع أسهل في الثقة والتدقيق.

### أين تقيم المعرفة؟

إن كانت الإجابة تعتمد على وثائقك أنت، فالعامل الحاسم عادةً هو الاسترجاع لا النموذج؛ فنموذج عام يُعطى المقاطع الصحيحة كثيرًا ما يتفوق على نموذج متخصص لم يُعطَ شيئًا. ويفيد الضبط أكثر ما يفيد في الأسلوب والصيغة والحكم الذي لا يمكن تقديمه وثيقةً.

## دليل مبسّط

| الحالة | ما يكفي عادةً |
| --- | --- |
| استدلال واسع وموضوعات متنوعة وكلفة خطأ منخفضة | نموذج عام |
| يجب أن تأتي الإجابات من موادك الخاصة | نموذج عام مع استرجاع قوي |
| مفردات متخصصة وصيغ مخرجات ثابتة | نموذج مضبوط للمجال |
| مخاطر عالية وحاجة إلى سلوك متسق | نموذج مضبوط للمجال مع مراجعة بشرية |

## أخطاء شائعة

- **الضبط لإصلاح مشكلة استرجاع.** إن كانت الحقائق تنقص النموذج فلن يفيد تعليمه أسلوبًا.
- **الحكم على حفنة من الأمثلة.** ابنِ مجموعة اختبار صغيرة من أسئلة حقيقية، وقيّم الخيارين عليها.
- **إهمال الصيانة.** يجب إعادة تقييم النموذج المضبوط كلما تغيّر النموذج الأساسي أو تغيّرت بياناتك.

## الخلاصة

ابدأ بنموذج عام واسترجاع جيد، وانتقل إلى نموذج مضبوط للمجال حين تستطيع الإشارة إلى فجوة مقيسة على أسئلة اختبارك أنت، واحتفظ بمجموعة الاختبار تلك لتعيد النظر في القرار لاحقًا.`,
    },
  },
];

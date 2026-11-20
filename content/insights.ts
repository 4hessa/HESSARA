// قسم «رؤى»: أربع مقالات منهجية بلغتين، أصلها من الموقع المرجعي، مع ملاحظة توضّح ما لا تقدّمه هسّارة فعلًا من
// الأساليب الموصوفة. لكل مقالة قائمة مصادر مرقّمة، والأرقام بين معقوفين في النص تشير إليها. تحقّقنا من وجود كل مصدر
// وعنوانه وما نُسب إليه في ١٩ نوفمبر ٢٠٢٦. وما لم يُسنَد إلى مصدر في النص هو رأي منهجي، لا نتيجة بحثية.
// في ٢٠ نوفمبر ٢٠٢٦ أُعيدت كتابة مقالتَي المداولة والسيناريوهات لجمهور المنصة (الطلاب والفرق التقنية) بأمثلة
// تقنية بدل «فرق القيادة» و«المراجعة الاستراتيجية»، دون تغيير مصادرهما ولا ما نُسب إليها.
import type { Lang } from "../lib/i18n.ts";
import type { Entry } from "./types";

/** نوع المقالة: يحدد البطاقة التي تمثّله في صفحة «رؤى». */
export type InsightFormat = "research" | "field" | "briefing";
export type Insight = Entry & { format: InsightFormat };

/** أنواع ما يُنشر بترتيب العرض. لا يظهر نوع في الصفحة إلا إذا نُشرت فيه مقالة واحدة على الأقل. */
export const FORMATS: Record<InsightFormat, { icon: string; ar: { title: string; text: string }; en: { title: string; lower: string; text: string } }> = {
  research: {
    icon: "quill",
    ar: { title: "مذكرات بحثية", text: "دراسات أطول في المنهج والدليل والحدود." },
    en: { title: "Research Notes", lower: "research notes", text: "Longer studies of method, evidence, and limits." },
  },
  field: {
    icon: "telescope",
    ar: { title: "تقارير ميدانية", text: "ملاحظات عملية عن سلوك النماذج في المهام الحقيقية." },
    en: { title: "Field Reports", lower: "field reports", text: "Practical notes on how models behave in real tasks." },
  },
  briefing: {
    icon: "lantern",
    ar: { title: "إحاطات", text: "إرشاد موجز لمن عليه أن يقرر." },
    en: { title: "Briefings", lower: "briefings", text: "Short guidance for anyone who has to decide." },
  },
};

/** الأنواع التي نُشرت فيها مقالة فعلًا، بترتيب العرض. فلا تَعِد الصفحة بنوع لم يُنشر فيه شيء بعد. */
export function publishedFormats(list: readonly Insight[] = INSIGHTS): InsightFormat[] {
  return (Object.keys(FORMATS) as InsightFormat[]).filter((f) => list.some((e) => e.format === f));
}

/** أسماء الأنواع في جملة: «مذكرات بحثية وإحاطات»، و«Research Notes & Briefings»، و«research notes and briefings». */
export function formatList(lang: Lang, formats: readonly InsightFormat[], style: "title" | "lower" = "title"): string {
  if (lang === "ar") return formats.map((f, i) => (i ? "و" : "") + FORMATS[f].ar.title).join(" ");
  const names = formats.map((f) => FORMATS[f].en[style]);
  if (names.length < 3) return names.join(style === "title" ? " & " : " and ");
  const head = names.slice(0, -1).join(", ");
  return style === "title" ? `${head} & ${names.at(-1)}` : `${head}, and ${names.at(-1)}`;
}

export const INSIGHTS: Insight[] = [
  {
    slug: "multi-agent-deliberation",
    format: "research",
    en: {
      kicker: "Research Note",
      title: "How multi-agent deliberation changes the review of a technical decision",
      sub: "Where putting the same question to several specialist agents helps, and where one careful pass is still the better tool",
      description: "When several specialist agents take on the same technical decision from different angles, such as a system design or a project's scope, the review changes shape. A look at where that helps and where it does not.",
      note: "HESSARA runs one agent per consultation; it does not stage a debate between agents automatically. The method below can be applied by running the same brief in separate consultations and comparing the answers.",
      body: `A technical decision in a small team usually has one voice. One member proposes the architecture, the framework, or the scope; the others react to that proposal; and its framing quietly decides which objections are ever raised. Multi-agent deliberation changes that starting point: several specialist models are given the same brief and asked to argue it from different positions before anyone settles on an answer [1][2].

## What actually changes

The value is not that more models produce more text. It is that disagreement appears early, while acting on it is still cheap: before the database schema is fixed, and before a month of code is written. A single model asked to reflect on its own answer tends to keep it once it is confident; models assigned opposing positions bring out alternatives it would not reach alone [2].

- **Assumptions are stated, not implied.** A systems-engineering agent and a security agent asked the same question will rest on different premises. Placing their answers side by side exposes those premises.
- **Objections arrive before commitment.** In a team project, the strongest objection may surface only at the supervisor's review or the final defence, after the work is done. People are often reluctant to voice reservations while a plan is being made, which is why methods such as the premortem ask for objections explicitly and early [6].
- **The record is richer.** A deliberation leaves behind who argued what and why. When the decision has to be explained months later, in a project report or before an examining committee, that record is more useful than a polished conclusion.

## Where it helps

Deliberation earns its cost when the question has real tension in it: delivery speed against code quality, a relational database against a document database, building a component against relying on an existing service, a wider scope against a version that works before the deadline. It also helps when team members hold different views and need those views represented fairly rather than averaged away.

There is published evidence that the structure can improve answers. When several instances of a model proposed answers and then debated them, factual accuracy and reasoning improved over a single model on the tasks tested [1]. Anthropic reports that a lead model coordinating sub-agents working in parallel outperformed a single agent by 90.2% on its internal research evaluation [5].

## Where it does not

Many questions have no tension worth staging. If the task is to fix an error that stops the code from building, convert data from one format to another, or check a calculation, a council adds delay and the appearance of rigour without the substance. A single careful pass, checked by a person, is the better tool. A comparison of debate methods found that, in their current form, they do not reliably outperform simpler strategies such as sampling several answers and keeping the most common one [3], and model developers advise starting with the simplest design that does the job [7].

There is a second limit. Models from the same provider or with the same architecture, given the same brief, can agree for the wrong reasons. In a study of more than 350 models, when two models were both wrong they gave the same wrong answer 60% of the time on one benchmark dataset [4]. Three confident answers that rest on the same unexamined assumption are one answer, not three. Agreement between agents is weak evidence unless they were given different information or different roles, and it counts for more when the agents run on models from different developers.

## A working pattern

1. **Frame the decision in one sentence** and list the constraints that are not negotiable: the deadline, the team's size and skills, and any technology the course requires.
2. **Assign roles that genuinely conflict.** A systems-engineering agent, a security agent, and a technical-planning agent will disagree about different things [2].
3. **Ask for positions before discussion,** so that later convergence can be seen for what it is [1]. In practice, let each agent answer before you show it another agent's answer.
4. **Have a person decide.** The deliberation informs the decision; the team, and its supervisor where needed, makes it.

The steps for doing this on HESSARA, together with the Critique Lab, are in [Getting a second opinion](/resources/multi-agent-playbook).

> A council is worth convening when you would otherwise hear only one side of an argument you need to have.

## What to take away

Use deliberation for decisions with real tension, keep it away from routine fixes, and treat agreement between agents with the same suspicion you would apply to a team in which everyone learned from the same tutorial.

## Sources

1. Du, Li, Torralba, Tenenbaum & Mordatch (2023). [Improving Factuality and Reasoning in Language Models through Multiagent Debate](https://arxiv.org/abs/2305.14325). ICML 2024.
2. Liang et al. (2023). [Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate](https://arxiv.org/abs/2305.19118). EMNLP 2024.
3. Smit, Grinsztajn, Duckworth, Barrett & Pretorius (2023). [Should we be going MAD? A Look at Multi-Agent Debate Strategies for LLMs](https://arxiv.org/abs/2311.17371). ICML 2024.
4. Kim, Garg, Peng & Garg (2025). [Correlated Errors in Large Language Models](https://arxiv.org/abs/2506.07962). ICML 2025.
5. Anthropic (2025). [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system).
6. Klein (2007). *Performing a Project Premortem*. Harvard Business Review, September 2007, pp. 18–19.
7. Anthropic (2024). [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents).

Sources checked on 19 November 2026.`,
    },
    ar: {
      kicker: "مذكرة بحثية",
      title: "كيف تغيّر المداولة متعددة الوكلاء مراجعة القرار التقني",
      sub: "أين يفيد عرض السؤال نفسه على أكثر من وكيل متخصص، وأين تبقى مراجعة واحدة متأنية هي الأداة الأفضل",
      description: "حين يتناول أكثر من وكيل متخصص قرارًا تقنيًا واحدًا من زوايا مختلفة، كتصميم نظام أو تحديد نطاق مشروع، يتغير شكل المراجعة. نظرة في مواضع النفع وحدوده.",
      note: "تشغّل هسّارة وكيلًا واحدًا في كل استشارة، ولا تُجري مناظرة آلية بين الوكلاء. يمكن تطبيق المنهج أدناه بتشغيل الموجز نفسه في استشارات منفصلة ثم مقارنة الإجابات.",
      body: `القرار التقني في الفريق الصغير صوتٌ واحد في العادة: يقترح أحد الأعضاء البنية أو إطار العمل أو النطاق، ويتفاعل الباقون مع اقتراحه، ويحدّد إطارُ الاقتراح بهدوء أيَّ الاعتراضات سيُطرح أصلًا. والمداولة متعددة الوكلاء تغيّر نقطة البداية هذه؛ إذ تُعطى عدة نماذج متخصصة الموجزَ نفسه، ويُطلب منها أن تحاجّ فيه من مواقع مختلفة قبل أن يستقر أحدٌ على إجابة [1][2].

## ما الذي يتغير فعلًا

ليست القيمة في أن مزيدًا من النماذج ينتج مزيدًا من النص، بل في أن الخلاف يظهر مبكرًا، حين يكون التصرف بناءً عليه ما يزال قليل الكلفة: قبل أن يُثبَّت مخطط قاعدة البيانات، وقبل أن يُكتب شهر من الشفرة. فالنموذج الواحد إذا طُلب منه أن يراجع إجابته يميل إلى التمسك بها متى وثق بها، أما نماذج تُعطى مواقف متعارضة فتُخرج بدائل لم يكن ليبلغها وحده [2].

- **تُعلَن الافتراضات بدل أن تُضمَر.** وكيل هندسة الأنظمة ووكيل أمن المعلومات إذا سُئلا السؤال نفسه سيبنيان على مقدمات مختلفة، ووضع إجابتيهما جنبًا إلى جنب يكشف تلك المقدمات.
- **تصل الاعتراضات قبل الالتزام.** في مشروع الفريق قد لا يظهر أقوى اعتراض إلا في مراجعة المشرف أو في المناقشة النهائية، بعد أن يكون العمل قد أُنجز. وكثيرًا ما يتردد الناس في إبداء تحفظاتهم أثناء وضع الخطة، ولهذا تطلب أساليب مثل «تحليل ما قبل الفشل» الاعتراضاتِ صراحةً وفي وقت مبكر [6].
- **يصبح السجل أغنى.** تترك المداولة وراءها من حاجّ بماذا ولماذا. وحين يلزم شرح القرار بعد أشهر، في تقرير المشروع أو أمام لجنة المناقشة، يكون هذا السجل أنفع من خلاصة مصقولة.

## أين تفيد

تستحق المداولة كلفتها حين يحمل السؤال توترًا حقيقيًا: سرعة التسليم مقابل جودة الشفرة، وقاعدة بيانات علائقية مقابل قاعدة بيانات مستندية، وبناء مكوّن بنفسك مقابل الاعتماد على خدمة قائمة، ونطاق أوسع مقابل نسخة تعمل فعلًا قبل الموعد. وتفيد كذلك حين يحمل أعضاء الفريق آراء مختلفة ويحتاجون إلى تمثيلها بإنصاف بدل أن تذوب في متوسطٍ يرضي الجميع.

وثمة أدلة منشورة على أن هذا البناء قد يحسّن الإجابات. حين اقترحت عدة نسخ من نموذج إجاباتها ثم تناظرت حولها، تحسّنت الدقة الواقعية والاستدلال مقارنة بنموذج واحد في المهام المختبرة [1]. وتذكر Anthropic أن نموذجًا قائدًا ينسّق وكلاء فرعيين يعملون بالتوازي تفوّق على وكيل منفرد بنسبة 90.2% في تقييمها الداخلي لمهام البحث [5].

## أين لا تفيد

كثير من الأسئلة لا يحمل توترًا يستحق أن يُمثَّل. إن كانت المهمة إصلاح خطأ يمنع بناء الشفرة، أو تحويل بيانات من صيغة إلى أخرى، أو التحقق من حساب، فالمجلس يضيف تأخيرًا ومظهرًا من الصرامة بلا جوهر. مرورٌ واحد متأنٍّ يراجعه إنسان هو الأداة الأفضل. وقد وجدت دراسة قارنت أساليب المناظرة أنها بصيغتها الحالية لا تتفوق بثبات على أساليب أبسط، مثل توليد عدة إجابات واختيار الأكثر تكرارًا [3]، ويوصي مطوّرو النماذج بالبدء بأبسط تصميم يؤدي المهمة [7].

وثمة حدّ ثانٍ: النماذج التي تأتي من المزوّد نفسه أو تتشارك البنية نفسها، إذا أُعطيت الموجز نفسه، قد تتفق لأسباب خاطئة. ففي دراسة شملت أكثر من 350 نموذجًا، حين أخطأ نموذجان معًا أعطيا الإجابة الخاطئة نفسها في 60% من الحالات على إحدى مجموعات الاختبار [4]. ثلاث إجابات واثقة تقوم على الافتراض نفسه غير المفحوص هي إجابة واحدة لا ثلاث. واتفاق الوكلاء دليل ضعيف ما لم يُعطَوا معلومات مختلفة أو أدوارًا مختلفة، ويزداد وزنه حين تعمل على نماذج من مطوّرين مختلفين.

## نمط عمل

1. **صُغ القرار في جملة واحدة** واذكر القيود غير القابلة للتفاوض: الموعد النهائي، وحجم الفريق ومهاراته، وأي تقنية يشترطها المقرر.
2. **وزّع أدوارًا تتعارض فعلًا.** وكيل هندسة الأنظمة ووكيل أمن المعلومات ووكيل التخطيط التقني سيختلفون حول أشياء مختلفة [2].
3. **اطلب المواقف قبل النقاش،** ليُرى التقارب اللاحق على حقيقته [1]. وعمليًا: دع كل وكيل يجيب قبل أن تعرض عليه إجابة غيره.
4. **دع إنسانًا يقرر.** المداولة تُغني القرار ولا تتخذه؛ القرار للفريق، ولمشرفه حين يلزم.

وخطوات تطبيق ذلك في هسّارة، مع مختبر النقد، في [رأي ثانٍ: الوكلاء والنماذج والمراجعة](/resources/multi-agent-playbook).

> يستحق المجلس أن يُعقد حين كنت ستسمع، لولاه، طرفًا واحدًا فقط من جدال تحتاج إلى خوضه.

## الخلاصة

استخدم المداولة للقرارات التي تحمل توترًا حقيقيًا، وأبعدها عن الإصلاحات الروتينية، وعامل اتفاق الوكلاء بالريبة نفسها التي تعامل بها اتفاق فريق تعلّم أفراده كلهم من الدرس نفسه.

## المصادر

1. Du وآخرون (2023)، مؤتمر ICML 2024: نسخ متعددة من النموذج تقترح إجاباتها ثم تتناظر، فتتحسن الدقة والاستدلال. [Improving Factuality and Reasoning in Language Models through Multiagent Debate](https://arxiv.org/abs/2305.14325)
2. Liang وآخرون (2023)، مؤتمر EMNLP 2024: النموذج المنفرد يتمسك بإجابته متى وثق بها، والمواقف المتعارضة مع حَكَم تفتح بدائل. [Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate](https://arxiv.org/abs/2305.19118)
3. Smit وآخرون (2023)، مؤتمر ICML 2024: أساليب المناظرة بصيغتها الحالية لا تتفوق بثبات على الأساليب الأبسط. [Should we be going MAD? A Look at Multi-Agent Debate Strategies for LLMs](https://arxiv.org/abs/2311.17371)
4. Kim وآخرون (2025)، مؤتمر ICML 2025: أخطاء النماذج مترابطة، ويزيد ترابطها حين تشترك في المزوّد أو البنية. [Correlated Errors in Large Language Models](https://arxiv.org/abs/2506.07962)
5. Anthropic (2025): كيف بُنيت ميزة البحث متعددة الوكلاء، ونتيجة تقييمها الداخلي. [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
6. Klein (2007)، مجلة Harvard Business Review، عدد سبتمبر 2007، ص 18–19: أسلوب «تحليل ما قبل الفشل» لاستخراج الاعتراضات قبل التنفيذ. *Performing a Project Premortem*
7. Anthropic (2024): البدء بأبسط تصميم، وعدم زيادة التعقيد إلا عند الحاجة. [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)

رُوجعت المصادر في 19 نوفمبر 2026.`,
    },
  },
  {
    slug: "citation-first-reasoning",
    format: "research",
    en: {
      kicker: "Method Note",
      title: "Grounding answers in evidence: what citation-first reasoning looks like",
      sub: "Tracing each claim in a recommendation back to the document it came from",
      description: "A practical look at citation-first reasoning, where every claim in an AI-assisted recommendation can be traced to its source.",
      note: "This version of HESSARA works with the text you type or paste; it does not retrieve documents or attach citations. The note describes a method for judging any AI answer, HESSARA's included.",
      body: `Most disappointing AI answers share one fault: they sound right and cannot be checked. Part of the reason lies in how models are trained and scored: common evaluations reward a confident guess over an admission of uncertainty [5]. Citation-first reasoning reverses the usual order. The system finds the evidence first, and is only then allowed to make a claim that the evidence supports [1][2].

## The difference in practice

A conventional answer is written and then decorated with references. A citation-first answer is assembled from passages that were retrieved before a word of the answer existed [1]. The practical test is simple: pick any sentence in the answer and ask where it came from. If the reply is a specific passage in a specific document, the answer is grounded. If the reply is "the model knows this", it is not.

## What a grounded answer contains

- **Claims tied to passages,** not to whole documents. "See the annual report" is not a citation. Some model APIs now return references to the exact sentences an answer relied on [4].
- **Visible gaps.** Where the sources are silent, the answer says so instead of filling the space [5].
- **Conflicts shown, not resolved in secret.** When two sources disagree, the reader sees both.
- **A clear line between evidence and inference.** What the sources say and what the system concluded from them are labelled differently.

## What grounding does not do

Grounding reduces a particular failure: statements with no basis. It does not make an answer correct. A model can quote a passage accurately and still draw the wrong conclusion from it, cite a source that is itself mistaken, or miss the one document that mattered because it was never retrieved. The quality of retrieval has a large effect on how well cited answers hold up [2].

Citations need checking too. In an audit of four generative search engines, only 51.5% of the generated sentences were fully supported by their citations, and only 74.5% of the citations supported the sentence they were attached to [3].

For that reason, no honest system should promise that errors are impossible. What it can promise is that every claim is open to inspection, which turns checking from guesswork into a short, bounded task.

## How to review a grounded answer

1. **Sample the citations.** Open three at random and confirm the passage says what the answer claims [3].
2. **Look for what is missing.** Ask which document you expected to see and did not.
3. **Read the inferences separately.** These are where judgment entered, and where yours is needed.
4. **Check the dates.** A well-cited answer built on last year's figures is still out of date.

## What to take away

Citation-first reasoning does not remove the need for review. It makes review faster and bounded, and it makes the limits of an answer visible to the person who has to rely on it.

## Sources

1. Lewis et al. (2020). [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401). NeurIPS 2020.
2. Gao, Yen, Yu & Chen (2023). [Enabling Large Language Models to Generate Text with Citations](https://arxiv.org/abs/2305.14627). EMNLP 2023.
3. Liu, Zhang & Liang (2023). [Evaluating Verifiability in Generative Search Engines](https://aclanthology.org/2023.findings-emnlp.467). Findings of EMNLP 2023.
4. Anthropic (2025). [Introducing Citations on the Anthropic API](https://www.anthropic.com/news/introducing-citations-api).
5. Kalai et al. (2025). [Why language models hallucinate](https://openai.com/index/why-language-models-hallucinate/). OpenAI.

Sources checked on 19 November 2026.`,
    },
    ar: {
      kicker: "مذكرة منهجية",
      title: "ربط الإجابات بالأدلة: كيف يبدو الاستدلال القائم على الاستشهاد أولًا",
      sub: "تتبّع كل ادعاء في التوصية إلى الوثيقة التي جاء منها",
      description: "نظرة عملية في الاستدلال القائم على الاستشهاد أولًا، حيث يمكن تتبّع كل ادعاء في توصية مدعومة بالذكاء الاصطناعي إلى مصدره.",
      note: "تعمل هذه النسخة من هسّارة على النص الذي تكتبه أو تلصقه، ولا تسترجع وثائق ولا ترفق استشهادات. تصف المقالة منهجًا للحكم على أي إجابة من الذكاء الاصطناعي، ومنها إجابات هسّارة.",
      body: `تشترك أغلب إجابات الذكاء الاصطناعي المخيِّبة في عيب واحد: تبدو صحيحة ولا يمكن التحقق منها. ويعود جزء من السبب إلى طريقة تدريب النماذج وتقييمها؛ فالتقييمات الشائعة تكافئ التخمين الواثق أكثر من الاعتراف بعدم اليقين [5]. والاستدلال القائم على الاستشهاد أولًا يقلب الترتيب المعتاد؛ فيجد النظام الدليل أولًا، ثم لا يُسمح له إلا بادعاء يدعمه ذلك الدليل [1][2].

## الفرق في التطبيق

الإجابة التقليدية تُكتب ثم تُزيَّن بالمراجع. أما إجابة الاستشهاد أولًا فتُجمَع من مقاطع استُرجعت قبل أن توجد كلمة واحدة من الإجابة [1]. والاختبار العملي بسيط: اختر أي جملة في الإجابة واسأل من أين جاءت. إن كان الجواب مقطعًا محددًا في وثيقة محددة فالإجابة مسنودة، وإن كان «النموذج يعرف هذا» فليست كذلك.

## ما تحتويه الإجابة المسنودة

- **ادعاءات مربوطة بمقاطع** لا بوثائق كاملة. عبارة «انظر التقرير السنوي» ليست استشهادًا. وبعض الواجهات البرمجية للنماذج صارت تُرجع إشارات إلى الجمل نفسها التي استندت إليها الإجابة [4].
- **فجوات ظاهرة.** حيث تصمت المصادر تقول الإجابة ذلك بدل أن تملأ الفراغ [5].
- **تعارضات معروضة لا محسومة في الخفاء.** حين يختلف مصدران يرى القارئ كليهما.
- **خط واضح بين الدليل والاستنتاج.** ما تقوله المصادر وما استنتجه النظام منها موسومان بشكل مختلف.

## ما لا يفعله الإسناد

يقلّل الإسناد نوعًا محددًا من الإخفاق: عبارات بلا أساس. لكنه لا يجعل الإجابة صحيحة؛ فقد يقتبس النموذج مقطعًا بدقة ثم يستخلص منه نتيجة خاطئة، أو يستشهد بمصدر هو نفسه مخطئ، أو يفوّت الوثيقة الوحيدة المهمة لأنها لم تُسترجَع أصلًا. ولجودة الاسترجاع أثر كبير في متانة الإجابات الموثّقة [2].

والاستشهادات نفسها تحتاج إلى فحص. ففي تدقيق لأربعة محركات بحث توليدية، كانت 51.5% فقط من الجمل المولَّدة مدعومة دعمًا كاملًا باستشهاداتها، و74.5% فقط من الاستشهادات تدعم الجملة الملحقة بها [3].

لذلك لا ينبغي لأي نظام صادق أن يعد بأن الأخطاء مستحيلة. ما يستطيع أن يعد به هو أن يكون كل ادعاء قابلًا للفحص، فيتحول التحقق من تخمين إلى مهمة قصيرة محدودة.

## كيف تراجع إجابة مسنودة

1. **اختر عيّنة من الاستشهادات.** افتح ثلاثة عشوائيًا وتأكد أن المقطع يقول ما تدّعيه الإجابة [3].
2. **ابحث عمّا هو غائب.** اسأل: أي وثيقة توقعت أن تراها ولم ترها؟
3. **اقرأ الاستنتاجات منفصلة.** هنا دخل الحكم، وهنا يُحتاج حكمك أنت.
4. **تحقق من التواريخ.** إجابة موثّقة جيدًا مبنية على أرقام العام الماضي تبقى قديمة.

## الخلاصة

لا يلغي الاستدلال القائم على الاستشهاد أولًا الحاجة إلى المراجعة، لكنه يجعلها أسرع ومحدودة النطاق، ويُظهر حدود الإجابة لمن سيعتمد عليها.

## المصادر

1. Lewis وآخرون (2020)، مؤتمر NeurIPS 2020: الورقة التي قدّمت التوليد المعزَّز بالاسترجاع (RAG)، أي ربط النموذج بمسترجِع للوثائق. [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
2. Gao وآخرون (2023)، مؤتمر EMNLP 2023: معيار لتقييم الإجابات المرفقة باستشهادات، وجودة الاسترجاع فيه حاسمة. [Enabling Large Language Models to Generate Text with Citations](https://arxiv.org/abs/2305.14627)
3. Liu وآخرون (2023)، Findings of EMNLP 2023: تدقيق بشري لاستشهادات أربعة محركات بحث توليدية. [Evaluating Verifiability in Generative Search Engines](https://aclanthology.org/2023.findings-emnlp.467)
4. Anthropic (2025): إجابات تشير إلى الجمل والمقاطع التي استندت إليها. [Introducing Citations on the Anthropic API](https://www.anthropic.com/news/introducing-citations-api)
5. Kalai وآخرون (2025)، OpenAI: التدريب والتقييم يكافئان التخمين أكثر من الاعتراف بعدم اليقين. [Why language models hallucinate](https://openai.com/index/why-language-models-hallucinate/)

رُوجعت المصادر في 19 نوفمبر 2026.`,
    },
  },
  {
    slug: "scenario-simulation",
    format: "briefing",
    en: {
      kicker: "Briefing",
      title: "Scenario planning for a technical project: a working method",
      sub: "Framing assumptions, ranges, and decision points before any model is asked to predict how the project will go",
      description: "A short working method for students and technical teams who plan a project with scenarios instead of a single estimate, using AI as a sparring partner.",
      note: "HESSARA does not run simulations or assign probabilities to scenarios. The method below uses a model as a sparring partner, not as a forecaster.",
      body: `Project plans fail most often before any work begins. A team asks how long the project will take, receives a confident estimate, and argues about the estimate instead of the assumptions behind it. The method below puts the assumptions first. It draws on scenario practice developed in corporate planning, best known from Shell, where scenarios were used in place of a single forecast [1]. The same discipline fits a graduation project or a small product team.

## Start with the decision, not the forecast

Write down the decision the scenarios are meant to inform and the date by which it must be made: which technologies to commit to by the end of week two, whether to build on an external API or a local model, how much to promise in the project proposal. If no decision depends on the outcome, the exercise is research, and should be scoped as research.

## Name the few things that matter

Most outcomes are driven by a small number of uncertainties. Choose the two or three that would change the decision if they moved, and set the rest aside [2]. In a technical project they are often things like access to the data you need, the limits of a free service tier, or the time team members have during exams. For each one, record:

- the range you consider plausible, with a low and a high case
- what you would expect to observe first if it began to move; planners call these signposts [3]
- who on the team is closest to that signal

## Build scenarios as stories with numbers

A scenario is a consistent account of how the chosen uncertainties resolve together [2]. Three or four are enough. Each should be plausible, distinct from the others, and uncomfortable in a different way: the data arrives late while the API stays stable, for example, or the data is on time but the free tier proves too small. Avoid a "base case" that everyone quietly treats as the prediction.

## Where models help

| Task | A model is useful for | A person must still |
| --- | --- | --- |
| Framing | Listing uncertainties you had not considered | Choose which ones matter |
| Consistency | Checking that a scenario's parts fit together | Judge whether it is plausible |
| Stress-testing | Arguing against your preferred plan | Decide what risk is acceptable |
| Monitoring | Summarising signals as they arrive | Decide when to act |

Treat any probability a model attaches to a scenario as a prompt for discussion. It reflects the framing it was given, not a measurement of the world. Model outputs can shift with changes that should not matter: in one study, the formatting of a prompt alone moved a model's accuracy by up to 76 points [5].

## Turn scenarios into decision points

For each scenario, agree in advance what you would do and what observation would trigger it [3]: if the data has not arrived by the end of week four, switch to a public dataset; if the free tier's limits stop your testing twice in one week, drop the feature that depends on it. This is the part that pays for the exercise: when the signal appears, the argument has already been had. Public-sector foresight guidance follows the same sequence: test assumptions, build scenarios, stress-test strategies, then plan actions [4].

## What to take away

Fix the decision, limit the uncertainties, write scenarios that disagree with each other, and agree your triggers before you need them. A plan is only as good as the assumptions a team is willing to write down.

## Sources

1. Wack (1985). [Scenarios: Uncharted Waters Ahead](https://hbr.org/1985/09/scenarios-uncharted-waters-ahead). Harvard Business Review, September–October 1985.
2. Schoemaker (1995). [Scenario Planning: A Tool for Strategic Thinking](https://sloanreview.mit.edu/article/scenario-planning-a-tool-for-strategic-thinking/). Sloan Management Review, 36(2), 25–40.
3. Dewar (2002). *Assumption-Based Planning: A Tool for Reducing Avoidable Surprises*. Cambridge University Press.
4. OECD (2025). [Strategic Foresight Toolkit for Resilient Public Policy](https://www.oecd.org/en/publications/foresight-toolkit-for-resilient-public-policy_bcdd9304-en).
5. Sclar, Choi, Tsvetkov & Suhr (2023). [Quantifying Language Models' Sensitivity to Spurious Features in Prompt Design](https://arxiv.org/abs/2310.11324). ICLR 2024.

Sources checked on 19 November 2026.`,
    },
    ar: {
      kicker: "إحاطة",
      title: "التخطيط بالسيناريوهات لمشروع تقني: منهج عملي",
      sub: "صياغة الافتراضات والنطاقات ونقاط القرار قبل أن يُطلب من أي نموذج أن يتنبأ بمسار المشروع",
      description: "منهج عملي قصير للطلاب والفرق التقنية لتخطيط مشروع بالسيناريوهات بدل تقدير واحد، مع استخدام الذكاء الاصطناعي محاورًا ناقدًا.",
      note: "لا تُجري هسّارة محاكاة ولا تمنح السيناريوهات احتمالات. المنهج أدناه يستخدم النموذج محاورًا ناقدًا، لا متنبئًا.",
      body: `تفشل خطط المشاريع غالبًا قبل أن يبدأ العمل: يسأل الفريق كم سيستغرق المشروع، فيتلقى تقديرًا واثقًا، ثم يتجادل حول التقدير بدل الافتراضات التي وراءه. والمنهج أدناه يضع الافتراضات أولًا. وهو يستند إلى ممارسة السيناريوهات التي نشأت في التخطيط المؤسسي، وأشهرها تجربة شركة Shell التي استخدمت السيناريوهات بدل تنبؤ واحد [1]. والانضباط نفسه يناسب مشروع تخرج أو فريق منتج صغيرًا.

## ابدأ بالقرار لا بالتنبؤ

اكتب القرار الذي يُفترض أن تُغنيه السيناريوهات، والتاريخ الذي يجب أن يُتخذ فيه: أي التقنيات يلتزم بها الفريق بنهاية الأسبوع الثاني، وهل يبني على واجهة برمجية خارجية أم على نموذج محلي، وكم يَعِد في مقترح المشروع. إن لم يكن هناك قرار يتوقف على النتيجة، فالتمرين بحث، وينبغي تحديد نطاقه على أنه بحث.

## سمِّ القليل الذي يهم

تحرّك أغلبَ النتائج قلةٌ من أوجه عدم اليقين. اختر اثنين أو ثلاثة منها لو تحركت لتغيّر القرار، وضع الباقي جانبًا [2]. وفي المشروع التقني تكون غالبًا من قبيل: الحصول على البيانات المطلوبة، وحدود الخطة المجانية لخدمة ما، والوقت المتاح لأعضاء الفريق في فترة الاختبارات. ولكلٍّ منها سجّل:

- النطاق الذي تراه معقولًا، بحالة دنيا وحالة عليا
- ما تتوقع أن تلاحظه أولًا إن بدأ يتحرك، ويسمّيه المخططون «المؤشرات» [3]
- من في الفريق هو الأقرب إلى تلك الإشارة

## ابنِ السيناريوهات قصصًا بأرقام

السيناريو رواية متسقة لكيفية حسم أوجه عدم اليقين المختارة معًا [2]، وثلاثة أو أربعة منها تكفي. ينبغي أن يكون كلٌّ منها معقولًا، ومتميزًا عن غيره، ومزعجًا بطريقة مختلفة: كأن تتأخر البيانات وتبقى الواجهة البرمجية مستقرة، أو تصل البيانات في موعدها وتضيق الخطة المجانية عن الحاجة. وتجنّب «حالة أساس» يعاملها الجميع بصمت على أنها التنبؤ.

## أين تفيد النماذج

| المهمة | النموذج مفيد في | ويبقى على الإنسان أن |
| --- | --- | --- |
| الصياغة | سرد أوجه عدم يقين لم تخطر لك | يختار ما يهم منها |
| الاتساق | التحقق من تلاؤم أجزاء السيناريو | يحكم على معقوليته |
| اختبار الضغط | المحاجّة ضد خطتك المفضلة | يقرر أي خطر مقبول |
| الرصد | تلخيص الإشارات عند وصولها | يقرر متى يتصرف |

عامِل أي احتمال يلصقه نموذج بسيناريو على أنه مدخل للنقاش؛ فهو يعكس الإطار الذي أُعطي له، لا قياسًا للعالم. ومخرجات النماذج قد تتغير بتغييرات لا ينبغي أن تؤثر فيها: في إحدى الدراسات غيّر تنسيق الطلب وحده دقة نموذج بما يصل إلى 76 نقطة [5].

## حوّل السيناريوهات إلى نقاط قرار

لكل سيناريو اتفقوا مسبقًا على ما ستفعلونه، وعلى الملاحظة التي ستطلق ذلك الفعل [3]: إن لم تصل البيانات بنهاية الأسبوع الرابع فانتقلوا إلى مجموعة بيانات عامة، وإن أوقفت حدودُ الخطة المجانية الاختبارَ مرتين في أسبوع واحد فاحذفوا الميزة التي تعتمد عليها. هذا هو الجزء الذي يسدّد كلفة التمرين: حين تظهر الإشارة يكون الجدال قد حُسم مسبقًا. وتتبع إرشادات الاستشراف في القطاع العام التسلسل نفسه: اختبار الافتراضات، ثم بناء السيناريوهات، ثم اختبار الاستراتيجيات تحت الضغط، ثم خطط العمل [4].

## الخلاصة

ثبّت القرار، وقلّل أوجه عدم اليقين، واكتب سيناريوهات يخالف بعضها بعضًا، واتفق على محفّزاتك قبل أن تحتاجها. الخطة لا تكون أفضل من الافتراضات التي يقبل الفريق أن يكتبها.

## المصادر

1. Wack (1985)، مجلة Harvard Business Review، عدد سبتمبر–أكتوبر 1985: المقالة التي عرّفت عالم الأعمال بتجربة Shell في السيناريوهات. [Scenarios: Uncharted Waters Ahead](https://hbr.org/1985/09/scenarios-uncharted-waters-ahead)
2. Schoemaker (1995)، مجلة Sloan Management Review، المجلد 36، العدد 2، ص 25–40: تحديد الاتجاهات وأوجه عدم اليقين، ثم بناء سيناريوهات منها. [Scenario Planning: A Tool for Strategic Thinking](https://sloanreview.mit.edu/article/scenario-planning-a-tool-for-strategic-thinking/)
3. Dewar (2002)، دار Cambridge University Press: التخطيط القائم على الافتراضات، والمؤشرات التي تنبّه إلى انهيار افتراض. *Assumption-Based Planning: A Tool for Reducing Avoidable Surprises*
4. منظمة OECD (2025): دليل للاستشراف الاستراتيجي في السياسات العامة بخطوات من اختبار الافتراضات إلى خطط العمل. [Strategic Foresight Toolkit for Resilient Public Policy](https://www.oecd.org/en/publications/foresight-toolkit-for-resilient-public-policy_bcdd9304-en)
5. Sclar وآخرون (2023)، مؤتمر ICLR 2024: حساسية النماذج لتنسيق الطلب، حتى 76 نقطة من الدقة. [Quantifying Language Models' Sensitivity to Spurious Features in Prompt Design](https://arxiv.org/abs/2310.11324)

رُوجعت المصادر في 19 نوفمبر 2026.`,
    },
  },
  {
    slug: "general-vs-domain-models",
    format: "research",
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

Both routes have evidence behind them. BloombergGPT was trained on a mix of financial and general text, and its authors report that it outperforms existing models on financial tasks without losing ground on general benchmarks [1]. In medicine, a general model steered by prompting strategies alone matched or beat models built for the field on medical benchmarks [2].

### What does an error cost?

For a first draft that a person will rewrite, breadth and speed matter most. For an output that feeds a decision with legal or financial weight, consistency matters more than fluency, and a narrower model with predictable behaviour is easier to trust and to audit.

### Where does the knowledge live?

If the answer depends on your own documents, the deciding factor is usually retrieval, not the model. A general model given the right passages will often outperform a specialised model given none. In a direct comparison, retrieval consistently outperformed unsupervised fine-tuning for adding knowledge to a model, both for facts it had seen in training and for new ones [3]. How documents are prepared also matters: adding a short context to each chunk before indexing cut retrieval failures by 49% in Anthropic's tests [5]. Tuning helps most with style, format, and judgement that cannot be supplied as a document [3][4].

## A simple guide

| Situation | Usually sufficient |
| --- | --- |
| Broad reasoning, varied topics, low cost of error | A general model |
| Answers must come from your own material | A general model with strong retrieval |
| Specialised vocabulary and fixed output formats | A domain-tuned model |
| High stakes and a need for consistent behaviour | A domain-tuned model with human review |

## Common mistakes

- **Tuning to fix a retrieval problem.** If the model lacks the facts, teaching it a style will not help [3].
- **Judging on a handful of examples.** Build a small test set from real questions and score both options on it.
- **Ignoring maintenance.** A tuned model must be re-evaluated whenever the underlying model or your data changes. Hosted models change too: between March and June 2023, GPT-4's accuracy at telling prime from composite numbers fell from 84% to 51% [6].

## What to take away

Start with a general model and good retrieval; OpenAI's own guidance is to begin with prompting, and to add retrieval or fine-tuning according to the gap that evaluation shows [4]. Move to a domain-tuned model when you can point to a measured gap on your own test questions, and keep that test set so the decision can be revisited.

## Sources

1. Wu et al. (2023). [BloombergGPT: A Large Language Model for Finance](https://arxiv.org/abs/2303.17564).
2. Nori et al. (2023). [Can Generalist Foundation Models Outcompete Special-Purpose Tuning? Case Study in Medicine](https://arxiv.org/abs/2311.16452).
3. Ovadia, Brief, Mishaeli & Elisha (2023). [Fine-Tuning or Retrieval? Comparing Knowledge Injection in LLMs](https://arxiv.org/abs/2312.05934).
4. OpenAI. [Optimizing LLM Accuracy](https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy). OpenAI API documentation.
5. Anthropic (2024). [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval).
6. Chen, Zaharia & Zou (2024). [How Is ChatGPT's Behavior Changing over Time?](https://doi.org/10.1162/99608f92.5317da47) Harvard Data Science Review.

Sources checked on 19 November 2026.`,
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

ولكلا الطريقين شواهد. فقد دُرّب نموذج BloombergGPT على مزيج من النصوص المالية والعامة، ويذكر مؤلفوه أنه تفوّق على النماذج القائمة في المهام المالية دون أن يتراجع في المقاييس العامة [1]. وفي الطب، جارى نموذج عام، بتوجيهه بأساليب صياغة الطلبات وحدها، نماذجَ بُنيت للمجال أو تفوّق عليها في اختبارات طبية [2].

### كم يكلّف الخطأ؟

في مسودة أولى سيعيد إنسان كتابتها، الأهم هو الاتساع والسرعة. أما في مخرَج يغذّي قرارًا له وزن قانوني أو مالي، فيصبح الاتساق أهم من الطلاقة، ويكون النموذج الأضيق ذو السلوك المتوقع أسهل في الثقة والتدقيق.

### أين تقيم المعرفة؟

إن كانت الإجابة تعتمد على وثائقك أنت، فالعامل الحاسم عادةً هو الاسترجاع لا النموذج؛ فنموذج عام يُعطى المقاطع الصحيحة كثيرًا ما يتفوق على نموذج متخصص لم يُعطَ شيئًا. وفي مقارنة مباشرة تفوّق الاسترجاع بثبات على الضبط الدقيق غير الموجَّه في إضافة المعرفة إلى النموذج، سواء الحقائق التي رآها في التدريب أو الجديدة عليه [3]. وطريقة تجهيز الوثائق مهمة أيضًا: إضافة سياق قصير إلى كل مقطع قبل فهرسته خفّضت إخفاقات الاسترجاع بنسبة 49% في اختبارات Anthropic [5]. ويفيد الضبط أكثر ما يفيد في الأسلوب والصيغة والحكم الذي لا يمكن تقديمه وثيقةً [3][4].

## دليل مبسّط

| الحالة | ما يكفي عادةً |
| --- | --- |
| استدلال واسع وموضوعات متنوعة وكلفة خطأ منخفضة | نموذج عام |
| يجب أن تأتي الإجابات من موادك الخاصة | نموذج عام مع استرجاع قوي |
| مفردات متخصصة وصيغ مخرجات ثابتة | نموذج مضبوط للمجال |
| مخاطر عالية وحاجة إلى سلوك متسق | نموذج مضبوط للمجال مع مراجعة بشرية |

## أخطاء شائعة

- **الضبط لإصلاح مشكلة استرجاع.** إن كانت الحقائق تنقص النموذج فلن يفيد تعليمه أسلوبًا [3].
- **الحكم على حفنة من الأمثلة.** ابنِ مجموعة اختبار صغيرة من أسئلة حقيقية، وقيّم الخيارين عليها.
- **إهمال الصيانة.** يجب إعادة تقييم النموذج المضبوط كلما تغيّر النموذج الأساسي أو تغيّرت بياناتك. والنماذج المستضافة تتغير هي أيضًا: بين مارس ويونيو 2023 تراجعت دقة GPT-4 في تمييز الأعداد الأولية من غيرها من 84% إلى 51% [6].

## الخلاصة

ابدأ بنموذج عام واسترجاع جيد؛ وإرشادات OpenAI نفسها تبدأ بصياغة الطلبات، ثم تضيف الاسترجاع أو الضبط الدقيق بحسب الفجوة التي يكشفها التقييم [4]. وانتقل إلى نموذج مضبوط للمجال حين تستطيع الإشارة إلى فجوة مقيسة على أسئلة اختبارك أنت، واحتفظ بمجموعة الاختبار تلك لتعيد النظر في القرار لاحقًا.

## المصادر

1. Wu وآخرون (2023): نموذج مالي دُرّب على نصوص مالية وعامة معًا. [BloombergGPT: A Large Language Model for Finance](https://arxiv.org/abs/2303.17564)
2. Nori وآخرون (2023): نموذج عام موجَّه بصياغة الطلبات في مقابل نماذج طبية متخصصة. [Can Generalist Foundation Models Outcompete Special-Purpose Tuning? Case Study in Medicine](https://arxiv.org/abs/2311.16452)
3. Ovadia وآخرون (2023): الاسترجاع تفوّق على الضبط الدقيق غير الموجَّه في إضافة المعرفة. [Fine-Tuning or Retrieval? Comparing Knowledge Injection in LLMs](https://arxiv.org/abs/2312.05934)
4. OpenAI، توثيق الواجهة البرمجية: متى تكفي صياغة الطلبات، ومتى يلزم الاسترجاع أو الضبط الدقيق. [Optimizing LLM Accuracy](https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy)
5. Anthropic (2024): إضافة سياق إلى مقاطع الوثائق قبل فهرستها تخفّض إخفاقات الاسترجاع. [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)
6. Chen وآخرون (2024)، مجلة Harvard Data Science Review: سلوك النموذج نفسه يتغير بين إصداراته المتتالية. [How Is ChatGPT's Behavior Changing over Time?](https://doi.org/10.1162/99608f92.5317da47)

رُوجعت المصادر في 19 نوفمبر 2026.`,
    },
  },
];

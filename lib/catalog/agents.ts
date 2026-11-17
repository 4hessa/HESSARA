// الوكيل = نموذج أساسي + تعليمات تخصصية + نموذج إدخال منظّم + عقد مخرجات + نمط مراجعة افتراضي.
// التعليمات التخصصية نفسها في agentInstructions.ts (خادم فقط) حتى لا تدخل حزمة المتصفح.
// لا يملك أي وكيل في هذه النسخة أدوات خارجية: كل ما يفعله تحليل نصي، ويُسجَّل كل استدعاء في سجل الإجراءات.
export type IntakeField = { key: string; label: string; placeholder: string; multiline?: boolean; required?: boolean };

export type AgentDef = {
  id: string;
  name: string;
  icon: "code" | "layers" | "neural" | "flask" | "shield" | "route";
  scope: string;
  canDo: string[];
  tools: string[];
  needsApproval: string[];
  limits: string[];
  examples: string[];
  intake: IntakeField[];
  sections: string[]; // عقد المخرجات
  reviewMode: string; // نمط المراجعة الافتراضي في مختبر النقد
};

const NO_TOOLS = ["تحليل نصي فقط — لا تنفيذ شفرة، ولا تصفّح، ولا وصول إلى ملفات أو أنظمة خارجية."];
const APPROVAL = ["لا ينفّذ أي إجراء خارجي. كل ما يقترحه يبقى اقتراحًا ينفّذه المستخدم بنفسه."];

export const AGENTS: AgentDef[] = [
  {
    id: "coding",
    name: "وكيل البرمجة",
    icon: "code",
    scope: "تشخيص الأخطاء، مراجعة الشفرة، واقتراح الإصلاحات واختبارات التحقق.",
    canDo: ["قراءة شفرة أو رسالة خطأ ملصقة وتحديد السبب المرجّح", "اقتراح إصلاح مع شرح أثره", "كتابة اختبار يثبت الإصلاح"],
    tools: NO_TOOLS,
    needsApproval: APPROVAL,
    limits: ["لا يشغّل الشفرة، فتشخيصه استنتاج من النص لا نتيجة تنفيذ.", "يحتاج رسالة الخطأ الكاملة وسياق الاستدعاء ليكون دقيقًا."],
    examples: ["الدالة تعيد قيمة فارغة عند القائمة الفارغة — ما السبب؟", "راجِع هذه الدالة من ناحية الحالات الحدّية."],
    intake: [
      { key: "lang", label: "اللغة وبيئة التشغيل", placeholder: "مثال: Python 3.12 على Linux" },
      { key: "error", label: "رسالة الخطأ أو السلوك غير المتوقع", placeholder: "الصق الرسالة كاملة", multiline: true, required: true },
      { key: "code", label: "الشفرة ذات الصلة", placeholder: "الصق أصغر جزء يعيد إنتاج المشكلة", multiline: true },
      { key: "tried", label: "ما الذي جرّبته؟", placeholder: "اختياري" },
    ],
    sections: ["التشخيص المرجّح", "الدليل من النص المقدَّم", "الإصلاح المقترح", "اختبار يثبت الإصلاح", "ما لم أستطع التحقق منه"],
    reviewMode: "technical",
  },
  {
    id: "systems",
    name: "وكيل هندسة الأنظمة",
    icon: "layers",
    scope: "تحليل البنية التقنية وقابلية التوسع والاعتمادية واختيار المكونات.",
    canDo: ["مقارنة بدائل معمارية بمعايير صريحة", "تحديد نقاط الفشل المنفردة والاختناقات", "اقتراح خطة ترحيل تدريجية"],
    tools: NO_TOOLS,
    needsApproval: APPROVAL,
    limits: ["التقديرات الكمية تعتمد على الأرقام التي يقدّمها المستخدم؛ لا يقيس النظام الفعلي.", "لا يطّلع على البنية الحقيقية أو فواتير السحابة."],
    examples: ["هل أفصل خدمة الإشعارات عن التطبيق الأحادي الآن؟", "كيف أتحمّل عشرة أضعاف الحمل الحالي؟"],
    intake: [
      { key: "system", label: "وصف النظام الحالي", placeholder: "المكونات، قاعدة البيانات، طريقة النشر", multiline: true, required: true },
      { key: "load", label: "الحمل والأرقام المعروفة", placeholder: "طلبات في الثانية، حجم البيانات، زمن الاستجابة" },
      { key: "goal", label: "الهدف أو القيد", placeholder: "مثال: توفر ٩٩٫٩٪ بميزانية محدودة" },
    ],
    sections: ["فهم الوضع الحالي", "الاختناقات ونقاط الفشل", "البدائل ومقايضاتها", "التوصية وشروط صلاحيتها", "خطة الترحيل والتراجع"],
    reviewMode: "risk",
  },
  {
    id: "ai",
    name: "وكيل الذكاء الاصطناعي",
    icon: "neural",
    scope: "اختيار النماذج، تصميم التجارب، وتحليل التقييمات وخطوات التدريب.",
    canDo: ["اقتراح خط أساس وتجربة قابلة للتكرار", "تشخيص بطء أو ضعف جودة تطبيق مبني على نموذج لغوي", "تصميم مجموعة تقييم ومقاييسها"],
    tools: NO_TOOLS,
    needsApproval: APPROVAL,
    limits: ["لا يدرّب نماذج ولا يشغّل تقييمات؛ يصمّمها فقط.", "معلوماته عن إصدارات النماذج وأسعارها قد تكون قديمة ويجب التحقق منها من المصدر."],
    examples: ["تطبيقي المعتمد على نموذج لغوي بطيء؛ من أين أبدأ؟", "هل أحتاج ضبطًا دقيقًا أم يكفي الاسترجاع؟"],
    intake: [
      { key: "task", label: "المهمة والبيانات", placeholder: "ما الذي يفعله النموذج، وما حجم البيانات ونوعها؟", multiline: true, required: true },
      { key: "metric", label: "كيف تقيس النجاح الآن؟", placeholder: "المقياس والقيمة الحالية إن وُجدت" },
      { key: "constraint", label: "القيود", placeholder: "زمن الاستجابة، التكلفة، العتاد، الخصوصية" },
    ],
    sections: ["صياغة المشكلة والمقياس", "خط الأساس", "الفرضيات مرتّبة بالأولوية", "تصميم التجربة", "مخاطر التقييم وحدود الاستنتاج"],
    reviewMode: "evidence",
  },
  {
    id: "research",
    name: "وكيل البحث العلمي",
    icon: "flask",
    scope: "صياغة الفرضيات، تصميم المنهجية، وتحليل القيود دون اختلاق نتائج أو مراجع.",
    canDo: ["تحويل فكرة إلى سؤال بحثي قابل للاختبار", "اقتراح منهجية ومتغيرات وضوابط", "تحديد تهديدات الصدق والقيود"],
    tools: NO_TOOLS,
    needsApproval: APPROVAL,
    limits: ["لا يبحث في قواعد البيانات العلمية ولا يستطيع تأكيد وجود مرجع.", "لا يذكر مراجع بعينها؛ يصف نوع المصادر المطلوب البحث عنها."],
    examples: ["كيف أصوغ فرضية لمشروع تخرج عن تقييم النماذج اللغوية العربية؟", "ما تهديدات الصدق في تصميم تجربتي؟"],
    intake: [
      { key: "topic", label: "الموضوع أو الفكرة", placeholder: "صف الفكرة في جملتين", multiline: true, required: true },
      { key: "stage", label: "المرحلة الحالية", placeholder: "فكرة أولية، مقترح، جمع بيانات، كتابة" },
      { key: "resources", label: "الموارد المتاحة", placeholder: "بيانات، عتاد، وقت" },
    ],
    sections: ["السؤال البحثي", "الفرضية القابلة للدحض", "المنهجية والمتغيرات", "تهديدات الصدق والقيود", "ما يجب البحث عنه في الأدبيات"],
    reviewMode: "logic",
  },
  {
    id: "security",
    name: "وكيل أمن المعلومات",
    icon: "shield",
    scope: "مراجعة المخاطر والضوابط الدفاعية والتكوينات الأمنية المصرّح بفحصها.",
    canDo: ["نمذجة تهديدات لتصميم موصوف", "مراجعة تكوين أو شفرة ملصقة بحثًا عن ثغرات شائعة", "اقتراح ضوابط دفاعية مرتّبة بالأولوية"],
    tools: NO_TOOLS,
    needsApproval: ["يفترض أن المستخدم مالك النظام أو مصرَّح له بفحصه.", ...APPROVAL],
    limits: ["دفاعي فقط: لا يكتب أدوات هجوم ولا يساعد في اختراق أنظمة الغير.", "لا يفحص النظام الحي؛ المراجعة مبنية على ما يُلصق له."],
    examples: ["راجِع إعدادات المصادقة في هذا الملف.", "ما التهديدات على واجهة رفع الملفات في تطبيقي؟"],
    intake: [
      { key: "asset", label: "ما الذي تريد حمايته؟", placeholder: "النظام، البيانات، المستخدمون", multiline: true, required: true },
      { key: "config", label: "التكوين أو الشفرة للمراجعة", placeholder: "احذف المفاتيح والأسرار قبل اللصق", multiline: true },
      { key: "auth", label: "صفتك تجاه النظام", placeholder: "مالك، مطوّر مصرَّح له، طالب في بيئة مختبر" },
    ],
    sections: ["الأصول وحدود الثقة", "التهديدات مرتّبة بالخطورة", "الضوابط الموصى بها", "كيف تتحقق من فعالية الضابط", "ما يحتاج مراجعة مختص بشري"],
    reviewMode: "risk",
  },
  {
    id: "planning",
    name: "وكيل التخطيط التقني",
    icon: "route",
    scope: "تحويل المتطلبات إلى مراحل تطوير ومهام ومخرجات قابلة للقياس.",
    canDo: ["تقسيم مشروع إلى مراحل لها معايير قبول", "تحديد الاعتماديات والمسار الحرج", "اقتراح أصغر نسخة قابلة للإثبات"],
    tools: NO_TOOLS,
    needsApproval: APPROVAL,
    limits: ["تقديرات المدة تقريبية وتعتمد على ما يذكره المستخدم عن الفريق والخبرة.", "لا ينشئ مهامًا في أدوات إدارة المشاريع."],
    examples: ["لدي ثمانية أسابيع لمشروع تخرج؛ كيف أقسّمها؟", "حوّل هذه المتطلبات إلى مراحل بمعايير قبول."],
    intake: [
      { key: "goal", label: "الهدف النهائي", placeholder: "ما الذي يجب أن يعمل في النهاية؟", multiline: true, required: true },
      { key: "time", label: "المدة والفريق", placeholder: "مثال: ٨ أسابيع، شخصان" },
      { key: "fixed", label: "ما هو ثابت لا يتغير؟", placeholder: "موعد، تقنية مفروضة، متطلبات لجنة" },
    ],
    sections: ["الهدف ومعيار النجاح", "أصغر نسخة قابلة للإثبات", "المراحل ومعايير قبولها", "الاعتماديات والمخاطر", "ما يُؤجَّل عمدًا"],
    reviewMode: "feasibility",
  },
];

const NO_TOOLS_EN = ["Text analysis only: no code execution, no browsing, and no access to files or external systems."];
const APPROVAL_EN = ["Takes no external action. Everything it proposes stays a proposal that you carry out yourself."];

/** النسخة الإنجليزية: البنية والمعرّفات نفسها، والنصوص مترجمة. */
export const AGENTS_EN: AgentDef[] = [
  {
    id: "coding",
    name: "Coding agent",
    icon: "code",
    scope: "Diagnosing errors, reviewing code, and proposing fixes with tests that verify them.",
    canDo: ["Read pasted code or an error message and identify the likely cause", "Propose a fix and explain its effect", "Write a test that proves the fix"],
    tools: NO_TOOLS_EN,
    needsApproval: APPROVAL_EN,
    limits: ["It does not run code, so its diagnosis is an inference from the text, not an execution result.", "It needs the full error message and the calling context to be accurate."],
    examples: ["The function returns an empty value for an empty list. Why?", "Review this function for edge cases."],
    intake: [
      { key: "lang", label: "Language and runtime", placeholder: "e.g. Python 3.12 on Linux" },
      { key: "error", label: "Error message or unexpected behaviour", placeholder: "Paste the full message", multiline: true, required: true },
      { key: "code", label: "Relevant code", placeholder: "Paste the smallest part that reproduces the problem", multiline: true },
      { key: "tried", label: "What have you tried?", placeholder: "Optional" },
    ],
    sections: ["Likely diagnosis", "Evidence from the text provided", "Proposed fix", "A test that proves the fix", "What I could not verify"],
    reviewMode: "technical",
  },
  {
    id: "systems",
    name: "Systems engineering agent",
    icon: "layers",
    scope: "Analysing technical architecture, scalability, reliability, and the choice of components.",
    canDo: ["Compare architectural options against explicit criteria", "Identify single points of failure and bottlenecks", "Propose a gradual migration plan"],
    tools: NO_TOOLS_EN,
    needsApproval: APPROVAL_EN,
    limits: ["Quantitative estimates depend on the figures you provide; it does not measure the real system.", "It cannot see your actual infrastructure or cloud bills."],
    examples: ["Should I split the notification service out of the monolith now?", "How do I handle ten times the current load?"],
    intake: [
      { key: "system", label: "Description of the current system", placeholder: "Components, database, how it is deployed", multiline: true, required: true },
      { key: "load", label: "Load and known figures", placeholder: "Requests per second, data size, response time" },
      { key: "goal", label: "Goal or constraint", placeholder: "e.g. 99.9% availability on a limited budget" },
    ],
    sections: ["Understanding the current state", "Bottlenecks and points of failure", "Options and their trade-offs", "Recommendation and the conditions it depends on", "Migration and rollback plan"],
    reviewMode: "risk",
  },
  {
    id: "ai",
    name: "AI agent",
    icon: "neural",
    scope: "Choosing models, designing experiments, and analysing evaluations and training steps.",
    canDo: ["Propose a baseline and a repeatable experiment", "Diagnose a slow or low-quality application built on a language model", "Design an evaluation set and its metrics"],
    tools: NO_TOOLS_EN,
    needsApproval: APPROVAL_EN,
    limits: ["It does not train models or run evaluations; it only designs them.", "Its knowledge of model versions and prices may be out of date and must be checked at the source."],
    examples: ["My LLM-based app is slow. Where do I start?", "Do I need fine-tuning, or is retrieval enough?"],
    intake: [
      { key: "task", label: "Task and data", placeholder: "What does the model do, and what is the size and type of the data?", multiline: true, required: true },
      { key: "metric", label: "How do you measure success now?", placeholder: "The metric and its current value, if any" },
      { key: "constraint", label: "Constraints", placeholder: "Latency, cost, hardware, privacy" },
    ],
    sections: ["Framing the problem and the metric", "Baseline", "Hypotheses in order of priority", "Experiment design", "Evaluation risks and limits of the conclusion"],
    reviewMode: "evidence",
  },
  {
    id: "research",
    name: "Scientific research agent",
    icon: "flask",
    scope: "Framing hypotheses, designing methodology, and analysing limitations without inventing results or references.",
    canDo: ["Turn an idea into a testable research question", "Propose a methodology, variables, and controls", "Identify threats to validity and limitations"],
    tools: NO_TOOLS_EN,
    needsApproval: APPROVAL_EN,
    limits: ["It does not search scientific databases and cannot confirm that a reference exists.", "It names no specific references; it describes the kind of sources to look for."],
    examples: ["How do I frame a hypothesis for a graduation project on evaluating Arabic language models?", "What are the threats to validity in my experiment design?"],
    intake: [
      { key: "topic", label: "Topic or idea", placeholder: "Describe the idea in two sentences", multiline: true, required: true },
      { key: "stage", label: "Current stage", placeholder: "Initial idea, proposal, data collection, writing" },
      { key: "resources", label: "Available resources", placeholder: "Data, hardware, time" },
    ],
    sections: ["The research question", "A falsifiable hypothesis", "Methodology and variables", "Threats to validity and limitations", "What to search for in the literature"],
    reviewMode: "logic",
  },
  {
    id: "security",
    name: "Information security agent",
    icon: "shield",
    scope: "Reviewing risks, defensive controls, and security configurations you are authorised to examine.",
    canDo: ["Threat-model a described design", "Review pasted configuration or code for common vulnerabilities", "Propose defensive controls in order of priority"],
    tools: NO_TOOLS_EN,
    needsApproval: ["It assumes you own the system or are authorised to examine it.", ...APPROVAL_EN],
    limits: ["Defensive only: it does not write attack tools or help break into other people's systems.", "It does not scan the live system; the review rests on what you paste."],
    examples: ["Review the authentication settings in this file.", "What are the threats to the file-upload endpoint in my app?"],
    intake: [
      { key: "asset", label: "What do you want to protect?", placeholder: "The system, the data, the users", multiline: true, required: true },
      { key: "config", label: "Configuration or code to review", placeholder: "Remove keys and secrets before pasting", multiline: true },
      { key: "auth", label: "Your role towards the system", placeholder: "Owner, authorised developer, student in a lab environment" },
    ],
    sections: ["Assets and trust boundaries", "Threats ranked by severity", "Recommended controls", "How to check a control works", "What needs review by a human specialist"],
    reviewMode: "risk",
  },
  {
    id: "planning",
    name: "Technical planning agent",
    icon: "route",
    scope: "Turning requirements into development phases, tasks, and measurable deliverables.",
    canDo: ["Split a project into phases with acceptance criteria", "Identify dependencies and the critical path", "Propose the smallest version that proves the idea"],
    tools: NO_TOOLS_EN,
    needsApproval: APPROVAL_EN,
    limits: ["Duration estimates are approximate and depend on what you say about the team and its experience.", "It does not create tasks in project-management tools."],
    examples: ["I have eight weeks for a graduation project. How should I split them?", "Turn these requirements into phases with acceptance criteria."],
    intake: [
      { key: "goal", label: "Final goal", placeholder: "What must work at the end?", multiline: true, required: true },
      { key: "time", label: "Time and team", placeholder: "e.g. 8 weeks, two people" },
      { key: "fixed", label: "What is fixed and cannot change?", placeholder: "A deadline, an imposed technology, committee requirements" },
    ],
    sections: ["Goal and success criterion", "The smallest version that proves the idea", "Phases and their acceptance criteria", "Dependencies and risks", "What is deliberately postponed"],
    reviewMode: "feasibility",
  },
];

export const agentsFor = (lang: "ar" | "en" = "ar") => (lang === "en" ? AGENTS_EN : AGENTS);
export const agentById = (id: string | null | undefined, lang: "ar" | "en" = "ar") => agentsFor(lang).find((a) => a.id === id);

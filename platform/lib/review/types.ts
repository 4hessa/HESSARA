export type Severity = "high" | "medium" | "low";
export type Finding = { severity: Severity; title: string; detail: string; quote?: string; suggestion?: string };
export type Verdict = { criterion: string; status: "pass" | "fail" | "unclear"; reason: string };
export type ReviewResult = {
  engine: "llm" | "heuristic";
  engineLabel: string;
  summary: string;
  strengths: string[];
  findings: Finding[];
  verdicts: Verdict[];
  needsHuman: boolean;
  limits: string[];
};

export type ReviewMode = {
  id: string;
  name: string;
  short: string;
  criteria: string[]; // المعايير المعلنة التي يُحكم بها
  needsCriteria?: boolean;
};

export const REVIEW_MODES: ReviewMode[] = [
  {
    id: "technical",
    name: "الناقد التقني",
    short: "أخطاء، افتراضات ضعيفة، ومشكلات هندسية.",
    criteria: ["هل تُقاس المشكلة قبل اقتراح الحل؟", "هل توجد طريقة تحقق من النتيجة؟", "هل تُذكر الافتراضات والمعلومات الناقصة؟", "هل تخلو من أحكام مطلقة غير مبررة؟", "هل تعالج الشفرة المعروضة حالات الخطأ؟"],
  },
  {
    id: "evidence",
    name: "مدقق الأدلة",
    short: "هل الادعاءات مدعومة بما هو معروض فعلًا؟",
    criteria: ["هل لكل رقم أو نسبة مصدر أو طريقة قياس؟", "هل تُنسب الادعاءات إلى مصادر يمكن الرجوع إليها؟", "هل يُفصل بين الحقيقة والاستنتاج؟", "هل يُصرَّح بما لم يُتحقق منه؟"],
  },
  {
    id: "risk",
    name: "محلل المخاطر",
    short: "الإخفاقات المحتملة وأثرها وخطط التراجع.",
    criteria: ["هل تُذكر المخاطر صراحةً؟", "هل توجد خطة تراجع أو نسخ احتياطي؟", "هل توجد مراقبة تكشف الفشل؟", "هل يُنفَّذ التغيير تدريجيًا؟", "هل تُراعى البيانات والأسرار؟"],
  },
  {
    id: "logic",
    name: "المراجع المنطقي",
    short: "تناقضات واستنتاجات غير مبررة.",
    criteria: ["هل تخلو من تعميمات مطلقة؟", "هل الاستنتاجات مسبوقة بمقدماتها؟", "هل تُعرض بدائل أو تفسيرات أخرى؟", "هل تخلو من مغالطة السبب الواحد؟"],
  },
  {
    id: "feasibility",
    name: "مراجع التنفيذ",
    short: "قابلية تطبيق الخطة: متطلبات، موارد، خطوات.",
    criteria: ["هل الخطوات مرقّمة ومرتّبة؟", "هل تُذكر المتطلبات المسبقة والاعتماديات؟", "هل تُحدَّد الموارد أو المدة أو المسؤول؟", "هل لكل مرحلة معيار قبول؟", "هل يُحدَّد ما يُؤجَّل؟"],
  },
  {
    id: "judge",
    name: "المحكّم المنظّم",
    short: "حكم لكل معيار تكتبه أنت: مستوفى، غير مستوفى، أو غير محسوم.",
    criteria: [],
    needsCriteria: true,
  },
];

/** النسخة الإنجليزية: المعرّفات نفسها، والأسماء والمعايير مترجمة. */
export const REVIEW_MODES_EN: ReviewMode[] = [
  {
    id: "technical",
    name: "Technical critic",
    short: "Errors, weak assumptions, and engineering problems.",
    criteria: ["Is the problem measured before a solution is proposed?", "Is there a way to verify the result?", "Are assumptions and missing information stated?", "Is it free of unjustified absolute claims?", "Does any code shown handle error cases?"],
  },
  {
    id: "evidence",
    name: "Evidence checker",
    short: "Are the claims supported by what is actually shown?",
    criteria: ["Does every figure or percentage have a source or a method of measurement?", "Are claims attributed to sources that can be consulted?", "Is fact separated from inference?", "Is what has not been verified stated?"],
  },
  {
    id: "risk",
    name: "Risk analyst",
    short: "Possible failures, their impact, and rollback plans.",
    criteria: ["Are the risks stated explicitly?", "Is there a rollback plan or a backup?", "Is there monitoring that would reveal a failure?", "Is the change rolled out gradually?", "Are data and secrets taken into account?"],
  },
  {
    id: "logic",
    name: "Logic reviewer",
    short: "Contradictions and unjustified conclusions.",
    criteria: ["Is it free of absolute generalisations?", "Are conclusions preceded by their premises?", "Are alternatives or other explanations presented?", "Is it free of the single-cause fallacy?"],
  },
  {
    id: "feasibility",
    name: "Delivery reviewer",
    short: "Whether the plan can be carried out: requirements, resources, steps.",
    criteria: ["Are the steps numbered and ordered?", "Are prerequisites and dependencies stated?", "Are resources, duration, or an owner set?", "Does every phase have an acceptance criterion?", "Is what will be postponed identified?"],
  },
  {
    id: "judge",
    name: "Structured judge",
    short: "A verdict for each criterion you write: met, not met, or undecided.",
    criteria: [],
    needsCriteria: true,
  },
];

export const modesFor = (lang: "ar" | "en" = "ar") => (lang === "en" ? REVIEW_MODES_EN : REVIEW_MODES);
export const modeById = (id: string, lang: "ar" | "en" = "ar") => modesFor(lang).find((m) => m.id === id);

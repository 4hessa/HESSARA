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

export const modeById = (id: string) => REVIEW_MODES.find((m) => m.id === id);

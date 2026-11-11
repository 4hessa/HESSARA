// المراجع القاعدي: فحوص حتمية بتعابير نمطية. يكشف غياب عناصر بنيوية
// (قياس، تحقق، مصادر، تراجع…) ولا يفهم المعنى ولا يتحقق من صحة أي معلومة.
import { modeById, type Finding, type ReviewResult, type Verdict } from "./types.ts";

type Check = {
  title: string;
  severity: Finding["severity"];
  /** يعيد true إذا وُجدت المشكلة. قد يعيد الاقتباس المخالف. */
  problem: (t: string) => boolean | string;
  detail: string;
  suggestion: string;
  strength?: string;
};

const has = (re: RegExp) => (t: string) => re.test(t);
const lacks = (re: RegExp) => (t: string) => !re.test(t);
const firstMatch = (re: RegExp) => (t: string) => {
  const m = t.match(re);
  if (!m) return false;
  const i = m.index ?? 0;
  return t.slice(Math.max(0, i - 30), i + m[0].length + 40).replace(/\s+/g, " ").trim();
};

const ABSOLUTE = /(دائم[ًا]{1,2}|مضمون[ةه]?|بالتأكيد|حتم[ًا]{1,2}|بلا شك|لا يمكن أن|مستحيل|أفضل حل|الحل الوحيد|always|never|guarantee)/i;
const MEASURE = /(قِ?س|قياس|مقياس|سجّل|وسيط|مئين|benchmark|profil|metric)/i;
const VERIFY = /(تحق[ّق]|اختبار|اختبر|قارن|معيار قبول|verify|test)/i;
const ASSUME = /(افتراض|يُفترض|بافتراض|معلومات ناقصة|غير معروف|حدود الثقة|لا أعرف|غير متأكد|assum)/i;
const SOURCE = /(https?:\/\/|المصدر|وفق|بحسب|حسب (دراسة|تقرير|توثيق)|مرجع|\[\d+\])/i;
const NUMBER_CLAIM = /(\d+([.,٫]\d+)?\s?[%٪]|[٠-٩]+\s?[%٪]|\d+\s?(x|×|ضعف|أضعاف)|أسرع ب|أفضل ب)/i;
const RISK = /(مخاطر|مخاطرة|خطر|قد يفشل|قد يؤدي|risk)/i;
const ROLLBACK = /(تراجع|استرجاع|نسخ احتياطي|نسخة احتياطية|rollback|backup|مفتاح تبديل)/i;
const MONITOR = /(مراقبة|تنبيه|سجلات|سجّل|monitor|alert|log)/i;
const GRADUAL = /(تدريج|مرحل|جزء من المستخدمين|تجريبي[ًا]? أول|canary|خلف مفتاح)/i;
const SECRETS = /(سر|أسرار|مفتاح|بيانات شخصية|خصوصية|تشفير|secret|privacy)/i;
const STEPS = /(^|\n)\s*(\d+|[١-٩])[.)-]\s+\S/;
const PREREQ = /(متطلب|يلزم|يحتاج|اعتمادي|قبل البدء|prerequisite|depend)/i;
const RESOURCES = /(أسبوع|يوم|شهر|ساعة|مسؤول|فريق|ميزانية|تكلفة|موارد|week|day|owner|budget)/i;
const ACCEPT = /(معيار قبول|معايير القبول|المخرج|يُعتبر مكتمل|definition of done|مخرجات)/i;
const DEFER = /(يُؤجَّل|يؤجل|لاحق[ًا]{1,2}|خارج النطاق|مرحلة تالية|out of scope)/i;
const ALTERNATIVES = /(بديل|بدائل|خيار آخر|من جهة أخرى|في المقابل|أو يمكن|alternativ)/i;
const BECAUSE = /(لأن|بسبب|نتيجة|إذ إن|ولذلك|لذا|because|therefore)/i;
const CODE = /```/;
const ERR_HANDLING = /(try|catch|except|raise|throw|if\s+err|Result<|\?\?|معالجة الخطأ)/i;

const CHECKS: Record<string, Check[]> = {
  technical: [
    { title: "لا قياس قبل الحل", severity: "high", problem: lacks(MEASURE), detail: "لم يرد في النص ما يدل على قياس المشكلة أو تحديد خط أساس قبل اقتراح التغييرات.", suggestion: "أضف خطوة قياس محددة (ماذا يُقاس وبأي أداة) قبل أي تعديل.", strength: "يتضمن النص قياسًا أو خط أساس." },
    { title: "لا طريقة للتحقق من النتيجة", severity: "high", problem: lacks(VERIFY), detail: "لا يذكر النص كيف يُعرف أن الحل نجح.", suggestion: "حدّد اختبارًا أو مقارنة قبل/بعد بمعيار نجاح رقمي.", strength: "يذكر النص طريقة للتحقق." },
    { title: "الافتراضات غير مصرَّح بها", severity: "medium", problem: lacks(ASSUME), detail: "لم يُذكر أي افتراض أو معلومة ناقصة، وهذا نادر في تحليل تقني سليم.", suggestion: "اكتب قائمة قصيرة بما افترضته وما لا تعرفه.", strength: "يصرّح النص بافتراضاته أو بحدود معرفته." },
    { title: "حكم مطلق", severity: "medium", problem: firstMatch(ABSOLUTE), detail: "صياغة قاطعة لا يسندها دليل معروض في النص.", suggestion: "استبدل بها صياغة مشروطة تذكر متى يصحّ الحكم.", strength: "يخلو النص من الأحكام المطلقة التي يكشفها هذا الفحص." },
    { title: "شفرة بلا معالجة أخطاء ظاهرة", severity: "low", problem: (t) => CODE.test(t) && !ERR_HANDLING.test(t), detail: "يحتوي النص شفرة، ولم يُعثر فيها على نمط معالجة أخطاء.", suggestion: "وضّح سلوك الشفرة عند فشل الاستدعاء أو المدخل غير الصالح." },
  ],
  evidence: [
    { title: "رقم أو نسبة بلا مصدر", severity: "high", problem: (t) => (NUMBER_CLAIM.test(t) && !SOURCE.test(t) ? (firstMatch(NUMBER_CLAIM)(t) as string) : false), detail: "ورد ادعاء كمّي ولم يرد في النص أي مصدر أو طريقة قياس.", suggestion: "اذكر مصدر الرقم أو كيف قيس، أو احذفه." },
    { title: "لا مصادر في النص", severity: "medium", problem: lacks(SOURCE), detail: "لا يحتوي النص روابط ولا إحالات يمكن الرجوع إليها.", suggestion: "أرفق مصدرًا لكل ادعاء لا يُعدّ معرفة عامة.", strength: "يحتوي النص إحالات أو روابط (لم يُتحقق من صحتها)." },
    { title: "لا فصل بين الحقيقة والاستنتاج", severity: "medium", problem: lacks(/(استنتاج|أرجّح|يُحتمل|على الأرجح|تخمين|فرضية|likely|probably)/i), detail: "لا توجد ألفاظ تميّز المؤكد من المرجّح.", suggestion: "علّم الجمل الاستنتاجية بألفاظ ترجيح صريحة.", strength: "يميّز النص بين المؤكد والمرجّح." },
    { title: "لا تصريح بما لم يُتحقق منه", severity: "low", problem: lacks(ASSUME), detail: "لم يُذكر ما لم يُتحقق منه.", suggestion: "أضف فقرة «ما لم أتحقق منه».", strength: "يصرّح النص بحدود التحقق." },
  ],
  risk: [
    { title: "المخاطر غير مذكورة", severity: "high", problem: lacks(RISK), detail: "لا يذكر النص أي مخاطرة أو احتمال فشل.", suggestion: "اذكر لكل خطوة مؤثرة: ما الذي قد يفشل وما أثره.", strength: "يذكر النص مخاطر صراحةً." },
    { title: "لا خطة تراجع", severity: "high", problem: lacks(ROLLBACK), detail: "لا توجد خطة تراجع أو نسخ احتياطي.", suggestion: "حدّد كيف تعود للحالة السابقة وكم يستغرق ذلك.", strength: "توجد خطة تراجع أو نسخ احتياطي." },
    { title: "لا مراقبة تكشف الفشل", severity: "medium", problem: lacks(MONITOR), detail: "لم تُذكر مراقبة أو تنبيهات.", suggestion: "حدّد المؤشر الذي سينبّهك إلى الفشل وعتبته.", strength: "تُذكر مراقبة أو سجلات." },
    { title: "تنفيذ دفعة واحدة", severity: "medium", problem: lacks(GRADUAL), detail: "لا يدل النص على تنفيذ تدريجي.", suggestion: "طبّق التغيير على جزء محدود أولًا.", strength: "التنفيذ تدريجي." },
    { title: "لا ذكر للبيانات والأسرار", severity: "low", problem: lacks(SECRETS), detail: "لم يُتطرق لأثر التغيير على البيانات الحساسة.", suggestion: "وضّح إن كان التغيير يمسّ بيانات شخصية أو أسرارًا." },
  ],
  logic: [
    { title: "تعميم مطلق", severity: "medium", problem: firstMatch(ABSOLUTE), detail: "تعميم قاطع يكفي مثال مضاد واحد لنقضه.", suggestion: "حدّد نطاق صحة العبارة.", strength: "لم يُعثر على تعميمات مطلقة من النوع الذي يكشفه هذا الفحص." },
    { title: "استنتاجات بلا تعليل ظاهر", severity: "medium", problem: lacks(BECAUSE), detail: "لا توجد أدوات تعليل تربط النتائج بمقدماتها.", suggestion: "اربط كل توصية بسببها.", strength: "يستخدم النص تعليلًا صريحًا." },
    { title: "لا بدائل ولا تفسيرات أخرى", severity: "medium", problem: lacks(ALTERNATIVES), detail: "يعرض النص مسارًا واحدًا دون بدائل.", suggestion: "اذكر بديلًا واحدًا على الأقل ولماذا استُبعد.", strength: "يعرض النص بدائل." },
    { title: "سبب واحد لمشكلة مركّبة", severity: "low", problem: (t) => /(السبب الوحيد|السبب هو|المشكلة هي ببساطة)/.test(t), detail: "يُنسب الأثر لسبب واحد دون استبعاد غيره.", suggestion: "اذكر الأسباب الأخرى الممكنة وكيف تُستبعد." },
  ],
  feasibility: [
    { title: "الخطوات غير مرقّمة", severity: "medium", problem: lacks(STEPS), detail: "لا توجد خطوات مرقّمة مرتّبة.", suggestion: "حوّل الخطة إلى خطوات مرقّمة.", strength: "الخطوات مرقّمة ومرتّبة." },
    { title: "لا متطلبات مسبقة", severity: "medium", problem: lacks(PREREQ), detail: "لم تُذكر متطلبات أو اعتماديات.", suggestion: "اذكر ما يجب توفره قبل البدء.", strength: "تُذكر المتطلبات أو الاعتماديات." },
    { title: "لا موارد ولا مدة ولا مسؤول", severity: "high", problem: lacks(RESOURCES), detail: "لا تحدد الخطة وقتًا أو موارد أو مسؤولًا.", suggestion: "أضف لكل مرحلة مدة تقريبية ومن ينفّذها.", strength: "تحدد الخطة موارد أو مددًا." },
    { title: "لا معايير قبول", severity: "high", problem: lacks(ACCEPT), detail: "لا يُعرف متى تُعدّ المرحلة منجزة.", suggestion: "اكتب لكل مرحلة مخرجًا ومعيار قبول.", strength: "توجد مخرجات أو معايير قبول." },
    { title: "لا تحديد لما يُؤجَّل", severity: "low", problem: lacks(DEFER), detail: "لا يوضح النص ما هو خارج النطاق.", suggestion: "اذكر ما يُؤجَّل عمدًا.", strength: "يحدد النص ما يُؤجَّل." },
  ],
};

const STOP = new Set(["هل", "في", "من", "على", "إلى", "عن", "أن", "أو", "ما", "لا", "كل", "مع", "هذا", "هذه", "التي", "الذي", "يكون", "تكون", "ذكر", "يذكر", "تذكر", "النص", "الإجابة", "the", "is", "a", "an", "of", "and", "to"]);
const norm = (s: string) =>
  s.toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");

function judge(text: string, criteria: string[]): Verdict[] {
  const t = norm(text);
  return criteria.map((criterion) => {
    const words = norm(criterion).split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2 && !STOP.has(w));
    const stems = words.map((w) => (w.startsWith("ال") && w.length > 4 ? w.slice(2) : w));
    const hits = stems.filter((w) => t.includes(w));
    if (!stems.length) return { criterion, status: "unclear", reason: "المعيار أقصر من أن يُطابَق لفظيًا." };
    if (hits.length === 0)
      return { criterion, status: "fail", reason: "لم ترد في النص أيٌّ من ألفاظ المعيار. قد يكون مستوفى بصياغة أخرى لا يكشفها هذا المحرك." };
    return {
      criterion,
      status: "unclear",
      reason: `وردت ألفاظ ذات صلة (${hits.slice(0, 4).join("، ")})، لكن المطابقة اللفظية لا تكفي للحكم بالاستيفاء.`,
    };
  });
}

export function heuristicReview(modeId: string, text: string, criteria: string[]): ReviewResult {
  const mode = modeById(modeId);
  const findings: Finding[] = [];
  const strengths: string[] = [];
  let verdicts: Verdict[] = [];

  if (modeId === "judge") {
    verdicts = judge(text, criteria);
  } else {
    for (const c of CHECKS[modeId] ?? []) {
      const r = c.problem(text);
      if (r) findings.push({ severity: c.severity, title: c.title, detail: c.detail, suggestion: c.suggestion, quote: typeof r === "string" ? r : undefined });
      else if (c.strength) strengths.push(c.strength);
    }
  }
  const order = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);
  const high = findings.filter((f) => f.severity === "high").length;

  return {
    engine: "heuristic",
    engineLabel: "المراجع القاعدي (فحوص نمطية حتمية)",
    summary:
      modeId === "judge"
        ? `فُحص ${verdicts.length} معيار بمطابقة لفظية. هذا المحرك لا يحكم بالاستيفاء؛ يحدد فقط ما غابت ألفاظه كليًا.`
        : findings.length
          ? `كشف نمط «${mode?.name}» ${findings.length} ملاحظة، منها ${high} عالية الأهمية.`
          : `لم يكشف نمط «${mode?.name}» ملاحظات بالفحوص النمطية. هذا لا يعني سلامة المحتوى.`,
    strengths,
    findings,
    verdicts,
    needsHuman: true,
    limits: [
      "الفحوص تبحث عن وجود ألفاظ وبُنى، ولا تفهم المعنى.",
      "لا يتحقق هذا المحرك من صحة أي معلومة أو مصدر.",
      "غياب الملاحظات لا يعني صحة النص، ووجودها لا يعني خطأه.",
    ],
  };
}

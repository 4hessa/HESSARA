// المراجع القاعدي: فحوص حتمية بتعابير نمطية. يكشف غياب عناصر بنيوية
// (قياس، تحقق، مصادر، تراجع…) ولا يفهم المعنى ولا يتحقق من صحة أي معلومة.
// الأنماط تغطي العربية والإنجليزية معًا، والرسائل تُعرض بلغة الواجهة.
import { modeById, type Finding, type ReviewResult, type Verdict } from "./types.ts";

type L = "ar" | "en";
type Bi = { ar: string; en: string };
type Check = {
  title: Bi;
  severity: Finding["severity"];
  /** يعيد true إذا وُجدت المشكلة. قد يعيد الاقتباس المخالف. */
  problem: (t: string) => boolean | string;
  detail: Bi;
  suggestion: Bi;
  strength?: Bi;
};

const lacks = (re: RegExp) => (t: string) => !re.test(t);
const firstMatch = (re: RegExp) => (t: string) => {
  const m = t.match(re);
  if (!m) return false;
  const i = m.index ?? 0;
  return t.slice(Math.max(0, i - 30), i + m[0].length + 40).replace(/\s+/g, " ").trim();
};
const b = (ar: string, en: string): Bi => ({ ar, en });

const ABSOLUTE = /(دائم[ًا]{1,2}|مضمون[ةه]?|بالتأكيد|حتم[ًا]{1,2}|بلا شك|لا يمكن أن|مستحيل|أفضل حل|الحل الوحيد|\b(?:always|never|guarante\w*|certainly|definitely|impossible|the best solution|the only solution)\b)/i;
const MEASURE = /(قِ?س|قياس|مقياس|سجّل|وسيط|مئين|\b(?:measur\w*|baseline|benchmark\w*|profil\w*|metrics?|percentile|p9[59]|latency budget)\b)/i;
const VERIFY = /(تحق[ّق]|اختبار|اختبر|قارن|معيار قبول|\b(?:verif\w*|test\w*|compar\w*|acceptance criteri\w*|validat\w*)\b)/i;
const ASSUME = /(افتراض|يُفترض|بافتراض|معلومات ناقصة|غير معروف|حدود الثقة|لا أعرف|غير متأكد|\b(?:assum\w*|unknowns?|missing information|not sure|uncertain\w*|limits? of confidence|I do not know|I don't know)\b)/i;
const SOURCE = /(https?:\/\/|المصدر|وفق|بحسب|حسب (دراسة|تقرير|توثيق)|مرجع|\[\d+\]|\b(?:source[sd]?|according to|reference[sd]?|cited|documentation states)\b)/i;
// التكرارات محدودة الطول: تعابير بلا حدود كانت تربيعية الكلفة على سلاسل أرقام أو أسطر طويلة.
const NUMBER_CLAIM = /(\d{1,12}([.,٫]\d{1,12})?\s?[%٪]|[٠-٩]{1,12}\s?[%٪]|\d{1,12}\s?(x|×|ضعف|أضعاف|times (?:faster|better|slower))|أسرع ب|أفضل ب|faster by|better by)/i;
const RISK = /(مخاطر|مخاطرة|خطر|قد يفشل|قد يؤدي|\b(?:risks?|risky|could fail|may fail|might fail|failure mode)\b)/i;
const ROLLBACK = /(تراجع|استرجاع|نسخ احتياطي|نسخة احتياطية|مفتاح تبديل|\b(?:roll ?back|revert\w*|backups?|feature flag|kill switch)\b)/i;
const MONITOR = /(مراقبة|تنبيه|سجلات|سجّل|\b(?:monitor\w*|alert\w*|logs?|logging|dashboard|observab\w*)\b)/i;
const GRADUAL = /(تدريج|مرحل|جزء من المستخدمين|تجريبي[ًا]? أول|خلف مفتاح|\b(?:gradual\w*|phased|staged|canary|subset of users|behind a flag|pilot)\b)/i;
const SECRETS = /(سر|أسرار|مفتاح|بيانات شخصية|خصوصية|تشفير|\b(?:secrets?|keys?|personal data|privacy|encrypt\w*|credentials?)\b)/i;
const STEPS = /(^|\n)[^\S\n]{0,40}(\d{1,9}|[١-٩])[.)-]\s\s{0,10}\S/;
const PREREQ = /(متطلب|يلزم|يحتاج|اعتمادي|قبل البدء|\b(?:prerequisites?|depend\w*|requires?|before starting)\b)/i;
const RESOURCES = /(أسبوع|يوم|شهر|ساعة|مسؤول|فريق|ميزانية|تكلفة|موارد|\b(?:weeks?|days?|months?|hours?|owner|team|budget|cost|resources?)\b)/i;
const ACCEPT = /(معيار قبول|معايير القبول|المخرج|يُعتبر مكتمل|مخرجات|\b(?:acceptance criteri\w*|definition of done|deliverables?|done when)\b)/i;
const DEFER = /(يُؤجَّل|يؤجل|لاحق[ًا]{1,2}|خارج النطاق|مرحلة تالية|\b(?:defer\w*|postpon\w*|later phase|next phase|out of scope)\b)/i;
const ALTERNATIVES = /(بديل|بدائل|خيار آخر|من جهة أخرى|في المقابل|أو يمكن|\b(?:alternativ\w*|options?|on the other hand|instead|trade-?offs?)\b)/i;
const BECAUSE = /(لأن|بسبب|نتيجة|إذ إن|ولذلك|لذا|\b(?:because|therefore|since|due to|as a result|so that)\b)/i;
const INFERENCE = /(استنتاج|أرجّح|يُحتمل|على الأرجح|تخمين|فرضية|\b(?:likely|probably|inferred?|hypothes\w*|estimate\w*|I suspect)\b)/i;
const ONE_CAUSE = /(السبب الوحيد|السبب هو|المشكلة هي ببساطة|\b(?:the only reason|the cause is|the problem is simply)\b)/i;
const CODE = /```/;
const ERR_HANDLING = /(try|catch|except|raise|throw|if\s+err|Result<|\?\?|معالجة الخطأ)/i;

const CHECKS: Record<string, Check[]> = {
  technical: [
    { title: b("لا قياس قبل الحل", "No measurement before the solution"), severity: "high", problem: lacks(MEASURE), detail: b("لم يرد في النص ما يدل على قياس المشكلة أو تحديد خط أساس قبل اقتراح التغييرات.", "Nothing in the text shows the problem being measured or a baseline being set before changes are proposed."), suggestion: b("أضف خطوة قياس محددة (ماذا يُقاس وبأي أداة) قبل أي تعديل.", "Add a specific measurement step (what is measured, and with which tool) before any change."), strength: b("يتضمن النص قياسًا أو خط أساس.", "The text includes a measurement or a baseline.") },
    { title: b("لا طريقة للتحقق من النتيجة", "No way to verify the result"), severity: "high", problem: lacks(VERIFY), detail: b("لا يذكر النص كيف يُعرف أن الحل نجح.", "The text does not say how you would know the solution worked."), suggestion: b("حدّد اختبارًا أو مقارنة قبل/بعد بمعيار نجاح رقمي.", "Define a test or a before/after comparison with a numeric success criterion."), strength: b("يذكر النص طريقة للتحقق.", "The text states a way to verify.") },
    { title: b("الافتراضات غير مصرَّح بها", "Assumptions are not stated"), severity: "medium", problem: lacks(ASSUME), detail: b("لم يُذكر أي افتراض أو معلومة ناقصة، وهذا نادر في تحليل تقني سليم.", "No assumption or missing information is mentioned, which is rare in sound technical analysis."), suggestion: b("اكتب قائمة قصيرة بما افترضته وما لا تعرفه.", "Write a short list of what you assumed and what you do not know."), strength: b("يصرّح النص بافتراضاته أو بحدود معرفته.", "The text states its assumptions or the limits of its knowledge.") },
    { title: b("حكم مطلق", "Absolute claim"), severity: "medium", problem: firstMatch(ABSOLUTE), detail: b("صياغة قاطعة لا يسندها دليل معروض في النص.", "A categorical statement with no evidence shown in the text."), suggestion: b("استبدل بها صياغة مشروطة تذكر متى يصحّ الحكم.", "Replace it with a conditional statement that says when the claim holds."), strength: b("يخلو النص من الأحكام المطلقة التي يكشفها هذا الفحص.", "The text has none of the absolute claims this check detects.") },
    { title: b("شفرة بلا معالجة أخطاء ظاهرة", "Code without visible error handling"), severity: "low", problem: (t) => CODE.test(t) && !ERR_HANDLING.test(t), detail: b("يحتوي النص شفرة، ولم يُعثر فيها على نمط معالجة أخطاء.", "The text contains code, and no error-handling pattern was found in it."), suggestion: b("وضّح سلوك الشفرة عند فشل الاستدعاء أو المدخل غير الصالح.", "Make clear what the code does when a call fails or the input is invalid.") },
  ],
  evidence: [
    { title: b("رقم أو نسبة بلا مصدر", "A figure or percentage without a source"), severity: "high", problem: (t) => (NUMBER_CLAIM.test(t) && !SOURCE.test(t) ? (firstMatch(NUMBER_CLAIM)(t) as string) : false), detail: b("ورد ادعاء كمّي ولم يرد في النص أي مصدر أو طريقة قياس.", "A quantitative claim appears, with no source or method of measurement in the text."), suggestion: b("اذكر مصدر الرقم أو كيف قيس، أو احذفه.", "State the figure's source or how it was measured, or remove it.") },
    { title: b("لا مصادر في النص", "No sources in the text"), severity: "medium", problem: lacks(SOURCE), detail: b("لا يحتوي النص روابط ولا إحالات يمكن الرجوع إليها.", "The text contains no links or references that can be consulted."), suggestion: b("أرفق مصدرًا لكل ادعاء لا يُعدّ معرفة عامة.", "Attach a source to every claim that is not common knowledge."), strength: b("يحتوي النص إحالات أو روابط (لم يُتحقق من صحتها).", "The text contains references or links (not checked for accuracy).") },
    { title: b("لا فصل بين الحقيقة والاستنتاج", "No separation of fact and inference"), severity: "medium", problem: lacks(INFERENCE), detail: b("لا توجد ألفاظ تميّز المؤكد من المرجّح.", "No wording distinguishes what is certain from what is likely."), suggestion: b("علّم الجمل الاستنتاجية بألفاظ ترجيح صريحة.", "Mark inferred sentences with explicit words of likelihood."), strength: b("يميّز النص بين المؤكد والمرجّح.", "The text distinguishes the certain from the likely.") },
    { title: b("لا تصريح بما لم يُتحقق منه", "Nothing said about what was not verified"), severity: "low", problem: lacks(ASSUME), detail: b("لم يُذكر ما لم يُتحقق منه.", "What has not been verified is not mentioned."), suggestion: b("أضف فقرة «ما لم أتحقق منه».", "Add a paragraph on what you have not verified."), strength: b("يصرّح النص بحدود التحقق.", "The text states the limits of verification.") },
  ],
  risk: [
    { title: b("المخاطر غير مذكورة", "Risks are not mentioned"), severity: "high", problem: lacks(RISK), detail: b("لا يذكر النص أي مخاطرة أو احتمال فشل.", "The text mentions no risk or possibility of failure."), suggestion: b("اذكر لكل خطوة مؤثرة: ما الذي قد يفشل وما أثره.", "For every significant step, state what could fail and what the impact would be."), strength: b("يذكر النص مخاطر صراحةً.", "The text names risks explicitly.") },
    { title: b("لا خطة تراجع", "No rollback plan"), severity: "high", problem: lacks(ROLLBACK), detail: b("لا توجد خطة تراجع أو نسخ احتياطي.", "There is no rollback plan or backup."), suggestion: b("حدّد كيف تعود للحالة السابقة وكم يستغرق ذلك.", "State how you would return to the previous state, and how long it would take."), strength: b("توجد خطة تراجع أو نسخ احتياطي.", "There is a rollback plan or a backup.") },
    { title: b("لا مراقبة تكشف الفشل", "No monitoring to reveal failure"), severity: "medium", problem: lacks(MONITOR), detail: b("لم تُذكر مراقبة أو تنبيهات.", "No monitoring or alerts are mentioned."), suggestion: b("حدّد المؤشر الذي سينبّهك إلى الفشل وعتبته.", "Name the signal that would warn you of failure, and its threshold."), strength: b("تُذكر مراقبة أو سجلات.", "Monitoring or logs are mentioned.") },
    { title: b("تنفيذ دفعة واحدة", "All-at-once rollout"), severity: "medium", problem: lacks(GRADUAL), detail: b("لا يدل النص على تنفيذ تدريجي.", "Nothing in the text points to a gradual rollout."), suggestion: b("طبّق التغيير على جزء محدود أولًا.", "Apply the change to a limited part first."), strength: b("التنفيذ تدريجي.", "The rollout is gradual.") },
    { title: b("لا ذكر للبيانات والأسرار", "No mention of data and secrets"), severity: "low", problem: lacks(SECRETS), detail: b("لم يُتطرق لأثر التغيير على البيانات الحساسة.", "The effect of the change on sensitive data is not addressed."), suggestion: b("وضّح إن كان التغيير يمسّ بيانات شخصية أو أسرارًا.", "Make clear whether the change touches personal data or secrets.") },
  ],
  logic: [
    { title: b("تعميم مطلق", "Absolute generalisation"), severity: "medium", problem: firstMatch(ABSOLUTE), detail: b("تعميم قاطع يكفي مثال مضاد واحد لنقضه.", "A categorical generalisation that a single counter-example would refute."), suggestion: b("حدّد نطاق صحة العبارة.", "State the range within which the statement holds."), strength: b("لم يُعثر على تعميمات مطلقة من النوع الذي يكشفه هذا الفحص.", "No absolute generalisations of the kind this check detects were found.") },
    { title: b("استنتاجات بلا تعليل ظاهر", "Conclusions without visible reasoning"), severity: "medium", problem: lacks(BECAUSE), detail: b("لا توجد أدوات تعليل تربط النتائج بمقدماتها.", "No reasoning words link the conclusions to their premises."), suggestion: b("اربط كل توصية بسببها.", "Tie every recommendation to its reason."), strength: b("يستخدم النص تعليلًا صريحًا.", "The text uses explicit reasoning.") },
    { title: b("لا بدائل ولا تفسيرات أخرى", "No alternatives or other explanations"), severity: "medium", problem: lacks(ALTERNATIVES), detail: b("يعرض النص مسارًا واحدًا دون بدائل.", "The text presents a single path with no alternatives."), suggestion: b("اذكر بديلًا واحدًا على الأقل ولماذا استُبعد.", "Name at least one alternative and why it was ruled out."), strength: b("يعرض النص بدائل.", "The text presents alternatives.") },
    { title: b("سبب واحد لمشكلة مركّبة", "A single cause for a compound problem"), severity: "low", problem: (t) => ONE_CAUSE.test(t), detail: b("يُنسب الأثر لسبب واحد دون استبعاد غيره.", "The effect is attributed to one cause without ruling out others."), suggestion: b("اذكر الأسباب الأخرى الممكنة وكيف تُستبعد.", "List the other possible causes and how they are ruled out.") },
  ],
  feasibility: [
    { title: b("الخطوات غير مرقّمة", "The steps are not numbered"), severity: "medium", problem: lacks(STEPS), detail: b("لا توجد خطوات مرقّمة مرتّبة.", "There are no numbered, ordered steps."), suggestion: b("حوّل الخطة إلى خطوات مرقّمة.", "Turn the plan into numbered steps."), strength: b("الخطوات مرقّمة ومرتّبة.", "The steps are numbered and ordered.") },
    { title: b("لا متطلبات مسبقة", "No prerequisites"), severity: "medium", problem: lacks(PREREQ), detail: b("لم تُذكر متطلبات أو اعتماديات.", "No requirements or dependencies are mentioned."), suggestion: b("اذكر ما يجب توفره قبل البدء.", "State what must be in place before starting."), strength: b("تُذكر المتطلبات أو الاعتماديات.", "Requirements or dependencies are mentioned.") },
    { title: b("لا موارد ولا مدة ولا مسؤول", "No resources, duration, or owner"), severity: "high", problem: lacks(RESOURCES), detail: b("لا تحدد الخطة وقتًا أو موارد أو مسؤولًا.", "The plan sets no time, resources, or owner."), suggestion: b("أضف لكل مرحلة مدة تقريبية ومن ينفّذها.", "Give every phase an approximate duration and the person who carries it out."), strength: b("تحدد الخطة موارد أو مددًا.", "The plan sets resources or durations.") },
    { title: b("لا معايير قبول", "No acceptance criteria"), severity: "high", problem: lacks(ACCEPT), detail: b("لا يُعرف متى تُعدّ المرحلة منجزة.", "There is no way to know when a phase counts as done."), suggestion: b("اكتب لكل مرحلة مخرجًا ومعيار قبول.", "Write a deliverable and an acceptance criterion for every phase."), strength: b("توجد مخرجات أو معايير قبول.", "There are deliverables or acceptance criteria.") },
    { title: b("لا تحديد لما يُؤجَّل", "Nothing marked as postponed"), severity: "low", problem: lacks(DEFER), detail: b("لا يوضح النص ما هو خارج النطاق.", "The text does not make clear what is out of scope."), suggestion: b("اذكر ما يُؤجَّل عمدًا.", "State what is deliberately postponed."), strength: b("يحدد النص ما يُؤجَّل.", "The text identifies what is postponed.") },
  ],
};

const STOP = new Set(["هل", "في", "من", "على", "إلى", "عن", "أن", "أو", "ما", "لا", "كل", "مع", "هذا", "هذه", "التي", "الذي", "يكون", "تكون", "ذكر", "يذكر", "تذكر", "النص", "الإجابة",
  "the", "is", "are", "a", "an", "of", "and", "or", "to", "in", "on", "for", "with", "does", "do", "has", "have", "every", "each", "that", "this", "text", "answer", "plan"]);
const norm = (s: string) =>
  s.toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");

function judge(text: string, criteria: string[], lang: L): Verdict[] {
  const t = norm(text);
  return criteria.map((criterion) => {
    const words = norm(criterion).split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2 && !STOP.has(w));
    const stems = words.map((w) => (w.startsWith("ال") && w.length > 4 ? w.slice(2) : w));
    const hits = stems.filter((w) => t.includes(w));
    if (!stems.length) return { criterion, status: "unclear", reason: lang === "ar" ? "المعيار أقصر من أن يُطابَق لفظيًا." : "The criterion is too short to match by wording." };
    if (hits.length === 0)
      return { criterion, status: "fail", reason: lang === "ar"
        ? "لم ترد في النص أيٌّ من ألفاظ المعيار. قد يكون مستوفى بصياغة أخرى لا يكشفها هذا المحرك."
        : "None of the criterion's words appear in the text. It may be met in other wording that this engine cannot detect." };
    return {
      criterion,
      status: "unclear",
      reason: lang === "ar"
        ? `وردت ألفاظ ذات صلة (${hits.slice(0, 4).join("، ")})، لكن المطابقة اللفظية لا تكفي للحكم بالاستيفاء.`
        : `Related words appear (${hits.slice(0, 4).join(", ")}), but matching words is not enough to judge the criterion met.`,
    };
  });
}

export function heuristicReview(modeId: string, text: string, criteria: string[], lang: L = "ar"): ReviewResult {
  const mode = modeById(modeId, lang);
  const findings: Finding[] = [];
  const strengths: string[] = [];
  let verdicts: Verdict[] = [];

  if (modeId === "judge") {
    verdicts = judge(text, criteria, lang);
  } else {
    for (const c of CHECKS[modeId] ?? []) {
      const r = c.problem(text);
      if (r) findings.push({ severity: c.severity, title: c.title[lang], detail: c.detail[lang], suggestion: c.suggestion[lang], quote: typeof r === "string" ? r : undefined });
      else if (c.strength) strengths.push(c.strength[lang]);
    }
  }
  const order = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b2) => order[a.severity] - order[b2.severity]);
  const high = findings.filter((f) => f.severity === "high").length;
  const ar = lang === "ar";

  return {
    engine: "heuristic",
    engineLabel: ar ? "المراجع القاعدي (فحوص نمطية حتمية)" : "Rule-based reviewer (deterministic pattern checks)",
    summary:
      modeId === "judge"
        ? ar
          ? `فُحص ${verdicts.length} معيار بمطابقة لفظية. هذا المحرك لا يحكم بالاستيفاء؛ يحدد فقط ما غابت ألفاظه كليًا.`
          : `${verdicts.length} criteria were checked by word matching. This engine does not judge a criterion met; it only flags those whose words are entirely absent.`
        : findings.length
          ? ar
            ? `كشف نمط «${mode?.name}» ${findings.length} ملاحظة، منها ${high} عالية الأهمية.`
            : `The “${mode?.name}” mode found ${findings.length} issue${findings.length === 1 ? "" : "s"}, ${high} of high importance.`
          : ar
            ? `لم يكشف نمط «${mode?.name}» ملاحظات بالفحوص النمطية. هذا لا يعني سلامة المحتوى.`
            : `The “${mode?.name}” mode found no issues with its pattern checks. That does not mean the content is sound.`,
    strengths,
    findings,
    verdicts,
    needsHuman: true,
    limits: ar
      ? ["الفحوص تبحث عن وجود ألفاظ وبُنى، ولا تفهم المعنى.", "لا يتحقق هذا المحرك من صحة أي معلومة أو مصدر.", "غياب الملاحظات لا يعني صحة النص، ووجودها لا يعني خطأه."]
      : ["The checks look for the presence of words and structures; they do not understand meaning.", "This engine does not verify any fact or source.", "The absence of issues does not mean the text is right, and their presence does not mean it is wrong."],
  };
}

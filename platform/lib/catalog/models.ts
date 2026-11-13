// فهرس النماذج. الحالة تُحسب وقت التشغيل من إعدادات الخادم، ولا يُعرض نموذج
// «متاحًا» ما لم يكن مفتاحه ومعرّف إصداره مضبوطين فعلًا.
export type ModelStatus = "ready" | "configured" | "not_configured" | "failed";

export type ModelDef = {
  id: string;
  name: string; // اسم العرض
  vendor: string; // الجهة المطوّرة
  vendorKey: "hessara" | "anthropic" | "openai" | "google" | "meta" | "alibaba" | "deepseek" | "local";
  adapter: "demo" | "anthropic" | "openai" | "gemini";
  category: string; // قيمة عرض بلغة الواجهة: تجريبي / سحابي / محلي
  description: string;
  tasks: string[];
  inputs: string; // ما تدعمه هسّارة فعليًا لهذا النموذج
  docsUrl?: string;
  pricing?: string; // يُذكر فقط إن وُجد مصدر
  /** معرّف ثابت موثّق، أو اسم متغير البيئة الذي يحدده. */
  apiModel?: string;
  env: { key?: string; model?: string; baseUrl?: string; defaultBaseUrl?: string };
  note?: string;
};

const TEXT_ONLY = "نص فقط في هذه النسخة من هسّارة (لا ملفات ولا صور).";
const CLAUDE_PRICING_NOTE = "وفق جدول أسعار المزوّد المخزَّن بتاريخ ٢٠٢٦-١١-٠٣ — راجع الصفحة الرسمية قبل الاعتماد عليه.";

export const MODELS: ModelDef[] = [
  {
    id: "hessara-demo",
    name: "المحرك التجريبي",
    vendor: "هسّارة",
    vendorKey: "hessara",
    adapter: "demo",
    category: "تجريبي",
    description:
      "محرك قواعد محلي يعمل دون مفاتيح خدمات. ليس نموذج ذكاء اصطناعي: يصنّف السؤال بكلمات مفتاحية ويعرض قالبًا تحليليًا ثابتًا، والغرض منه إثبات مسار الاستخدام كاملًا.",
    tasks: ["تجربة المنصة", "عرض المسار الوظيفي"],
    inputs: TEXT_ONLY,
    env: {},
    note: "إجاباته قوالب معدّة سلفًا وليست توليدًا لغويًا.",
  },
  {
    id: "claude-opus-5-5",
    name: "Claude Opus 5.5",
    vendor: "Anthropic",
    vendorKey: "anthropic",
    adapter: "anthropic",
    category: "سحابي",
    description: "النموذج الافتراضي في فئة Opus للتحليل المعقّد والبرمجة والمهام متعددة الخطوات.",
    tasks: ["تحليل معقّد", "برمجة", "مراجعة نقدية"],
    inputs: TEXT_ONLY,
    apiModel: "claude-opus-5-5",
    docsUrl: "https://platform.claude.com/docs/en/about-claude/models/overview",
    pricing: `٤ دولارات للإدخال و٢٠ دولارًا للإخراج لكل مليون رمز. ${CLAUDE_PRICING_NOTE}`,
    env: { key: "ANTHROPIC_API_KEY" },
  },
  {
    id: "claude-sonnet-5-5",
    name: "Claude Sonnet 5.5",
    vendor: "Anthropic",
    vendorKey: "anthropic",
    adapter: "anthropic",
    category: "سحابي",
    description: "توازن بين السرعة والقدرة للاستشارات اليومية والبرمجة.",
    tasks: ["استشارات يومية", "برمجة", "تلخيص"],
    inputs: TEXT_ONLY,
    apiModel: "claude-sonnet-5-5",
    docsUrl: "https://platform.claude.com/docs/en/about-claude/models/overview",
    pricing: `دولاران للإدخال و١٠ دولارات للإخراج لكل مليون رمز. ${CLAUDE_PRICING_NOTE}`,
    env: { key: "ANTHROPIC_API_KEY" },
  },
  {
    id: "claude-haiku-5-5",
    name: "Claude Haiku 5.5",
    vendor: "Anthropic",
    vendorKey: "anthropic",
    adapter: "anthropic",
    category: "سحابي",
    description: "الأسرع والأقل تكلفة في العائلة؛ يناسب الأسئلة القصيرة والتصنيف.",
    tasks: ["أسئلة سريعة", "تصنيف", "مراجعات قصيرة"],
    inputs: TEXT_ONLY,
    apiModel: "claude-haiku-5-5",
    docsUrl: "https://platform.claude.com/docs/en/about-claude/models/overview",
    pricing: `٠٫١٠ دولار للإدخال و٠٫٥٠ دولار للإخراج لكل مليون رمز (حتى ١٠٠ ألف رمز في الطلب). ${CLAUDE_PRICING_NOTE}`,
    env: { key: "ANTHROPIC_API_KEY" },
  },
  {
    id: "gpt",
    name: "GPT",
    vendor: "OpenAI",
    vendorKey: "openai",
    adapter: "openai",
    category: "سحابي",
    description: "عائلة نماذج OpenAI. الإصدار المستخدم يحدده مشغّل المنصة في إعدادات الخادم ولا تفترضه هسّارة.",
    tasks: ["استشارات عامة", "برمجة"],
    inputs: TEXT_ONLY,
    docsUrl: "https://platform.openai.com/docs/models",
    env: { key: "OPENAI_API_KEY", model: "OPENAI_MODEL", defaultBaseUrl: "https://api.openai.com/v1" },
  },
  {
    id: "gemini",
    name: "Gemini",
    vendor: "Google",
    vendorKey: "google",
    adapter: "gemini",
    category: "سحابي",
    description: "عائلة نماذج Google. الإصدار يحدده مشغّل المنصة في إعدادات الخادم.",
    tasks: ["استشارات عامة", "تحليل"],
    inputs: TEXT_ONLY,
    docsUrl: "https://ai.google.dev/gemini-api/docs/models",
    env: { key: "GEMINI_API_KEY", model: "GEMINI_MODEL" },
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    vendor: "DeepSeek",
    vendorKey: "deepseek",
    adapter: "openai",
    category: "سحابي",
    description: "نماذج DeepSeek عبر واجهة متوافقة مع OpenAI. الإصدار يحدده مشغّل المنصة.",
    tasks: ["برمجة", "استدلال"],
    inputs: TEXT_ONLY,
    docsUrl: "https://api-docs.deepseek.com/",
    env: { key: "DEEPSEEK_API_KEY", model: "DEEPSEEK_MODEL", baseUrl: "DEEPSEEK_BASE_URL", defaultBaseUrl: "https://api.deepseek.com" },
  },
  {
    id: "qwen",
    name: "Qwen",
    vendor: "Alibaba Cloud",
    vendorKey: "alibaba",
    adapter: "openai",
    category: "سحابي",
    description: "نماذج Qwen عبر مستضيف يوفّر واجهة متوافقة مع OpenAI. العنوان والإصدار يحددهما مشغّل المنصة.",
    tasks: ["استشارات عامة", "برمجة"],
    inputs: TEXT_ONLY,
    env: { key: "QWEN_API_KEY", model: "QWEN_MODEL", baseUrl: "QWEN_BASE_URL" },
  },
  {
    id: "llama",
    name: "Llama",
    vendor: "Meta",
    vendorKey: "meta",
    adapter: "openai",
    category: "سحابي",
    description: "نماذج Llama مفتوحة الأوزان لدى مستضيف خارجي بواجهة متوافقة مع OpenAI. العنوان والإصدار يحددهما مشغّل المنصة.",
    tasks: ["استشارات عامة", "تجارب"],
    inputs: TEXT_ONLY,
    docsUrl: "https://www.llama.com/docs/overview/",
    env: { key: "LLAMA_API_KEY", model: "LLAMA_MODEL", baseUrl: "LLAMA_BASE_URL" },
  },
  {
    id: "local",
    name: "نموذج محلي",
    vendor: "خادم المنصة",
    vendorKey: "local",
    adapter: "openai",
    category: "محلي",
    description:
      "نموذج يعمل على خادم هسّارة نفسه (مثل Ollama). الاتصال يتم من الخادم لا من المتصفح، فلا يصل إلى نموذج على جهاز المستخدم الشخصي.",
    tasks: ["خصوصية أعلى", "تجارب دون تكلفة لكل طلب"],
    inputs: TEXT_ONLY,
    env: { model: "LOCAL_MODEL", baseUrl: "LOCAL_BASE_URL" },
    note: "لا يحتاج مفتاحًا؛ يكفي ضبط العنوان واسم النموذج.",
  },
];

/** النصوص الإنجليزية لكل نموذج؛ الحقول التقنية (المعرّفات والمتغيرات والروابط) مشتركة. */
const TEXT_ONLY_EN = "Text only in this version of HESSARA (no files or images).";
const CLAUDE_PRICING_NOTE_EN = "From the provider's price list as stored on 2026-11-03; check the official page before relying on it.";
type ModelText = Pick<ModelDef, "description" | "tasks" | "inputs"> & Partial<Pick<ModelDef, "name" | "vendor" | "pricing" | "note">>;
const EN: Record<string, ModelText> = {
  "hessara-demo": {
    name: "Demo engine",
    vendor: "HESSARA",
    description: "A local rule engine that runs without any service keys. It is not an AI model: it classifies the question by keywords and shows a fixed analytical template. Its purpose is to prove the whole path of use end to end.",
    tasks: ["Trying the platform", "Showing the workflow"],
    inputs: TEXT_ONLY_EN,
    note: "Its answers are prepared templates, not language generation.",
  },
  "claude-opus-5-5": {
    description: "The default model in the Opus class, for complex analysis, programming, and multi-step tasks.",
    tasks: ["Complex analysis", "Programming", "Critical review"],
    inputs: TEXT_ONLY_EN,
    pricing: `US$4 input and US$20 output per million tokens. ${CLAUDE_PRICING_NOTE_EN}`,
  },
  "claude-sonnet-5-5": {
    description: "A balance of speed and capability for everyday consultations and programming.",
    tasks: ["Everyday consultations", "Programming", "Summaries"],
    inputs: TEXT_ONLY_EN,
    pricing: `US$2 input and US$10 output per million tokens. ${CLAUDE_PRICING_NOTE_EN}`,
  },
  "claude-haiku-5-5": {
    description: "The fastest and least expensive in the family; suited to short questions and classification.",
    tasks: ["Quick questions", "Classification", "Short reviews"],
    inputs: TEXT_ONLY_EN,
    pricing: `US$0.10 input and US$0.50 output per million tokens (up to 100k tokens per request). ${CLAUDE_PRICING_NOTE_EN}`,
  },
  gpt: {
    description: "OpenAI's model family. The version used is set by the platform operator in the server settings; HESSARA does not assume one.",
    tasks: ["General consultations", "Programming"],
    inputs: TEXT_ONLY_EN,
  },
  gemini: {
    description: "Google's model family. The version is set by the platform operator in the server settings.",
    tasks: ["General consultations", "Analysis"],
    inputs: TEXT_ONLY_EN,
  },
  deepseek: {
    description: "DeepSeek models through an OpenAI-compatible interface. The version is set by the platform operator.",
    tasks: ["Programming", "Reasoning"],
    inputs: TEXT_ONLY_EN,
  },
  qwen: {
    description: "Qwen models through a host that offers an OpenAI-compatible interface. The address and version are set by the platform operator.",
    tasks: ["General consultations", "Programming"],
    inputs: TEXT_ONLY_EN,
  },
  llama: {
    description: "Open-weight Llama models at an external host with an OpenAI-compatible interface. The address and version are set by the platform operator.",
    tasks: ["General consultations", "Experiments"],
    inputs: TEXT_ONLY_EN,
  },
  local: {
    name: "Local model",
    vendor: "Platform server",
    description: "A model running on the HESSARA server itself (such as Ollama). The connection is made from the server, not the browser, so it cannot reach a model on the user's own computer.",
    tasks: ["More privacy", "Experiments with no per-request cost"],
    inputs: TEXT_ONLY_EN,
    note: "Needs no key; setting the address and model name is enough.",
  },
};
const CATEGORY_EN: Record<string, string> = { "تجريبي": "Demo", "سحابي": "Cloud", "محلي": "Local" };

/** نسخة النموذج بلغة الواجهة. الفئة تبقى قيمة عرض نصية لأن عوامل التصفية تقارن بها. */
export function localizeModel(def: ModelDef, lang: "ar" | "en"): ModelDef {
  if (lang === "ar") return def;
  const en = EN[def.id];
  return { ...def, ...en, category: CATEGORY_EN[def.category] ?? def.category };
}

export const modelById = (id: string | null | undefined) => MODELS.find((m) => m.id === id);
export const DEMO_MODEL_ID = "hessara-demo";

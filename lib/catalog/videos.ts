// مكتبة الميديا: تُعرض فقط السجلات التي تحقق منها سكربت التحقق (scripts/verify-videos.mjs)
// عبر واجهة oEmbed الرسمية ليوتيوب. لا يُضاف أي رابط غير متحقق منه لإكمال العدد.
import verified from "@/data/videos.json";

export type Video = {
  id: string; // معرّف يوتيوب
  title: string; // كما أعاده يوتيوب
  channel: string;
  category: string;
  lang: "ar" | "en";
  level: "مبتدئ" | "متوسط" | "متقدم";
  paths: string[];
  durationSec?: number | null;
  published?: string | null;
  views?: number | null; // كما عرضها يوتيوب وقت التحقق؛ مؤشر مساعد لا دليل جودة
  verifiedAt: string;
};

export const CATEGORIES: { id: string; name: string; en: string; target: number }[] = [
  { id: "intro", name: "مدخل إلى الذكاء الاصطناعي", en: "Introduction to AI", target: 25 },
  { id: "math", name: "الرياضيات الأساسية للذكاء الاصطناعي", en: "Core maths for AI", target: 15 },
  { id: "programming", name: "البرمجة التطبيقية", en: "Applied programming", target: 20 },
  { id: "ml", name: "تعلم الآلة", en: "Machine learning", target: 20 },
  { id: "dl", name: "التعلم العميق", en: "Deep learning", target: 20 },
  { id: "llm", name: "النماذج اللغوية وتطويرها", en: "Language models and their development", target: 25 },
  { id: "transformers", name: "المحولات والتقسيم إلى رموز", en: "Transformers and tokenisation", target: 15 },
  { id: "finetune", name: "الضبط الدقيق والتدريب", en: "Fine-tuning and training", target: 15 },
  { id: "agents", name: "بناء الوكلاء الذكيين", en: "Building intelligent agents", target: 20 },
  { id: "local", name: "التشغيل والاستضافة المحلية", en: "Running and hosting locally", target: 15 },
  { id: "eval", name: "التقييم والأمان والاعتمادية", en: "Evaluation, safety, and reliability", target: 10 },
];
export const TARGET_TOTAL = CATEGORIES.reduce((n, c) => n + c.target, 0);

export const PATHS: { id: string; name: string; about: string; en: string; aboutEn: string }[] = [
  { id: "zero", name: "من الصفر إلى أساسيات الذكاء الاصطناعي", about: "المفاهيم الأولى والرياضيات اللازمة.", en: "From zero to the basics of AI", aboutEn: "First concepts and the maths you need." },
  { id: "how-llm", name: "كيف تعمل النماذج اللغوية", about: "من الشبكة العصبية إلى المحوّل والرموز.", en: "How language models work", aboutEn: "From the neural network to the transformer and tokens." },
  { id: "agent", name: "بناء وكيل ذكي", about: "الأدوات والتخطيط وحلقة التنفيذ.", en: "Building an intelligent agent", aboutEn: "Tools, planning, and the execution loop." },
  { id: "train-small", name: "تدريب نموذج صغير", about: "بناء نموذج لغوي مصغّر وتدريبه.", en: "Training a small model", aboutEn: "Building and training a miniature language model." },
  { id: "run-local", name: "تشغيل نموذج على الحاسب الشخصي", about: "المتطلبات وأدوات التشغيل المحلي.", en: "Running a model on your own computer", aboutEn: "Requirements and tools for running locally." },
  { id: "host", name: "استضافة نموذج أو وكيل وربطه بتطبيق", about: "الواجهات البرمجية والنشر.", en: "Hosting a model or agent and connecting it to an app", aboutEn: "APIs and deployment." },
  { id: "evaluate", name: "تقييم جودة النماذج والوكلاء", about: "المقاييس ومجموعات التقييم.", en: "Evaluating models and agents", aboutEn: "Metrics and evaluation sets." },
];

/** تسميات المستوى (القيمة المخزّنة عربية في ملف البيانات). */
export const LEVEL_EN: Record<string, string> = { "مبتدئ": "Beginner", "متوسط": "Intermediate", "متقدم": "Advanced" };

export const VIDEOS = verified as Video[];
export const videoById = (id: string) => VIDEOS.find((v) => v.id === id);
export const videoUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
export const videoThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

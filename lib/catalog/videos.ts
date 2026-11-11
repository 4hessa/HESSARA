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
  verifiedAt: string;
};

export const CATEGORIES: { id: string; name: string; target: number }[] = [
  { id: "intro", name: "مدخل إلى الذكاء الاصطناعي", target: 25 },
  { id: "math", name: "الرياضيات الأساسية للذكاء الاصطناعي", target: 15 },
  { id: "programming", name: "البرمجة التطبيقية", target: 20 },
  { id: "ml", name: "تعلم الآلة", target: 20 },
  { id: "dl", name: "التعلم العميق", target: 20 },
  { id: "llm", name: "النماذج اللغوية وتطويرها", target: 25 },
  { id: "transformers", name: "المحولات والتقسيم إلى رموز", target: 15 },
  { id: "finetune", name: "الضبط الدقيق والتدريب", target: 15 },
  { id: "agents", name: "بناء الوكلاء الذكيين", target: 20 },
  { id: "local", name: "التشغيل والاستضافة المحلية", target: 15 },
  { id: "eval", name: "التقييم والأمان والاعتمادية", target: 10 },
];
export const TARGET_TOTAL = CATEGORIES.reduce((n, c) => n + c.target, 0);

export const PATHS: { id: string; name: string; about: string }[] = [
  { id: "zero", name: "من الصفر إلى أساسيات الذكاء الاصطناعي", about: "المفاهيم الأولى والرياضيات اللازمة." },
  { id: "how-llm", name: "كيف تعمل النماذج اللغوية", about: "من الشبكة العصبية إلى المحوّل والرموز." },
  { id: "agent", name: "بناء وكيل ذكي", about: "الأدوات والتخطيط وحلقة التنفيذ." },
  { id: "train-small", name: "تدريب نموذج صغير", about: "بناء نموذج لغوي مصغّر وتدريبه." },
  { id: "run-local", name: "تشغيل نموذج على الحاسب الشخصي", about: "المتطلبات وأدوات التشغيل المحلي." },
  { id: "host", name: "استضافة نموذج أو وكيل وربطه بتطبيق", about: "الواجهات البرمجية والنشر." },
  { id: "evaluate", name: "تقييم جودة النماذج والوكلاء", about: "المقاييس ومجموعات التقييم." },
];

export const VIDEOS = verified as Video[];
export const videoById = (id: string) => VIDEOS.find((v) => v.id === id);
export const videoUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
export const videoThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

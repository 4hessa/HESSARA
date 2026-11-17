// المحتوى الطويل (المقالات والوثائق والصفحات التعريفية) بلغتين. النص بصيغة Markdown مبسّطة
// يعرضها components/site/Article.tsx: عناوين ## و ###، فقرات، قوائم، اقتباس، جداول، روابط، وتنسيق داخلي.
export type Doc = {
  kicker?: string;
  title: string;
  sub?: string;
  description: string;
  /** ملاحظة تظهر أعلى النص بإطار جانبي (توضيح لحدود المنصة أو حالة الوثيقة). */
  note?: string;
  cta?: string;
  body: string;
};
export type Entry = { slug: string; ar: Doc; en: Doc };

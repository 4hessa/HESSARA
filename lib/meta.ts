// بيانات الصفحة لمحركات البحث وبطاقات المشاركة: الرابط القانوني، وعنوان المشاركة ووصفها وصورتها،
// كما كان الموقع المرجعي يضعها لكل صفحة.
import type { Metadata } from "next";
import type { Lang } from "./i18n";

export function pageMeta(lang: Lang, title: string, description: string, path: string): Metadata {
  const full = `${title} — ${lang === "ar" ? "هسّارة" : "HESSARA"}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: full,
      description,
      url: path,
      siteName: "HESSARA",
      type: "website",
      locale: lang === "ar" ? "ar_SA" : "en_GB",
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: lang === "ar" ? "هسّارة: شخص وحيد على درب شاحب بين غابة داكنة وأعمدة قوطية" : "HESSARA: a lone figure on a pale path between dark forest and gothic pillars" }],
    },
  };
}

import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./fonts.css";
import "./globals.css";
import { AppProvider } from "@/components/app";
import { ErrorReporter } from "@/components/ErrorReporter";
import { PageView } from "@/components/PageView";
import { currentUser, toPublic } from "@/lib/auth";
import { dirOf } from "@/lib/i18n";
import { getLang, getTimeZone } from "@/lib/i18n-server";
import { listModels } from "@/lib/providers";
import { SITE } from "@/lib/site";


export async function generateMetadata(): Promise<Metadata> {
  const ar = (await getLang()) === "ar";
  return {
    metadataBase: SITE ? new URL(SITE) : undefined,
    title: ar
      ? { default: "هسّارة — ذكاء يرشد، وبصيرة تصنع الفرق", template: "%s — هسّارة" }
      : { default: "HESSARA — Intelligence That Guides. Insight That Matters", template: "%s — HESSARA" },
    description: ar
      ? "منصة أكاديمية للاستشارات التقنية بالذكاء الاصطناعي، تجمع وكلاء متخصصين ونماذج لغوية ومصادر علمية موثّقة. مشروع تخرج في كلية الذكاء الاصطناعي."
      : "An academic AI-powered technical consulting platform that brings together specialised agents, language models and cited scientific resources. A graduation project at a College of Artificial Intelligence.",
    openGraph: { siteName: "HESSARA", type: "website", images: [{ url: "/og.jpg", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image" },
  };
}
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content", // يُبقي حقل الكتابة ظاهرًا عند فتح لوحة مفاتيح الهاتف
  themeColor: "#111111",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  // الوضع الفاتح هو الافتراضي كما في التصميم المرجعي؛ الداكن اختيار صريح يُحفظ في ملف ارتباط.
  const theme = (await cookies()).get("hs_theme")?.value === "dark" ? "dark" : undefined;
  const user = await currentUser();
  return (
    <html lang={lang} dir={dirOf(lang)} data-theme={theme} suppressHydrationWarning>
      <head>
        {lang === "en" && <link rel="preload" href="/fonts/newsreader-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />}
        {lang === "ar" && <link rel="preload" href="/fonts/newsreader-marks.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />}
        <link rel="preload" href="/fonts/roboto-condensed-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {lang === "ar" && <link rel="preload" href="/fonts/markazi-arabic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />}
        {lang === "ar" && <link rel="preload" href="/fonts/markazi-punct.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />}
        {lang === "ar" && <link rel="preload" href="/fonts/plex-arabic-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />}
      </head>
      <body>
        <AppProvider lang={lang} tz={await getTimeZone()} user={user ? toPublic(user) : null} models={await listModels(!!user, lang)}>{children}<PageView /><ErrorReporter /></AppProvider>
      </body>
    </html>
  );
}

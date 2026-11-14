import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./fonts.css";
import "./globals.css";
import { AppProvider } from "@/components/app";
import { currentUser, toPublic } from "@/lib/auth";
import { dirOf } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
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
      ? "منصة استشارية تجمع نماذج ذكاء اصطناعي من عدة مزوّدين ووكلاء متخصصين ومختبرًا للنقد والتقييم في مساحة عمل واحدة."
      : "An AI advisory platform that brings models from several providers, specialised agents, and a critique lab into one workspace.",
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
        <link rel="preload" href="/fonts/newsreader-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/roboto-condensed-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {lang === "ar" && <link rel="preload" href="/fonts/markazi-arabic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />}
        {lang === "ar" && <link rel="preload" href="/fonts/plex-arabic-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />}
      </head>
      <body>
        <AppProvider lang={lang} user={user ? toPublic(user) : null} models={await listModels(!!user, lang)}>{children}</AppProvider>
      </body>
    </html>
  );
}

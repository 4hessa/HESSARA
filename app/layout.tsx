import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./fonts.css";
import "./globals.css";
import { AppProvider } from "@/components/app";
import { currentUser, toPublic } from "@/lib/auth";
import { listModels } from "@/lib/providers";

export const metadata: Metadata = {
  title: { default: "هسّارة — من المشكلة إلى الحل، بمساعدة الذكاء الاصطناعي", template: "%s — هسّارة" },
  description: "منصة استشارية تجمع نماذج الذكاء الاصطناعي والوكلاء المتخصصين وأدوات النقد والتقييم في تجربة واحدة.",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content", // يُبقي حقل الكتابة ظاهرًا عند فتح لوحة مفاتيح الهاتف
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const t = (await cookies()).get("hs_theme")?.value;
  const theme = t === "dark" || t === "light" ? t : undefined;
  const user = await currentUser();
  return (
    <html lang="ar" dir="rtl" data-theme={theme} suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/plex-arabic-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/plex-arabic-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <AppProvider user={user ? toPublic(user) : null} models={listModels()}>{children}</AppProvider>
      </body>
    </html>
  );
}

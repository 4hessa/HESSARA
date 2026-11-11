import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/600.css";
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
      <body>
        <AppProvider user={user ? toPublic(user) : null} models={listModels()}>{children}</AppProvider>
      </body>
    </html>
  );
}

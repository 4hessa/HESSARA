// عرض الأوقات بتوقيت المستخدم. الخادم على Vercel يعمل بالتوقيت العالمي، فيرسل المتصفح منطقته الزمنية في
// ملف ارتباط (hs_tz) ليُنسَّق بها ما يُعرض من الخادم. قبل وجود الملف (أول زيارة) يُعرض التوقيت العالمي ثم يُصحَّح
// في المتصفح فور التحميل. هذا الملف بلا اعتماد على الخادم، فيستورده المتصفح أيضًا.
import { intlLocale, type Lang } from "./i18n.ts";

export const TZ_COOKIE = "hs_tz";

/** منطقة زمنية صالحة باسمها في قاعدة IANA، وإلا UTC. */
export function safeTimeZone(tz?: string | null): string {
  if (!tz || tz.length > 64 || !/^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+){0,2}$/.test(tz)) return "UTC";
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

export type TimeStyle = "short" | "medium";

const OPTIONS: Record<TimeStyle, Intl.DateTimeFormatOptions> = {
  short: { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" },
  medium: { dateStyle: "medium", timeStyle: "short" },
};

export function formatTime(ts: number, lang: Lang, tz: string, style: TimeStyle = "short"): string {
  return new Intl.DateTimeFormat(intlLocale(lang), { ...OPTIONS[style], timeZone: safeTimeZone(tz) }).format(ts);
}

"use client";
// وقت بتوقيت المستخدم. يُنسَّق في الخادم بالمنطقة المحفوظة في ملف الارتباط، ثم في المتصفح بمنطقته الفعلية.
// suppressHydrationWarning لأن مكتبات التنسيق تختلف قليلًا بين الخادم والمتصفحات (الفواصل مثلًا)، والوقت نفسه صحيح.
import { formatTime, type TimeStyle } from "@/lib/time";
import { useApp } from "./app";

export function LocalTime({ ts, style = "short" }: { ts: number; style?: TimeStyle }) {
  const { lang, tz } = useApp();
  const n = Number(ts);
  return <time dateTime={new Date(n).toISOString()} suppressHydrationWarning>{formatTime(n, lang, tz, style)}</time>;
}

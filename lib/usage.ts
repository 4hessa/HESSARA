// الحدّ اليومي لاستدعاءات النماذج الحقيقية لكل مستخدم، وصلاحية صاحب المشروع.
// يُحتسب كل استدعاء يكلّف رصيدًا: إجابة نموذج لغوي، ومراجعة بنموذج لغوي أو بنموذج التقييم Jev، ونسخة منقّحة.
// المحرك التجريبي والمراجع القاعدي واختبار الاتصال لا تُحتسب. يتجدد الحد مع بداية اليوم بالتوقيت العالمي.
import { get, run } from "./db.ts";

const DEFAULT_LIMIT = 20;

/** HESSARA_DAILY_LIMIT يغيّر الحد؛ 0 يوقف النماذج الحقيقية لغير صاحب المشروع. */
export function dailyLimit(): number {
  const raw = process.env.HESSARA_DAILY_LIMIT?.trim();
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : DEFAULT_LIMIT;
}

/** صاحب المشروع: بريده في HESSARA_ADMIN_EMAILS (مفصولة بفواصل). لا حدّ عليه، ويرى صفحة الإحصاءات. */
export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  const list = (process.env.HESSARA_ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

export const usageDay = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);

export type Quota = { used: number; limit: number | null; left: number | null };

export async function quotaFor(user: { id: string; email: string }): Promise<Quota> {
  const row = await get<{ calls: number | string }>("SELECT calls FROM usage_daily WHERE user_id = ? AND day = ?", user.id, usageDay());
  const used = Number(row?.calls ?? 0);
  if (isAdmin(user.email)) return { used, limit: null, left: null };
  const limit = dailyLimit();
  return { used, limit, left: Math.max(0, limit - used) };
}

export const quotaExhausted = (q: Quota) => q.left !== null && q.left <= 0;

/** يُسجَّل بعد نجاح الاستدعاء، فلا يستهلك الفشل حصة المستخدم. */
export async function countUse(userId: string): Promise<void> {
  await run(
    "INSERT INTO usage_daily (user_id, day, calls) VALUES (?,?,1) ON CONFLICT (user_id, day) DO UPDATE SET calls = usage_daily.calls + 1",
    userId, usageDay(),
  );
}

export const quotaMessage = (limit: number | null, lang: "ar" | "en") =>
  lang === "ar"
    ? `بلغت حدّك اليومي من استدعاءات النماذج الحقيقية (${limit}). يتجدد الحد غدًا، ويبقى المحرك التجريبي والمراجع القاعدي متاحَين.`
    : `You have reached your daily limit of real-model calls (${limit}). It renews tomorrow; the demo engine and the rule-based reviewer remain available.`;

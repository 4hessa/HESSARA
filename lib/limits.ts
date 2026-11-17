// حدود المحاولات المشتركة بين كل نسخ الخادم: تُحفظ في قاعدة البيانات لا في ذاكرة نسخة واحدة،
// فلا يتجاوزها من يوزّع محاولاته على نسخ متعددة على الاستضافة السحابية. تُستخدم للدخول وإنشاء الحسابات.
import { get, run } from "./db.ts";

const TRUST_PROXY = () => process.env.HESSARA_TRUST_PROXY === "1";

/** يضيف محاولة إلى الحاوية ويعيد عدد محاولاتها في النافذة الجارية (تبدأ نافذة جديدة بعد انقضاء السابقة). */
async function hit(bucket: string, windowMs: number): Promise<number> {
  const now = Date.now();
  const reset = now + windowMs;
  await run(
    "INSERT INTO rate_limits (bucket, hits, reset_at) VALUES (?, 1, ?) ON CONFLICT (bucket) DO UPDATE SET " +
      "hits = CASE WHEN rate_limits.reset_at < ? THEN 1 ELSE rate_limits.hits + 1 END, " +
      "reset_at = CASE WHEN rate_limits.reset_at < ? THEN ? ELSE rate_limits.reset_at END",
    bucket, reset, now, now, reset,
  );
  // تنظيف عرضي للحاويات المنتهية منذ يوم.
  if (Math.random() < 0.02) await run("DELETE FROM rate_limits WHERE reset_at < ?", now - 86_400_000).catch(() => {});
  const row = await get<{ hits: number | string }>("SELECT hits FROM rate_limits WHERE bucket = ?", bucket);
  return Number(row?.hits ?? 0);
}

/** محاولة مسموحة ما دامت لم تتجاوز max في النافذة. */
export async function allow(bucket: string, max: number, windowMs: number): Promise<boolean> {
  return (await hit(bucket, windowMs)) <= max;
}

/** عدد الإخفاقات المسجلة في نافذة لم تنقضِ بعد. */
export async function failures(bucket: string): Promise<number> {
  const row = await get<{ hits: number | string; reset_at: number | string }>("SELECT hits, reset_at FROM rate_limits WHERE bucket = ?", bucket);
  return row && Number(row.reset_at) >= Date.now() ? Number(row.hits) : 0;
}

export const noteFailureShared = (bucket: string, windowMs: number) => hit(bucket, windowMs).then(() => undefined);
export const clearShared = (bucket: string) => run("DELETE FROM rate_limits WHERE bucket = ?", bucket);

/**
 * حد لكل عنوان عميل، بالشرط نفسه الذي يطبّقه ipLimit: لا يُعتمد العنوان إلا خلف وسيط موثوق
 * (HESSARA_TRUST_PROXY=1، ويؤخذ آخر عنوان أضافه الوسيط)، وإلا فلا حدّ بالعنوان أصلًا.
 */
export async function allowIp(req: Request, name: string, max: number, windowMs: number): Promise<boolean> {
  if (!TRUST_PROXY()) return true;
  const hops = (req.headers.get("x-forwarded-for") || "").split(",").map((h) => h.trim()).filter(Boolean);
  return allow(`${name}:${(hops[hops.length - 1] || "unknown").slice(0, 64)}`, max, windowMs);
}

// سجل الأخطاء الداخلي. سجلات التشغيل في الخطة المجانية لدى Vercel تُحفظ ساعة واحدة فقط، فيُحصى هنا كل خطأ في
// اليوم حسب مصدره (الخادم أو متصفح الزائر) ومساره ونوعه، مع آخر عيّنة من رسالته بعد تنقيتها، ويُعرض في صفحة
// إحصاءات المنصة. لا يُحفظ أي محتوى كتبه المستخدم ولا أي معرّف له: المسار قالب (/consult/[id]) لا رابط فعلي،
// والرسالة تُقصّ وتُستبدل فيها عناوين البريد والأرقام الطويلة والرموز. تُحذف السجلات بعد 30 يومًا.
import { run } from "./db.ts";
import { usageDay } from "./usage.ts";

export type ErrorSource = "server" | "client";
const KEEP_DAYS = 30;

/** تنقية الرسالة قبل حفظها. */
export function redact(raw: string, max = 180): string {
  return String(raw ?? "")
    .split("\n")[0]
    .replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, "[email]")
    .replace(/https?:\/\/\S+/g, "[url]")
    .replace(/[A-Za-z0-9_-]{24,}/g, "[token]")
    .replace(/\d{4,}/g, "[n]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** نوع الخطأ: اسمه، ورمزه إن وُجد (مثل رمز خطأ Postgres). */
export function errorKind(e: unknown): string {
  if (e && typeof e === "object") {
    const o = e as { name?: unknown; code?: unknown };
    const name = typeof o.name === "string" && o.name ? o.name : "Error";
    const code = typeof o.code === "string" || typeof o.code === "number" ? `:${o.code}` : "";
    return `${name}${code}`.replace(/[^\w:.-]/g, "").slice(0, 60) || "Error";
  }
  return typeof e;
}

/** إشارات التنقل في Next.js (غير موجود، إعادة توجيه...) وانقطاع اتصال الزائر ليست أخطاء. */
export function isNoise(e: unknown): boolean {
  const o = (e ?? {}) as { digest?: unknown; name?: unknown };
  if (typeof o.digest === "string" && /^(NEXT_|DYNAMIC_SERVER_USAGE|BAILOUT_)/.test(o.digest)) return true;
  return o.name === "AbortError" || o.name === "ResponseAborted";
}

/** قالب مسار صفحة من متصفح الزائر: تُستبدل المعرّفات كما في عدّاد الزيارات. */
export function clientRoute(raw: unknown): string {
  if (typeof raw !== "string" || !raw.startsWith("/")) return "(unknown)";
  const p = (raw.split(/[?#]/)[0].replace(/\/+$/, "") || "/")
    .replace(/^\/consult\/(?!new(?:\/|$))[^/]+/, "/consult/[id]")
    .replace(/^\/s\/[^/]+/, "/s/[token]")
    .replace(/^\/(insights|resources)\/[^/]+/, "/$1/[slug]");
  return /^\/[a-z0-9\-/[\]]*$/i.test(p) ? p.slice(0, 120) : "(unknown)";
}

export async function pruneErrors(now = Date.now()) {
  await run("DELETE FROM error_counts WHERE day < ?", usageDay(now - KEEP_DAYS * 86_400_000));
}

export async function recordError(source: ErrorSource, route: string, kind: string, message: string, now = Date.now()) {
  await run(
    "INSERT INTO error_counts (day, source, route, kind, hits, last_at, sample) VALUES (?,?,?,?,1,?,?) " +
      "ON CONFLICT (day, source, route, kind) DO UPDATE SET hits = error_counts.hits + 1, last_at = excluded.last_at, sample = excluded.sample",
    usageDay(now), source, route.slice(0, 120), kind.slice(0, 60), now, redact(message),
  );
  if (Math.random() < 0.02) await pruneErrors(now).catch(() => {});
}

/** لخطأ في الخادم: لا يرمي أبدًا، فتعطّل التسجيل لا يزيد الخطأ الأصلي سوءًا. */
export async function recordServerError(e: unknown, route: string): Promise<void> {
  if (isNoise(e)) return;
  try {
    await recordError("server", route || "(unknown)", errorKind(e), e instanceof Error ? e.message : String(e));
  } catch (err) {
    console.error("[errors] could not record:", (err as Error)?.name);
  }
}

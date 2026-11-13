// أدوات مشتركة لمسارات الواجهة البرمجية: التحقق من المصدر، الحدود، والأخطاء.
import { NextResponse } from "next/server";
import { currentUser } from "./auth";
import type { UserRow } from "./db";

export const LIMITS = {
  message: 12_000, // أحرف لكل رسالة
  reviewInput: 20_000,
  body: 96_000, // بايت لكل طلب (نص المراجعة ٢٠ ألف حرف عربي ≈ ٤٠ ألف بايت × نسختين)
  name: 60,
};

export const fail = (status: number, error: string) => NextResponse.json({ error }, { status });
export const ok = (data: unknown = { ok: true }) => NextResponse.json(data);

/** حماية من الطلبات العابرة للمواقع: الطلبات المغيِّرة يجب أن تأتي من أصل الموقع نفسه. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // طلبات غير متصفحية (اختبارات) لا تحمل ملفات ارتباط تلقائيًا
  try {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** يقرأ جسم الطلب بحد أقصى صارم: يُرفض قبل التخزين في الذاكرة إن تجاوز الحد (حماية قبل المصادقة). */
export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T | null> {
  try {
    const declared = Number(req.headers.get("content-length") || 0);
    if (declared > LIMITS.body || !req.body) return null;
    const reader = req.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > LIMITS.body) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    const v = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    return v && typeof v === "object" && !Array.isArray(v) ? (v as T) : null;
  } catch {
    return null;
  }
}

type Handler<C> = (req: Request, user: UserRow, ctx: C) => Promise<Response> | Response;

/** يغلّف المعالج: يرفض الأصل المخالف ويشترط جلسة صالحة. */
export function authed<C = unknown>(handler: Handler<C>) {
  return async (req: Request, ctx: C) => {
    if (req.method !== "GET" && !sameOrigin(req)) return fail(403, "مصدر الطلب غير مسموح.");
    const user = await currentUser();
    if (!user) return fail(401, "يلزم تسجيل الدخول.");
    return handler(req, user, ctx);
  };
}

// محدِّد معدل بسيط في الذاكرة (يكفي لخادم واحد؛ يحتاج مخزنًا مشتركًا عند التوسع الأفقي).
const buckets = new Map<string, { n: number; reset: number }>();
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return true;
  }
  b.n += 1;
  return b.n <= max;
}

/** عدّاد إخفاقات: يُفحص قبل المحاولة، يزيد عند الفشل فقط، ويُصفَّر عند النجاح. */
export const isBlocked = (key: string, max: number) => {
  const b = buckets.get(key);
  return !!b && b.reset >= Date.now() && b.n >= max;
};
export const noteFailure = (key: string, windowMs: number) => void rateLimit(key, Infinity, windowMs);
export const clearFailures = (key: string) => void buckets.delete(key);

/**
 * حد لكل عنوان عميل. ترويسة X-Forwarded-For يكتبها العميل نفسه ما لم يكن أمام الخادم وسيط موثوق،
 * لذا لا تُعتمد إلا عند ضبط HESSARA_TRUST_PROXY=1 (ويؤخذ آخر عنوان أضافه الوسيط).
 * دون وسيط موثوق لا يوجد عنوان يُنسب إليه الطلب، فلا يُطبَّق حد بالعنوان إطلاقًا: حدٌّ إجمالي
 * مشترك كان سيمكّن زائرًا واحدًا من قفل الخدمة على الجميع. الحماية حينها بحدود الحساب والبريد.
 */
const TRUST_PROXY = process.env.HESSARA_TRUST_PROXY === "1";
export function ipLimit(req: Request, name: string, max: number, windowMs: number): boolean {
  if (!TRUST_PROXY) return true;
  const hops = (req.headers.get("x-forwarded-for") || "").split(",").map((h) => h.trim()).filter(Boolean);
  return rateLimit(`${name}:${(hops[hops.length - 1] || "unknown").slice(0, 64)}`, max, windowMs);
}

export const str = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max ? v : null;

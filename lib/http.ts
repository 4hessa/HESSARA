// أدوات مشتركة لمسارات الواجهة البرمجية: التحقق من المصدر، الحدود، والأخطاء.
import { NextResponse } from "next/server";
import { currentUser } from "./auth";
import type { UserRow } from "./db";

export const LIMITS = {
  message: 12_000, // أحرف لكل رسالة
  reviewInput: 20_000,
  body: 64_000, // بايت لكل طلب
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

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T | null> {
  try {
    const text = await req.text();
    if (text.length > LIMITS.body) return null;
    const v = JSON.parse(text);
    return v && typeof v === "object" ? (v as T) : null;
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

export const clientKey = (req: Request) =>
  (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();

export const str = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max ? v : null;

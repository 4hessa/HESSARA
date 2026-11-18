// حدود استدعاءات النماذج الحقيقية في اليوم، وصلاحية صاحب المشروع.
// حدّان: حد لكل مستخدم، وسقف واحد للمنصة كلها حتى لا تتضاعف الحصة بإنشاء حسابات كثيرة.
// يُحتسب كل استدعاء يكلّف رصيدًا: إجابة نموذج لغوي، ومراجعة بنموذج لغوي أو بنموذج التقييم Jev، ونسخة منقّحة.
// المحرك التجريبي والمراجع القاعدي واختبار الاتصال لا تُحتسب. يتجدد الحدّان مع بداية اليوم بالتوقيت العالمي.
import { get, run } from "./db.ts";

const DEFAULT_LIMIT = 20;
const DEFAULT_PLATFORM_LIMIT = 100;

function envLimit(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

/** HESSARA_DAILY_LIMIT يغيّر حد المستخدم الواحد؛ 0 يوقف النماذج الحقيقية لغير صاحب المشروع. */
export const dailyLimit = () => envLimit("HESSARA_DAILY_LIMIT", DEFAULT_LIMIT);

/** HESSARA_PLATFORM_DAILY_LIMIT يغيّر سقف المنصة كلها (مجموع استدعاءات كل المستخدمين، ومنهم صاحب المشروع). */
export const platformDailyLimit = () => envLimit("HESSARA_PLATFORM_DAILY_LIMIT", DEFAULT_PLATFORM_LIMIT);

// HESSARA_ADMIN_EMAILS تُلصق يدويًا في إعدادات Vercel، فقد تحمل ما لا يُرى: علامات اتجاه النص التي تُنسخ مع
// النص العربي، أو علامات تنصيص، أو صيغة «الاسم <البريد>»، أو بادئة mailto:، أو نقطة في الآخر، أو فاصلة عربية
// أو منقوطة أو سطرًا جديدًا بين عنوانين. القراءة تتجاوز ذلك كله، ولا يبقى إلا ما فيه @.
const HIDDEN = /\p{Cf}/gu;
// علامات التنصيص والأقواس تُحذف من طرفي العنوان فقط، لأن الفاصلة العليا جائزة داخل البريد (o'brien@…).
const EDGES = /^["'`<>«»“”‘’()[\]]+|["'`<>«»“”‘’()[\].]+$/g;
const normEmail = (s: string) => s.replace(HIDDEN, "").trim().toLowerCase();

/** عناوين صاحب المشروع كما يقرؤها الموقع من HESSARA_ADMIN_EMAILS. */
export function adminEmails(raw = process.env.HESSARA_ADMIN_EMAILS): string[] {
  return (raw ?? "").replace(HIDDEN, "").split(/[\s,;،؛]+/u)
    .map((s) => s.replace(EDGES, "").replace(/^mailto:/i, "").replace(EDGES, "").toLowerCase())
    .filter((s) => s.includes("@"));
}

/** صاحب المشروع: بريده في HESSARA_ADMIN_EMAILS. لا حدّ عليه، ويرى صفحة الإحصاءات. */
export function isAdmin(email?: string | null): boolean {
  return !!email && adminEmails().includes(normEmail(email));
}

function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

/**
 * سطر لسجلات الموقع حين تُرفض صفحة الإحصاءات لحساب مسجَّل الدخول، يبيّن السبب دون أي عنوان:
 * هل وصل المتغير إلى هذا النشر، وكم عنوانًا قُرئ منه، وهل حمل محارف خفية، وهل نطاق بريد الحساب بينها،
 * وكم حرفًا يختلف أقرب عنوان عن بريد الحساب (حتى ٣، وما زاد «more»).
 */
export function adminDeniedDiagnostic(email: string, raw = process.env.HESSARA_ADMIN_EMAILS): string {
  const list = adminEmails(raw);
  const mine = normEmail(email);
  const domain = (a: string) => a.slice(a.lastIndexOf("@") + 1);
  const nearest = list.length ? Math.min(...list.map((a) => editDistance(a, mine))) : null;
  return JSON.stringify({
    event: "admin_denied",
    variable: raw === undefined ? "missing" : raw.trim() ? "set" : "empty",
    addresses: list.length,
    hiddenChars: /\p{Cf}/u.test(raw ?? ""),
    sameDomain: list.some((a) => domain(a) === domain(mine)),
    nearest: nearest === null ? null : nearest <= 3 ? nearest : "more",
  });
}

export const usageDay = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);

/** left: ما بقي للمستخدم، platformLeft: ما بقي للمنصة كلها. null يعني بلا حد (صاحب المشروع). */
export type Quota = { used: number; limit: number | null; left: number | null; platformLeft: number | null };

export async function platformUsedToday(): Promise<number> {
  const row = await get<{ n: number | string | null }>("SELECT SUM(calls) AS n FROM usage_daily WHERE day = ?", usageDay());
  return Number(row?.n ?? 0);
}

export async function quotaFor(user: { id: string; email: string }): Promise<Quota> {
  const row = await get<{ calls: number | string }>("SELECT calls FROM usage_daily WHERE user_id = ? AND day = ?", user.id, usageDay());
  const used = Number(row?.calls ?? 0);
  if (isAdmin(user.email)) return { used, limit: null, left: null, platformLeft: null };
  const limit = dailyLimit();
  const platformLeft = Math.max(0, platformDailyLimit() - (await platformUsedToday()));
  return { used, limit, left: Math.max(0, limit - used), platformLeft };
}

const userOut = (q: Pick<Quota, "left">) => q.left !== null && q.left <= 0;
const platformOut = (q: Pick<Quota, "platformLeft">) => q.platformLeft !== null && q.platformLeft <= 0;

export const quotaExhausted = (q: Quota) => userOut(q) || platformOut(q);

/** يُسجَّل بعد نجاح الاستدعاء، فلا يستهلك الفشل حصة المستخدم. */
export async function countUse(userId: string): Promise<void> {
  await run(
    "INSERT INTO usage_daily (user_id, day, calls) VALUES (?,?,1) ON CONFLICT (user_id, day) DO UPDATE SET calls = usage_daily.calls + 1",
    userId, usageDay(),
  );
}

/** رسالة الرفض: حد المستخدم إن بلغه، وإلا سقف المنصة. */
export function quotaMessage(q: Pick<Quota, "limit" | "left" | "platformLeft">, lang: "ar" | "en"): string {
  if (!userOut(q) && platformOut(q))
    return lang === "ar"
      ? "بلغت المنصة سقفها اليومي المشترك من استدعاءات النماذج الحقيقية لكل المستخدمين. يتجدد السقف غدًا، ويبقى المحرك التجريبي والمراجع القاعدي متاحَين."
      : "The platform has reached its shared daily cap on real-model calls across all users. It renews tomorrow; the demo engine and the rule-based reviewer remain available.";
  return lang === "ar"
    ? `بلغت حدّك اليومي من استدعاءات النماذج الحقيقية (${q.limit}). يتجدد الحد غدًا، ويبقى المحرك التجريبي والمراجع القاعدي متاحَين.`
    : `You have reached your daily limit of real-model calls (${q.limit}). It renews tomorrow; the demo engine and the rule-based reviewer remain available.`;
}

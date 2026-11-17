// استبيان سهولة الاستخدام في قاعدة البيانات: إجابة واحدة لكل مستخدم، وملخص مجمّع لصفحة الإحصاءات.
// العبارات وطريقة حساب الدرجة في sus-items.ts.
import { all, get, run } from "./db.ts";
import { susScore, validAnswers, SUS_ITEMS } from "./sus-items.ts";

export { susScore, validAnswers, SUS_ITEMS };

/** يُعرض الاستبيان بعد هذا العدد من الاستشارات، حتى يقيّم المستخدم تجربة فعلية. */
export const SUS_MIN_CONSULTATIONS = 2;

export type SusStatus = "answered" | "dismissed" | "eligible" | "not_yet";

export async function susStatus(userId: string): Promise<SusStatus> {
  const row = await get<{ answers: string | null; dismissed: number | string }>("SELECT answers, dismissed FROM sus_responses WHERE user_id = ?", userId);
  if (row?.answers) return "answered";
  if (row && Number(row.dismissed) === 1) return "dismissed";
  const c = await get<{ c: unknown }>("SELECT COUNT(*) AS c FROM consultations WHERE user_id = ?", userId);
  return Number(c?.c ?? 0) >= SUS_MIN_CONSULTATIONS ? "eligible" : "not_yet";
}

export async function userSus(userId: string): Promise<{ answers: number[]; score: number; lang: string; created_at: number } | null> {
  const row = await get<{ answers: string | null; score: number | string | null; lang: string; created_at: number | string }>(
    "SELECT answers, score, lang, created_at FROM sus_responses WHERE user_id = ?", userId);
  if (!row?.answers) return null;
  return { answers: JSON.parse(row.answers) as number[], score: Number(row.score), lang: row.lang, created_at: Number(row.created_at) };
}

/** إجابة واحدة لكل مستخدم: الإرسال الجديد يحل محل السابق. */
export async function saveSus(userId: string, answers: number[], lang: string, now = Date.now()) {
  const score = susScore(answers);
  if (score === null) throw new Error("invalid SUS answers");
  await run(
    "INSERT INTO sus_responses (user_id, answers, score, lang, dismissed, created_at) VALUES (?,?,?,?,0,?) " +
      "ON CONFLICT (user_id) DO UPDATE SET answers = excluded.answers, score = excluded.score, lang = excluded.lang, dismissed = 0, created_at = excluded.created_at",
    userId, JSON.stringify(answers), score, lang, now,
  );
  return score;
}

/** «لا، شكرًا»: لا تُعرض الدعوة مرة أخرى. لا يمس إجابة سابقة إن وُجدت. */
export async function dismissSus(userId: string, lang: string, now = Date.now()) {
  await run(
    "INSERT INTO sus_responses (user_id, answers, score, lang, dismissed, created_at) VALUES (?,NULL,NULL,?,1,?) " +
      "ON CONFLICT (user_id) DO UPDATE SET dismissed = 1 WHERE sus_responses.answers IS NULL",
    userId, lang, now,
  );
}

export type SusSummary = { n: number; mean: number | null; median: number | null; min: number | null; max: number | null; items: (number | null)[] };

/** ملخص مجمّع لصفحة الإحصاءات: لا هوية لأي مجيب. */
export async function susSummary(): Promise<SusSummary> {
  const rows = await all<{ answers: string; score: number | string }>("SELECT answers, score FROM sus_responses WHERE answers IS NOT NULL");
  const scores = rows.map((r) => Number(r.score)).sort((a, b) => a - b);
  const n = scores.length;
  if (!n) return { n, mean: null, median: null, min: null, max: null, items: Array(10).fill(null) };
  const mean = scores.reduce((s, v) => s + v, 0) / n;
  const median = n % 2 ? scores[(n - 1) / 2] : (scores[n / 2 - 1] + scores[n / 2]) / 2;
  const sums = Array(10).fill(0);
  for (const r of rows) (JSON.parse(r.answers) as number[]).forEach((v, i) => (sums[i] += v));
  return { n, mean, median, min: scores[0], max: scores[n - 1], items: sums.map((s) => s / n) };
}

/** للتنزيل من صفحة الإحصاءات: الإجابات والدرجة واللغة واليوم، دون أي معرّف للمستخدم. */
export async function susCsv(): Promise<string> {
  const rows = await all<{ answers: string; score: number | string; lang: string; created_at: number | string }>(
    "SELECT answers, score, lang, created_at FROM sus_responses WHERE answers IS NOT NULL ORDER BY created_at");
  const head = [...Array.from({ length: 10 }, (_, i) => `q${i + 1}`), "score", "lang", "day"].join(",");
  const lines = rows.map((r) => [...(JSON.parse(r.answers) as number[]), Number(r.score), r.lang === "en" ? "en" : "ar", new Date(Number(r.created_at)).toISOString().slice(0, 10)].join(","));
  return [head, ...lines].join("\n") + "\n";
}

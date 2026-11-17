// تنزيل كل ما تحفظه المنصة عن المستخدم في ملف واحد (JSON): الحساب وتفضيلاته، والاستشارات برسائلها وتقييماتها،
// والمراجعات، والمفضلات، وسجل الوكلاء، واستدعاءات النماذج اليومية، والجلسات النشطة، واستبيان سهولة الاستخدام.
// لا يتضمن تجزئة كلمة المرور ولا رموز الجلسات، لأنها أسرار تحمي الحساب لا بيانات عنه.
import { all, get, type ConsultRow, type MessageRow, type ReviewRow } from "@/lib/db";
import { authed, fail } from "@/lib/http";
import { tOf } from "@/lib/i18n";
import { allow } from "@/lib/limits";

const iso = (v: unknown) => (v == null ? null : new Date(Number(v)).toISOString());
const parsed = (s: unknown) => {
  if (typeof s !== "string") return s ?? null;
  try { return JSON.parse(s); } catch { return s; }
};
const rating = (f: unknown) => (Number(f) === 1 ? "helpful" : Number(f) === -1 ? "not_helpful" : null);

export const GET = authed(async (req, user) => {
  const t = tOf(req);
  if (!(await allow(`export:${user.id}`, 10, 60 * 60_000))) return fail(429, t("طلبات تنزيل كثيرة. أعد المحاولة بعد قليل.", "Too many downloads. Try again shortly."));

  const [consultations, messages, shares, reviews, favorites, actions, usage, sessions, sus] = await Promise.all([
    all<ConsultRow>("SELECT * FROM consultations WHERE user_id = ? ORDER BY created_at", user.id),
    all<MessageRow & { reason: string | null }>(
      "SELECT m.*, f.reason AS reason FROM messages m JOIN consultations c ON c.id = m.consultation_id " +
        "LEFT JOIN feedback_reasons f ON f.message_id = m.id WHERE c.user_id = ? ORDER BY m.created_at, m.id",
      user.id,
    ),
    all<{ token: string; consultation_id: string; created_at: number }>("SELECT token, consultation_id, created_at FROM shares WHERE user_id = ?", user.id),
    all<ReviewRow>("SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at", user.id),
    all<{ kind: string; ref: string; created_at: number }>("SELECT kind, ref, created_at FROM favorites WHERE user_id = ? ORDER BY created_at", user.id),
    all<{ consultation_id: string | null; kind: string; detail: string; created_at: number }>(
      "SELECT consultation_id, kind, detail, created_at FROM actions WHERE user_id = ? ORDER BY created_at", user.id),
    all<{ day: string; calls: number }>("SELECT day, calls FROM usage_daily WHERE user_id = ? ORDER BY day", user.id),
    all<{ expires_at: number }>("SELECT expires_at FROM sessions WHERE user_id = ? ORDER BY expires_at", user.id),
    get<{ answers: string | null; score: number | null; lang: string; dismissed: number; created_at: number }>(
      "SELECT answers, score, lang, dismissed, created_at FROM sus_responses WHERE user_id = ?", user.id),
  ]);
  const origin = new URL(req.url).origin;
  const shareOf = new Map(shares.map((s) => [s.consultation_id, s]));

  const data = {
    format: "hessara-export/1",
    exported_at: new Date().toISOString(),
    note: {
      ar: "نسخة من كل ما تحفظه هسّارة عنك، عدا تجزئة كلمة المرور ورموز الجلسات. التواريخ بالتوقيت العالمي.",
      en: "A copy of everything HESSARA stores about you, except the password hash and session tokens. Times are in UTC.",
    },
    account: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      preferred_model: user.pref_model,
      preferred_agent: user.pref_agent,
      break_reminder: { enabled: Number(user.reminder_enabled) === 1, every_minutes: Number(user.reminder_minutes) },
      suggest_videos: Number(user.personalize) === 1,
      external_model_consent: Number(user.external_consent) === 1,
      created_at: iso(user.created_at),
    },
    consultations: consultations.map((c) => {
      const share = shareOf.get(c.id);
      return {
        id: c.id,
        title: c.title,
        model_id: c.model_id,
        agent_id: c.agent_id,
        saved: Number(c.saved) === 1,
        created_at: iso(c.created_at),
        updated_at: iso(c.updated_at),
        share_link: share ? { url: `${origin}/s/${share.token}`, created_at: iso(share.created_at) } : null,
        messages: messages.filter((m) => m.consultation_id === c.id).map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          model_id: m.model_id,
          engine: m.engine,
          status: m.status,
          rating: rating(m.feedback),
          not_helpful_reason: m.reason ?? null,
          created_at: iso(m.created_at),
        })),
      };
    }),
    reviews: reviews.map((r) => ({
      id: r.id,
      consultation_id: r.consultation_id,
      message_id: r.message_id,
      mode: r.mode,
      criteria: parsed(r.criteria),
      input: r.input,
      result: parsed(r.result),
      engine: r.engine,
      revised: r.revised,
      created_at: iso(r.created_at),
    })),
    favorites: favorites.map((f) => ({ kind: f.kind, ref: f.ref, created_at: iso(f.created_at) })),
    agent_log: actions.map((a) => ({ consultation_id: a.consultation_id, kind: a.kind, detail: a.detail, created_at: iso(a.created_at) })),
    daily_real_model_calls: usage.map((u) => ({ day: u.day, calls: Number(u.calls) })),
    active_sessions: sessions.map((s) => ({ expires_at: iso(s.expires_at) })),
    usability_questionnaire: sus
      ? { answers: parsed(sus.answers), score: sus.score == null ? null : Number(sus.score), lang: sus.lang, declined: Number(sus.dismissed) === 1, at: iso(sus.created_at) }
      : null,
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="hessara-data-${new Date().toISOString().slice(0, 10)}.json"`,
      "cache-control": "no-store",
    },
  });
});

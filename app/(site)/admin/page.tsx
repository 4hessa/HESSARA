// إحصاءات المنصة لصاحب المشروع (بريده في HESSARA_ADMIN_EMAILS). أعداد مجمّعة فقط:
// لا تعرض محتوى أي استشارة ولا هوية أي مستخدم. لغيره تظهر الصفحة كأنها غير موجودة.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalTime } from "@/components/LocalTime";
import { AppPage } from "@/components/site/Page";
import { agentById } from "@/lib/catalog/agents";
import { localizeModel, modelById } from "@/lib/catalog/models";
import { all, get } from "@/lib/db";
import { requireUser } from "@/lib/guard";
import { intlLocale, makeT } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { listModels } from "@/lib/providers";
import { modeById } from "@/lib/review/types";
import { SUS_ITEMS, susSummary } from "@/lib/sus";
import { adminDeniedDiagnostic, dailyLimit, isAdmin, platformDailyLimit, usageDay } from "@/lib/usage";

export async function generateMetadata(): Promise<Metadata> {
  const t = makeT(await getLang());
  return { title: t("إحصاءات المنصة", "Platform statistics"), robots: { index: false, follow: false } };
}

const DAY = 86_400_000;
const n = (v: unknown) => Number(v ?? 0);
const REASONS: Record<string, { ar: string; en: string }> = {
  inaccurate: { ar: "غير دقيقة", en: "Inaccurate" },
  incomplete: { ar: "ناقصة", en: "Incomplete" },
  off_topic: { ar: "لا تجيب عن السؤال", en: "Does not answer the question" },
  unclear: { ar: "غير واضحة", en: "Unclear" },
  other: { ar: "سبب آخر", en: "Another reason" },
};
const STATUS: Record<string, { ar: string; en: string }> = {
  ready: { ar: "يعمل", en: "Ready" },
  configured: { ar: "مهيّأ، لم يُختبر", en: "Configured, untested" },
  failed: { ar: "فشل آخر اختبار", en: "Last test failed" },
  not_configured: { ar: "غير مهيّأ", en: "Not configured" },
};

export default async function AdminPage() {
  const user = await requireUser("/admin");
  if (!isAdmin(user.email)) {
    // أعداد وعلامات فقط، دون أي عنوان؛ تظهر في سجلات Vercel لمعرفة سبب الرفض.
    console.warn(adminDeniedDiagnostic(user.email));
    notFound();
  }
  const lang = await getLang();
  const t = makeT(lang);
  const num = (v: number) => new Intl.NumberFormat(intlLocale(lang)).format(v);
  const now = Date.now();
  const week = now - 7 * DAY;
  const month30 = usageDay(now - 29 * DAY);
  const days14 = usageDay(now - 13 * DAY);
  const modelName = (id: string | null) => { const d = modelById(id); return d ? localizeModel(d, lang).name : id ?? "—"; };

  const [users, users7, consults, consults7, answers, reviewsTotal, shares, views30] = await Promise.all([
    get("SELECT COUNT(*) AS c FROM users"),
    get("SELECT COUNT(*) AS c FROM users WHERE created_at >= ?", week),
    get("SELECT COUNT(*) AS c FROM consultations"),
    get("SELECT COUNT(*) AS c FROM consultations WHERE created_at >= ?", week),
    get("SELECT COUNT(*) AS c FROM messages WHERE role = 'assistant'"),
    get("SELECT COUNT(*) AS c FROM reviews"),
    get("SELECT COUNT(*) AS c FROM shares"),
    get("SELECT COALESCE(SUM(views), 0) AS c FROM page_views WHERE day >= ?", month30),
  ]).then((rows) => rows.map((r) => n((r as { c?: unknown } | undefined)?.c)));

  const byModel = await all<{ model_id: string | null; engine: string | null; answers: unknown; up: unknown; down: unknown }>(
    "SELECT model_id, engine, COUNT(*) AS answers, SUM(CASE WHEN feedback = 1 THEN 1 ELSE 0 END) AS up, SUM(CASE WHEN feedback = -1 THEN 1 ELSE 0 END) AS down " +
      "FROM messages WHERE role = 'assistant' GROUP BY model_id, engine ORDER BY COUNT(*) DESC",
  );
  const reasons = await all<{ reason: string; c: unknown }>("SELECT reason, COUNT(*) AS c FROM feedback_reasons GROUP BY reason ORDER BY COUNT(*) DESC");
  const agents = await all<{ agent_id: string | null; c: unknown }>("SELECT agent_id, COUNT(*) AS c FROM consultations GROUP BY agent_id ORDER BY COUNT(*) DESC");
  const reviews = await all<{ mode: string; engine: string; c: unknown }>("SELECT mode, engine, COUNT(*) AS c FROM reviews GROUP BY mode, engine ORDER BY COUNT(*) DESC");
  const limit = dailyLimit();
  const today = await get<{ users: unknown; calls: unknown; capped: unknown }>(
    "SELECT COUNT(*) AS users, COALESCE(SUM(calls), 0) AS calls, SUM(CASE WHEN calls >= ? THEN 1 ELSE 0 END) AS capped FROM usage_daily WHERE day = ?",
    limit, usageDay(now),
  );
  const topPaths = await all<{ path: string; v: unknown }>("SELECT path, SUM(views) AS v FROM page_views WHERE day >= ? GROUP BY path ORDER BY SUM(views) DESC LIMIT 12", month30);
  const perDay = await all<{ day: string; v: unknown }>("SELECT day, SUM(views) AS v FROM page_views WHERE day >= ? GROUP BY day ORDER BY day", days14);
  const models = await listModels(true, lang);
  const platform = platformDailyLimit();
  const errors7 = n((await get<{ c: unknown }>("SELECT COALESCE(SUM(hits), 0) AS c FROM error_counts WHERE day >= ?", usageDay(now - 6 * DAY)))?.c);
  const errors = await all<{ day: string; source: string; route: string; kind: string; hits: unknown; last_at: unknown; sample: string }>(
    "SELECT day, source, route, kind, hits, last_at, sample FROM error_counts WHERE day >= ? ORDER BY day DESC, hits DESC LIMIT 40", days14);
  const sus = await susSummary();
  const dec = (v: number | null, digits = 1) => (v === null ? "—" : new Intl.NumberFormat(intlLocale(lang), { maximumFractionDigits: digits }).format(v));

  const tiles: { label: string; value: number | string; note: string }[] = [
    { label: t("المستخدمون", "Users"), value: users, note: t(`${num(users7)} جديد خلال ٧ أيام`, `${num(users7)} new in 7 days`) },
    { label: t("الاستشارات", "Consultations"), value: consults, note: t(`${num(consults7)} خلال ٧ أيام`, `${num(consults7)} in 7 days`) },
    { label: t("الإجابات", "Answers"), value: answers, note: t("من كل النماذج والمحرك التجريبي", "From every model and the demo engine") },
    { label: t("المراجعات النقدية", "Critical reviews"), value: reviewsTotal, note: t("في المختبر والاستشارات", "In the lab and in consultations") },
    { label: t("روابط مشاركة نشطة", "Active share links"), value: shares, note: t("استشارات شاركها أصحابها", "Consultations shared by their owners") },
    { label: t("الزيارات", "Page views"), value: views30, note: t("آخر ٣٠ يومًا، دون الآلات", "Last 30 days, without bots") },
    { label: t("استدعاءات النماذج اليوم", "Model calls today"), value: n(today?.calls), note: t(`من سقف المنصة اليومي: ${num(platform)}`, `Of the platform's daily cap: ${num(platform)}`) },
    { label: t("الأخطاء", "Errors"), value: errors7, note: t("آخر ٧ أيام، من الخادم والمتصفح", "Last 7 days, server and browser") },
    { label: t("سهولة الاستخدام", "Ease of use"), value: dec(sus.mean), note: t(`متوسط مقياس SUS من 100، ${num(sus.n)} إجابة`, `Mean SUS score out of 100, ${num(sus.n)} responses`) },
  ];

  return (
    <AppPage eyebrow={t("لصاحب المشروع", "For the project owner")} title={t("إحصاءات المنصة", "Platform statistics")}
      copy={t("أعداد مجمّعة فقط: لا تعرض هذه الصفحة محتوى أي استشارة ولا هوية أي مستخدم.", "Aggregate counts only: this page shows neither the content of any consultation nor the identity of any user.")}>
      <div className="stack-lg">
        <section className="kpi-row" aria-label={t("أرقام رئيسية", "Key figures")}>
          {tiles.map((k) => (
            <div key={k.label} className="kpi">
              <span className="kpi__label">{k.label}</span>
              <span className="kpi__value">{typeof k.value === "number" ? num(k.value) : k.value}</span>
              <span className="kpi__note">{k.note}</span>
            </div>
          ))}
        </section>

        <section className="stack-sm">
          <h2 className="t-h4">{t("حدود النماذج الحقيقية اليوم", "Today's limits on real models")}</h2>
          <p className="t-small">
            {t(`الحد لكل مستخدم: ${num(limit)} استدعاء، وسقف المنصة كلها: ${num(platform)}. استخدم النماذج اليوم ${num(n(today?.users))} مستخدم بمجموع ${num(n(today?.calls))} استدعاء، وبلغ حدّه منهم ${num(n(today?.capped))}.`,
              `Limit per user: ${num(limit)} calls; cap for the whole platform: ${num(platform)}. Today ${num(n(today?.users))} users made ${num(n(today?.calls))} calls in total, and ${num(n(today?.capped))} of them reached their limit.`)}
            {" "}{t("يُغيَّران بالمتغيرين HESSARA_DAILY_LIMIT و HESSARA_PLATFORM_DAILY_LIMIT.", "Change them with HESSARA_DAILY_LIMIT and HESSARA_PLATFORM_DAILY_LIMIT.")}
          </p>
        </section>

        <section className="stack-sm" aria-labelledby="sus-h">
          <h2 id="sus-h" className="t-h4">{t("استبيان سهولة الاستخدام (SUS)", "Usability questionnaire (SUS)")}</h2>
          <p className="t-small">
            {sus.n
              ? t(`${num(sus.n)} إجابة. المتوسط ${dec(sus.mean)} من 100، والوسيط ${dec(sus.median)}، وأدنى درجة ${dec(sus.min)} وأعلاها ${dec(sus.max)}.`,
                  `${num(sus.n)} responses. Mean ${dec(sus.mean)} out of 100, median ${dec(sus.median)}, lowest ${dec(sus.min)}, highest ${dec(sus.max)}.`)
              : t("لا إجابات بعد. تظهر الدعوة في لوحة كل مستخدم أجرى استشارتين على الأقل.", "No responses yet. The invitation appears on the dashboard of every user with at least two consultations.")}
            {" "}{t("الدرجة للمقارنة وليست نسبة مئوية، والعدد الصغير لا يكفي لحكم عام. الترجمة العربية للعبارات ترجمة المنصة وليست نسخة محكّمة منشورة.",
              "The score is for comparison and is not a percentage, and a small number of responses does not support a general conclusion. The Arabic wording is the platform's own translation, not a published validated version.")}
          </p>
          {sus.n > 0 && (
            <>
              <div className="table-wrap">
                <table className="stat-table">
                  <thead><tr><th>{t("العبارة", "Statement")}</th><th>{t("متوسط الإجابة (1–5)", "Mean answer (1–5)")}</th></tr></thead>
                  <tbody>
                    {SUS_ITEMS.map((it, i) => <tr key={i}><td>{num(i + 1)}. {it[lang]}</td><td>{dec(sus.items[i], 2)}</td></tr>)}
                  </tbody>
                </table>
              </div>
              <div><a className="btn btn-secondary btn-sm" href="/api/admin/sus" download>{t("نزّل الإجابات (ملف جدولي دون أسماء)", "Download the responses (spreadsheet file, no names)")}</a></div>
            </>
          )}
        </section>

        <section className="stack-sm">
          <h2 className="t-h4">{t("الإجابات والتقييمات حسب النموذج", "Answers and ratings by model")}</h2>
          <div className="table-wrap">
            <table className="stat-table">
              <thead><tr><th>{t("النموذج", "Model")}</th><th>{t("الإجابات", "Answers")}</th><th>{t("مفيدة", "Helpful")}</th><th>{t("غير مفيدة", "Not helpful")}</th><th>{t("نسبة المفيدة من المقيَّمة", "Helpful share of rated")}</th></tr></thead>
              <tbody>
                {byModel.length === 0 && <tr><td colSpan={5}>{t("لا إجابات بعد.", "No answers yet.")}</td></tr>}
                {byModel.map((r, i) => {
                  const up = n(r.up), down = n(r.down);
                  return (
                    <tr key={i}>
                      <td><bdi>{modelName(r.model_id)}</bdi>{r.engine === "demo" ? t(" (تجريبي)", " (demo)") : ""}</td>
                      <td>{num(n(r.answers))}</td><td>{num(up)}</td><td>{num(down)}</td>
                      <td>{up + down ? `${num(Math.round((up / (up + down)) * 100))}%` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid-2">
          <section className="stack-sm">
            <h2 className="t-h4">{t("أسباب «غير مفيدة»", "Reasons for “not helpful”")}</h2>
            <table className="stat-table">
              <thead><tr><th>{t("السبب", "Reason")}</th><th>{t("العدد", "Count")}</th></tr></thead>
              <tbody>
                {reasons.length === 0 && <tr><td>{t("لا أسباب مسجلة بعد.", "No reasons recorded yet.")}</td></tr>}
                {reasons.map((r) => <tr key={r.reason}><td>{REASONS[r.reason]?.[lang] ?? r.reason}</td><td>{num(n(r.c))}</td></tr>)}
              </tbody>
            </table>
          </section>
          <section className="stack-sm">
            <h2 className="t-h4">{t("الاستشارات حسب الوكيل", "Consultations by agent")}</h2>
            <table className="stat-table">
              <thead><tr><th>{t("الوكيل", "Agent")}</th><th>{t("الاستشارات", "Consultations")}</th></tr></thead>
              <tbody>
                {agents.length === 0 && <tr><td>{t("لا استشارات بعد.", "No consultations yet.")}</td></tr>}
                {agents.map((a, i) => <tr key={i}><td>{a.agent_id ? agentById(a.agent_id, lang)?.name ?? a.agent_id : t("بدون وكيل", "No agent")}</td><td>{num(n(a.c))}</td></tr>)}
              </tbody>
            </table>
          </section>
        </div>

        <section className="stack-sm">
          <h2 className="t-h4">{t("المراجعات حسب النمط والمحرك", "Reviews by mode and engine")}</h2>
          <div className="table-wrap">
            <table className="stat-table">
              <thead><tr><th>{t("النمط", "Mode")}</th><th>{t("المحرك", "Engine")}</th><th>{t("العدد", "Count")}</th></tr></thead>
              <tbody>
                {reviews.length === 0 && <tr><td colSpan={3}>{t("لا مراجعات بعد.", "No reviews yet.")}</td></tr>}
                {reviews.map((r, i) => (
                  <tr key={i}>
                    <td>{modeById(r.mode, lang)?.name ?? r.mode}</td>
                    <td>{r.engine === "jev" ? "Jev" : r.engine === "llm" ? t("نموذج لغوي", "Language model") : t("المراجع القاعدي", "Rule-based")}</td>
                    <td>{num(n(r.c))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="stack-sm">
          <h2 className="t-h4">{t("حالة النماذج", "Model status")}</h2>
          <div className="table-wrap">
            <table className="stat-table">
              <thead><tr><th>{t("النموذج", "Model")}</th><th>{t("الحالة", "Status")}</th><th>{t("آخر اختبار", "Last test")}</th><th>{t("السبب", "Reason")}</th></tr></thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.id}>
                    <td><bdi>{m.name}</bdi></td>
                    <td>{m.engine === "demo" ? t("تجريبي — يعمل دون مفاتيح", "Demo — runs without keys") : STATUS[m.status]?.[lang] ?? m.status}</td>
                    <td>{m.checkedAt ? <LocalTime ts={m.checkedAt} /> : "—"}</td>
                    <td className="t-small">{m.checkError ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="stack-sm" aria-labelledby="err-h">
          <h2 id="err-h" className="t-h4">{t("الأخطاء (١٤ يومًا)", "Errors (14 days)")}</h2>
          <p className="t-small">{t("أخطاء غير متوقعة في الخادم أو في متصفحات الزوار، مجمّعة حسب اليوم والصفحة والنوع. الرسالة منقّاة: لا تحوي بريدًا ولا أرقامًا طويلة ولا أي نص كتبه مستخدم. تُحذف بعد ٣٠ يومًا.",
            "Unexpected errors on the server or in visitors' browsers, grouped by day, page and type. Messages are cleaned: no emails, long numbers or text written by a user. Deleted after 30 days.")}</p>
          <div className="table-wrap">
            <table className="stat-table">
              <thead><tr><th>{t("اليوم", "Day")}</th><th>{t("المصدر", "Source")}</th><th>{t("المسار", "Route")}</th><th>{t("النوع", "Type")}</th><th>{t("المرات", "Count")}</th><th>{t("آخر رسالة", "Last message")}</th></tr></thead>
              <tbody>
                {errors.length === 0 && <tr><td colSpan={6}>{t("لا أخطاء مسجلة.", "No errors recorded.")}</td></tr>}
                {errors.map((e, i) => (
                  <tr key={i}>
                    <td><span className="ltr">{e.day}</span></td>
                    <td>{e.source === "client" ? t("المتصفح", "Browser") : t("الخادم", "Server")}</td>
                    <td><span className="ltr"><code>{e.route}</code></span></td>
                    <td><span className="ltr"><code>{e.kind}</code></span></td>
                    <td>{num(n(e.hits))}</td>
                    <td className="t-small"><span className="ltr">{e.sample || "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid-2">
          <section className="stack-sm">
            <h2 className="t-h4">{t("أكثر الصفحات زيارة (٣٠ يومًا)", "Most viewed pages (30 days)")}</h2>
            <table className="stat-table">
              <thead><tr><th>{t("الصفحة", "Page")}</th><th>{t("الزيارات", "Views")}</th></tr></thead>
              <tbody>
                {topPaths.length === 0 && <tr><td>{t("لا زيارات مسجلة بعد.", "No views recorded yet.")}</td></tr>}
                {topPaths.map((p) => <tr key={p.path}><td><span className="ltr"><code>{p.path}</code></span></td><td>{num(n(p.v))}</td></tr>)}
              </tbody>
            </table>
          </section>
          <section className="stack-sm">
            <h2 className="t-h4">{t("الزيارات اليومية (١٤ يومًا)", "Daily page views (14 days)")}</h2>
            <table className="stat-table">
              <thead><tr><th>{t("اليوم", "Day")}</th><th>{t("الزيارات", "Views")}</th></tr></thead>
              <tbody>
                {perDay.length === 0 && <tr><td>{t("لا زيارات مسجلة بعد.", "No views recorded yet.")}</td></tr>}
                {perDay.map((d) => <tr key={d.day}><td><span className="ltr">{d.day}</span></td><td>{num(n(d.v))}</td></tr>)}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </AppPage>
  );
}

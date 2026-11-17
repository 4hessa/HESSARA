import type { Metadata } from "next";
import Link from "next/link";
import { FavButton } from "@/components/Fav";
import { Icon } from "@/components/Icon";
import { PrefAgentButton } from "@/components/PrefAgent";
import { AppPage } from "@/components/site/Page";
import { currentUser } from "@/lib/auth";
import { agentsFor } from "@/lib/catalog/agents";
import { localizeModel, modelById } from "@/lib/catalog/models";
import { all } from "@/lib/db";
import { intlLocale, makeT, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { pageMeta } from "@/lib/meta";
import { modeById } from "@/lib/review/types";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const t = makeT(lang);
  return pageMeta(lang, t("الوكلاء المتخصصون", "Specialised agents"), t("ستة وكلاء متخصصين، لكلٍّ منهم تعليمات مكتوبة ونموذج إدخال وبنية إجابة ثابتة وحدود معلنة.", "Six specialised agents, each with written instructions, an intake form, a fixed answer structure, and stated limits."), "/agents");
}

/** سجل الإجراءات يُخزَّن بنية مستقلة عن اللغة ويُصاغ هنا بلغة الواجهة؛ السجلات القديمة نص عربي يُعرض كما هو. */
function describe(kind: string, detail: string, lang: Lang): string {
  const t = makeT(lang);
  let d: { model?: string; agent?: string | null; status?: string; mode?: string; engine?: string };
  try { d = JSON.parse(detail); } catch { return detail; }
  if (kind === "model_call") {
    const def = modelById(d.model);
    const name = def ? localizeModel(def, lang).name : d.model ?? "";
    const agent = d.agent ? agentsFor(lang).find((a) => a.id === d.agent)?.name : null;
    const status = d.status === "complete" ? t("مكتمل", "complete") : t("متوقف", "stopped");
    return agent ? t(`استدعاء ${name} عبر ${agent} — ${status}`, `Called ${name} through the ${agent} — ${status}`) : t(`استدعاء ${name} — ${status}`, `Called ${name} — ${status}`);
  }
  if (kind === "review") {
    const mode = modeById(d.mode ?? "", lang)?.name ?? d.mode;
    return t(`مراجعة «${mode}» — ${d.engine === "llm" ? "بنموذج لغوي" : "بالمراجع القاعدي"}`, `“${mode}” review — ${d.engine === "llm" ? "by a language model" : "by the rule-based reviewer"}`);
  }
  return detail;
}

export default async function AgentsPage() {
  const user = await currentUser();
  const lang = await getLang();
  const t = makeT(lang);
  const AGENTS = agentsFor(lang);
  const favs = user ? (await all<{ ref: string }>("SELECT ref FROM favorites WHERE user_id = ? AND kind = 'agent'", user.id)).map((f) => f.ref) : [];
  const log = user ? await all<{ kind: string; detail: string; created_at: number }>("SELECT kind, detail, created_at FROM actions WHERE user_id = ? ORDER BY created_at DESC LIMIT 8", user.id) : [];
  const fmt = new Intl.DateTimeFormat(intlLocale(lang), { dateStyle: "medium", timeStyle: "short" });
  return (
    <AppPage
      art={{ name: "consulting", kind: "fade", y: "-10.1rem", fade: { "--art-h": "26rem", "--f1": "35%", "--f2": "65%", "--f3": "100%" } }}
      top="15rem"
      eyebrow={t("المجلس الاستشاري", "Advisory Council")}
      title={t("الوكلاء المتخصصون", "Specialised Agents")}
      copy={t("الوكيل في هسّارة تركيب من: نموذج أساسي تختاره أنت، وتعليمات تخصصية، ونموذج إدخال يطلب ما يحتاجه مجاله، وبنية إجابة محددة، ونمط مراجعة افتراضي. في هذه النسخة لا يملك أي وكيل أدوات خارجية: يحلّل ويقترح ولا ينفّذ.",
        "An agent in HESSARA combines a base model you choose, specialised instructions, an intake form that asks for what its field needs, a fixed answer structure, and a default review mode. In this version no agent has external tools: it analyses and proposes, but does not act.")}
    >
      <div className="grid-2">
        {AGENTS.map((a) => (
          <article key={a.id} id={a.id} className="card">
            <div className="row-between">
              <div className="row" style={{ flexWrap: "nowrap" }}><span className="icon-tile"><Icon name={a.icon} /></span><h2 className="t-h3">{a.name}</h2></div>
              <FavButton kind="agent" id={a.id} initial={favs.includes(a.id)} label={a.name} />
            </div>
            <p className="muted t-small">{a.scope}</p>
            <div className="stack-sm"><h3 className="label">{t("ما يستطيع فعله", "What it can do")}</h3><ul className="list-check">{a.canDo.map((x) => <li key={x}><Icon name="check" size={16} /><span>{x}</span></li>)}</ul></div>
            <details>
              <summary className="link t-small" style={{ cursor: "pointer" }}>{t("الأدوات، الصلاحيات، والحدود", "Tools, permissions, and limits")}</summary>
              <dl className="stack-sm t-small" style={{ marginTop: "0.75rem" }}>
                <div><dt className="label">{t("الأدوات", "Tools")}</dt><dd style={{ margin: 0 }} className="muted">{a.tools.join(" ")}</dd></div>
                <div><dt className="label">{t("ما يحتاج موافقتك", "What needs your approval")}</dt><dd style={{ margin: 0 }} className="muted">{a.needsApproval.join(" ")}</dd></div>
                <div><dt className="label">{t("الحدود", "Limits")}</dt><dd style={{ margin: 0 }} className="muted">{a.limits.join(" ")}</dd></div>
                <div><dt className="label">{t("النموذج الأساسي", "Base model")}</dt><dd style={{ margin: 0 }} className="muted">{t("تختاره عند بدء الاستشارة، ويظهر اسمه مع كل إجابة.", "You choose it when you start the consultation, and its name appears with every answer.")}</dd></div>
                <div><dt className="label">{t("بنية الإجابة", "Answer structure")}</dt><dd style={{ margin: 0 }} className="muted">{a.sections.join(lang === "ar" ? " ← " : " → ")}</dd></div>
                <div><dt className="label">{t("نمط المراجعة الافتراضي", "Default review mode")}</dt><dd style={{ margin: 0 }} className="muted">{modeById(a.reviewMode, lang)?.name}</dd></div>
                <div><dt className="label">{t("أمثلة", "Examples")}</dt><dd style={{ margin: 0 }} className="muted">{a.examples.map((e) => (lang === "ar" ? `«${e}»` : `“${e}”`)).join(" ")}</dd></div>
              </dl>
            </details>
            <div className="card-foot">
              <Link className="btn btn-primary btn-sm" href={`/consult/new?agent=${a.id}`}>{t("ابدأ مع هذا الوكيل", "Start with this agent")}</Link>
              {user && <PrefAgentButton id={a.id} name={a.name} />}
            </div>
          </article>
        ))}
      </div>
      {user && (
        <section className="card block" aria-labelledby="log">
          <h2 id="log" className="t-h3">{t("سجل الإجراءات المنفَّذة فعلًا", "Log of actions actually taken")}</h2>
          <p className="t-small muted">{t("يُسجَّل هنا كل استدعاء نموذج أو مراجعة جرت باسم حسابك. لا إجراءات خارجية في هذه النسخة.", "Every model call or review made under your account is recorded here. There are no external actions in this version.")}</p>
          {log.length === 0 ? <p className="t-small muted">{t("لا إجراءات بعد.", "No actions yet.")}</p> : (
            <ul className="t-small stack-sm">{log.map((l, i) => <li key={i} className="row-between"><span>{describe(l.kind, l.detail, lang)}</span><span className="t-caption">{fmt.format(l.created_at)}</span></li>)}</ul>
          )}
        </section>
      )}
    </AppPage>
  );
}

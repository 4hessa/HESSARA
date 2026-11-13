import type { Metadata } from "next";
import Link from "next/link";
import { fmtDate, VendorMark } from "@/components/bits";
import { Icon } from "@/components/Icon";
import { QuickConsult } from "@/components/QuickConsult";
import { AppPage } from "@/components/site/Page";
import { agentById, agentsFor } from "@/lib/catalog/agents";
import { localizeModel, modelById } from "@/lib/catalog/models";
import { VIDEOS, videoThumb, videoUrl } from "@/lib/catalog/videos";
import { all, type ConsultRow } from "@/lib/db";
import { requireUser } from "@/lib/guard";
import { makeT } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = makeT(await getLang());
  return { title: t("لوحتي", "Dashboard") };
}

export default async function Home() {
  const user = await requireUser("/home");
  const lang = await getLang();
  const t = makeT(lang);
  const STARTERS = [
    { label: t("تحليل مشكلة تقنية", "Analyse a technical problem"), href: "/consult/new", icon: "consult" },
    { label: t("مراجعة شفرة برمجية", "Review some code"), href: "/consult/new?agent=coding", icon: "code" },
    { label: t("نقد فكرة أو قرار", "Critique an idea or decision"), href: "/lab", icon: "lab" },
    { label: t("بناء خطة مشروع", "Build a project plan"), href: "/consult/new?agent=planning", icon: "route" },
    { label: t("استشارة بحثية", "A research consultation"), href: "/consult/new?agent=research", icon: "flask" },
  ];
  const modelName = (id: string | null) => { const d = modelById(id); return d ? localizeModel(d, lang).name : ""; };
  const recent = await all<ConsultRow>("SELECT * FROM consultations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 5", user.id);
  const saved = await all<ConsultRow>("SELECT * FROM consultations WHERE user_id = ? AND saved = 1 ORDER BY updated_at DESC LIMIT 5", user.id);
  const favs = await all<{ kind: string; ref: string }>("SELECT kind, ref FROM favorites WHERE user_id = ?", user.id);
  const favAgents = [...new Set([user.pref_agent, ...favs.filter((f) => f.kind === "agent").map((f) => f.ref)])].map((id) => agentById(id, lang)).filter((a) => !!a);
  const usedModels = (await all<{ model_id: string }>("SELECT model_id FROM consultations WHERE user_id = ? GROUP BY model_id ORDER BY MAX(updated_at) DESC LIMIT 4", user.id))
    .map((r) => modelById(r.model_id)).filter((m) => !!m).map((m) => localizeModel(m, lang));
  const savedVideos = favs.filter((f) => f.kind === "video").map((f) => VIDEOS.find((v) => v.id === f.ref)).filter((v) => !!v);
  const videos = (savedVideos.length ? savedVideos : user.personalize ? VIDEOS.slice(0, 3) : []).slice(0, 3);
  const prefDef = modelById(user.pref_model);
  const pref = prefDef ? localizeModel(prefDef, lang) : undefined;

  return (
    <AppPage
      art={{ name: "home", kind: "fade", fade: { "--art-h": "24rem", "--f1": "20%", "--f2": "55%", "--f3": "100%" } }}
      top="14rem"
      eyebrow={t("لوحتي", "Dashboard")}
      title={t(`مرحبًا ${user.name}، كيف يمكننا مساعدتك اليوم؟`, `Welcome, ${user.name}. How can we help today?`)}
      copy={pref
        ? <>{t("نموذجك المفضل:", "Your favourite model:")} <bdi><strong>{pref.name}</strong></bdi> {t("— يُختار تلقائيًا في كل استشارة جديدة.", "— chosen automatically in every new consultation.")}</>
        : <>{t("لم تحدد نموذجًا مفضلًا بعد.", "You have not chosen a favourite model yet.")} <Link className="link" href="/models">{t("اختر من النماذج", "Choose from the models")}</Link></>}
    >
      <div className="stack-lg">
        <section className="stack" aria-label={t("ابدأ استشارة", "Start a consultation")} style={{ maxWidth: "46rem", marginInline: "auto", width: "100%" }}>
          <QuickConsult />
          <div className="chips" aria-label={t("ابدأ من مهمة", "Start from a task")}>
            {STARTERS.map((s) => <Link key={s.label} href={s.href} className="chip"><Icon name={s.icon} size={16} /> {s.label}</Link>)}
          </div>
        </section>

        <div className="grid-2">
          <section className="card" aria-labelledby="recent">
            <div className="row-between"><h2 id="recent" className="t-h3">{t("آخر الاستشارات", "Recent consultations")}</h2><Link className="link t-small" href="/consult">{t("السجل الكامل", "Full history")}</Link></div>
            {recent.length === 0 ? <p className="muted t-small">{t("لا استشارات بعد. اكتب مشكلتك في الحقل أعلاه لتبدأ.", "No consultations yet. Write your problem in the field above to begin.")}</p> : (
              <ul>{recent.map((c) => (
                <li key={c.id}><Link href={`/consult/${c.id}`} className="ws-item"><span className="ws-item-title">{c.title}</span>
                  <span className="t-caption"><bdi>{modelName(c.model_id)}</bdi>{c.agent_id ? ` · ${agentById(c.agent_id, lang)?.name}` : ""} · {fmtDate(c.updated_at, lang)}</span></Link></li>
              ))}</ul>
            )}
          </section>
          <section className="card" aria-labelledby="saved">
            <div className="row-between"><h2 id="saved" className="t-h3">{t("الاستشارات المحفوظة", "Saved consultations")}</h2><Link className="link t-small" href="/consult?saved=1">{t("الكل", "All")}</Link></div>
            {saved.length === 0 ? <p className="muted t-small">{t("احفظ استشارة بزر الإشارة المرجعية في أعلى المحادثة لتجدها هنا.", "Save a consultation with the bookmark button at the top of the conversation to find it here.")}</p> : (
              <ul>{saved.map((c) => <li key={c.id}><Link href={`/consult/${c.id}`} className="ws-item"><span className="ws-item-title">{c.title}</span><span className="t-caption">{fmtDate(c.updated_at, lang)}</span></Link></li>)}</ul>
            )}
          </section>
          <section className="card" aria-labelledby="fav-agents">
            <div className="row-between"><h2 id="fav-agents" className="t-h3">{t("وكلاؤك المفضلون", "Your favourite agents")}</h2><Link className="link t-small" href="/agents">{t("كل الوكلاء", "All agents")}</Link></div>
            {favAgents.length === 0 ? <p className="muted t-small">{t(`لم تضف وكيلًا إلى المفضلة. يوجد ${agentsFor(lang).length} وكلاء متخصصين.`, `You have not added an agent to your favourites. There are ${agentsFor(lang).length} specialised agents.`)}</p> : (
              <div className="chips">{favAgents.map((a) => <Link key={a!.id} className="chip" href={`/consult/new?agent=${a!.id}`}><Icon name={a!.icon} size={16} /> {a!.name}</Link>)}</div>
            )}
          </section>
          <section className="card" aria-labelledby="used-models">
            <div className="row-between"><h2 id="used-models" className="t-h3">{t("النماذج المستخدمة مؤخرًا", "Recently used models")}</h2><Link className="link t-small" href="/models">{t("كل النماذج", "All models")}</Link></div>
            {usedModels.length === 0 ? <p className="muted t-small">{t("ستظهر هنا النماذج التي تستخدمها في استشاراتك.", "The models you use in your consultations will appear here.")}</p> : (
              <div className="chips">{usedModels.map((m) => <Link key={m.id} className="chip" href={`/consult/new?model=${m.id}`}><VendorMark vendorKey={m.vendorKey} small /> <bdi>{m.name}</bdi></Link>)}</div>
            )}
          </section>
        </div>

        {videos.length > 0 && (
          <section className="stack" aria-labelledby="vids">
            <div className="row-between"><h2 id="vids" className="t-h3">{savedVideos.length ? t("فيديوهاتك المحفوظة", "Your saved videos") : t("فيديوهات مقترحة", "Suggested videos")}</h2><Link className="link t-small" href="/media">{t("المكتبة", "Library")}</Link></div>
            <div className="grid-3">{videos.map((v) => (
              <a key={v!.id} href={videoUrl(v!.id)} target="_blank" rel="noopener noreferrer" className="card card-link">
                <div className="video-thumb"><img src={videoThumb(v!.id)} alt="" loading="lazy" width={480} height={270} /></div>
                <h3 className="t-h4" dir="auto">{v!.title}</h3><p className="t-caption" dir="auto">{v!.channel}</p></a>
            ))}</div>
          </section>
        )}
      </div>
    </AppPage>
  );
}

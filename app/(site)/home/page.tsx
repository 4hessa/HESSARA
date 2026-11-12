import type { Metadata } from "next";
import Link from "next/link";
import { fmtDate, VendorMark } from "@/components/bits";
import { Icon } from "@/components/Icon";
import { QuickConsult } from "@/components/QuickConsult";
import { AGENTS, agentById } from "@/lib/catalog/agents";
import { modelById } from "@/lib/catalog/models";
import { VIDEOS, videoThumb, videoUrl } from "@/lib/catalog/videos";
import { all, type ConsultRow } from "@/lib/db";
import { requireUser } from "@/lib/guard";

export const metadata: Metadata = { title: "لوحتي" };

const STARTERS = [
  { label: "تحليل مشكلة تقنية", href: "/consult/new", icon: "consult" },
  { label: "مراجعة شفرة برمجية", href: "/consult/new?agent=coding", icon: "code" },
  { label: "نقد فكرة أو قرار", href: "/lab", icon: "lab" },
  { label: "بناء خطة مشروع", href: "/consult/new?agent=planning", icon: "route" },
  { label: "استشارة بحثية", href: "/consult/new?agent=research", icon: "flask" },
];

export default async function Home() {
  const user = await requireUser("/home");
  const recent = await all<ConsultRow>("SELECT * FROM consultations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 5", user.id);
  const saved = await all<ConsultRow>("SELECT * FROM consultations WHERE user_id = ? AND saved = 1 ORDER BY updated_at DESC LIMIT 5", user.id);
  const favs = await all<{ kind: string; ref: string }>("SELECT kind, ref FROM favorites WHERE user_id = ?", user.id);
  const favAgents = [...new Set([user.pref_agent, ...favs.filter((f) => f.kind === "agent").map((f) => f.ref)])].map((id) => agentById(id)).filter((a) => !!a);
  const usedModels = (await all<{ model_id: string }>("SELECT model_id FROM consultations WHERE user_id = ? GROUP BY model_id ORDER BY MAX(updated_at) DESC LIMIT 4", user.id))
    .map((r) => modelById(r.model_id)).filter((m) => !!m);
  const savedVideos = favs.filter((f) => f.kind === "video").map((f) => VIDEOS.find((v) => v.id === f.ref)).filter((v) => !!v);
  const videos = (savedVideos.length ? savedVideos : user.personalize ? VIDEOS.slice(0, 3) : []).slice(0, 3);
  const pref = modelById(user.pref_model);

  return (
    <div className="container page stack-lg">
      <section className="stack" aria-labelledby="hi" style={{ maxWidth: 820, marginInline: "auto", width: "100%" }}>
        <div className="stack-sm">
          <h1 id="hi" className="t-h2">مرحبًا {user.name}، كيف يمكننا مساعدتك اليوم؟</h1>
          <p className="muted t-small">
            {pref ? <>نموذجك المفضل: <bdi><strong>{pref.name}</strong></bdi> — يُختار تلقائيًا في كل استشارة جديدة.</> : <>لم تحدد نموذجًا مفضلًا بعد. <Link className="link" href="/models">اختر من النماذج</Link></>}
          </p>
        </div>
        <QuickConsult />
        <div className="chips" aria-label="ابدأ من مهمة">
          {STARTERS.map((s) => <Link key={s.label} href={s.href} className="chip"><Icon name={s.icon} size={16} /> {s.label}</Link>)}
        </div>
      </section>

      <div className="grid-2">
        <section className="card" aria-labelledby="recent">
          <div className="row-between"><h2 id="recent" className="t-h3">آخر الاستشارات</h2><Link className="link t-small" href="/consult">السجل الكامل</Link></div>
          {recent.length === 0 ? <p className="muted t-small">لا استشارات بعد. اكتب مشكلتك في الحقل أعلاه لتبدأ.</p> : (
            <ul>{recent.map((c) => (
              <li key={c.id}><Link href={`/consult/${c.id}`} className="ws-item"><span className="ws-item-title">{c.title}</span>
                <span className="t-caption"><bdi>{modelById(c.model_id)?.name}</bdi>{c.agent_id ? ` · ${agentById(c.agent_id)?.name}` : ""} · {fmtDate(c.updated_at)}</span></Link></li>
            ))}</ul>
          )}
        </section>
        <section className="card" aria-labelledby="saved">
          <div className="row-between"><h2 id="saved" className="t-h3">الاستشارات المحفوظة</h2><Link className="link t-small" href="/consult?saved=1">الكل</Link></div>
          {saved.length === 0 ? <p className="muted t-small">احفظ استشارة بزر الإشارة المرجعية في أعلى المحادثة لتجدها هنا.</p> : (
            <ul>{saved.map((c) => <li key={c.id}><Link href={`/consult/${c.id}`} className="ws-item"><span className="ws-item-title">{c.title}</span><span className="t-caption">{fmtDate(c.updated_at)}</span></Link></li>)}</ul>
          )}
        </section>
        <section className="card" aria-labelledby="fav-agents">
          <div className="row-between"><h2 id="fav-agents" className="t-h3">وكلاؤك المفضلون</h2><Link className="link t-small" href="/agents">كل الوكلاء</Link></div>
          {favAgents.length === 0 ? <p className="muted t-small">لم تضف وكيلًا إلى المفضلة. يوجد {AGENTS.length} وكلاء متخصصين.</p> : (
            <div className="chips">{favAgents.map((a) => <Link key={a.id} className="chip" href={`/consult/new?agent=${a.id}`}><Icon name={a.icon} size={16} /> {a.name}</Link>)}</div>
          )}
        </section>
        <section className="card" aria-labelledby="used-models">
          <div className="row-between"><h2 id="used-models" className="t-h3">النماذج المستخدمة مؤخرًا</h2><Link className="link t-small" href="/models">كل النماذج</Link></div>
          {usedModels.length === 0 ? <p className="muted t-small">ستظهر هنا النماذج التي تستخدمها في استشاراتك.</p> : (
            <div className="chips">{usedModels.map((m) => <Link key={m.id} className="chip" href={`/consult/new?model=${m.id}`}><VendorMark vendorKey={m.vendorKey} small /> <bdi>{m.name}</bdi></Link>)}</div>
          )}
        </section>
      </div>

      {videos.length > 0 && (
        <section className="stack" aria-labelledby="vids">
          <div className="row-between"><h2 id="vids" className="t-h3">{savedVideos.length ? "فيديوهاتك المحفوظة" : "فيديوهات مقترحة"}</h2><Link className="link t-small" href="/media">المكتبة</Link></div>
          <div className="grid-3">{videos.map((v) => (
            <a key={v.id} href={videoUrl(v.id)} target="_blank" rel="noopener noreferrer" className="card card-link">
              <div className="video-thumb"><img src={videoThumb(v.id)} alt="" loading="lazy" width={480} height={270} /></div>
              <h3 className="t-h4" dir="auto">{v.title}</h3><p className="t-caption" dir="auto">{v.channel}</p></a>
          ))}</div>
        </section>
      )}
    </div>
  );
}

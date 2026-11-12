import type { Metadata } from "next";
import Link from "next/link";
import { FavButton } from "@/components/Fav";
import { Icon } from "@/components/Icon";
import { PrefAgentButton } from "@/components/PrefAgent";
import { currentUser } from "@/lib/auth";
import { AGENTS } from "@/lib/catalog/agents";
import { all } from "@/lib/db";
import { modeById } from "@/lib/review/types";

export const metadata: Metadata = { title: "الوكلاء المتخصصون" };

export default async function AgentsPage() {
  const user = await currentUser();
  const favs = user ? (await all<{ ref: string }>("SELECT ref FROM favorites WHERE user_id = ? AND kind = 'agent'", user.id)).map((f) => f.ref) : [];
  const log = user ? await all<{ detail: string; created_at: number }>("SELECT detail, created_at FROM actions WHERE user_id = ? ORDER BY created_at DESC LIMIT 8", user.id) : [];
  return (
    <div className="container page">
      <div className="page-head">
        <h1 className="t-h2">الوكلاء المتخصصون</h1>
        <p className="muted" style={{ maxWidth: "72ch" }}>الوكيل في هسّارة تركيب من: نموذج أساسي تختاره أنت، وتعليمات تخصصية، ونموذج إدخال يطلب ما يحتاجه مجاله، وبنية إجابة محددة، ونمط مراجعة افتراضي. في هذه النسخة لا يملك أي وكيل أدوات خارجية: يحلّل ويقترح ولا ينفّذ.</p>
      </div>
      <div className="grid-2">
        {AGENTS.map((a) => (
          <article key={a.id} id={a.id} className="card">
            <div className="row-between">
              <div className="row" style={{ flexWrap: "nowrap" }}><span className="icon-tile"><Icon name={a.icon} /></span><h2 className="t-h3">{a.name}</h2></div>
              <FavButton kind="agent" id={a.id} initial={favs.includes(a.id)} label={a.name} />
            </div>
            <p className="muted">{a.scope}</p>
            <div className="stack-sm"><h3 className="label">ما يستطيع فعله</h3><ul className="list-check">{a.canDo.map((x) => <li key={x}><Icon name="check" size={16} /><span>{x}</span></li>)}</ul></div>
            <details>
              <summary className="link t-small" style={{ cursor: "pointer" }}>الأدوات، الصلاحيات، والحدود</summary>
              <dl className="stack-sm t-small" style={{ marginTop: 12 }}>
                <div><dt className="label">الأدوات</dt><dd style={{ margin: 0 }} className="muted">{a.tools.join(" ")}</dd></div>
                <div><dt className="label">ما يحتاج موافقتك</dt><dd style={{ margin: 0 }} className="muted">{a.needsApproval.join(" ")}</dd></div>
                <div><dt className="label">الحدود</dt><dd style={{ margin: 0 }} className="muted">{a.limits.join(" ")}</dd></div>
                <div><dt className="label">النموذج الأساسي</dt><dd style={{ margin: 0 }} className="muted">تختاره عند بدء الاستشارة، ويظهر اسمه مع كل إجابة.</dd></div>
                <div><dt className="label">بنية الإجابة</dt><dd style={{ margin: 0 }} className="muted">{a.sections.join(" ← ")}</dd></div>
                <div><dt className="label">نمط المراجعة الافتراضي</dt><dd style={{ margin: 0 }} className="muted">{modeById(a.reviewMode)?.name}</dd></div>
                <div><dt className="label">أمثلة</dt><dd style={{ margin: 0 }} className="muted">{a.examples.map((e) => `«${e}»`).join(" ")}</dd></div>
              </dl>
            </details>
            <div className="card-foot">
              <Link className="btn btn-primary btn-sm" href={`/consult/new?agent=${a.id}`}>ابدأ مع هذا الوكيل</Link>
              {user && <PrefAgentButton id={a.id} name={a.name} />}
            </div>
          </article>
        ))}
      </div>
      {user && (
        <section className="card" style={{ marginTop: "var(--s-6)" }} aria-labelledby="log">
          <h2 id="log" className="t-h3">سجل الإجراءات المنفَّذة فعلًا</h2>
          <p className="t-small muted">يُسجَّل هنا كل استدعاء نموذج أو مراجعة جرت باسم حسابك. لا إجراءات خارجية في هذه النسخة.</p>
          {log.length === 0 ? <p className="t-small muted">لا إجراءات بعد.</p> : (
            <ul className="t-small stack-sm">{log.map((l, i) => <li key={i} className="row-between"><span>{l.detail}</span><span className="t-caption">{new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(l.created_at)}</span></li>)}</ul>
          )}
        </section>
      )}
    </div>
  );
}

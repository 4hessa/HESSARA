"use client";
import { useMemo, useState } from "react";
import { CATEGORIES, PATHS, videoThumb, videoUrl, type Video } from "@/lib/catalog/videos";
import { FavButton } from "./Fav";
import { Icon } from "./Icon";

const fmtDur = (s?: number | null) => {
  if (!s) return null;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return `${h ? `${h}:` : ""}${h ? String(m).padStart(2, "0") : m}:${String(ss).padStart(2, "0")}`;
};

export function MediaClient({ videos, saved }: { videos: Video[]; saved: string[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [lang, setLang] = useState("all");
  const [level, setLevel] = useState("all");
  const [path, setPath] = useState("all");
  const [sort, setSort] = useState("category");
  const [onlySaved, setOnlySaved] = useState(false);
  const [page, setPage] = useState(1);
  const PER = 24;

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = videos.filter((v) =>
      (cat === "all" || v.category === cat) && (lang === "all" || v.lang === lang) && (level === "all" || v.level === level) &&
      (path === "all" || v.paths.includes(path)) && (!onlySaved || saved.includes(v.id)) &&
      (!needle || v.title.toLowerCase().includes(needle) || v.channel.toLowerCase().includes(needle)));
    const order = CATEGORIES.map((c) => c.id);
    if (sort === "title") out.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "channel") out.sort((a, b) => a.channel.localeCompare(b.channel));
    else if (sort === "duration") out.sort((a, b) => (a.durationSec ?? 1e9) - (b.durationSec ?? 1e9));
    else out.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
    return out;
  }, [videos, q, cat, lang, level, path, sort, onlySaved, saved]);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const shown = list.slice((page - 1) * PER, page * PER);
  const sel = (label: string, value: string, set: (v: string) => void, opts: [string, string][]) => (
    <div className="field"><label className="label" htmlFor={`m-${label}`}>{label}</label>
      <select id={`m-${label}`} className="select" value={value} onChange={(e) => { set(e.target.value); setPage(1); }}>{opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></div>
  );

  return (
    <div className="stack">
      <section aria-labelledby="paths" className="stack-sm">
        <h2 id="paths" className="t-h3">مسارات التعلم</h2>
        <div className="chips">
          <button className="chip" aria-pressed={path === "all"} onClick={() => { setPath("all"); setPage(1); }}>كل الفيديوهات</button>
          {PATHS.map((p) => {
            const n = videos.filter((v) => v.paths.includes(p.id)).length;
            return <button key={p.id} className="chip" aria-pressed={path === p.id} title={p.about} disabled={n === 0} style={n === 0 ? { opacity: .5, cursor: "not-allowed" } : undefined} onClick={() => { setPath(p.id); setPage(1); }}>{p.name} ({n})</button>;
          })}
        </div>
      </section>
      <div className="toolbar" style={{ gridTemplateColumns: "2fr repeat(4, minmax(0, 1fr))" }}>
        <div className="field"><label className="label" htmlFor="m-q">بحث</label>
          <input id="m-q" className="input" type="search" placeholder="عنوان الفيديو أو اسم القناة" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
        {sel("المجال", cat, setCat, [["all", "كل المجالات"], ...CATEGORIES.map((c) => [c.id, c.name] as [string, string])])}
        {sel("اللغة", lang, setLang, [["all", "الكل"], ["ar", "العربية"], ["en", "الإنجليزية"]])}
        {sel("المستوى", level, setLevel, [["all", "الكل"], ["مبتدئ", "مبتدئ"], ["متوسط", "متوسط"], ["متقدم", "متقدم"]])}
        {sel("الترتيب", sort, setSort, [["category", "حسب المجال"], ["title", "العنوان"], ["channel", "القناة"], ["duration", "الأقصر أولًا"]])}
      </div>
      <div className="row-between">
        <p className="t-small muted" role="status">{list.length} فيديو</p>
        <button className="chip" aria-pressed={onlySaved} onClick={() => { setOnlySaved(!onlySaved); setPage(1); }}><Icon name="bookmark" size={16} /> المحفوظة فقط</button>
      </div>
      {shown.length === 0 ? <div className="empty"><p>لا فيديوهات تطابق البحث.</p></div> : (
        <div className="grid-3">
          {shown.map((v) => (
            <article key={v.id} className="card">
              <a href={videoUrl(v.id)} target="_blank" rel="noopener noreferrer" className="video-thumb" aria-label={`افتح على يوتيوب: ${v.title}`}>
                <img src={videoThumb(v.id)} alt="" loading="lazy" width={480} height={270} />
                {fmtDur(v.durationSec) && <span className="video-dur">{fmtDur(v.durationSec)}</span>}
              </a>
              <div className="row-between" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                <h3 className="t-h4" dir="auto"><a href={videoUrl(v.id)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>{v.title}</a></h3>
                <FavButton kind="video" id={v.id} initial={saved.includes(v.id)} label="الفيديو" />
              </div>
              <p className="t-caption" dir="auto">{v.channel}{v.published ? ` · ${v.published.slice(0, 4)}` : ""}</p>
              <div className="chips"><span className="badge">{CATEGORIES.find((c) => c.id === v.category)?.name}</span><span className="badge">{v.level}</span><span className="badge">{v.lang === "ar" ? "العربية" : "الإنجليزية"}</span></div>
            </article>
          ))}
        </div>
      )}
      {pages > 1 && (
        <nav className="row" aria-label="صفحات النتائج" style={{ justifyContent: "center" }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>السابق</button>
          <span className="t-small">صفحة {page} من {pages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page === pages} onClick={() => setPage(page + 1)}>التالي</button>
        </nav>
      )}
    </div>
  );
}

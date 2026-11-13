"use client";
import { useMemo, useState } from "react";
import { CATEGORIES, LEVEL_EN, PATHS, videoThumb, videoUrl, type Video } from "@/lib/catalog/videos";
import { useApp } from "./app";
import { FavButton } from "./Fav";
import { Icon } from "./Icon";

const fmtDur = (s?: number | null) => {
  if (!s) return null;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return `${h ? `${h}:` : ""}${h ? String(m).padStart(2, "0") : m}:${String(ss).padStart(2, "0")}`;
};

export function MediaClient({ videos, saved }: { videos: Video[]; saved: string[] }) {
  const { t, lang: ui } = useApp();
  const ar = ui === "ar";
  const catName = (id: string) => { const c = CATEGORIES.find((x) => x.id === id); return c ? (ar ? c.name : c.en) : id; };
  const levelName = (l: string) => (ar ? l : LEVEL_EN[l] ?? l);
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
    else if (sort === "views") out.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    else if (sort === "duration") out.sort((a, b) => (a.durationSec ?? 1e9) - (b.durationSec ?? 1e9));
    else out.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
    return out;
  }, [videos, q, cat, lang, level, path, sort, onlySaved, saved]);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const shown = list.slice((page - 1) * PER, page * PER);
  const sel = (key: string, label: string, value: string, set: (v: string) => void, opts: [string, string][]) => (
    <div className="field"><label className="label" htmlFor={`m-${key}`}>{label}</label>
      <select id={`m-${key}`} className="select" value={value} onChange={(e) => { set(e.target.value); setPage(1); }}>{opts.map(([v, x]) => <option key={v} value={v}>{x}</option>)}</select></div>
  );

  return (
    <div className="stack">
      <section aria-labelledby="paths" className="stack-sm">
        <h2 id="paths" className="t-h3">{t("مسارات التعلم", "Learning paths")}</h2>
        <div className="chips">
          <button className="chip" aria-pressed={path === "all"} onClick={() => { setPath("all"); setPage(1); }}>{t("كل الفيديوهات", "All videos")}</button>
          {PATHS.map((p) => {
            const n = videos.filter((v) => v.paths.includes(p.id)).length;
            return <button key={p.id} className="chip" aria-pressed={path === p.id} title={ar ? p.about : p.aboutEn} disabled={n === 0} style={n === 0 ? { opacity: .5, cursor: "not-allowed" } : undefined} onClick={() => { setPath(p.id); setPage(1); }}>{ar ? p.name : p.en} ({n})</button>;
          })}
        </div>
      </section>
      <div className="toolbar" style={{ gridTemplateColumns: "2fr repeat(4, minmax(0, 1fr))" }}>
        <div className="field"><label className="label" htmlFor="m-q">{t("بحث", "Search")}</label>
          <input id="m-q" className="input" type="search" placeholder={t("عنوان الفيديو أو اسم القناة", "Video title or channel name")} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
        {sel("cat", t("المجال", "Field"), cat, setCat, [["all", t("كل المجالات", "All fields")], ...CATEGORIES.map((c) => [c.id, ar ? c.name : c.en] as [string, string])])}
        {sel("lang", t("اللغة", "Language"), lang, setLang, [["all", t("الكل", "All")], ["ar", t("العربية", "Arabic")], ["en", t("الإنجليزية", "English")]])}
        {sel("level", t("المستوى", "Level"), level, setLevel, [["all", t("الكل", "All")], ...(["مبتدئ", "متوسط", "متقدم"].map((l) => [l, levelName(l)] as [string, string]))])}
        {sel("sort", t("الترتيب", "Sort"), sort, setSort, [["category", t("حسب المجال", "By field")], ["title", t("العنوان", "Title")], ["channel", t("القناة", "Channel")], ["views", t("الأكثر مشاهدة وقت التحقق", "Most viewed when checked")], ["duration", t("الأقصر أولًا", "Shortest first")]])}
      </div>
      <div className="row-between">
        <p className="t-small muted" role="status">{t(`${list.length} فيديو`, `${list.length} videos`)}</p>
        <button className="chip" aria-pressed={onlySaved} onClick={() => { setOnlySaved(!onlySaved); setPage(1); }}><Icon name="bookmark" size={16} /> {t("المحفوظة فقط", "Saved only")}</button>
      </div>
      {shown.length === 0 ? <div className="empty"><p>{t("لا فيديوهات تطابق البحث.", "No videos match your search.")}</p></div> : (
        <div className="grid-3">
          {shown.map((v) => (
            <article key={v.id} className="card">
              <a href={videoUrl(v.id)} target="_blank" rel="noopener noreferrer" className="video-thumb" aria-label={t(`افتح على يوتيوب: ${v.title}`, `Open on YouTube: ${v.title}`)}>
                <img src={videoThumb(v.id)} alt="" loading="lazy" width={480} height={270} />
                {fmtDur(v.durationSec) && <span className="video-dur">{fmtDur(v.durationSec)}</span>}
              </a>
              <div className="row-between" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                <h3 className="t-h4" dir="auto"><a href={videoUrl(v.id)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>{v.title}</a></h3>
                <FavButton kind="video" id={v.id} initial={saved.includes(v.id)} label={t("الفيديو", "the video")} />
              </div>
              <p className="t-caption"><bdi>{v.channel}</bdi>{v.views ? ` · ${new Intl.NumberFormat(ar ? "ar" : "en", { notation: "compact" }).format(v.views)} ${t("مشاهدة وقت التحقق", "views when checked")}` : ""}</p>
              <div className="chips"><span className="badge">{catName(v.category)}</span><span className="badge">{levelName(v.level)}</span><span className="badge">{v.lang === "ar" ? t("العربية", "Arabic") : t("الإنجليزية", "English")}</span></div>
            </article>
          ))}
        </div>
      )}
      {pages > 1 && (
        <nav className="row" aria-label={t("صفحات النتائج", "Result pages")} style={{ justifyContent: "center" }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>{t("السابق", "Previous")}</button>
          <span className="t-small">{t(`صفحة ${page} من ${pages}`, `Page ${page} of ${pages}`)}</span>
          <button className="btn btn-secondary btn-sm" disabled={page === pages} onClick={() => setPage(page + 1)}>{t("التالي", "Next")}</button>
        </nav>
      )}
    </div>
  );
}

// لبنات الصفحات التعريفية من الموقع المرجعي: بطاقات الأيقونات، الخطوات، القوائم، والدعوة إلى الإجراء.
import Link from "next/link";
import type { ReactNode } from "react";
import { RefIcon } from "./RefIcon";

const two = (i: number) => String(i + 1).padStart(2, "0");

export type TileItem = { icon: string; title: string; text: string; href?: string };
export function Tiles({ items }: { items: TileItem[] }) {
  return (
    <ol className="tiles">
      {items.map((it, i) => {
        const body = (
          <>
            <RefIcon name={it.icon} />
            <span className="tile__n">{two(i)} /</span>
            <h3 className="tile__t">{it.title}</h3>
            <p className="tile__d">{it.text}</p>
          </>
        );
        return (
          <li key={it.title}>
            {it.href ? <Link className="tile frame" href={it.href}>{body}</Link> : <div className="tile frame">{body}</div>}
          </li>
        );
      })}
    </ol>
  );
}

export function Steps({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ol className="steps">
      {items.map((it, i) => (
        <li key={it.title} className="step">
          <div className="step__n">{two(i)}</div>
          <h3 className="step__t">{it.title}</h3>
          <p className="step__d">{it.text}</p>
        </li>
      ))}
    </ol>
  );
}

export type CtaAction = { label: string; href: string; ghost?: boolean };
export function Cta({ title, text, actions, id = "cta" }: { title: ReactNode; text?: ReactNode; actions: CtaAction[]; id?: string }) {
  return (
    <section className="section" id={id}>
      <div className="cta frame">
        <h2>{title}</h2>
        {text && <p>{text}</p>}
        <div className="btn-row">
          {actions.map((a) => <Link key={a.href + a.label} className={`btn${a.ghost ? " btn--ghost" : ""}`} href={a.href}>{a.label}</Link>)}
        </div>
      </div>
    </section>
  );
}

export type RowItem = { kind: string; title: string; text: string; href: string };
export function Rows({ items, rtl }: { items: RowItem[]; rtl?: boolean }) {
  return (
    <div className="rows">
      {items.map((r) => (
        <Link key={r.href} className="entry" href={r.href}>
          <span className="entry__k">{r.kind}</span>
          <span><span className="entry__t">{r.title}</span><p className="entry__d">{r.text}</p></span>
          <span className="entry__a" aria-hidden="true">{rtl ? "←" : "→"}</span>
        </Link>
      ))}
    </div>
  );
}

export function SectionHead({ eyebrow, title, lede, id }: { eyebrow: string; title: ReactNode; lede?: ReactNode; id?: string }) {
  return (
    <>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="title" id={id}>{title}</h2>
      {lede && <p className="lede">{lede}</p>}
    </>
  );
}

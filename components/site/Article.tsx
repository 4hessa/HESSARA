// عارض Markdown للمحتوى الطويل الموثوق (مقالات المنصة ووثائقها). يبني عناصر React مباشرة ولا يحقن HTML.
// يدعم: ## و ### عناوين، فقرات، قوائم مرقّمة ونقطية، اقتباس، جداول، فاصل، **غامق**، *مائل*، `شفرة`، وروابط.
import Link from "next/link";
import type { ReactNode } from "react";

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(\[[^\]\n]+\]\(([^)\s]+)\))/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${key}-${i++}`;
    if (m[1]) out.push(<code key={k}>{tok.slice(1, -1)}</code>);
    else if (m[2]) out.push(<strong key={k}>{inline(tok.slice(2, -2), k)}</strong>);
    else if (m[3]) out.push(<em key={k}>{inline(tok.slice(1, -1), k)}</em>);
    else if (m[4]) {
      const label = inline(tok.slice(1, tok.indexOf("](")), k);
      const href = m[5];
      out.push(/^https?:/.test(href)
        ? <a key={k} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
        : <Link key={k} href={href}>{label}</Link>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const LIST = /^\s*([-*]|\d+\.|[١-٩]+\.)\s+/;
const cells = (row: string) => row.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

export function ArticleBody({ md }: { md: string }) {
  const lines = md.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0, n = 0;
  const key = () => `a${n++}`;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith("### ")) { blocks.push(<h3 key={key()}>{inline(line.slice(4), key())}</h3>); i++; continue; }
    if (line.startsWith("## ")) { blocks.push(<h2 key={key()}>{inline(line.slice(3), key())}</h2>); i++; continue; }
    if (/^-{3,}\s*$/.test(line)) { blocks.push(<hr key={key()} />); i++; continue; }
    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) buf.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push(<blockquote key={key()}>{inline(buf.join(" "), key())}</blockquote>);
      continue;
    }
    if (line.trim().startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(lines[i++]);
      const [head, , ...body] = rows;
      const k = key();
      blocks.push(
        <div key={k} className="table-wrap" tabIndex={0} role="region" aria-label={cells(head).join(" / ")}>
          <table>
            <thead><tr>{cells(head).map((c, j) => <th key={j} scope="col">{inline(c, `${k}h${j}`)}</th>)}</tr></thead>
            <tbody>{body.map((r, ri) => <tr key={ri}>{cells(r).map((c, j) => <td key={j}>{inline(c, `${k}r${ri}c${j}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (LIST.test(line)) {
      const ordered = /^\s*(\d+|[١-٩]+)\./.test(line);
      const items: ReactNode[] = [];
      while (i < lines.length && LIST.test(lines[i])) { const k = key(); items.push(<li key={k}>{inline(lines[i++].replace(LIST, ""), k)}</li>); }
      blocks.push(ordered ? <ol key={key()}>{items}</ol> : <ul key={key()}>{items}</ul>);
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(##|>|\||-{3,})/.test(lines[i]) && !LIST.test(lines[i])) buf.push(lines[i++]);
    blocks.push(<p key={key()}>{inline(buf.join(" "), key())}</p>);
  }
  return <>{blocks}</>;
}

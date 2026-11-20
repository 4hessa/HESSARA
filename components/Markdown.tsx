// عارض Markdown مصغّر وآمن: يبني عناصر React مباشرة ولا يحقن HTML خامًا.
// يدعم العناوين والقوائم والاقتباس والشفرة والفاصل والجداول والتنسيق الداخلي. ومن الوسوم يُفهم <br> وحده
// (تكتبه النماذج داخل خلايا الجداول) فيصير سطرًا جديدًا؛ وكل وسم غيره يبقى نصًا ظاهرًا.
import type { ReactNode } from "react";

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`\n]{1,2000}`)|(\*\*[^*\n]{1,2000}\*\*)|(\*[^*\n]{1,2000}\*)|(\[[^\]\[\n]{1,500}\]\((https?:\/\/[^\s)]{1,2000})\))/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const k = `${key}-${i++}`;
    if (m[1]) out.push(<code key={k}>{t.slice(1, -1)}</code>);
    else if (m[2]) out.push(<strong key={k}>{t.slice(2, -2)}</strong>);
    else if (m[3]) out.push(<em key={k}>{t.slice(1, -1)}</em>);
    else if (m[4]) {
      const label = t.slice(1, t.indexOf("]"));
      out.push(<a key={k} href={m[5]} target="_blank" rel="noopener noreferrer nofollow">{label}</a>);
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** النص الداخلي مع تحويل <br> إلى سطر جديد. */
function rich(text: string, key: string): ReactNode[] {
  return text.split(/<br\s*\/?>/i).flatMap((part, i) => {
    const nodes = inline(part, `${key}.${i}`);
    return i ? [<br key={`${key}.br${i}`} />, ...nodes] : nodes;
  });
}

// صف الفصل تحت رأس الجدول: |---|:--:| ...
const TABLE_SEP = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;
const isTableAt = (lines: string[], i: number) =>
  lines[i].includes("|") && i + 1 < lines.length && lines[i + 1].includes("|") && TABLE_SEP.test(lines[i + 1]);
const cells = (line: string) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0, k = 0;
  const key = () => `b${k++}`;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
      i++;
      blocks.push(<pre key={key()} tabIndex={0}><code>{buf.join("\n")}</code></pre>);
    } else if (isTableAt(lines, i)) {
      const id = key();
      const head = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) rows.push(cells(lines[i++]));
      // الجدول العريض يُمرَّر أفقيًا داخل إطاره، ويصل إليه لوحة المفاتيح.
      blocks.push(
        <div className="table-wrap" key={id} tabIndex={0}>
          <table>
            <thead><tr>{head.map((c, j) => <th key={j} scope="col">{rich(c, `${id}h${j}`)}</th>)}</tr></thead>
            <tbody>{rows.map((r, ri) => <tr key={ri}>{r.map((c, j) => <td key={j}>{rich(c, `${id}r${ri}c${j}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
    } else if (/^#{1,4}\s/.test(line)) {
      const level = line.match(/^#+/)![0].length;
      const content = rich(line.replace(/^#+\s*/, ""), key());
      blocks.push(level <= 2 ? <h3 key={key()}>{content}</h3> : <h4 key={key()}>{content}</h4>);
      i++;
    } else if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push(<hr key={key()} />);
      i++;
    } else if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push(<blockquote key={key()}>{rich(buf.join(" "), key())}</blockquote>);
    } else if (/^\s*([-*•]|\d+[.)]|[١-٩][.)])\s+/.test(line)) {
      const ordered = /^\s*(\d+|[١-٩])[.)]/.test(line);
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*([-*•]|\d+[.)]|[١-٩][.)])\s+/.test(lines[i])) {
        const id = key();
        items.push(<li key={id}>{rich(lines[i].replace(/^\s*([-*•]|\d+[.)]|[١-٩][.)])\s+/, ""), id)}</li>);
        i++;
      }
      blocks.push(ordered ? <ol key={key()}>{items}</ol> : <ul key={key()}>{items}</ul>);
    } else if (!line.trim()) {
      i++;
    } else {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(```|#{1,4}\s|>\s?|\s*([-*•]|\d+[.)])\s+)/.test(lines[i]) && !isTableAt(lines, i)) buf.push(lines[i++]);
      blocks.push(<p key={key()}>{rich(buf.join(" "), key())}</p>);
    }
  }
  return <div className="prose" dir="auto">{blocks}</div>;
}

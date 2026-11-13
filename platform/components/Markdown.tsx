// عارض Markdown مصغّر وآمن: يبني عناصر React مباشرة ولا يحقن HTML خامًا.
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
    } else if (/^#{1,4}\s/.test(line)) {
      const level = line.match(/^#+/)![0].length;
      const content = inline(line.replace(/^#+\s*/, ""), key());
      blocks.push(level <= 2 ? <h3 key={key()}>{content}</h3> : <h4 key={key()}>{content}</h4>);
      i++;
    } else if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push(<hr key={key()} />);
      i++;
    } else if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push(<blockquote key={key()}>{inline(buf.join(" "), key())}</blockquote>);
    } else if (/^\s*([-*•]|\d+[.)]|[١-٩][.)])\s+/.test(line)) {
      const ordered = /^\s*(\d+|[١-٩])[.)]/.test(line);
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*([-*•]|\d+[.)]|[١-٩][.)])\s+/.test(lines[i])) {
        const id = key();
        items.push(<li key={id}>{inline(lines[i].replace(/^\s*([-*•]|\d+[.)]|[١-٩][.)])\s+/, ""), id)}</li>);
        i++;
      }
      blocks.push(ordered ? <ol key={key()}>{items}</ol> : <ul key={key()}>{items}</ul>);
    } else if (!line.trim()) {
      i++;
    } else {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(```|#{1,4}\s|>\s?|\s*([-*•]|\d+[.)])\s+)/.test(lines[i])) buf.push(lines[i++]);
      blocks.push(<p key={key()}>{inline(buf.join(" "), key())}</p>);
    }
  }
  return <div className="prose" dir="auto">{blocks}</div>;
}

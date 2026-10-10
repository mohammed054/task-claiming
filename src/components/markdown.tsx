import type { ReactNode } from "react";

/** A deliberately small renderer: paragraphs, bullet and numbered lists, **bold** and `code`. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-fg">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={i} className="rounded bg-raised px-1 py-0.5 font-mono text-[12px] text-fg">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const bullet = /^\s*[-*]\s+(.*)$/;
    const numbered = /^\s*\d+[.)]\s+(.*)$/;

    if (bullet.test(line)) {
      const items: string[] = [];
      while (i < lines.length && bullet.test(lines[i])) items.push(lines[i++].replace(bullet, "$1"));
      nodes.push(
        <ul key={nodes.length} className="list-disc space-y-1 pl-5 marker:text-faint">
          {items.map((item, n) => (
            <li key={n}>{inline(item)}</li>
          ))}
        </ul>,
      );
    } else if (numbered.test(line)) {
      const items: string[] = [];
      while (i < lines.length && numbered.test(lines[i])) items.push(lines[i++].replace(numbered, "$1"));
      nodes.push(
        <ol key={nodes.length} className="list-decimal space-y-1 pl-5 marker:text-faint">
          {items.map((item, n) => (
            <li key={n}>{inline(item)}</li>
          ))}
        </ol>,
      );
    } else {
      const para: string[] = [];
      while (i < lines.length && lines[i].trim() && !bullet.test(lines[i]) && !numbered.test(lines[i])) {
        para.push(lines[i++]);
      }
      nodes.push(
        <p key={nodes.length} className="whitespace-pre-line">
          {inline(para.join("\n"))}
        </p>,
      );
    }
  }

  return <div className="space-y-2.5 text-[13px] leading-relaxed text-muted">{nodes}</div>;
}

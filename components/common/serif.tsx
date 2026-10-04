import { Fragment } from "react";
import { cn } from "@/lib/utils";

/** Renders "one *word* in italics" markup: text wrapped in asterisks becomes <em>. */
export function withItalics(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") && part.length > 2 ? <em key={i}>{part.slice(1, -1)}</em> : <Fragment key={i}>{part}</Fragment>,
  );
}

/** Plain text, without the italics markers (for titles, alt text, aria). */
export const plain = (text: string) => text.replaceAll("*", "");

/** Elegant serif heading with a small uppercase label above it. */
export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  align?: "center" | "left";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl", className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <Tag className="font-serif text-4xl leading-[1.1] text-text sm:text-5xl">{withItalics(title)}</Tag>
      {body && <p className="mt-4 text-lg leading-relaxed text-muted">{body}</p>}
    </div>
  );
}

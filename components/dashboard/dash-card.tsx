import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Botanical } from "@/components/brand/botanical";
import { withItalics } from "@/components/common/serif";
import { cn } from "@/lib/utils";

/** A dashboard section in the Ituze style: serif title, botanical mark, soft lift on hover. */
export function DashCard({
  title,
  eyebrow,
  icon = "sprig",
  href,
  linkLabel,
  className,
  children,
  id,
}: {
  title: string;
  eyebrow?: string;
  icon?: "sprig" | "leaf" | "stem" | "bud";
  href?: string;
  linkLabel?: string;
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("lift flex flex-col rounded-[2rem] border border-border bg-surface p-6", className)}>
      <header className="mb-4 flex items-start gap-3">
        <Botanical variant={icon} className="size-8 shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="eyebrow mb-1 !text-[0.62rem] !text-accent-strong">{eyebrow}</p>}
          <h2 className="font-serif text-2xl leading-tight">{withItalics(title)}</h2>
        </div>
        {href && linkLabel && (
          <Link href={href} className="mt-1 inline-flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:underline">
            {linkLabel} <ArrowRight className="size-3.5" />
          </Link>
        )}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}

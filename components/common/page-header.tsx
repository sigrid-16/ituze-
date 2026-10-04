import { withItalics } from "@/components/common/serif";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className,
}: {
  title: string;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end gap-4", className)}>
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{withItalics(title)}</h1>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

import { cn } from "@/lib/utils";

/** Ituze mark: a small sprig inside a soft arch. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn("size-9", className)}>
      <path d="M8 36 V18 a12 12 0 0 1 24 0 V36 Z" className="fill-primary" />
      <path d="M20 32 V17" className="stroke-primary-foreground" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M20 22 C 15 22 13.5 18 14 15 C 18 15 20 17.5 20 22Z" className="fill-primary-foreground" />
      <path d="M20 19.5 C 24.5 19.5 26.5 15.5 26 12.5 C 22 12.5 20 15 20 19.5Z" className="fill-accent" />
    </svg>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-2xl font-semibold tracking-wide text-primary">Ituze</span>
          <span className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-[0.3em] text-muted">Wellbeing</span>
        </span>
      )}
    </span>
  );
}

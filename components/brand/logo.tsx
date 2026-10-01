import { cn } from "@/lib/utils";

/** Ituze mark: a sprouting seed inside an imigongo-style diamond. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn("size-9", className)}>
      <rect x="6" y="6" width="28" height="28" rx="8" transform="rotate(45 20 20)" className="fill-primary" />
      <path d="M20 29 V18" className="stroke-primary-foreground" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M20 21 C 14 21 12.5 16.5 13 13.5 C 17 13.5 20 16 20 21Z" className="fill-primary-foreground" />
      <path d="M20 19 C 25 19 27 15 26.5 12 C 22.5 12 20 14.5 20 19Z" className="fill-accent" />
    </svg>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && <span className="text-xl font-extrabold tracking-tight text-primary">Ituze</span>}
    </span>
  );
}

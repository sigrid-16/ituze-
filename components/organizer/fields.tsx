"use client";

import { cn } from "@/lib/utils";

/** Small form helpers shared by the organizer screens. */
export function Field({ label, htmlFor, hint, children, className }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-11 w-full rounded-2xl border border-border bg-surface px-3", className)} {...props} />;
}

export function StatusPill({ tone, children }: { tone: "green" | "tan" | "muted"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider",
        tone === "green" && "bg-primary-soft text-primary",
        tone === "tan" && "bg-accent-soft text-accent-strong",
        tone === "muted" && "bg-background text-muted",
      )}
    >
      {children}
    </span>
  );
}

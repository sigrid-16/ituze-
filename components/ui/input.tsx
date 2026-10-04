import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-border bg-surface px-4 text-base text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-base leading-relaxed text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-semibold", className)} {...props} />;
}

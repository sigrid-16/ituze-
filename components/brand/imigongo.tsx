import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Decorative pattern inspired by Rwandan imigongo art (nested chevrons and
 * diamonds). Uses currentColor, so callers set colour + opacity. Purely
 * decorative: hidden from assistive tech.
 */
export function ImigongoPattern({
  className,
  variant = "chevron",
}: {
  className?: string;
  variant?: "chevron" | "diamond";
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg aria-hidden className={cn("pointer-events-none", className)} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {variant === "chevron" ? (
          <pattern id={id} width="48" height="24" patternUnits="userSpaceOnUse">
            <path d="M0 18 L12 6 L24 18 L36 6 L48 18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" />
            <path d="M0 24 L12 12 L24 24 L36 12 L48 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          </pattern>
        ) : (
          <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M20 2 L38 20 L20 38 L2 20 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M20 11 L29 20 L20 29 L11 20 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="18" y="18" width="4" height="4" transform="rotate(45 20 20)" fill="currentColor" />
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** A thin decorative band, e.g. under a header or at the top of a card. */
export function ImigongoBand({ className }: { className?: string }) {
  return <ImigongoPattern className={cn("h-3 w-full text-accent opacity-60", className)} />;
}

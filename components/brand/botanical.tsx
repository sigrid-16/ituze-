import { cn } from "@/lib/utils";

/**
 * Simple leaf / botanical line icons, drawn with currentColor.
 * Purely decorative: hidden from assistive tech.
 */
export function Botanical({ variant = "sprig", className }: { variant?: "sprig" | "leaf" | "stem" | "bud"; className?: string }) {
  const common = {
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: cn("size-10", className),
  };
  if (variant === "leaf")
    return (
      <svg {...common}>
        <path d="M24 42 C 24 30 24 20 24 8" />
        <path d="M24 8 C 34 14 36 26 24 34 C 12 26 14 14 24 8Z" />
        <path d="M24 18 L 30 14 M24 24 L 31 20 M24 18 L 18 14 M24 24 L 17 20" />
      </svg>
    );
  if (variant === "stem")
    return (
      <svg {...common}>
        <path d="M24 44 V 6" />
        <path d="M24 14 C 18 14 15 10 15 6 C 20 6 24 9 24 14Z" />
        <path d="M24 22 C 30 22 33 18 33 14 C 28 14 24 17 24 22Z" />
        <path d="M24 30 C 18 30 15 26 15 22 C 20 22 24 25 24 30Z" />
        <path d="M24 38 C 30 38 33 34 33 30 C 28 30 24 33 24 38Z" />
      </svg>
    );
  if (variant === "bud")
    return (
      <svg {...common}>
        <path d="M24 44 V 22" />
        <path d="M24 22 C 18 18 18 10 24 5 C 30 10 30 18 24 22Z" />
        <path d="M24 34 C 17 34 13 30 12 25 C 18 25 22 28 24 34Z" />
        <path d="M24 30 C 31 30 35 26 36 21 C 30 21 26 24 24 30Z" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M24 44 C 24 32 22 20 16 8" />
      <path d="M21 26 C 14 26 10 21 10 15 C 17 15 21 20 21 26Z" />
      <path d="M22.5 32 C 30 32 35 27 35 20 C 28 20 23 25 22.5 32Z" />
      <path d="M18.5 17 C 22 13 22 8 20 4 C 16.5 7 16 12 18.5 17Z" />
    </svg>
  );
}

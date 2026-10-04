import { cn } from "@/lib/utils";

export function Avatar({
  name,
  color = "#2F5D50",
  className,
}: {
  name: string;
  color?: string;
  className?: string;
}) {
  const initials = name
    .replace(/^Dr\.?\s+/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold", className)}
      style={{ backgroundColor: color, color: isLight(color) ? "#16201C" : "#FFFDF9" }}
    >
      {initials}
    </span>
  );
}

function isLight(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

import { createElement } from "react";
import { Dumbbell, Feather, HeartPulse, Moon, NotebookPen, Sparkles, type LucideIcon } from "lucide-react";
import type { GoalKind } from "@/lib/data/types";

export const GOAL_KINDS: { kind: GoalKind; icon: LucideIcon; defaultDays: number }[] = [
  { kind: "sleep", icon: Moon, defaultDays: 5 },
  { kind: "journaling", icon: NotebookPen, defaultDays: 3 },
  { kind: "stress", icon: HeartPulse, defaultDays: 3 },
  { kind: "movement", icon: Dumbbell, defaultDays: 3 },
  { kind: "gratitude", icon: Feather, defaultDays: 3 },
  { kind: "custom", icon: Sparkles, defaultDays: 3 },
];

/** Renders the icon for a goal kind. */
export function GoalIcon({ kind, className }: { kind: GoalKind; className?: string }) {
  return createElement(GOAL_KINDS.find((g) => g.kind === kind)!.icon, { className });
}

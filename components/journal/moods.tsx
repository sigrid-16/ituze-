"use client";

import type { Mood } from "@/lib/data/types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const MOODS: { mood: Mood; emoji: string }[] = [
  { mood: "calm", emoji: "😌" },
  { mood: "grateful", emoji: "🙏" },
  { mood: "hopeful", emoji: "🌱" },
  { mood: "proud", emoji: "✨" },
  { mood: "tired", emoji: "😴" },
  { mood: "heavy", emoji: "🌧️" },
  { mood: "anxious", emoji: "😟" },
  { mood: "mixed", emoji: "🌤️" },
];

export const moodEmoji = (m: Mood) => MOODS.find((x) => x.mood === m)?.emoji ?? "";

export function MoodTag({ mood }: { mood: Mood }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-0.5 text-xs font-semibold">
      <span aria-hidden>{moodEmoji(mood)}</span> {t(`moods.${mood}`)}
    </span>
  );
}

export function MoodPicker({ value, onChange }: { value?: Mood; onChange: (m?: Mood) => void }) {
  const { t } = useI18n();
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">
        {t("journal.moodLabel")} <span className="font-normal text-muted">({t("common.optional")})</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {MOODS.map(({ mood, emoji }) => {
          const selected = value === mood;
          return (
            <button
              key={mood}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? undefined : mood)}
              className={cn(
                "inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors",
                selected ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface hover:border-primary/40",
              )}
            >
              <span aria-hidden>{emoji}</span>
              {t(`moods.${mood}`)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

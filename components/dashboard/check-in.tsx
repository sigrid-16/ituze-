"use client";

import Link from "next/link";
import { HeartHandshake, NotebookPen } from "lucide-react";
import { withItalics } from "@/components/common/serif";
import { Button } from "@/components/ui/button";
import { data, useQuery, type CheckinMood } from "@/lib/data";
import { useCurrentUser } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { cn, toYmd } from "@/lib/utils";

const OPTIONS: { mood: CheckinMood; emoji: string }[] = [
  { mood: "good", emoji: "😊" },
  { mood: "getting-by", emoji: "🙂" },
  { mood: "heavy", emoji: "😔" },
  { mood: "too-much", emoji: "😟" },
  { mood: "unsure", emoji: "😐" },
];

/** Which gentle next steps each answer offers. */
const ACTIONS: Record<CheckinMood, ("write" | "talk")[]> = {
  good: ["write"],
  "getting-by": [],
  heavy: ["write", "talk"],
  "too-much": ["talk"],
  unsure: ["write"],
};

/** Daily "How are you, really?" check-in with one gentle reply. Private to the user. */
export function CheckIn() {
  const { t } = useI18n();
  const { userId } = useCurrentUser();
  const today = toYmd(new Date());
  const { data: checkins = [] } = useQuery(`daily:${userId}`, () => data.checkins.list(userId));
  const current = checkins.find((c) => c.date === today)?.mood;

  return (
    <section className="rounded-[2rem] bg-sage p-6 sm:p-8" aria-labelledby="checkin-title">
      <p className="eyebrow">{t("checkin.hint")}</p>
      <h2 id="checkin-title" className="mt-2 font-serif text-3xl sm:text-4xl">
        {withItalics(t("checkin.title"))}
      </h2>

      <div className="mt-5 flex flex-wrap gap-2.5" role="radiogroup" aria-labelledby="checkin-title">
        {OPTIONS.map((o) => {
          const selected = current === o.mood;
          return (
            <button
              key={o.mood}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => data.checkins.set(userId, today, o.mood)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-2.5 text-left text-sm font-semibold transition-all duration-500 ease-out",
                selected
                  ? "border-primary bg-surface text-primary shadow-[0_8px_24px_-14px_rgba(47,74,60,0.5)]"
                  : "border-transparent bg-surface/60 text-text hover:-translate-y-0.5 hover:bg-surface",
                current && !selected && "opacity-70",
              )}
            >
              <span className="text-lg" aria-hidden>
                {o.emoji}
              </span>
              {t(`checkin.moods.${o.mood}`)}
            </button>
          );
        })}
      </div>

      {current && (
        <div key={current} className="animate-rise mt-6 rounded-3xl bg-surface/80 p-5" role="status">
          <p className="font-serif text-xl italic leading-snug sm:text-2xl">{t(`checkin.replies.${current}`)}</p>
          {ACTIONS[current].length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {ACTIONS[current].includes("write") && (
                <Button asChild size="sm" variant={current === "too-much" ? "outline" : "default"} className="lift">
                  <Link href="/app/journal/new">
                    <NotebookPen /> {t("checkin.writeIt")}
                  </Link>
                </Button>
              )}
              {ACTIONS[current].includes("talk") && (
                <Button asChild size="sm" variant={current === "too-much" ? "default" : "outline"} className="lift">
                  <Link href="/app/support">
                    <HeartHandshake /> {t("checkin.talk")}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

"use client";

import { Bell, Check, Undo2 } from "lucide-react";
import { data, type CheckinFeeling, type Goal, type GoalCheckin } from "@/lib/data";
import { useI18n, intlLocale } from "@/lib/i18n";
import { cn, toYmd, weekDays } from "@/lib/utils";
import { GoalIcon } from "./goal-kinds";

const FEELINGS: { value: CheckinFeeling; key: string }[] = [
  { value: "did-it", key: "goals.didIt" },
  { value: "a-little", key: "goals.aLittle" },
  { value: "not-today", key: "goals.notToday" },
];

/** Today's gentle check-in buttons for one goal. */
export function CheckinButtons({ goal, checkins }: { goal: Goal; checkins: GoalCheckin[] }) {
  const { t } = useI18n();
  const today = toYmd(new Date());
  const todays = checkins.find((c) => c.goalId === goal.id && c.date === today);

  if (todays) {
    const label = FEELINGS.find((f) => f.value === todays.feeling)!.key;
    return (
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold",
            todays.feeling === "not-today" ? "bg-background text-muted" : "bg-primary-soft text-primary",
          )}
        >
          {todays.feeling !== "not-today" && <Check className="size-4" />}
          {t(label)}
        </span>
        <button
          onClick={() => data.goals.undoCheckIn(goal.userId, goal.id, today)}
          className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-muted hover:bg-background"
        >
          <Undo2 className="size-3.5" /> {t("goals.undo")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={t("goals.checkinQuestion")}>
      {FEELINGS.map((f) => (
        <button
          key={f.value}
          onClick={() => data.goals.checkIn(goal.userId, goal.id, today, f.value)}
          className={cn(
            "h-9 cursor-pointer rounded-full px-4 text-sm font-semibold transition-colors",
            f.value === "did-it"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-background ring-1 ring-border hover:bg-primary-soft",
          )}
        >
          {t(f.key)}
        </button>
      ))}
    </div>
  );
}

/** Mon–Sun dots. Check-ins are celebrated; empty days are simply empty, never red. */
export function WeekDots({ goal, checkins }: { goal: Goal; checkins: GoalCheckin[] }) {
  const { locale } = useI18n();
  const days = weekDays();
  const today = toYmd(new Date());
  return (
    <ol className="flex gap-1.5">
      {days.map((d) => {
        const ymd = toYmd(d);
        const c = checkins.find((x) => x.goalId === goal.id && x.date === ymd);
        const shown = c && c.feeling !== "not-today";
        return (
          <li key={ymd} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-full text-[0.65rem] font-bold",
                shown ? (c!.feeling === "did-it" ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary") : "bg-background",
                ymd === today && !shown && "ring-2 ring-primary/40",
              )}
              title={ymd}
            >
              {shown && <Check className="size-3.5" />}
            </span>
            <span className="text-[0.65rem] font-semibold uppercase text-muted">
              {d.toLocaleDateString(intlLocale(locale), { weekday: "narrow" })}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function GoalSummaryRow({ goal, checkins }: { goal: Goal; checkins: GoalCheckin[] }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-background/60 p-4">
      <div className="flex min-w-[14rem] flex-1 items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <GoalIcon kind={goal.kind} className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold">{goal.title}</p>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
            {t("goals.perWeek", { n: goal.daysPerWeek })}
            {goal.reminder.enabled && (
              <span className="inline-flex items-center gap-1">
                <Bell className="size-3" /> {goal.reminder.time}
              </span>
            )}
          </p>
        </div>
      </div>
      <CheckinButtons goal={goal} checkins={checkins} />
    </div>
  );
}

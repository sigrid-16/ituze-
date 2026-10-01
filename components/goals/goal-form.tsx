"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { Goal, GoalKind } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { GOAL_KINDS } from "./goal-kinds";

export type GoalDraft = Pick<Goal, "kind" | "title" | "intention" | "daysPerWeek" | "reminder">;

export function GoalForm({
  initial,
  onSubmit,
  onCancel,
  extra,
}: {
  initial?: GoalDraft;
  onSubmit: (g: GoalDraft) => void;
  onCancel: () => void;
  extra?: React.ReactNode;
}) {
  const { t } = useI18n();
  const [kind, setKind] = useState<GoalKind>(initial?.kind ?? "sleep");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [intention, setIntention] = useState(initial?.intention ?? "");
  const [days, setDays] = useState(initial?.daysPerWeek ?? 3);
  const [reminderOn, setReminderOn] = useState(initial?.reminder.enabled ?? false);
  const [time, setTime] = useState(initial?.reminder.time ?? "20:00");
  const editing = !!initial;

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          kind,
          title: title.trim() || t(`goals.kinds.${kind}`),
          intention: intention.trim() || undefined,
          daysPerWeek: days,
          reminder: { enabled: reminderOn, time },
        });
      }}
    >
      {!editing && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {GOAL_KINDS.map(({ kind: k, icon: Icon }) => (
            <button
              type="button"
              key={k}
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-2xl border-2 p-3 text-left text-sm font-bold transition-colors",
                kind === k ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-primary/40",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {t(`goals.kinds.${k}`)}
            </button>
          ))}
        </div>
      )}

      <div>
        <Label htmlFor="goal-title">{t("goals.titleLabel")}</Label>
        <Input id="goal-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t(`goals.kinds.${kind}`)} maxLength={80} />
      </div>

      <div>
        <Label htmlFor="goal-why">
          {t("goals.intentionLabel")} <span className="font-normal text-muted">({t("common.optional")})</span>
        </Label>
        <Textarea id="goal-why" rows={2} value={intention} onChange={(e) => setIntention(e.target.value)} maxLength={200} />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{t("goals.rhythmLabel")}</legend>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <button
              type="button"
              key={n}
              aria-pressed={days === n}
              onClick={() => setDays(n)}
              className={cn(
                "h-10 flex-1 cursor-pointer rounded-xl text-sm font-bold transition-colors",
                days === n ? "bg-primary text-primary-foreground" : "bg-background ring-1 ring-border hover:bg-primary-soft",
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted">{t("goals.perWeek", { n: days })}</p>
      </fieldset>

      <div className="flex items-center gap-3 rounded-2xl bg-background p-4">
        <div className="flex-1">
          <p className="text-sm font-semibold">{t("goals.reminder")}</p>
          {reminderOn && (
            <label className="mt-2 flex items-center gap-2 text-sm text-muted">
              {t("goals.reminderAt")}
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-9 rounded-xl border border-border bg-surface px-2 text-text"
              />
            </label>
          )}
        </div>
        <Switch checked={reminderOn} onCheckedChange={setReminderOn} aria-label={t("goals.reminder")} />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {extra}
        <Button type="button" variant="ghost" className="ml-auto" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.save")}</Button>
      </div>
    </form>
  );
}

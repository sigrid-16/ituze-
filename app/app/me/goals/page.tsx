"use client";

import { useState } from "react";
import { Archive, Bell, Pencil, Plus, Sprout } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { toast } from "@/components/common/toaster";
import { CheckinButtons, WeekDots } from "@/components/goals/goal-checkin";
import { GoalForm } from "@/components/goals/goal-form";
import { GoalIcon } from "@/components/goals/goal-kinds";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { data, useQuery, type Goal } from "@/lib/data";
import { useCurrentUser } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { daysAgoYmd, toYmd, weekDays } from "@/lib/utils";

export default function GoalsPage() {
  const { t } = useI18n();
  const { userId } = useCurrentUser();
  const { data: goals, loading } = useQuery(`goals:${userId}`, () => data.goals.list(userId));
  const { data: checkins = [] } = useQuery(`checkins:${userId}`, () => data.goals.checkins(userId));
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const week = new Set(weekDays().map(toYmd));
  const shownUpThisWeek = checkins.filter((c) => week.has(c.date) && c.feeling !== "not-today").length;
  const since = daysAgoYmd(29);

  return (
    <>
      <PageHeader
        title={t("goals.title")}
        subtitle={t("goals.subtitle")}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus /> <span className="hidden sm:inline">{t("goals.add")}</span>
          </Button>
        }
      />

      {!!goals?.length && (
        <div className="mb-6 flex items-center gap-3 rounded-3xl bg-primary-soft p-5 text-primary">
          <Sprout className="size-7 shrink-0" />
          <p className="font-bold">{shownUpThisWeek > 0 ? t("goals.celebrate", { n: shownUpThisWeek }) : t("goals.kind")}</p>
        </div>
      )}

      {loading ? (
        <div className="h-48 animate-pulse rounded-3xl bg-border/50" />
      ) : !goals?.length ? (
        <Card className="border-dashed p-10 text-center">
          <Sprout className="mx-auto size-8 text-primary" />
          <p className="mt-3 text-muted">{t("goals.empty")}</p>
          <Button className="mt-4" onClick={() => setCreating(true)}>
            <Plus /> {t("goals.add")}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => {
            const moments = checkins.filter((c) => c.goalId === g.id && c.date >= since && c.feeling !== "not-today").length;
            return (
              <Card key={g.id} className="flex flex-col">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <GoalIcon kind={g.kind} className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold leading-snug">{g.title}</h2>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
                      {t(`goals.kinds.${g.kind}`)} · {t("goals.perWeek", { n: g.daysPerWeek })}
                      {g.reminder.enabled && (
                        <span className="inline-flex items-center gap-1">
                          · <Bell className="size-3" /> {g.reminder.time}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => setEditing(g)} aria-label={t("common.edit")}>
                    <Pencil />
                  </Button>
                </div>
                {g.intention && <p className="mt-3 text-sm italic text-muted">“{g.intention}”</p>}
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{t("goals.thisWeek")}</p>
                    <WeekDots goal={g} checkins={checkins} />
                  </div>
                  <p className="pb-5 text-right text-xs font-semibold text-primary">{t("goals.moments30", { n: moments })}</p>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 text-sm font-semibold">{t("goals.checkinQuestion")}</p>
                  <CheckinButtons goal={g} checkins={checkins} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent title={t("goals.add")} description={t("goals.subtitle")}>
          <GoalForm
            onCancel={() => setCreating(false)}
            onSubmit={async (g) => {
              await data.goals.create({ ...g, userId });
              setCreating(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent title={editing?.title ?? ""}>
          {editing && (
            <GoalForm
              initial={editing}
              onCancel={() => setEditing(null)}
              onSubmit={async (g) => {
                await data.goals.update(userId, editing.id, g);
                setEditing(null);
              }}
              extra={
                <Button
                  type="button"
                  variant="ghost"
                  onClick={async () => {
                    await data.goals.update(userId, editing.id, { archived: true });
                    setEditing(null);
                    toast(t("goals.archived"));
                  }}
                >
                  <Archive /> {t("goals.archive")}
                </Button>
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

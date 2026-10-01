"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarDays, Clock, Hourglass, Lightbulb, MapPin, MessageCircle, MessageSquareText, Phone, Pin, Plus, Video } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { ImigongoPattern } from "@/components/brand/imigongo";
import { GoalSummaryRow } from "@/components/goals/goal-checkin";
import { JournalEntryCard } from "@/components/journal/entry-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow } from "@/components/ui/card";
import { promptOfTheDay } from "@/data/prompts";
import { JOURNEY_WEEKS } from "@/data/journey";
import { data, useQuery, type SessionMode } from "@/lib/data";
import { nextSession } from "@/lib/cohort";
import { firstName, useCurrentUser } from "@/lib/demo";
import { formatDateTime, formatDay, formatTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

const MODE_ICON: Record<SessionMode, typeof Video> = { video: Video, audio: Phone, text: MessageSquareText };

export default function HomePage() {
  const { t, locale } = useI18n();
  const { user, userId } = useCurrentUser();
  const [promptHidden, setPromptHidden] = useState(false);

  const { data: goals = [] } = useQuery(`goals:${userId}`, () => data.goals.list(userId));
  const { data: checkins = [] } = useQuery(`checkins:${userId}`, () => data.goals.checkins(userId));
  const { data: entries = [] } = useQuery(`journal:${userId}`, () => data.journal.list(userId));
  const { data: appointments = [] } = useQuery(`appts:${userId}`, () => data.appointments.listForMember(userId));
  const { data: psychologists = [] } = useQuery("psychologists", () => data.psychologists.list());
  const { data: cohortInfo } = useQuery(`cohort:${userId}`, () => data.cohorts.forMember(userId));
  const cohortId = cohortInfo?.cohort?.id;
  const { data: messages = [] } = useQuery(`messages:${cohortId}`, () =>
    cohortId ? data.cohorts.messages(cohortId) : Promise.resolve([]),
  );

  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? "home.greetingMorning" : hour < 17 ? "home.greetingAfternoon" : "home.greetingEvening";
  const prompt = promptOfTheDay();

  const nextAppt = appointments.find((a) => a.status === "upcoming" && new Date(a.time) > new Date());
  const apptPsych = nextAppt && psychologists.find((p) => p.id === nextAppt.psychologistId);
  const session = cohortInfo?.cohort && (cohortInfo.status === "active" || cohortInfo.status === "assigned") ? nextSession(cohortInfo.cohort) : null;
  const announcement = [...messages].reverse().find((m) => m.isAnnouncement);

  const upcoming = [
    nextAppt && apptPsych && { kind: "appt" as const, time: new Date(nextAppt.time) },
    session && { kind: "cohort" as const, time: session.date },
  ]
    .filter(Boolean)
    .sort((a, b) => a!.time.getTime() - b!.time.getTime()) as { kind: "appt" | "cohort"; time: Date }[];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <section className="animate-rise">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t(greetingKey, { name: firstName(user) })}</h1>
        <p className="mt-1.5 text-muted">{t("home.welcomeBack")}</p>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          {/* Today's reflection */}
          {!promptHidden && (
            <Card className="relative overflow-hidden bg-primary text-primary-foreground border-primary">
              <ImigongoPattern variant="diamond" className="absolute right-0 top-0 h-full w-40 opacity-10" />
              <div className="relative">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-85">
                  <Lightbulb className="size-4" /> {t("home.promptTitle")}
                </p>
                <p className="mt-3 text-xl font-bold leading-snug sm:text-2xl">{t(prompt.key)}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                    <Link href={`/app/journal/new?prompt=${prompt.id}`}>
                      {t("home.promptWrite")} <ArrowRight />
                    </Link>
                  </Button>
                  <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setPromptHidden(true)}>
                    {t("home.promptSkip")}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Goal check-in */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <CardEyebrow>{t("home.goalsTitle")}</CardEyebrow>
              <Link href="/app/me/goals" className="text-sm font-semibold text-primary hover:underline">
                {t("common.seeAll")}
              </Link>
            </div>
            {goals.length ? (
              <div className="space-y-2.5">
                {goals.slice(0, 3).map((g) => (
                  <GoalSummaryRow key={g.id} goal={g} checkins={checkins} />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <p className="flex-1 text-sm text-muted">{t("home.goalsEmpty")}</p>
                <Button asChild variant="soft" size="sm">
                  <Link href="/app/me/goals">
                    <Plus /> {t("home.goalsAdd")}
                  </Link>
                </Button>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          {/* Coming up */}
          <Card>
            <CardEyebrow className="mb-4">{t("home.nextTitle")}</CardEyebrow>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted">{t("home.nothingNext")}</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((u) =>
                  u.kind === "appt" && nextAppt && apptPsych ? (
                    <li key="appt" className="flex items-center gap-3 rounded-2xl bg-background/70 p-3">
                      <Avatar name={apptPsych.name} color={apptPsych.photoColor} className="size-11" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {t("home.nextAppointment", { mode: t(`modes.${nextAppt.mode}`), name: apptPsych.name })}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                          <Clock className="size-3.5" /> {formatDateTime(nextAppt.time, locale)}
                        </p>
                      </div>
                      {(() => {
                        const Icon = MODE_ICON[nextAppt.mode];
                        return (
                          <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                            <Icon className="size-4" />
                          </span>
                        );
                      })()}
                    </li>
                  ) : session && cohortInfo?.cohort ? (
                    <li key="cohort" className="flex items-center gap-3 rounded-2xl bg-background/70 p-3">
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                        <CalendarDays className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold">{t("home.nextCohort", { n: session.week })}</p>
                        <p className="text-xs font-semibold text-primary">{t(JOURNEY_WEEKS[session.week - 1].themeKey)}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5" /> {formatDay(session.date.toISOString(), locale)} · {cohortInfo.cohort.timeSlot}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3.5" /> {cohortInfo.cohort.location}
                          </span>
                        </p>
                      </div>
                    </li>
                  ) : null,
                )}
              </ul>
            )}
          </Card>

          {/* Cohort announcement / waiting list */}
          {announcement && cohortInfo?.cohort ? (
            <Card className="relative overflow-hidden">
              <ImigongoPattern className="absolute inset-x-0 top-0 h-2.5 w-full text-accent opacity-50" />
              <div className="mb-3 mt-1 flex items-center justify-between gap-2">
                <CardEyebrow>{t("home.announcementTitle")}</CardEyebrow>
                <Badge variant="accent">
                  <Pin /> {cohortInfo.cohort.name.split(" · ")[0]}
                </Badge>
              </div>
              <p className="text-sm font-bold">{announcement.authorName}</p>
              <p className="mt-1 line-clamp-4 text-sm leading-relaxed">{announcement.body}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted">
                  {formatDay(announcement.createdAt, locale)} · {formatTime(announcement.createdAt, locale)}
                </span>
                <Button asChild variant="soft" size="sm">
                  <Link href="/app/cohort">
                    <MessageCircle /> {t("home.openChat")}
                  </Link>
                </Button>
              </div>
            </Card>
          ) : cohortInfo?.status === "waiting" ? (
            <Card className="bg-accent-soft border-accent-soft">
              <div className="flex items-start gap-3">
                <Hourglass className="mt-0.5 size-6 shrink-0 text-accent-strong" />
                <div>
                  <p className="font-bold">{t("home.waitingTitle")}</p>
                  <p className="mt-1 text-sm leading-relaxed">
                    {t("home.waitingBody", { location: cohortInfo.waitlist?.preferredLocation ?? "Kigali" })}
                  </p>
                </div>
              </div>
            </Card>
          ) : cohortInfo?.status === "none" ? (
            <Card>
              <p className="font-bold">{t("landing.pillarCohortTitle")}</p>
              <p className="mt-1 text-sm text-muted">{t("landing.pillarCohortBody")}</p>
              <Button asChild variant="soft" size="sm" className="mt-3">
                <Link href="/app/cohort">{t("home.joinCohort")}</Link>
              </Button>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Recent reflections */}
      {entries.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">{t("home.journalTitle")}</h2>
            <Link href="/app/journal" className="text-sm font-semibold text-primary hover:underline">
              {t("common.seeAll")}
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {entries.slice(0, 2).map((e) => (
              <JournalEntryCard key={e.id} entry={e} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

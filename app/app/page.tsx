"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin, MessageSquareText, Phone, Pin, Plus, Video } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { CheckIn } from "@/components/dashboard/check-in";
import { DashCard } from "@/components/dashboard/dash-card";
import { GoalSummaryRow } from "@/components/goals/goal-checkin";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { data, useQuery, type CheckinMood, type Intent, type SessionMode } from "@/lib/data";
import { firstName, useCurrentUser } from "@/lib/demo";
import { formatDateTime, formatDay, formatTime } from "@/lib/format";
import { intlLocale, useI18n } from "@/lib/i18n";
import { toYmd } from "@/lib/utils";
import { useNow } from "@/lib/use-now";

const MODE_ICON: Record<SessionMode, typeof Video> = { video: Video, audio: Phone, text: MessageSquareText };

type SectionKey = "journal" | "community" | "support" | "resources" | "events" | "insights" | "goals";
const BASE_ORDER: SectionKey[] = ["journal", "community", "support", "resources", "events", "insights", "goals"];
/** What each sign-up answer brings forward. Answers never hide anything. */
const INTENT_SECTIONS: Record<Intent, SectionKey[]> = {
  understand: ["journal", "insights", "goals"],
  connect: ["community", "events"],
  professional: ["support"],
  exploring: ["resources", "journal"],
};

function orderSections(intents: Intent[]): SectionKey[] {
  return [...new Set([...intents.flatMap((i) => INTENT_SECTIONS[i]), ...BASE_ORDER])];
}

function timeOfDayKey(hour: number) {
  if (hour < 5) return "dashboard.night";
  if (hour < 12) return "dashboard.morning";
  if (hour < 18) return "dashboard.afternoon";
  return "dashboard.evening";
}

export default function UserDashboard() {
  const { t } = useI18n();
  const { user } = useCurrentUser();
  const sections = orderSections(user?.intents ?? []);
  const suggested = user?.intents.length ? sections[0] : undefined;

  const render: Record<SectionKey, React.ReactNode> = {
    journal: <JournalSection />,
    community: <CommunitySection />,
    support: <SupportSection />,
    resources: <ResourcesSection />,
    events: <EventsSection />,
    insights: <InsightsSection />,
    goals: <GoalsSection />,
  };

  return (
    <div className="space-y-6">
      <section className="animate-rise">
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{t("dashboard.hello", { name: firstName(user) })}</h1>
        <p className="mt-2 text-lg italic text-muted">{t(timeOfDayKey(new Date().getHours()))}</p>
      </section>

      <div className="animate-rise [animation-delay:100ms]">
        <CheckIn />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-2">
        {sections.map((key, i) => (
          <Reveal key={key} delay={(i % 2) * 90} className={key === suggested ? "md:col-span-2" : undefined}>
            <div className="relative h-full">
              {key === suggested && (
                <span className="absolute -top-2.5 left-6 z-10 rounded-full bg-accent px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-accent-foreground">
                  {t("dashboard.recommended")}
                </span>
              )}
              {render[key]}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function JournalSection() {
  const { t, locale } = useI18n();
  const { userId } = useCurrentUser();
  const { data: entries = [] } = useQuery(`journal:${userId}`, () => data.journal.list(userId));
  const latest = entries[0];
  return (
    <DashCard title={t("dashboard.journalTitle")} icon="sprig" href="/app/journal" linkLabel={t("common.seeAll")} className="h-full">
      {latest ? (
        <div className="rounded-2xl bg-blush/70 p-4">
          <p className="eyebrow !text-[0.62rem]">
            {t("dashboard.latestEntry")} · {formatDay(latest.createdAt, locale)}
          </p>
          <p className="mt-2 line-clamp-3 font-serif text-lg italic leading-snug">{latest.content || t("journal.voiceNote")}</p>
        </div>
      ) : (
        <p className="text-muted">{t("dashboard.journalEmpty")}</p>
      )}
      <Button asChild className="lift mt-4" size="sm">
        <Link href="/app/journal/new">
          <Plus /> {t("dashboard.writeSomething")}
        </Link>
      </Button>
    </DashCard>
  );
}

function CommunitySection() {
  const { t, locale } = useI18n();
  const { userId } = useCurrentUser();
  const { data: info } = useQuery(`community:${userId}`, () => data.community.forMember(userId));
  const groupId = info?.group?.id;
  const { data: messages = [] } = useQuery(`messages:${groupId}`, () => (groupId ? data.community.messages(groupId) : Promise.resolve([])));
  const announcements = messages.filter((m) => m.isAnnouncement).reverse().slice(0, 2);

  return (
    <DashCard title={t("dashboard.communityTitle")} icon="leaf" href="/app/community" linkLabel={info?.group ? t("dashboard.openGroup") : undefined} className="h-full">
      {info?.group ? (
        <>
          <p className="font-bold">{info.group.name}</p>
          <p className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-muted">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" /> {info.group.rhythm}
            </span>
            {info.facilitator && <span>{t("community.facilitatedBy", { name: info.facilitator.name })}</span>}
          </p>
          {announcements.length > 0 && (
            <>
              <p className="eyebrow mb-2 mt-4 !text-[0.62rem]">{t("dashboard.announcements")}</p>
              <ul className="space-y-2">
                {announcements.map((m) => (
                  <li key={m.id} className="rounded-2xl bg-sage/60 p-3 text-sm">
                    <p className="flex items-center gap-1.5 font-bold">
                      {m.pinned && <Pin className="size-3.5 text-accent-strong" />} {m.authorName}
                      <span className="ml-auto text-xs font-normal text-muted">{formatDay(m.createdAt, locale)}</span>
                    </p>
                    <p className="mt-1 line-clamp-2 leading-relaxed">{m.body}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <>
          <p className="text-muted">{t("dashboard.communityNone")}</p>
          <Button asChild variant="soft" size="sm" className="lift mt-4">
            <Link href="/app/community">{t("dashboard.findGroup")}</Link>
          </Button>
        </>
      )}
    </DashCard>
  );
}

function SupportSection() {
  const { t, locale } = useI18n();
  const { userId } = useCurrentUser();
  const { data: appointments = [] } = useQuery(`appts:${userId}`, () => data.appointments.listForMember(userId));
  const { data: psychologists = [] } = useQuery("psychologists", () => data.psychologists.list());
  const next = appointments.find((a) => (a.status === "upcoming" || a.status === "requested") && new Date(a.time) > new Date());
  const psych = next && psychologists.find((p) => p.id === next.psychologistId);
  const Icon = next ? MODE_ICON[next.mode] : Video;

  return (
    <DashCard title={t("dashboard.supportTitle")} icon="stem" href="/app/support" linkLabel={t("common.seeAll")} className="h-full">
      {next && psych ? (
        <div className="flex items-center gap-3 rounded-2xl bg-blush/70 p-3">
          <Avatar name={psych.name} color={psych.photoColor} className="size-12" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{t("dashboard.nextAppointment", { mode: t(`modes.${next.mode}`), name: psych.name })}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              <Clock className="size-3.5" /> {formatDateTime(next.time, locale)}
            </p>
            {next.status === "requested" && <p className="mt-0.5 text-xs font-semibold text-accent-strong">{t("dashboard.requested")}</p>}
          </div>
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-surface text-primary">
            <Icon className="size-4" />
          </span>
        </div>
      ) : (
        <p className="text-muted">{t("dashboard.noAppointment")}</p>
      )}
      <Button asChild variant={next ? "outline" : "default"} size="sm" className="lift mt-4">
        <Link href="/app/support">{t("dashboard.bookSession")}</Link>
      </Button>
    </DashCard>
  );
}

function ResourcesSection() {
  const { t } = useI18n();
  const { data: resources = [] } = useQuery("resources", () => data.resources.list());
  return (
    <DashCard title={t("dashboard.resourcesTitle")} icon="bud" href="/app/resources" linkLabel={t("common.seeAll")} className="h-full">
      <ul className="space-y-2">
        {resources.slice(0, 3).map((r) => (
          <li key={r.id}>
            <Link href={`/app/resources#${r.id}`} className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-blush/60">
              <span className="rounded-full bg-sage px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-primary">
                {t(`resources.${r.kind}`)}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold">{r.title}</span>
              <span className="shrink-0 text-xs text-muted">{t("common.minutes", { n: r.minutes })}</span>
            </Link>
          </li>
        ))}
      </ul>
    </DashCard>
  );
}

function EventsSection() {
  const { t, locale } = useI18n();
  const { userId } = useCurrentUser();
  const { data: events = [] } = useQuery("events", () => data.events.list());
  const { data: info } = useQuery(`community:${userId}`, () => data.community.forMember(userId));
  const visible = events.filter((e) => !e.groupId || e.groupId === info?.group?.id).slice(0, 3);
  return (
    <DashCard title={t("dashboard.eventsTitle")} icon="leaf" href="/app/community#events" linkLabel={t("common.seeAll")} className="h-full">
      {visible.length === 0 ? (
        <p className="text-muted">{t("dashboard.eventsEmpty")}</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((e) => (
            <li key={e.id} className="flex gap-3">
              <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-sage text-primary">
                <span className="text-[0.6rem] font-bold uppercase">{new Date(e.date).toLocaleDateString(intlLocale(locale), { month: "short" })}</span>
                <span className="font-serif text-xl leading-none">{new Date(e.date).getDate()}</span>
              </span>
              <div className="min-w-0">
                <p className="font-bold leading-snug">{e.title}</p>
                <p className="flex flex-wrap gap-x-2 text-xs text-muted">
                  <span>{formatDay(e.date, locale)} · {formatTime(e.date, locale)}</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" /> {e.location}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashCard>
  );
}

function InsightsSection() {
  const { t } = useI18n();
  const { userId } = useCurrentUser();
  const { data: entries = [] } = useQuery(`journal:${userId}`, () => data.journal.list(userId));
  const { data: checkins = [] } = useQuery(`daily:${userId}`, () => data.checkins.list(userId));
  const { data: goalCheckins = [] } = useQuery(`checkins:${userId}`, () => data.goals.checkins(userId));

  const weekAgo = useNow() - 7 * 86_400_000;
  const weekStart = toYmd(new Date(weekAgo));
  const journaled = entries.filter((e) => new Date(e.createdAt).getTime() > weekAgo).length;
  const checkedIn = checkins.filter((c) => c.date > weekStart).length;
  const goalMoments = goalCheckins.filter((c) => c.date > weekStart && c.feeling !== "not-today").length;
  const recent = checkins.slice(0, 10);
  const counts = recent.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.mood]: (acc[c.mood] ?? 0) + 1 }), {});
  const topMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  const lines = [
    journaled === 1 ? t("dashboard.insightJournalOne") : journaled > 1 ? t("dashboard.insightJournal", { n: journaled }) : null,
    checkedIn > 1 ? t("dashboard.insightCheckins", { n: checkedIn }) : null,
    topMood && topMood[1] > 1 ? t("dashboard.insightMood", { mood: t(`checkin.moods.${topMood[0] as CheckinMood}`) }) : null,
    goalMoments > 0 ? t("dashboard.insightGoals", { n: goalMoments }) : null,
  ].filter(Boolean) as string[];

  return (
    <DashCard title={t("dashboard.insightsTitle")} icon="bud" className="h-full bg-sage/50">
      {lines.length === 0 ? (
        <p className="text-muted">{t("dashboard.insightsEmpty")}</p>
      ) : (
        <ul className="space-y-2.5">
          {lines.map((l) => (
            <li key={l} className="font-serif text-lg italic leading-snug">
              {l}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-muted">{t("dashboard.insightNote")}</p>
    </DashCard>
  );
}

function GoalsSection() {
  const { t } = useI18n();
  const { userId } = useCurrentUser();
  const { data: goals = [] } = useQuery(`goals:${userId}`, () => data.goals.list(userId));
  const { data: checkins = [] } = useQuery(`checkins:${userId}`, () => data.goals.checkins(userId));
  return (
    <DashCard title={t("dashboard.goalsTitle")} icon="stem" href="/app/me/goals" linkLabel={t("common.seeAll")} className="h-full">
      {goals.length ? (
        <div className="space-y-2.5">
          {goals.slice(0, 3).map((g) => (
            <GoalSummaryRow key={g.id} goal={g} checkins={checkins} />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="flex-1 text-sm text-muted">{t("dashboard.goalsEmpty")}</p>
          <Button asChild variant="soft" size="sm">
            <Link href="/app/me/goals">
              <Plus /> {t("dashboard.goalsAdd")} <ArrowRight />
            </Link>
          </Button>
        </div>
      )}
    </DashCard>
  );
}

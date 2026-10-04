"use client";

import { useState } from "react";
import { CalendarDays, Lock, MapPin, Pin, Send, UsersRound } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { PageHeader } from "@/components/common/page-header";
import { toast } from "@/components/common/toaster";
import { DashCard } from "@/components/dashboard/dash-card";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { data, useQuery } from "@/lib/data";
import { displayName, useCurrentUser } from "@/lib/demo";
import { formatDay, formatTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function CommunityPage() {
  const { t, locale } = useI18n();
  const { user, userId } = useCurrentUser();
  const [draft, setDraft] = useState("");
  const { data: info } = useQuery(`community:${userId}`, () => data.community.forMember(userId));
  const { data: groups = [] } = useQuery("groups", () => data.community.groups());
  const { data: members = [] } = useQuery("group-members", () => data.community.members());
  const { data: psychologists = [] } = useQuery("psychologists", () => data.psychologists.list());
  const { data: events = [] } = useQuery("events", () => data.events.list());
  const group = info?.group;
  const { data: messages = [] } = useQuery(`messages:${group?.id}`, () => (group ? data.community.messages(group.id) : Promise.resolve([])));
  const others = groups.filter((g) => g.id !== group?.id);
  const visibleEvents = events.filter((e) => !e.groupId || e.groupId === group?.id);

  return (
    <>
      <PageHeader title={t("community.title")} subtitle={t("community.subtitle")} />

      {group && (
        <Reveal>
          <DashCard eyebrow={t("community.yourGroup")} title={group.name} icon="leaf" className="bg-blush/60">
            <p className="text-muted">{group.description}</p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4 text-primary" /> {group.rhythm}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-primary" /> {group.location}</span>
              <span className="inline-flex items-center gap-1.5"><UsersRound className="size-4 text-primary" /> {t("common.members", { n: info.memberCount })}</span>
              {info.facilitator && <span className="font-semibold">{t("community.facilitatedBy", { name: info.facilitator.name })}</span>}
            </p>

            <h3 className="eyebrow mb-3 mt-6">{t("community.messages")}</h3>
            <ul className="space-y-2.5">
              {messages.length === 0 && <li className="text-sm text-muted">{t("community.noMessages")}</li>}
              {messages.map((m) => (
                <li key={m.id} className={cn("rounded-2xl p-3.5 text-sm", m.isAnnouncement ? "bg-surface" : "bg-surface/60")}>
                  <p className="flex items-center gap-2">
                    <span className="font-bold">{m.authorName}</span>
                    {m.isAnnouncement && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[0.65rem] font-bold uppercase text-accent-strong">
                        {m.pinned && <Pin className="size-3" />} {t("community.announcements")}
                      </span>
                    )}
                    <span className="ml-auto text-xs text-muted">{formatDay(m.createdAt, locale)} · {formatTime(m.createdAt, locale)}</span>
                  </p>
                  <p className="mt-1 leading-relaxed">{m.body}</p>
                </li>
              ))}
            </ul>
            <form
              className="mt-4 flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                await data.community.post(group.id, user?.isAnonymous ? user.nickname : (user?.nickname ?? ""), draft.trim(), false);
                setDraft("");
              }}
            >
              <label htmlFor="group-message" className="sr-only">{t("community.writeMessage")}</label>
              <input
                id="group-message"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t("community.writeMessage")}
                className="h-11 min-w-0 flex-1 rounded-full border border-border bg-surface px-4 outline-none focus:border-primary"
              />
              <Button type="submit" size="icon" aria-label={t("community.send")} disabled={!draft.trim()}>
                <Send />
              </Button>
            </form>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><Lock className="size-3.5" /> {t("community.privacy")}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={async () => {
                await data.community.leave(group.id, userId);
                toast(t("community.left"));
              }}
            >
              {t("community.leave")}
            </Button>
          </DashCard>
        </Reveal>
      )}

      <section className="mt-10">
        <h2 className="font-serif text-3xl">{t("community.otherGroups")}</h2>
        <ul className="mt-5 grid gap-5 md:grid-cols-2">
          {others.map((g, i) => {
            const count = members.filter((m) => m.groupId === g.id).length;
            const full = count >= g.capacity;
            const facilitator = psychologists.find((p) => p.id === g.facilitatorId);
            return (
              <Reveal as="li" key={g.id} delay={(i % 2) * 90} className={cn("arch lift flex flex-col px-6 pb-7 pt-12 text-center", i % 2 ? "bg-blush" : "bg-sage")}>
                <h3 className="font-serif text-2xl">{g.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{g.description}</p>
                <p className="mt-3 text-sm font-semibold">{g.rhythm}</p>
                <p className="text-xs text-muted">{g.location}</p>
                {facilitator && (
                  <p className="mt-3 inline-flex items-center justify-center gap-2 text-sm">
                    <Avatar name={facilitator.name} color={facilitator.photoColor} className="size-7 text-[0.6rem]" />
                    {t("community.facilitatedBy", { name: facilitator.name })}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted">{t("common.members", { n: count })}</p>
                <Button
                  className="lift mx-auto mt-5"
                  size="sm"
                  disabled={full}
                  onClick={async () => {
                    await data.community.join(g.id, userId, user?.isAnonymous ? user.nickname : (user?.nickname ?? displayName(user)));
                    toast(t("community.joined", { name: g.name }));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {full ? t("community.full") : t("community.join")}
                </Button>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <section id="events" className="mt-10 scroll-mt-24">
        <h2 className="font-serif text-3xl">{t("community.events")}</h2>
        <ul className="mt-5 space-y-3">
          {visibleEvents.map((e) => (
            <Reveal as="li" key={e.id} className="lift flex gap-4 rounded-[1.5rem] border border-border bg-surface p-4">
              <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-sage text-primary">
                <span className="font-serif text-2xl leading-none">{new Date(e.date).getDate()}</span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{e.title}</span>
                  <span className="rounded-full bg-blush px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-accent-strong">
                    {t(`events.kinds.${e.kind}`)}
                  </span>
                  <span className="text-xs text-muted">{e.groupId ? t("community.groupOnly") : t("community.openToAll")}</span>
                </p>
                <p className="mt-1 text-sm text-muted">{e.description}</p>
                <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted">
                  <span>{formatDay(e.date, locale)} · {formatTime(e.date, locale)}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {e.location}</span>
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}

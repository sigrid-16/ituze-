"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck, EyeOff, Hourglass, ShieldCheck, Stethoscope, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Reveal } from "@/components/motion/reveal";
import { data, useQuery } from "@/lib/data";
import { firstName, useCurrentUser } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function OrganizerOverview() {
  const { t } = useI18n();
  const { user } = useCurrentUser();
  const { data: stats } = useQuery("stats", () => data.stats.overview());

  const tiles = stats
    ? [
        { icon: UsersRound, label: "organizer.stats.members", value: stats.members, href: "/app/admin/community" },
        { icon: EyeOff, label: "organizer.stats.anonymous", value: stats.anonymousMembers },
        { icon: CalendarCheck, label: "organizer.stats.bookings", value: stats.bookings, href: "/app/admin/therapists#bookings" },
        { icon: CalendarCheck, label: "organizer.stats.upcoming", value: stats.upcomingBookings, href: "/app/admin/therapists#bookings" },
        { icon: UsersRound, label: "organizer.stats.groups", value: stats.activeGroups, href: "/app/admin/community" },
        { icon: Stethoscope, label: "organizer.stats.therapists", value: stats.verifiedTherapists, href: "/app/admin/therapists" },
        { icon: Hourglass, label: "organizer.stats.pending", value: stats.pendingTherapists, href: "/app/admin/therapists" },
      ]
    : [];

  return (
    <>
      <PageHeader title={t("organizer.greeting", { name: firstName(user) })} subtitle={t("organizer.subtitle")} />
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {tiles.map((tile, i) => {
          const body = (
            <>
              <tile.icon className="size-5 text-accent-strong" />
              <p className="mt-3 font-serif text-5xl leading-none">{tile.value}</p>
              <p className="mt-2 text-sm font-semibold text-muted">{t(tile.label)}</p>
              {tile.href && <ArrowRight className="absolute right-5 top-5 size-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />}
            </>
          );
          const cls = cn("lift group relative block h-full rounded-[2rem] p-5", i % 3 === 1 ? "bg-sage" : "bg-blush");
          return (
            <Reveal as="li" key={tile.label} delay={(i % 4) * 70}>
              {tile.href ? (
                <Link href={tile.href} className={cls}>
                  {body}
                </Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </Reveal>
          );
        })}
      </ul>
      <p className="mt-6 flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-sm text-muted">
        <ShieldCheck className="size-4 shrink-0 text-primary" /> {t("organizer.overviewNote")}
      </p>
    </>
  );
}

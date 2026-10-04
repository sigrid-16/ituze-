"use client";

import { useState } from "react";
import { BadgeCheck, Clock, Languages, MapPin, MessageSquareText, Phone, Video } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { PageHeader } from "@/components/common/page-header";
import { toast } from "@/components/common/toaster";
import { DashCard } from "@/components/dashboard/dash-card";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label, Textarea } from "@/components/ui/input";
import { data, useQuery, type Psychologist, type SessionMode } from "@/lib/data";
import { displayName, useCurrentUser } from "@/lib/demo";
import { formatDateTime, formatDay, formatTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useNow } from "@/lib/use-now";

const MODE_ICON: Record<SessionMode, typeof Video> = { video: Video, audio: Phone, text: MessageSquareText };
const STATUS_TONE = {
  requested: "bg-accent-soft text-accent-strong",
  upcoming: "bg-primary-soft text-primary",
  completed: "bg-background text-muted",
  cancelled: "bg-background text-muted",
  declined: "bg-background text-muted",
} as const;

export default function SupportPage() {
  const { t, locale } = useI18n();
  const { userId } = useCurrentUser();
  const { data: psychologists = [] } = useQuery("psychologists", () => data.psychologists.list());
  const { data: appointments = [] } = useQuery(`appts:${userId}`, () => data.appointments.listForMember(userId));
  const [booking, setBooking] = useState<Psychologist | null>(null);
  const now = useNow();
  const mine = [...appointments].sort((a, b) => {
    const fa = new Date(a.time).getTime() > now ? 0 : 1;
    const fb = new Date(b.time).getTime() > now ? 0 : 1;
    return fa - fb || (fa ? b.time.localeCompare(a.time) : a.time.localeCompare(b.time));
  });

  return (
    <>
      <PageHeader title={t("support.title")} subtitle={t("support.subtitle")} />

      <DashCard title={t("support.yourSessions")} icon="stem" className="mb-10">
        {mine.length === 0 ? (
          <p className="text-muted">{t("support.noSessions")}</p>
        ) : (
          <ul className="space-y-2.5">
            {mine.map((a) => {
              const p = psychologists.find((x) => x.id === a.psychologistId);
              const Icon = MODE_ICON[a.mode];
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-blush/60 p-3">
                  {p && <Avatar name={p.name} color={p.photoColor} className="size-10" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{p?.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <Icon className="size-3.5" /> {t(`modes.${a.mode}`)} · {formatDateTime(a.time, locale)}
                    </p>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", STATUS_TONE[a.status])}>{t(`support.status.${a.status}`)}</span>
                  {a.status === "requested" && (
                    <Button variant="ghost" size="sm" onClick={() => data.appointments.setStatus(a.id, "cancelled")}>
                      {t("support.cancel")}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </DashCard>

      <h2 className="font-serif text-3xl">{t("support.choose")}</h2>
      <ul className="mt-5 grid gap-5 md:grid-cols-2">
        {psychologists.map((p, i) => (
          <Reveal as="li" key={p.id} delay={(i % 2) * 90}>
            <article className="lift flex h-full flex-col rounded-[2rem] border border-border bg-surface p-6">
              <div className="flex items-center gap-4">
                <Avatar name={p.name} color={p.photoColor} className="size-16 text-lg" />
                <div className="min-w-0">
                  <h3 className="font-serif text-2xl leading-tight">{p.name}</h3>
                  <p className="text-sm text-muted">{p.title}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary">
                    <BadgeCheck className="size-3.5" /> {t("support.verified")} · {t("support.years", { n: p.yearsExperience })}
                  </p>
                </div>
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed">{p.bio}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.specialties.map((s) => (
                  <span key={s} className="rounded-full bg-sage px-2.5 py-0.5 text-xs font-semibold text-primary">{s}</span>
                ))}
              </div>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {p.location}</span>
                <span className="inline-flex items-center gap-1"><Languages className="size-3.5" /> {p.languages.map((l) => l.toUpperCase()).join(" · ")}</span>
              </p>
              <div className="mt-5 flex items-center gap-2">
                {p.modes.map((m) => {
                  const Icon = MODE_ICON[m];
                  return (
                    <span key={m} title={t(`modes.${m}`)} className="inline-flex size-9 items-center justify-center rounded-full bg-blush text-accent-strong">
                      <Icon className="size-4" />
                      <span className="sr-only">{t(`modes.${m}`)}</span>
                    </span>
                  );
                })}
                <Button className="lift ml-auto" size="sm" onClick={() => setBooking(p)}>
                  {t("support.book")}
                </Button>
              </div>
            </article>
          </Reveal>
        ))}
      </ul>

      <Dialog open={!!booking} onOpenChange={(o) => !o && setBooking(null)}>
        {booking && (
          <DialogContent title={t("support.bookTitle", { name: booking.name })}>
            <BookingForm psychologist={booking} onDone={() => setBooking(null)} />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

function BookingForm({ psychologist, onDone }: { psychologist: Psychologist; onDone: () => void }) {
  const { t, locale } = useI18n();
  const { user, userId } = useCurrentUser();
  const { data: slots = [] } = useQuery(`slots:${psychologist.id}`, () => data.availability.list(psychologist.id, { openOnly: true }));
  const [slotId, setSlotId] = useState<string | null>(null);
  const [mode, setMode] = useState<SessionMode>(psychologist.modes[0]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const byDay = slots.slice(0, 18).reduce<Record<string, typeof slots>>((acc, s) => {
    const k = formatDay(s.start, locale);
    (acc[k] ??= []).push(s);
    return acc;
  }, {});

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!slotId) return;
        setSending(true);
        await data.appointments.request({ memberId: userId, psychologistId: psychologist.id, slotId, mode, message });
        toast(t("support.sent"));
        onDone();
      }}
    >
      <p className="mb-2 text-sm font-semibold">{t("support.pickTime")}</p>
      {slots.length === 0 ? (
        <p className="text-sm text-muted">{t("support.noSlots")}</p>
      ) : (
        <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
          {Object.entries(byDay).map(([day, list]) => (
            <div key={day}>
              <p className="eyebrow mb-1.5 !text-[0.62rem]">{day}</p>
              <div className="flex flex-wrap gap-2">
                {list.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={slotId === s.id}
                    onClick={() => setSlotId(s.id)}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1 rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition-colors duration-300",
                      slotId === s.id ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-primary/40",
                    )}
                  >
                    <Clock className="size-3.5" /> {formatTime(s.start, locale)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mb-2 mt-5 text-sm font-semibold">{t("support.pickMode")}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {psychologist.modes.map((m) => {
          const Icon = MODE_ICON[m];
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-sm font-semibold transition-colors duration-300",
                mode === m ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-primary/40",
              )}
            >
              <Icon className="size-4" /> {t(`modes.${m}`)}
            </button>
          );
        })}
      </div>

      <Label htmlFor="booking-message" className="mt-5">
        {t("support.message")} <span className="font-normal text-muted">({t("common.optional")})</span>
      </Label>
      <Textarea id="booking-message" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("support.messagePlaceholder")} />
      <p className="mt-3 rounded-2xl bg-blush px-4 py-3 text-sm">
        {user?.isAnonymous ? t("support.asNickname", { name: user.nickname }) : t("support.asName", { name: displayName(user) })}
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={!slotId || sending}>
          {t("support.send")}
        </Button>
      </div>
    </form>
  );
}

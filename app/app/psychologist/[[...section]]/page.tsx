"use client";

import { use, useState } from "react";
import { Bell, Check, Clock, EyeOff, Lock, MessageSquareText, NotebookPen, Phone, Plus, Trash2, UserRound, Video, X } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { PageHeader } from "@/components/common/page-header";
import { toast } from "@/components/common/toaster";
import { DashCard } from "@/components/dashboard/dash-card";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { data, useQuery, type Appointment, type Locale, type Psychologist, type SessionMode } from "@/lib/data";
import { firstName, useCurrentUser } from "@/lib/demo";
import { formatDateTime, formatDay, formatTime } from "@/lib/format";
import { LOCALES, useI18n } from "@/lib/i18n";
import { cn, isSameDay, toYmd } from "@/lib/utils";
import { useNow } from "@/lib/use-now";

const MODE_ICON: Record<SessionMode, typeof Video> = { video: Video, audio: Phone, text: MessageSquareText };
const MODES: SessionMode[] = ["video", "audio", "text"];
const PHOTO_COLORS = ["#2F4A3C", "#B5865F", "#4E7A6C", "#845A39", "#3B6F8F", "#8A6F4E", "#69716B"];

function usePsychologist() {
  const { user, userId } = useCurrentUser();
  const { data: psych } = useQuery(`psych-by-user:${userId}`, () => data.psychologists.byUser(userId));
  return { user, psych };
}

export default function TherapistPage({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section } = use(params);
  const { psych } = usePsychologist();
  if (!psych) return null;
  if (section?.[0] === "schedule") return <Schedule psych={psych} />;
  if (section?.[0] === "profile") return <ProfileEditor key={psych.id} psych={psych} />;
  return <Overview psych={psych} />;
}

/* -------------------------------- Overview -------------------------------- */

function Overview({ psych }: { psych: Psychologist }) {
  const { t, locale } = useI18n();
  const { user } = usePsychologist();
  const { data: appts = [] } = useQuery(`appts-psych:${psych.id}`, () => data.appointments.listForPsychologist(psych.id));
  const { data: notes = [] } = useQuery(`notes:${psych.id}`, () => data.notes.list(psych.id));
  const { data: shared = [] } = useQuery(`shared:${psych.id}`, () => data.journal.sharedWith(psych.id));
  const [noteFor, setNoteFor] = useState<Appointment | null>(null);

  const now = useNow();
  const future = (a: Appointment) => new Date(a.time).getTime() + a.durationMin * 60_000 > now;
  const requests = appts.filter((a) => a.status === "requested" && future(a));
  const upcoming = appts.filter((a) => a.status === "upcoming" && future(a));
  const recent = appts.filter((a) => a.status === "completed" || (a.status === "upcoming" && !future(a))).reverse().slice(0, 5);
  const todays = upcoming.filter((a) => isSameDay(new Date(a.time), new Date()));
  const missingNotes = recent.filter((a) => !notes.some((n) => n.appointmentId === a.id));
  const nameFor = (memberId: string) => appts.find((a) => a.memberId === memberId)?.memberName;

  const reminders = [
    ...todays.map((a) => t("therapist.reminderSoon", { mode: t(`modes.${a.mode}`), name: a.memberName, time: formatTime(a.time, locale) })),
    requests.length ? t("therapist.reminderRequests", { n: requests.length }) : null,
    missingNotes.length ? t("therapist.reminderNotes", { n: missingNotes.length }) : null,
  ].filter(Boolean) as string[];

  return (
    <>
      <PageHeader title={t("therapist.greeting", { name: firstName(user) })} subtitle={t("therapist.subtitle")} />

      {reminders.length > 0 && (
        <Reveal className="mb-6 rounded-[2rem] bg-sage p-6">
          <p className="eyebrow flex items-center gap-2">
            <Bell className="size-3.5" /> {t("therapist.reminders")}
          </p>
          <ul className="mt-3 space-y-1.5">
            {reminders.map((r) => (
              <li key={r} className="font-serif text-xl italic leading-snug">
                {r}
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-2">
        <Reveal>
          <DashCard title={t("therapist.requests")} icon="bud" className="h-full">
            {requests.length === 0 ? (
              <p className="text-muted">{t("therapist.noRequests")}</p>
            ) : (
              <ul className="space-y-3">
                {requests.map((a) => (
                  <li key={a.id} className="rounded-2xl bg-blush/70 p-4">
                    <ClientLine a={a} />
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted">
                      <Clock className="size-3.5" /> {t(`modes.${a.mode}`)} · {formatDateTime(a.time, locale)}
                    </p>
                    {a.message && <p className="mt-2 rounded-xl bg-surface/80 p-3 text-sm italic leading-relaxed">“{a.message}”</p>}
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="lift"
                        onClick={async () => {
                          await data.appointments.setStatus(a.id, "upcoming");
                          toast(t("therapist.accepted"));
                        }}
                      >
                        <Check /> {t("therapist.accept")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          await data.appointments.setStatus(a.id, "declined");
                          toast(t("therapist.declined"));
                        }}
                      >
                        <X /> {t("therapist.decline")}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DashCard>
        </Reveal>

        <Reveal delay={90}>
          <DashCard title={t("therapist.upcoming")} icon="stem" href="/app/psychologist/schedule" linkLabel={t("nav.schedule")} className="h-full">
            {upcoming.length === 0 ? (
              <p className="text-muted">{t("therapist.noUpcoming")}</p>
            ) : (
              <ul className="space-y-2.5">
                {upcoming.slice(0, 5).map((a) => (
                  <SessionRow key={a.id} a={a} />
                ))}
              </ul>
            )}
          </DashCard>
        </Reveal>

        <Reveal>
          <DashCard title={t("therapist.notes")} icon="sprig" className="h-full">
            <p className="mb-3 flex items-center gap-1.5 text-xs text-muted">
              <Lock className="size-3.5" /> {t("therapist.notesPrivate")}
            </p>
            <ul className="space-y-2.5">
              {recent.map((a) => {
                const note = notes.find((n) => n.appointmentId === a.id);
                return (
                  <li key={a.id} className="rounded-2xl border border-border p-3">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <ClientLine a={a} compact />
                        <p className="text-xs text-muted">{formatDateTime(a.time, locale)}</p>
                      </div>
                      <Button size="sm" variant={note ? "ghost" : "soft"} onClick={() => setNoteFor(a)}>
                        <NotebookPen /> {note ? t("therapist.editNote") : t("therapist.addNote")}
                      </Button>
                    </div>
                    {note && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{note.body}</p>}
                  </li>
                );
              })}
            </ul>
          </DashCard>
        </Reveal>

        <Reveal delay={90}>
          <DashCard title={t("therapist.shared")} icon="leaf" className="h-full">
            <p className="mb-3 text-xs text-muted">{t("therapist.sharedNote")}</p>
            {shared.length === 0 ? (
              <p className="text-muted">{t("therapist.sharedNone")}</p>
            ) : (
              <ul className="space-y-3">
                {shared.map((e) => (
                  <li key={e.id} className="rounded-2xl bg-blush/60 p-4">
                    <p className="text-xs font-bold text-muted">
                      {nameFor(e.userId) ?? "—"} · {formatDay(e.createdAt, locale)}
                    </p>
                    <p className="mt-1.5 font-serif text-lg italic leading-snug">{e.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </DashCard>
        </Reveal>
      </div>

      <NoteDialog psychId={psych.id} appointment={noteFor} initial={notes.find((n) => n.appointmentId === noteFor?.id)?.body ?? ""} onClose={() => setNoteFor(null)} />
    </>
  );
}

function ClientLine({ a, compact }: { a: Appointment; compact?: boolean }) {
  const { t } = useI18n();
  return (
    <p className="flex flex-wrap items-center gap-2">
      <span className={cn("font-bold", compact && "text-sm")}>{a.memberName}</span>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider",
          a.memberAnonymous ? "bg-sage text-primary" : "bg-accent-soft text-accent-strong",
        )}
      >
        {a.memberAnonymous ? <EyeOff className="size-3" /> : <UserRound className="size-3" />}
        {a.memberAnonymous ? t("therapist.anonymous") : t("therapist.identified")}
      </span>
    </p>
  );
}

function SessionRow({ a }: { a: Appointment }) {
  const { t, locale } = useI18n();
  const Icon = MODE_ICON[a.mode];
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-blush/60 p-3">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <ClientLine a={a} compact />
        <p className="text-xs text-muted">
          {t(`modes.${a.mode}`)} · {formatDateTime(a.time, locale)} · {a.durationMin} min
        </p>
      </div>
    </li>
  );
}

function NoteDialog({ psychId, appointment, initial, onClose }: { psychId: string; appointment: Appointment | null; initial: string; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Dialog open={!!appointment} onOpenChange={(o) => !o && onClose()}>
      {appointment && (
        <DialogContent title={`${t("therapist.notes")} · ${appointment.memberName}`} description={t("therapist.notesPrivate")}>
          <NoteForm key={appointment.id} psychId={psychId} appointmentId={appointment.id} initial={initial} onClose={onClose} />
        </DialogContent>
      )}
    </Dialog>
  );
}

function NoteForm({ psychId, appointmentId, initial, onClose }: { psychId: string; appointmentId: string; initial: string; onClose: () => void }) {
  const { t } = useI18n();
  const [body, setBody] = useState(initial);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await data.notes.save(psychId, appointmentId, body);
        toast(t("therapist.noteSaved"));
        onClose();
      }}
    >
      <Label htmlFor="session-note" className="sr-only">
        {t("therapist.notes")}
      </Label>
      <Textarea id="session-note" rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("therapist.notePlaceholder")} />
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.save")}</Button>
      </div>
    </form>
  );
}

/* -------------------------------- Schedule -------------------------------- */

function Schedule({ psych }: { psych: Psychologist }) {
  const { t, locale } = useI18n();
  const { data: slots = [] } = useQuery(`slots:${psych.id}`, () => data.availability.list(psych.id));
  const { data: appts = [] } = useQuery(`appts-psych:${psych.id}`, () => data.appointments.listForPsychologist(psych.id));
  const tomorrow = new Date(useNow() + 86_400_000);
  const [date, setDate] = useState(toYmd(tomorrow));
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(50);

  const byDay = slots.reduce<Record<string, typeof slots>>((acc, s) => {
    const k = formatDay(s.start, locale);
    (acc[k] ??= []).push(s);
    return acc;
  }, {});
  const active = appts.filter((a) => a.status === "upcoming" || a.status === "requested");

  return (
    <>
      <PageHeader title={t("therapist.schedule")} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <DashCard title={t("therapist.availability")} icon="stem">
          <p className="-mt-2 mb-4 text-sm text-muted">{t("therapist.availabilityBody")}</p>
          <form
            className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl bg-sage/60 p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const start = new Date(`${date}T${time}`);
              if (Number.isNaN(start.getTime())) return;
              await data.availability.add(psych.id, start.toISOString(), duration);
              toast(t("common.saved"));
            }}
          >
            <div>
              <Label htmlFor="slot-date">{t("therapist.date")}</Label>
              <Input id="slot-date" type="date" value={date} min={toYmd(new Date())} onChange={(e) => setDate(e.target.value)} className="w-40" />
            </div>
            <div>
              <Label htmlFor="slot-time">{t("therapist.time")}</Label>
              <Input id="slot-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-28" />
            </div>
            <div>
              <Label htmlFor="slot-duration">{t("therapist.duration")}</Label>
              <select
                id="slot-duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="h-11 rounded-2xl border border-border bg-surface px-3"
              >
                {[30, 50, 80].map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="lift">
              <Plus /> {t("therapist.addSlot")}
            </Button>
          </form>
          <div className="max-h-[28rem] space-y-4 overflow-y-auto pr-1">
            {Object.entries(byDay).map(([day, list]) => (
              <div key={day}>
                <p className="eyebrow mb-2 !text-[0.62rem]">{day}</p>
                <div className="flex flex-wrap gap-2">
                  {list.map((s) => (
                    <span
                      key={s.id}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border py-1 pl-3 text-sm font-semibold",
                        s.booked ? "border-accent/40 bg-accent-soft pr-3 text-accent-strong" : "border-border bg-surface pr-1",
                      )}
                    >
                      {formatTime(s.start, locale)}
                      {s.booked ? (
                        <span className="text-xs font-bold">· {t("therapist.booked")}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => data.availability.remove(psych.id, s.id)}
                          className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-blush hover:text-crisis"
                          aria-label={`${t("common.remove")} ${formatTime(s.start, locale)}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DashCard>

        <DashCard title={t("therapist.allSessions")} icon="sprig">
          <ul className="space-y-2.5">
            {active.map((a) => (
              <li key={a.id} className="rounded-2xl bg-blush/60 p-3">
                <ClientLine a={a} compact />
                <p className="mt-1 text-xs text-muted">
                  {t(`modes.${a.mode}`)} · {formatDateTime(a.time, locale)} ·{" "}
                  <span className="font-semibold">{t(`support.status.${a.status}`)}</span>
                </p>
              </li>
            ))}
          </ul>
        </DashCard>
      </div>
    </>
  );
}

/* --------------------------------- Profile -------------------------------- */

function ProfileEditor({ psych }: { psych: Psychologist }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: psych.name,
    title: psych.title,
    photoColor: psych.photoColor,
    specialties: psych.specialties.join(", "),
    languages: psych.languages,
    modes: psych.modes,
    bio: psych.bio,
    location: psych.location,
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <>
      <PageHeader title={t("therapist.profileTitle")} subtitle={t("therapist.profileBody")} />
      <form
        className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
        onSubmit={async (e) => {
          e.preventDefault();
          await data.psychologists.update(psych.id, {
            ...form,
            specialties: form.specialties
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          });
          toast(t("therapist.profileSaved"));
        }}
      >
        <DashCard title={t("nav.profile")} icon="leaf">
          <div className="space-y-4">
            <div>
              <Label htmlFor="p-name">{t("therapist.name")}</Label>
              <Input id="p-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="p-title">{t("therapist.titleLabel")}</Label>
              <Input id="p-title" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="p-spec">{t("therapist.specialties")}</Label>
              <Input id="p-spec" value={form.specialties} onChange={(e) => set("specialties", e.target.value)} />
              <p className="mt-1 text-xs text-muted">{t("therapist.specialtiesHint")}</p>
            </div>
            <div>
              <Label htmlFor="p-loc">{t("therapist.location")}</Label>
              <Input id="p-loc" value={form.location} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="p-bio">{t("therapist.bio")}</Label>
              <Textarea id="p-bio" rows={5} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
            </div>
          </div>
        </DashCard>

        <div className="space-y-5">
          <DashCard title={t("therapist.photoColor")} icon="bud">
            <div className="flex items-center gap-4">
              <Avatar name={form.name} color={form.photoColor} className="size-20 text-xl" />
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("therapist.photoColor")}>
                {PHOTO_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={form.photoColor === c}
                    aria-label={c}
                    onClick={() => set("photoColor", c)}
                    className={cn("size-8 cursor-pointer rounded-full ring-offset-2 ring-offset-surface", form.photoColor === c && "ring-2 ring-primary")}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">{t("therapist.photoHint")}</p>
          </DashCard>

          <DashCard title={t("therapist.languages")} icon="sprig">
            <div className="flex flex-wrap gap-2">
              {LOCALES.map((l) => (
                <ToggleChip key={l.code} on={form.languages.includes(l.code)} onClick={() => set("languages", toggle<Locale>(form.languages, l.code))}>
                  {l.label}
                </ToggleChip>
              ))}
            </div>
            <p className="mb-2 mt-5 text-sm font-semibold">{t("therapist.modes")}</p>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <ToggleChip key={m} on={form.modes.includes(m)} onClick={() => set("modes", toggle<SessionMode>(form.modes, m))}>
                  {t(`modes.${m}`)}
                </ToggleChip>
              ))}
            </div>
          </DashCard>

          <Button type="submit" size="lg" className="lift w-full">
            {t("common.save")}
          </Button>
        </div>
      </form>
    </>
  );
}

function ToggleChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-sm font-semibold transition-colors duration-300",
        on ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-primary/40",
      )}
    >
      {on && <Check className="size-4" />} {children}
    </button>
  );
}

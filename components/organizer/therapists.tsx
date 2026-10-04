"use client";

import { useState } from "react";
import { BadgeCheck, Ban, Pencil, Plus } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { PageHeader } from "@/components/common/page-header";
import { toast } from "@/components/common/toaster";
import { DashCard } from "@/components/dashboard/dash-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { data, useQuery, type Locale, type Psychologist, type SessionMode } from "@/lib/data";
import type { NewPsychologist } from "@/lib/data/source";
import { formatDateTime } from "@/lib/format";
import { LOCALES, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Field, StatusPill } from "./fields";
import { useNow } from "@/lib/use-now";

const MODES: SessionMode[] = ["video", "audio", "text"];
const EMPTY: NewPsychologist = {
  name: "",
  title: "Counselling psychologist",
  photoColor: "#4E7A6C",
  verificationStatus: "pending",
  licenseNumber: "",
  credentials: [],
  specialties: [],
  languages: ["rw", "en"],
  bio: "",
  location: "Kigali",
  modes: ["video", "audio"],
  yearsExperience: 1,
};

export function OrganizerTherapists() {
  const { t, locale } = useI18n();
  const { data: therapists = [] } = useQuery("psychologists:all", () => data.psychologists.list({ includeUnverified: true }));
  const { data: bookings = [] } = useQuery("appointments:all", () => data.appointments.listAll());
  const [editing, setEditing] = useState<{ id?: string; draft: NewPsychologist } | null>(null);
  const now = useNow();
  const upcoming = bookings.filter((b) => (b.status === "upcoming" || b.status === "requested") && new Date(b.time).getTime() > now);

  return (
    <>
      <PageHeader
        title={t("organizer.therapistsTitle")}
        actions={
          <Button className="lift" onClick={() => setEditing({ draft: EMPTY })}>
            <Plus /> {t("organizer.newTherapist")}
          </Button>
        }
      />

      <ul className="grid gap-4 md:grid-cols-2">
        {therapists.map((p) => (
          <li key={p.id} className="lift flex flex-col rounded-[2rem] border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <Avatar name={p.name} color={p.photoColor} className="size-12" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{p.name}</p>
                <p className="truncate text-xs text-muted">{p.title}</p>
              </div>
              <StatusPill tone={p.verificationStatus === "verified" ? "green" : p.verificationStatus === "pending" ? "tan" : "muted"}>
                {t(p.verificationStatus === "verified" ? "organizer.verified" : p.verificationStatus === "pending" ? "organizer.pendingStatus" : "organizer.rejected")}
              </StatusPill>
            </div>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-muted">{t("organizer.license")}</dt>
              <dd className="font-semibold">{p.licenseNumber || "—"}</dd>
              <dt className="text-muted">{t("organizer.credentials")}</dt>
              <dd>{p.credentials.join(" · ") || "—"}</dd>
              <dt className="text-muted">{t("therapist.specialties")}</dt>
              <dd>{p.specialties.join(" · ") || "—"}</dd>
              <dt className="text-muted">{t("therapist.languages")}</dt>
              <dd>{p.languages.map((l) => l.toUpperCase()).join(" · ")}</dd>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
              {p.verificationStatus !== "verified" && (
                <Button size="sm" onClick={() => data.psychologists.update(p.id, { verificationStatus: "verified" })}>
                  <BadgeCheck /> {t("organizer.verify")}
                </Button>
              )}
              {p.verificationStatus === "pending" && (
                <Button size="sm" variant="ghost" onClick={() => data.psychologists.update(p.id, { verificationStatus: "rejected" })}>
                  <Ban /> {t("organizer.reject")}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setEditing({ id: p.id, draft: { ...p } })}>
                <Pencil /> {t("common.edit")}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <DashCard id="bookings" title={t("organizer.bookingsTitle")} icon="stem" className="mt-10 scroll-mt-24">
        {upcoming.length === 0 ? (
          <p className="text-muted">{t("organizer.noBookings")}</p>
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted">
                  <th className="px-2 py-2 font-bold">{t("therapist.date")}</th>
                  <th className="px-2 py-2 font-bold">{t("nav.therapists")}</th>
                  <th className="px-2 py-2 font-bold">{t("therapist.modes")}</th>
                  <th className="px-2 py-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((b) => (
                  <tr key={b.id} className="border-t border-border">
                    <td className="px-2 py-2.5">{formatDateTime(b.time, locale)}</td>
                    <td className="px-2 py-2.5 font-semibold">{therapists.find((p) => p.id === b.psychologistId)?.name}</td>
                    <td className="px-2 py-2.5">{t(`modes.${b.mode}`)}</td>
                    <td className="px-2 py-2.5">{t(`support.status.${b.status}`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashCard>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && (
          <DialogContent title={editing.id ? editing.draft.name : t("organizer.newTherapist")} className="max-h-[90dvh] overflow-y-auto">
            <TherapistForm
              initial={editing.draft}
              onCancel={() => setEditing(null)}
              onSave={async (d) => {
                if (editing.id) await data.psychologists.update(editing.id, d);
                else await data.psychologists.create(d);
                toast(editing.id ? t("organizer.updated") : t("organizer.created"));
                setEditing(null);
              }}
            />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

function TherapistForm({ initial, onSave, onCancel }: { initial: NewPsychologist | Psychologist; onSave: (d: NewPsychologist) => void; onCancel: () => void }) {
  const { t } = useI18n();
  const [d, setD] = useState<NewPsychologist>(initial);
  const [specialties, setSpecialties] = useState(initial.specialties.join(", "));
  const [credentials, setCredentials] = useState(initial.credentials.join(", "));
  const set = <K extends keyof NewPsychologist>(k: K, v: NewPsychologist[K]) => setD((x) => ({ ...x, [k]: v }));
  const split = (s: string) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!d.name.trim()) return;
        // Strip read-only fields when editing an existing record
        const { name, title, photoColor, verificationStatus, licenseNumber, languages, bio, location, modes, yearsExperience } = d;
        onSave({
          name: name.trim(),
          title,
          photoColor,
          verificationStatus,
          licenseNumber,
          languages,
          bio,
          location,
          modes,
          yearsExperience,
          specialties: split(specialties),
          credentials: split(credentials),
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("therapist.name")} htmlFor="th-name">
          <Input id="th-name" value={d.name} onChange={(e) => set("name", e.target.value)} required />
        </Field>
        <Field label={t("therapist.titleLabel")} htmlFor="th-title">
          <Input id="th-title" value={d.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label={t("organizer.license")} htmlFor="th-license">
          <Input id="th-license" value={d.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} />
        </Field>
        <Field label={t("organizer.years")} htmlFor="th-years">
          <Input id="th-years" type="number" min={0} value={d.yearsExperience} onChange={(e) => set("yearsExperience", Number(e.target.value) || 0)} />
        </Field>
      </div>
      <Field label={t("organizer.credentials")} htmlFor="th-cred" hint={t("therapist.specialtiesHint")}>
        <Input id="th-cred" value={credentials} onChange={(e) => setCredentials(e.target.value)} />
      </Field>
      <Field label={t("therapist.specialties")} htmlFor="th-spec" hint={t("therapist.specialtiesHint")}>
        <Input id="th-spec" value={specialties} onChange={(e) => setSpecialties(e.target.value)} />
      </Field>
      <Field label={t("therapist.location")} htmlFor="th-loc">
        <Input id="th-loc" value={d.location} onChange={(e) => set("location", e.target.value)} />
      </Field>
      <div>
        <p className="mb-1.5 text-sm font-semibold">{t("therapist.languages")}</p>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map((l) => (
            <Chip key={l.code} on={d.languages.includes(l.code)} onClick={() => set("languages", toggle<Locale>(d.languages, l.code))}>
              {l.label}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-sm font-semibold">{t("therapist.modes")}</p>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <Chip key={m} on={d.modes.includes(m)} onClick={() => set("modes", toggle<SessionMode>(d.modes, m))}>
              {t(`modes.${m}`)}
            </Chip>
          ))}
        </div>
      </div>
      <Field label={t("therapist.bio")} htmlFor="th-bio">
        <Textarea id="th-bio" rows={3} value={d.bio} onChange={(e) => set("bio", e.target.value)} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.save")}</Button>
      </div>
    </form>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "rounded-full border-2 px-3 py-1 text-sm font-semibold transition-colors duration-300",
        on ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-primary/40",
      )}
    >
      {children}
    </button>
  );
}

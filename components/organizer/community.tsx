"use client";

import { useState } from "react";
import { CalendarDays, MapPin, Megaphone, Pencil, Plus, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { toast } from "@/components/common/toaster";
import { DashCard } from "@/components/dashboard/dash-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { data, useQuery, type CommunityEvent, type CommunityGroup } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { toYmd } from "@/lib/utils";
import { Field, Select } from "./fields";

type GroupDraft = Omit<CommunityGroup, "id" | "createdAt">;
const EMPTY_GROUP: GroupDraft = { name: "", description: "", facilitatorId: undefined, location: "", rhythm: "", capacity: 10 };

export function OrganizerCommunity() {
  const { t, locale } = useI18n();
  const { data: groups = [] } = useQuery("groups", () => data.community.groups());
  const { data: members = [] } = useQuery("group-members", () => data.community.members());
  const { data: psychologists = [] } = useQuery("psychologists", () => data.psychologists.list());
  const { data: events = [] } = useQuery("events", () => data.events.list());
  const [editing, setEditing] = useState<{ id?: string; draft: GroupDraft } | null>(null);
  const [eventOpen, setEventOpen] = useState(false);

  return (
    <>
      <PageHeader
        title={t("organizer.groupsTitle")}
        actions={
          <Button className="lift" onClick={() => setEditing({ draft: EMPTY_GROUP })}>
            <Plus /> {t("organizer.newGroup")}
          </Button>
        }
      />

      <div className="space-y-5">
        {groups.map((g) => {
          const groupMembers = members.filter((m) => m.groupId === g.id);
          const facilitator = psychologists.find((p) => p.id === g.facilitatorId);
          return (
            <DashCard key={g.id} title={g.name} icon="leaf">
              <p className="-mt-2 text-sm text-muted">{g.description}</p>
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span className="inline-flex items-center gap-1"><CalendarDays className="size-4 text-primary" /> {g.rhythm}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="size-4 text-primary" /> {g.location}</span>
                <span>{facilitator ? `${t("organizer.facilitator")}: ${facilitator.name}` : t("organizer.noFacilitator")}</span>
                <span className="font-semibold">
                  {groupMembers.length} / {g.capacity}
                </span>
              </p>

              <p className="eyebrow mb-2 mt-5 !text-[0.62rem]">{t("organizer.members")}</p>
              {groupMembers.length === 0 ? (
                <p className="text-sm text-muted">{t("organizer.noMembers")}</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {groupMembers.map((m) => (
                    <li key={m.userId} className="inline-flex items-center gap-1 rounded-full bg-blush py-1 pl-3 pr-1 text-sm font-semibold">
                      {m.displayName}
                      <button
                        type="button"
                        className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-surface hover:text-crisis"
                        aria-label={t("organizer.removeMember", { name: m.displayName })}
                        onClick={() => data.community.leave(g.id, m.userId)}
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <AnnouncementForm groupId={g.id} />

              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                <Button variant="ghost" size="sm" onClick={() => setEditing({ id: g.id, draft: { ...g } })}>
                  <Pencil /> {t("common.edit")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-crisis"
                  onClick={() => window.confirm(t("organizer.deleteGroupConfirm")) && data.community.removeGroup(g.id)}
                >
                  <Trash2 /> {t("common.delete")}
                </Button>
              </div>
            </DashCard>
          );
        })}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <h2 className="flex-1 font-serif text-3xl">{t("organizer.activities")}</h2>
          <Button variant="outline" className="lift" onClick={() => setEventOpen(true)}>
            <Plus /> {t("organizer.newEvent")}
          </Button>
        </div>
        <ul className="space-y-2.5">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{e.title}</p>
                <p className="text-xs text-muted">
                  {t(`events.kinds.${e.kind}`)} · {formatDateTime(e.date, locale)} · {e.location} ·{" "}
                  {e.groupId ? groups.find((g) => g.id === e.groupId)?.name : t("organizer.everyone")}
                </p>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label={`${t("common.remove")} ${e.title}`} onClick={() => data.events.remove(e.id)}>
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && (
          <DialogContent title={editing.id ? editing.draft.name : t("organizer.newGroup")}>
            <GroupForm
              initial={editing.draft}
              onCancel={() => setEditing(null)}
              onSave={async (draft) => {
                if (editing.id) await data.community.updateGroup(editing.id, draft);
                else await data.community.createGroup(draft);
                toast(editing.id ? t("organizer.updated") : t("organizer.created"));
                setEditing(null);
              }}
            />
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={eventOpen} onOpenChange={setEventOpen}>
        {eventOpen && (
          <DialogContent title={t("organizer.newEvent")}>
            <EventForm groups={groups} onDone={() => setEventOpen(false)} />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

function AnnouncementForm({ groupId }: { groupId: string }) {
  const { t } = useI18n();
  const [body, setBody] = useState("");
  return (
    <form
      className="mt-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!body.trim()) return;
        await data.community.post(groupId, "Ituze team", body.trim(), true);
        setBody("");
        toast(t("organizer.announced"));
      }}
    >
      <label htmlFor={`announce-${groupId}`} className="sr-only">
        {t("organizer.announce")}
      </label>
      <div className="flex gap-2">
        <Input id={`announce-${groupId}`} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("organizer.announcePlaceholder")} />
        <Button type="submit" variant="soft" disabled={!body.trim()} className="shrink-0">
          <Megaphone /> <span className="hidden sm:inline">{t("organizer.announce")}</span>
        </Button>
      </div>
    </form>
  );
}

function GroupForm({ initial, onSave, onCancel }: { initial: GroupDraft; onSave: (d: GroupDraft) => void; onCancel: () => void }) {
  const { t } = useI18n();
  const { data: psychologists = [] } = useQuery("psychologists", () => data.psychologists.list());
  const [d, setD] = useState(initial);
  const set = <K extends keyof GroupDraft>(k: K, v: GroupDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (d.name.trim()) onSave({ ...d, name: d.name.trim() });
      }}
    >
      <Field label={t("organizer.groupName")} htmlFor="g-name">
        <Input id="g-name" value={d.name} onChange={(e) => set("name", e.target.value)} required />
      </Field>
      <Field label={t("organizer.description")} htmlFor="g-desc">
        <Textarea id="g-desc" rows={3} value={d.description} onChange={(e) => set("description", e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("organizer.location")} htmlFor="g-loc">
          <Input id="g-loc" value={d.location} onChange={(e) => set("location", e.target.value)} />
        </Field>
        <Field label={t("organizer.rhythm")} htmlFor="g-rhythm">
          <Input id="g-rhythm" value={d.rhythm} onChange={(e) => set("rhythm", e.target.value)} placeholder="Thursdays · 17:30" />
        </Field>
        <Field label={t("organizer.facilitator")} htmlFor="g-fac">
          <Select id="g-fac" value={d.facilitatorId ?? ""} onChange={(e) => set("facilitatorId", e.target.value || undefined)}>
            <option value="">{t("organizer.noFacilitator")}</option>
            {psychologists.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("organizer.capacity")} htmlFor="g-cap">
          <Input id="g-cap" type="number" min={2} max={20} value={d.capacity} onChange={(e) => set("capacity", Number(e.target.value) || 10)} />
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.save")}</Button>
      </div>
    </form>
  );
}

function EventForm({ groups, onDone }: { groups: CommunityGroup[]; onDone: () => void }) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<CommunityEvent["kind"]>("gathering");
  const [groupId, setGroupId] = useState("");
  const [date, setDate] = useState(() => toYmd(new Date(Date.now() + 7 * 86_400_000)));
  const [time, setTime] = useState("17:30");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        await data.events.create({
          title: title.trim(),
          kind,
          groupId: groupId || undefined,
          date: new Date(`${date}T${time}`).toISOString(),
          location,
          description,
        });
        toast(t("organizer.created"));
        onDone();
      }}
    >
      <Field label={t("organizer.eventTitle")} htmlFor="e-title">
        <Input id="e-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("organizer.eventKind")} htmlFor="e-kind">
          <Select id="e-kind" value={kind} onChange={(e) => setKind(e.target.value as CommunityEvent["kind"])}>
            {(["gathering", "creative", "workshop", "volunteer"] as const).map((k) => (
              <option key={k} value={k}>
                {t(`events.kinds.${k}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("organizer.eventGroup")} htmlFor="e-group">
          <Select id="e-group" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            <option value="">{t("organizer.everyone")}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("therapist.date")} htmlFor="e-date">
          <Input id="e-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label={t("therapist.time")} htmlFor="e-time">
          <Input id="e-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>
      <Field label={t("organizer.location")} htmlFor="e-loc">
        <Input id="e-loc" value={location} onChange={(e) => setLocation(e.target.value)} />
      </Field>
      <Field label={t("organizer.description")} htmlFor="e-desc">
        <Textarea id="e-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.save")}</Button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Check, EyeOff, Pencil, Pin, PinOff, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { toast } from "@/components/common/toaster";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { data, useQuery, type Testimonial } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Field, StatusPill } from "./fields";

type Draft = Omit<Testimonial, "id" | "createdAt">;
const EMPTY: Draft = { name: "", detail: "", quote: "", approved: false, pinned: false, sample: false };

export function OrganizerTestimonials() {
  const { t } = useI18n();
  const { data: items = [] } = useQuery("testimonials:all", () => data.testimonials.list({ includeUnapproved: true }));
  const [editing, setEditing] = useState<{ id?: string; draft: Draft } | null>(null);

  return (
    <>
      <PageHeader
        title={t("organizer.testimonialsTitle")}
        subtitle={t("organizer.testimonialsBody")}
        actions={
          <Button className="lift" onClick={() => setEditing({ draft: EMPTY })}>
            <Plus /> {t("organizer.newTestimonial")}
          </Button>
        }
      />
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className={cn("lift rounded-[2rem] p-6", item.approved ? "bg-blush" : "border border-dashed border-border bg-surface")}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">{item.name}</span>
              {item.detail && <span className="text-sm text-muted">{item.detail}</span>}
              <span className="ml-auto flex flex-wrap gap-1.5">
                {item.pinned && <StatusPill tone="tan"><Pin className="size-3" /> {t("organizer.pinned")}</StatusPill>}
                <StatusPill tone={item.approved ? "green" : "muted"}>{item.approved ? t("organizer.approved") : t("organizer.pending")}</StatusPill>
                {item.sample && <StatusPill tone="muted">{t("testimonials.sample")}</StatusPill>}
              </span>
            </div>
            <p className="mt-3 line-clamp-4 font-serif text-lg leading-snug">{item.quote}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant={item.approved ? "ghost" : "default"} onClick={() => data.testimonials.update(item.id, { approved: !item.approved })}>
                {item.approved ? <EyeOff /> : <Check />} {item.approved ? t("organizer.unapprove") : t("organizer.approve")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => data.testimonials.update(item.id, { pinned: !item.pinned })}>
                {item.pinned ? <PinOff /> : <Pin />} {item.pinned ? t("organizer.unpin") : t("organizer.pin")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing({ id: item.id, draft: { ...item } })}>
                <Pencil /> {t("common.edit")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-crisis"
                onClick={() => window.confirm(t("organizer.removeConfirm")) && data.testimonials.remove(item.id)}
              >
                <Trash2 /> {t("common.remove")}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && (
          <DialogContent title={editing.id ? editing.draft.name : t("organizer.newTestimonial")}>
            <TestimonialForm
              initial={editing.draft}
              onCancel={() => setEditing(null)}
              onSave={async (d) => {
                if (editing.id) await data.testimonials.update(editing.id, d);
                else await data.testimonials.create(d);
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

function TestimonialForm({ initial, onSave, onCancel }: { initial: Draft; onSave: (d: Draft) => void; onCancel: () => void }) {
  const { t } = useI18n();
  const [d, setD] = useState(initial);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (d.name.trim() && d.quote.trim()) onSave({ ...d, name: d.name.trim(), quote: d.quote.trim() });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("organizer.personName")} htmlFor="t-name">
          <Input id="t-name" value={d.name} onChange={(e) => set("name", e.target.value)} required />
        </Field>
        <Field label={t("organizer.detail")} htmlFor="t-detail">
          <Input id="t-detail" value={d.detail} onChange={(e) => set("detail", e.target.value)} placeholder="24, Kigali" />
        </Field>
      </div>
      <Field label={t("organizer.quote")} htmlFor="t-quote">
        <Textarea id="t-quote" rows={6} value={d.quote} onChange={(e) => set("quote", e.target.value)} required />
      </Field>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
        {(
          [
            ["approved", "organizer.approved"],
            ["pinned", "organizer.pinned"],
            ["sample", "organizer.sampleStory"],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={d[k]} onChange={(e) => set(k, e.target.checked)} className="size-4 accent-[var(--primary)]" />
            {t(label)}
          </label>
        ))}
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

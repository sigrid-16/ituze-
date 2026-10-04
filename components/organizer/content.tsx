"use client";

import { useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { toast } from "@/components/common/toaster";
import { DashCard } from "@/components/dashboard/dash-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { data, useQuery, type Resource, type SiteContent } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { Field, Select, StatusPill } from "./fields";

type ResourceDraft = Omit<Resource, "id" | "createdAt">;
const EMPTY_RESOURCE: ResourceDraft = { kind: "article", title: "", summary: "", body: "", minutes: 3, topic: "", published: false };

export function OrganizerContent() {
  const { t } = useI18n();
  const { data: content } = useQuery("site-content", () => data.content.get());
  const { data: resources = [] } = useQuery("resources:all", () => data.resources.list({ includeDrafts: true }));
  const [editing, setEditing] = useState<{ id?: string; draft: ResourceDraft } | null>(null);

  return (
    <>
      <PageHeader title={t("nav.content")} />

      {content && <HomepageForm key={JSON.stringify(content)} initial={content} />}

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <h2 className="flex-1 font-serif text-3xl">{t("organizer.resourcesTitle")}</h2>
          <Button className="lift" onClick={() => setEditing({ draft: EMPTY_RESOURCE })}>
            <Plus /> {t("organizer.newResource")}
          </Button>
        </div>
        <ul className="space-y-2.5">
          {resources.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-4">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{r.title}</span>
                  <StatusPill tone={r.published ? "green" : "muted"}>{r.published ? t("organizer.published") : t("organizer.draft")}</StatusPill>
                </p>
                <p className="text-xs text-muted">
                  {t(`resources.${r.kind}`)} · {r.topic} · {t("common.minutes", { n: r.minutes })}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => data.resources.update(r.id, { published: !r.published })}>
                {r.published ? <EyeOff /> : <Eye />} {r.published ? t("organizer.unpublish") : t("organizer.publish")}
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label={`${t("common.edit")} ${r.title}`} onClick={() => setEditing({ id: r.id, draft: { ...r } })}>
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`${t("common.remove")} ${r.title}`}
                onClick={() => window.confirm(t("organizer.removeConfirm")) && data.resources.remove(r.id)}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && (
          <DialogContent title={editing.id ? editing.draft.title : t("organizer.newResource")}>
            <ResourceForm
              initial={editing.draft}
              onCancel={() => setEditing(null)}
              onSave={async (d) => {
                if (editing.id) await data.resources.update(editing.id, d);
                else await data.resources.create(d);
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

function HomepageForm({ initial }: { initial: SiteContent }) {
  const { t } = useI18n();
  const [heroTitle, setHeroTitle] = useState(initial.heroTitle ?? "");
  const [heroBody, setHeroBody] = useState(initial.heroBody ?? "");
  return (
    <DashCard title={t("organizer.homepage")} icon="sprig">
      <p className="-mt-2 mb-4 text-sm text-muted">{t("organizer.homepageBody")}</p>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await data.content.update({ heroTitle: heroTitle.trim() || undefined, heroBody: heroBody.trim() || undefined });
          toast(t("organizer.contentSaved"));
        }}
      >
        <Field label={t("organizer.heroTitle")} htmlFor="hero-title-input" hint={t("organizer.heroTitleHint")}>
          <Input id="hero-title-input" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder={t("home.welcome")} />
        </Field>
        <Field label={t("organizer.heroBody")} htmlFor="hero-body-input">
          <Textarea id="hero-body-input" rows={3} value={heroBody} onChange={(e) => setHeroBody(e.target.value)} placeholder={t("home.heroBody")} />
        </Field>
        <Button type="submit" className="lift">
          {t("common.save")}
        </Button>
      </form>
    </DashCard>
  );
}

function ResourceForm({ initial, onSave, onCancel }: { initial: ResourceDraft; onSave: (d: ResourceDraft) => void; onCancel: () => void }) {
  const { t } = useI18n();
  const [d, setD] = useState(initial);
  const set = <K extends keyof ResourceDraft>(k: K, v: ResourceDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (d.title.trim()) onSave({ ...d, title: d.title.trim() });
      }}
    >
      <Field label={t("organizer.eventTitle")} htmlFor="r-title">
        <Input id="r-title" value={d.title} onChange={(e) => set("title", e.target.value)} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t("organizer.resourceKind")} htmlFor="r-kind">
          <Select id="r-kind" value={d.kind} onChange={(e) => set("kind", e.target.value as Resource["kind"])}>
            <option value="article">{t("resources.article")}</option>
            <option value="exercise">{t("resources.exercise")}</option>
          </Select>
        </Field>
        <Field label={t("organizer.topic")} htmlFor="r-topic">
          <Input id="r-topic" value={d.topic} onChange={(e) => set("topic", e.target.value)} />
        </Field>
        <Field label={t("organizer.readingTime")} htmlFor="r-min">
          <Input id="r-min" type="number" min={1} max={60} value={d.minutes} onChange={(e) => set("minutes", Number(e.target.value) || 1)} />
        </Field>
      </div>
      <Field label={t("organizer.summary")} htmlFor="r-summary">
        <Input id="r-summary" value={d.summary} onChange={(e) => set("summary", e.target.value)} />
      </Field>
      <Field label={t("organizer.body")} htmlFor="r-body">
        <Textarea id="r-body" rows={5} value={d.body} onChange={(e) => set("body", e.target.value)} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={d.published} onChange={(e) => set("published", e.target.checked)} className="size-4 accent-[var(--primary)]" />
        {t("organizer.published")}
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.save")}</Button>
      </div>
    </form>
  );
}

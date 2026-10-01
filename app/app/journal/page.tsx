"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ImageIcon, Mic, NotebookPen, Plus, Search } from "lucide-react";
import { ImigongoPattern } from "@/components/brand/imigongo";
import { PageHeader } from "@/components/common/page-header";
import { PrivacyNote } from "@/components/common/privacy-note";
import { JournalEntryCard } from "@/components/journal/entry-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { data, useQuery, type JournalEntryType } from "@/lib/data";
import { useCurrentUser } from "@/lib/demo";
import { formatDay } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { cn, toYmd } from "@/lib/utils";

const FILTERS: { value: "all" | JournalEntryType; key: string; icon?: typeof Mic }[] = [
  { value: "all", key: "journal.filterAll" },
  { value: "text", key: "journal.write", icon: NotebookPen },
  { value: "voice", key: "journal.voice", icon: Mic },
  { value: "image", key: "journal.image", icon: ImageIcon },
];

export default function JournalPage() {
  const { t, locale } = useI18n();
  const { userId } = useCurrentUser();
  const { data: entries, loading } = useQuery(`journal:${userId}`, () => data.journal.list(userId));
  const [filter, setFilter] = useState<"all" | JournalEntryType>("all");
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const list = (entries ?? []).filter(
      (e) => (filter === "all" || e.type === filter) && (!q || e.content.toLowerCase().includes(q.toLowerCase())),
    );
    const map = new Map<string, typeof list>();
    for (const e of list) {
      const k = toYmd(new Date(e.createdAt));
      map.set(k, [...(map.get(k) ?? []), e]);
    }
    return [...map.entries()];
  }, [entries, filter, q]);

  return (
    <>
      <PageHeader
        title={t("journal.title")}
        subtitle={t("journal.subtitle")}
        actions={
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/app/journal/new">
              <Plus /> {t("journal.new")}
            </Link>
          </Button>
        }
      />

      {/* Quick start */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-border bg-surface p-5">
        <ImigongoPattern className="absolute inset-x-0 bottom-0 h-3 w-full text-primary opacity-20" />
        <PrivacyNote />
        <div className="mt-4 grid grid-cols-3 gap-3">
          {FILTERS.slice(1).map(({ value, key, icon: Icon }) => (
            <Link
              key={value}
              href={`/app/journal/new?type=${value}`}
              className="flex flex-col items-center gap-2 rounded-2xl bg-background px-2 py-4 text-sm font-bold transition-colors hover:bg-primary-soft hover:text-primary"
            >
              {Icon && <Icon className="size-6 text-primary" />}
              {t(key)}
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("journal.search")} className="h-11 pl-10" aria-label={t("journal.search")} />
        </div>
        <div className="flex gap-1.5 overflow-x-auto" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "h-11 shrink-0 cursor-pointer rounded-full px-4 text-sm font-semibold transition-colors",
                filter === f.value ? "bg-primary text-primary-foreground" : "bg-surface text-muted ring-1 ring-border hover:text-text",
              )}
            >
              {t(f.key)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-3xl bg-border/50" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
          <NotebookPen className="mx-auto size-8 text-primary" />
          <p className="mt-3 text-muted">{t("journal.empty")}</p>
          <Button asChild className="mt-4">
            <Link href="/app/journal/new">{t("journal.new")}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-7">
          {groups.map(([day, list]) => (
            <section key={day}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">{formatDay(list[0].createdAt, locale)}</h2>
              <div className="space-y-3">
                {list.map((e) => (
                  <JournalEntryCard key={e.id} entry={e} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Mobile floating action button */}
      <Link
        href="/app/journal/new"
        aria-label={t("journal.new")}
        className="fixed bottom-24 right-5 z-20 inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg sm:hidden"
      >
        <Plus className="size-6" />
      </Link>
    </>
  );
}

"use client";

import { useState } from "react";
import { ImageIcon, Lock, Mic, MoreHorizontal, NotebookPen, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { data, type JournalEntry } from "@/lib/data";
import { formatDuration, formatTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { REFLECTION_PROMPTS } from "@/data/prompts";
import { cn } from "@/lib/utils";
import { MoodTag } from "./moods";

const TYPE_ICON = { text: NotebookPen, voice: Mic, image: ImageIcon } as const;

export function JournalEntryCard({ entry, compact }: { entry: JournalEntry; compact?: boolean }) {
  const { t, locale } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const Icon = TYPE_ICON[entry.type];
  const prompt = entry.promptId ? REFLECTION_PROMPTS.find((p) => p.id === entry.promptId) : undefined;
  const long = entry.content.length > 280;

  return (
    <article className="rounded-3xl border border-border bg-surface p-5">
      <header className="flex items-center gap-2 text-sm">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Icon className="size-4" />
        </span>
        <time dateTime={entry.createdAt} className="font-semibold text-muted">
          {formatTime(entry.createdAt, locale)}
        </time>
        {entry.mood && <MoodTag mood={entry.mood} />}
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted" title={t("common.private")}>
          <Lock className="size-3.5" />
          <span className="sr-only">{t("common.private")}</span>
        </span>
        {!compact && (
          <DropdownMenu>
            <DropdownMenuTrigger className="-mr-1.5 cursor-pointer rounded-full p-1.5 text-muted hover:bg-primary-soft" aria-label={t("common.edit")}>
              <MoreHorizontal className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem
                className="text-crisis"
                onSelect={() => {
                  if (window.confirm(t("journal.deleteConfirm"))) data.journal.remove(entry.userId, entry.id);
                }}
              >
                <Trash2 /> {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      {prompt && <p className="mt-3 text-sm font-semibold italic text-primary">“{t(prompt.key)}”</p>}

      {entry.type === "image" && entry.mediaUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={entry.mediaUrl} alt="" className={cn("mt-3 w-full rounded-2xl border border-border object-cover", compact ? "max-h-40" : "max-h-80")} />
      )}
      {entry.type === "voice" && entry.mediaUrl && (
        <div className="mt-3 rounded-2xl bg-background p-3">
          <p className="mb-2 text-xs font-semibold text-muted">
            {t("journal.voiceNote")} · {formatDuration(entry.durationSec ?? 0)}
          </p>
          <audio controls src={entry.mediaUrl} className="h-10 w-full" preload="none" />
        </div>
      )}

      {entry.content && (
        <p
          className={cn(
            "mt-3 whitespace-pre-line leading-relaxed",
            compact && "line-clamp-2",
            !compact && long && !expanded && "line-clamp-5",
          )}
        >
          {entry.content}
        </p>
      )}
      {!compact && long && (
        <button className="mt-1 cursor-pointer text-sm font-semibold text-primary" onClick={() => setExpanded((x) => !x)}>
          {expanded ? "−" : "+"} {expanded ? t("journal.showLess") : t("journal.showMore")}
        </button>
      )}
    </article>
  );
}

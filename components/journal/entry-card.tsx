"use client";

import { useState } from "react";
import { HeartHandshake, ImageIcon, Lock, LockKeyhole, Mic, MoreHorizontal, NotebookPen, Trash2 } from "lucide-react";
import { toast } from "@/components/common/toaster";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { data, useQuery, type JournalEntry } from "@/lib/data";
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
  // Psychologists this member has had or booked sessions with: the only people an entry can be shared with
  const { data: myPsychologists = [] } = useQuery(`entry-psychs:${entry.userId}`, async () => {
    const appts = await data.appointments.listForMember(entry.userId);
    const ids = [...new Set(appts.filter((a) => a.status !== "declined" && a.status !== "cancelled").map((a) => a.psychologistId))];
    return (await data.psychologists.list()).filter((p) => ids.includes(p.id));
  });
  const shared = entry.sharedWith ?? [];
  const sharedNames = myPsychologists.filter((p) => shared.includes(p.id)).map((p) => p.name);

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
        {sharedNames.length ? (
          <span className="ml-auto inline-flex min-w-0 items-center gap-1 truncate rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-strong">
            <HeartHandshake className="size-3.5 shrink-0" />
            <span className="truncate">{t("journal.sharedWith", { name: sharedNames.join(", ") })}</span>
          </span>
        ) : (
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted" title={t("common.private")}>
            <Lock className="size-3.5" />
            <span className="sr-only">{t("common.private")}</span>
          </span>
        )}
        {!compact && (
          <DropdownMenu>
            <DropdownMenuTrigger className="-mr-1.5 cursor-pointer rounded-full p-1.5 text-muted hover:bg-primary-soft" aria-label={t("common.edit")}>
              <MoreHorizontal className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              {myPsychologists.length === 0 ? (
                <p className="max-w-60 px-2 py-1.5 text-xs text-muted">{t("journal.noPsychologist")}</p>
              ) : (
                myPsychologists.map((p) =>
                  shared.includes(p.id) ? (
                    <DropdownMenuItem
                      key={p.id}
                      onSelect={async () => {
                        await data.journal.update(entry.userId, entry.id, { sharedWith: shared.filter((x) => x !== p.id) });
                        toast(t("journal.unsharedToast"));
                      }}
                    >
                      <LockKeyhole /> {t("journal.stopSharing")} · {p.name}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      key={p.id}
                      onSelect={async () => {
                        await data.journal.update(entry.userId, entry.id, { sharedWith: [...shared, p.id] });
                        toast(t("journal.sharedToast", { name: p.name }));
                      }}
                    >
                      <HeartHandshake /> {t("journal.shareWith", { name: p.name })}
                    </DropdownMenuItem>
                  ),
                )
              )}
              <DropdownMenuSeparator />
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

"use client";

import Link from "next/link";
import { createContext, useContext, useState } from "react";
import { HeartHandshake, LifeBuoy, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { CRISIS_CONTACTS } from "@/lib/safety";
import { cn } from "@/lib/utils";

const CrisisContext = createContext<{ open: () => void }>({ open: () => {} });

export function CrisisProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const { t } = useI18n();
  return (
    <CrisisContext.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent title={t("crisis.title")} description={t("crisis.intro")}>
          <ul className="space-y-2.5">
            {CRISIS_CONTACTS.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-2xl border border-border p-3.5">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{c.name}</p>
                  <p className="text-sm text-muted">{c.description}</p>
                  <p className="mt-0.5 text-xs text-muted">{c.available}</p>
                </div>
                <Button asChild variant="crisis" size="sm" className="shrink-0">
                  <a href={`tel:${c.number.replace(/\s/g, "")}`} aria-label={t("crisis.call", { number: c.number })}>
                    <Phone />
                    {c.number}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-2xl bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-strong">
            {t("crisis.notEmergency")}
          </p>
          <Button asChild variant="soft" className="mt-3 w-full" onClick={() => setOpen(false)}>
            <Link href="/app/support">
              <HeartHandshake />
              {t("crisis.bookPsychologist")}
            </Link>
          </Button>
        </DialogContent>
      </Dialog>
    </CrisisContext.Provider>
  );
}

export const useCrisis = () => useContext(CrisisContext);

export function CrisisButton({ className, compact }: { className?: string; compact?: boolean }) {
  const { open } = useCrisis();
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border-2 border-crisis/70 px-3.5 text-sm font-bold text-crisis transition-colors hover:bg-crisis hover:text-crisis-foreground",
        className,
      )}
      aria-label={t("crisis.button")}
    >
      <LifeBuoy className="size-4" />
      <span className={cn(compact && "sr-only sm:not-sr-only")}>{t("crisis.button")}</span>
    </button>
  );
}

/** Gentle, non-alarming card shown when crisis language is detected. Never blocks writing. */
export function CrisisCard({ onDismiss }: { onDismiss: () => void }) {
  const { open } = useCrisis();
  const { t } = useI18n();
  return (
    <div role="status" className="animate-rise rounded-3xl border border-border bg-primary-soft p-5">
      <div className="flex items-start gap-3">
        <HeartHandshake className="mt-0.5 size-6 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="font-bold">{t("crisis.cardTitle")}</p>
          <p className="mt-1 text-sm leading-relaxed">{t("crisis.cardBody")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={open}>
              <LifeBuoy />
              {t("crisis.cardResources")}
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/app/support">{t("crisis.bookPsychologist")}</Link>
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              {t("crisis.cardKeepWriting")}
            </Button>
          </div>
        </div>
        <button onClick={onDismiss} className="cursor-pointer rounded-full p-1 text-muted hover:bg-surface" aria-label={t("common.close")}>
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

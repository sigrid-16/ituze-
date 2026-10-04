"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, Wind } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Reveal } from "@/components/motion/reveal";
import { data, useQuery } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function ResourcesPage() {
  const { t } = useI18n();
  const { data: resources = [] } = useQuery("resources", () => data.resources.list());
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <PageHeader title={t("resources.title")} subtitle={t("resources.subtitle")} />
      {resources.length === 0 && <p className="text-muted">{t("resources.empty")}</p>}
      <ul className="grid gap-5 md:grid-cols-2">
        {resources.map((r, i) => {
          const expanded = open === r.id;
          const Icon = r.kind === "exercise" ? Wind : BookOpen;
          return (
            <Reveal as="li" key={r.id} delay={(i % 2) * 90}>
              <article id={r.id} className={cn("lift h-full scroll-mt-24 rounded-[2rem] p-6", i % 3 === 1 ? "bg-sage" : "bg-blush")}>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-strong">
                  <Icon className="size-4" /> {t(`resources.${r.kind}`)} · {r.topic} · {t("common.minutes", { n: r.minutes })}
                </p>
                <h2 className="mt-3 font-serif text-2xl leading-tight">{r.title}</h2>
                <p className="mt-2 leading-relaxed text-muted">{r.summary}</p>
                {expanded && <p className="animate-rise mt-4 rounded-2xl bg-surface/80 p-4 leading-relaxed">{r.body}</p>}
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : r.id)}
                  className="mt-4 inline-flex cursor-pointer items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary"
                >
                  {expanded ? t("journal.showLess") : t("resources.read")}
                  <ChevronDown className={cn("size-4 transition-transform duration-300", expanded && "rotate-180")} />
                </button>
              </article>
            </Reveal>
          );
        })}
      </ul>
    </>
  );
}

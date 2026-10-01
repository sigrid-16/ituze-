"use client";

import { Hammer } from "lucide-react";
import { ImigongoPattern } from "@/components/brand/imigongo";
import { PageHeader } from "@/components/common/page-header";
import { useI18n } from "@/lib/i18n";

export function ComingSoon({ titleKey, bodyKey, step }: { titleKey: string; bodyKey: string; step: number }) {
  const { t } = useI18n();
  return (
    <>
      <PageHeader title={t(titleKey)} />
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-primary/40 bg-surface p-8 text-center sm:p-12">
        <ImigongoPattern variant="diamond" className="absolute inset-0 h-full w-full text-primary opacity-[0.05]" />
        <div className="relative">
          <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Hammer className="size-6" />
          </span>
          <p className="mt-4 text-lg font-bold">{t(bodyKey)}</p>
          <p className="mt-2 text-sm text-muted">
            {t("common.comingNext")} · {t("common.buildStep", { n: step })}
          </p>
        </div>
      </div>
    </>
  );
}

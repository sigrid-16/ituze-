"use client";

import { Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function PrivacyNote({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <p className={cn("inline-flex items-center gap-1.5 text-sm font-semibold text-primary", className)}>
      <Lock className="size-4" /> {t("common.private")}
    </p>
  );
}

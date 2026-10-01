"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { ImigongoPattern } from "@/components/brand/imigongo";
import { Logo } from "@/components/brand/logo";
import { ROLE_META, ROLES } from "@/components/shell/role-switcher";
import { LanguageSwitcher, ThemeToggle } from "@/components/shell/settings-controls";
import { Button } from "@/components/ui/button";
import { resetDemoData } from "@/lib/data";
import { ROLE_HOME, switchRole } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useState } from "react";

const PERSONA: Record<string, string> = {
  anonymous: "Inyenyeri",
  identified: "Aline Uwase",
  psychologist: "Dr. Jean-Paul Habimana",
  admin: "Claudine Mukamana",
};

export default function DemoPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [resetDone, setResetDone] = useState(false);

  return (
    <div className="relative min-h-dvh">
      <ImigongoPattern variant="diamond" className="absolute inset-0 h-full w-full text-primary opacity-[0.04]" />
      <header className="relative mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6">
        <Link href="/" aria-label="Ituze">
          <Logo />
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main className="relative mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pt-12">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("demo.title")}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">{t("demo.body")}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {ROLES.map((r, i) => {
            const M = ROLE_META[r];
            return (
              <button
                key={r}
                onClick={() => {
                  switchRole(r);
                  router.push(ROLE_HOME[r]);
                }}
                className="animate-rise group flex cursor-pointer items-start gap-4 rounded-3xl border border-border bg-surface p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className={cn("inline-flex size-12 shrink-0 items-center justify-center rounded-2xl", M.tone)}>
                  <M.icon className="size-6" />
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-bold">{t(`roles.${r}`)}</span>
                  <span className="mt-0.5 block text-sm font-semibold text-primary">{PERSONA[r]}</span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-muted">{t(`roles.${r}Desc`)}</span>
                </span>
                <ArrowRight className="mt-3 size-5 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </button>
            );
          })}
        </div>

        <Link
          href="/onboarding"
          className="mt-4 flex items-center gap-4 rounded-3xl border border-dashed border-primary/40 bg-primary-soft/40 p-5 transition-colors hover:bg-primary-soft"
        >
          <Sparkles className="size-6 text-primary" />
          <span className="flex-1">
            <span className="block font-bold">{t("demo.startOnboarding")}</span>
            <span className="block text-sm text-muted">{t("demo.startOnboardingBody")}</span>
          </span>
          <ArrowRight className="size-5 text-primary" />
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetDemoData();
              setResetDone(true);
            }}
          >
            <RotateCcw /> {t("demo.reset")}
          </Button>
          {resetDone && <span className="text-sm font-semibold text-primary">{t("demo.resetDone")}</span>}
        </div>
      </main>
    </div>
  );
}

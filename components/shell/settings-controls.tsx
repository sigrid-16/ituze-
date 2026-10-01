"use client";

import { Check, Languages, Monitor, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LOCALES, useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/data/types";
import { updateSettings, useSettings, type ThemePref } from "@/lib/settings";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, locale, setLocale } = useI18n();
  const current = LOCALES.find((l) => l.code === locale)!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("gap-1.5", className)} aria-label={t("settings.language")}>
          <Languages />
          {current.short}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>{t("settings.language")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={locale} onValueChange={(v) => setLocale(v as Locale)}>
          {LOCALES.map((l) => (
            <DropdownMenuRadioItem key={l.code} value={l.code}>
              <span className="w-6 text-xs font-bold text-muted">{l.short}</span>
              {l.label}
              {l.code === locale && <Check className="ml-auto size-4" />}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor } as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme } = useSettings();
  const { t } = useI18n();
  const order: ThemePref[] = ["light", "dark", "system"];
  const Icon = THEME_ICONS[theme];
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={className}
      onClick={() => updateSettings({ theme: order[(order.indexOf(theme) + 1) % order.length] })}
      aria-label={`${t("settings.theme")}: ${t(`settings.${theme}`)}`}
      title={`${t("settings.theme")}: ${t(`settings.${theme}`)}`}
    >
      <Icon />
    </Button>
  );
}

/** Segmented controls, used on the Me / settings screen. */
export function LanguageSegmented() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl bg-background p-1" role="radiogroup">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          role="radio"
          aria-checked={locale === l.code}
          onClick={() => setLocale(l.code)}
          className={cn(
            "h-11 cursor-pointer rounded-xl text-sm font-semibold transition-colors",
            locale === l.code ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-text",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export function ThemeSegmented() {
  const { theme } = useSettings();
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl bg-background p-1" role="radiogroup">
      {(["light", "dark", "system"] as const).map((v) => {
        const Icon = THEME_ICONS[v];
        return (
          <button
            key={v}
            role="radio"
            aria-checked={theme === v}
            onClick={() => updateSettings({ theme: v })}
            className={cn(
              "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors",
              theme === v ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-text",
            )}
          >
            <Icon className="size-4" />
            {t(`settings.${v}`)}
          </button>
        );
      })}
    </div>
  );
}

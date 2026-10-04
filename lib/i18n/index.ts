"use client";

import { useCallback } from "react";
import { useSettings, updateSettings } from "@/lib/settings";
import type { Locale } from "@/lib/data/types";
import { en } from "./en";
import { fr } from "./fr";
import { rw } from "./rw";

const dictionaries: Record<Locale, unknown> = { en, rw, fr };

export const LOCALES: { code: Locale; label: string; short: string }[] = [
  { code: "rw", label: "Ikinyarwanda", short: "RW" },
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Français", short: "FR" },
];

function lookup(dict: unknown, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in node) node = (node as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof node === "string" ? node : undefined;
}

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let s = lookup(dictionaries[locale], key) ?? lookup(en, key) ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

export function useI18n(): { t: TFunction; locale: Locale; setLocale: (l: Locale) => void } {
  const { locale } = useSettings();
  const t = useCallback<TFunction>((key, vars) => translate(locale, key, vars), [locale]);
  return { t, locale, setLocale: (l) => updateSettings({ locale: l }) };
}

/** Intl locale tag for dates. Kinyarwanda falls back gracefully where unsupported. */
export function intlLocale(locale: Locale): string {
  return locale === "rw" ? "rw-RW" : locale === "fr" ? "fr-RW" : "en-RW";
}

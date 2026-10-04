"use client";

/**
 * Per-browser demo settings: language, theme and the signed-in demo account.
 * Exposed through useSyncExternalStore so server and client render safely.
 */
import { useSyncExternalStore } from "react";
import type { Locale, Role } from "@/lib/data/types";

export type ThemePref = "light" | "dark" | "system";

export interface Settings {
  locale: Locale;
  theme: ThemePref;
  /** Role of the signed-in demo account (see lib/auth.ts) */
  role: Role;
  /** True while signed in to a demo account */
  signedIn: boolean;
}

const KEY = "ituze-settings";
export const DEFAULT_SETTINGS: Settings = { locale: "en", theme: "system", role: "identified", signedIn: false };

let current: Settings | null = null;
const listeners = new Set<() => void>();

function read(): Settings {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function getSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  if (!current) current = read();
  return current;
}

export function updateSettings(patch: Partial<Settings>) {
  current = { ...getSettings(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSettings, () => DEFAULT_SETTINGS);
}

/** True after hydration on the client. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

import { intlLocale, translate } from "@/lib/i18n";
import type { Locale } from "@/lib/data/types";
import { isSameDay } from "@/lib/utils";

export function formatDay(iso: string, locale: Locale): string {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, now)) return translate(locale, "common.today");
  if (isSameDay(d, yesterday)) return translate(locale, "common.yesterday");
  return d.toLocaleDateString(intlLocale(locale), { weekday: "short", day: "numeric", month: "short" });
}

export function formatTime(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleTimeString(intlLocale(locale), { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDateTime(iso: string, locale: Locale): string {
  return `${formatDay(iso, locale)} · ${formatTime(iso, locale)}`;
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${`${s}`.padStart(2, "0")}`;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Local YYYY-MM-DD */
export function toYmd(d: Date): string {
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
}

/** Monday-start week containing `d`, as YYYY-MM-DD strings. */
export function weekDays(d = new Date()): Date[] {
  const start = new Date(d);
  const offset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offset);
  start.setHours(12, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    return x;
  });
}

export function isSameDay(a: Date, b: Date) {
  return toYmd(a) === toYmd(b);
}

export function daysAgoYmd(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toYmd(d);
}

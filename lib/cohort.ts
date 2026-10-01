import type { Cohort } from "@/lib/data/types";

const WEEK = 7 * 86_400_000;

/** Date of the weekly in-person session for a given week (1–12). */
export function sessionDate(cohort: Cohort, week: number): Date {
  return new Date(new Date(cohort.startDate).getTime() + (week - 1) * WEEK);
}

/** Next upcoming session for an active or forming cohort. */
export function nextSession(cohort: Cohort, now = new Date()): { week: number; date: Date } | null {
  for (let w = 1; w <= 12; w++) {
    const d = sessionDate(cohort, w);
    if (d.getTime() + 2 * 3_600_000 > now.getTime()) return { week: w, date: d };
  }
  return null;
}

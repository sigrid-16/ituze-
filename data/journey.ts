import type { JourneyWeek } from "@/lib/data/types";

/** The 12-week healing journey, grouped into four phases. Themes are i18n keys. */
export const JOURNEY_WEEKS: JourneyWeek[] = [
  { week: 1, phase: 1, themeKey: "journey.w1", promptKey: "journey.p1" },
  { week: 2, phase: 1, themeKey: "journey.w2", promptKey: "journey.p2" },
  { week: 3, phase: 1, themeKey: "journey.w3", promptKey: "journey.p3" },
  { week: 4, phase: 2, themeKey: "journey.w4", promptKey: "journey.p4" },
  { week: 5, phase: 2, themeKey: "journey.w5", promptKey: "journey.p5" },
  { week: 6, phase: 2, themeKey: "journey.w6", promptKey: "journey.p6" },
  { week: 7, phase: 3, themeKey: "journey.w7", promptKey: "journey.p7" },
  { week: 8, phase: 3, themeKey: "journey.w8", promptKey: "journey.p8" },
  { week: 9, phase: 3, themeKey: "journey.w9", promptKey: "journey.p9" },
  { week: 10, phase: 4, themeKey: "journey.w10", promptKey: "journey.p10" },
  { week: 11, phase: 4, themeKey: "journey.w11", promptKey: "journey.p11" },
  { week: 12, phase: 4, themeKey: "journey.w12", promptKey: "journey.p12" },
];

export const JOURNEY_PHASES = [
  { phase: 1, titleKey: "journey.phase1", weeks: [1, 2, 3] },
  { phase: 2, titleKey: "journey.phase2", weeks: [4, 5, 6] },
  { phase: 3, titleKey: "journey.phase3", weeks: [7, 8, 9] },
  { phase: 4, titleKey: "journey.phase4", weeks: [10, 11, 12] },
] as const;

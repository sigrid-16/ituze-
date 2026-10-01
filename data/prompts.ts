import type { ReflectionPrompt } from "@/lib/data/types";

/** Rotating, optional reflection prompts. Text lives in the i18n dictionaries. */
export const REFLECTION_PROMPTS: ReflectionPrompt[] = Array.from({ length: 10 }, (_, i) => ({
  id: `prompt-${i + 1}`,
  key: `prompts.p${i + 1}`,
}));

/** Same prompt all day, rotates daily. */
export function promptOfTheDay(date = new Date()): ReflectionPrompt {
  const day = Math.floor(date.getTime() / 86_400_000);
  return REFLECTION_PROMPTS[day % REFLECTION_PROMPTS.length];
}

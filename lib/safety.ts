import crisisConfig from "@/config/crisis-contacts.json";

export interface CrisisContact {
  id: string;
  name: string;
  number: string;
  description: string;
  available: string;
}

/** Admin-editable via config/crisis-contacts.json (later: an admin-managed table). */
export const CRISIS_CONTACTS: CrisisContact[] = crisisConfig.contacts;
export const CRISIS_CONFIG_META = { country: crisisConfig.country, lastReviewed: crisisConfig.lastReviewed };

/**
 * Very simple, on-device phrase matching for crisis language (EN / FR / RW).
 * It only ever shows a gentle resources card; it never blocks writing and
 * never sends anything anywhere.
 */
const CRISIS_PATTERNS: RegExp[] = [
  // English
  /\bsuicid/i,
  /\bkill(ing)? my ?self\b/i,
  /\bend(ing)? (it all|my life)\b/i,
  /\bwant(ed)? to die\b/i,
  /\bbetter off dead\b/i,
  /\bno reason to live\b/i,
  /\bself[- ]?harm/i,
  /\b(hurt|cut|harm)(ing)? my ?self\b/i,
  // French
  /\bme tuer\b/i,
  /\ben finir\b/i,
  /\bmettre fin à (ma|mes) (vie|jours)\b/i,
  /\benvie de mourir\b/i,
  /\bme faire du mal\b/i,
  // Kinyarwanda
  /\bkwiyahura\b/i,
  /\bkwiyica\b/i,
  /\bndashaka gupfa\b/i,
  /\bnshaka gupfa\b/i,
  /\bkwikomeretsa\b/i,
];

export function containsCrisisLanguage(text: string): boolean {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

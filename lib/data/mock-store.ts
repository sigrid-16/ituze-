/**
 * Browser-state persistence for the demo. The whole demo database lives in
 * localStorage under one key and is seeded on first visit.
 *
 * Only `mock-source.ts` should import this file. UI code talks to the
 * `DataSource` interface instead, so this can be swapped for Supabase.
 */
import { createSeed, SEED_VERSION } from "@/data/seed";
import type { DemoDatabase } from "./types";

const STORAGE_KEY = "ituze-demo-db";
/** Sample dates are relative to the seed time, so refresh stale demos. */
const MAX_SEED_AGE_MS = 7 * 86_400_000;

let db: DemoDatabase | null = null;
const listeners = new Set<() => void>();

function load(): DemoDatabase {
  if (typeof window === "undefined") return createSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoDatabase;
      const fresh = Date.now() - new Date(parsed.seededAt).getTime() < MAX_SEED_AGE_MS;
      if (parsed.version === SEED_VERSION && fresh) return parsed;
    }
  } catch {
    // ignore: corrupt or blocked storage falls back to a fresh seed
  }
  const seed = createSeed();
  persist(seed);
  return seed;
}

function persist(next: DemoDatabase) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota exceeded (e.g. many large images): keep working in memory.
    console.warn("[ituze] Could not persist demo data; changes are kept in memory only.");
  }
}

export function getDb(): DemoDatabase {
  if (!db) db = load();
  return db;
}

/** Immutable update + persist + notify subscribers. */
export function updateDb(mutator: (draft: DemoDatabase) => DemoDatabase): void {
  db = mutator(getDb());
  persist(db);
  listeners.forEach((l) => l());
}

export function resetDb(): void {
  db = createSeed();
  persist(db);
  listeners.forEach((l) => l());
}

export function subscribeDb(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

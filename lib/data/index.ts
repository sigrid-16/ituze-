"use client";

/**
 * Single entry point for data access in the UI.
 *
 * To move to a real backend: implement `DataSource` with Supabase
 * (e.g. `lib/data/supabase-source.ts`), export it here as `data`, and point
 * `subscribeToDataChanges` at Supabase realtime. No UI changes needed.
 */
import { useEffect, useEffectEvent, useState } from "react";
import { mockSource } from "./mock-source";
import { resetDb, subscribeDb } from "./mock-store";
import type { DataSource } from "./source";

export const data: DataSource = mockSource;

export const subscribeToDataChanges = subscribeDb;
export const resetDemoData = resetDb;

/**
 * Tiny query hook: runs `fetcher`, re-runs whenever data changes.
 * `key` must change whenever the fetcher's inputs change.
 */
export function useQuery<T>(key: string, fetcher: () => Promise<T>): { data: T | undefined; loading: boolean } {
  const [state, setState] = useState<{ key: string; data: T | undefined }>({ key: "", data: undefined });

  const run = useEffectEvent(() => fetcher());

  useEffect(() => {
    let alive = true;
    const load = () =>
      run().then((d) => {
        if (alive) setState({ key, data: d });
      });
    load();
    const unsub = subscribeToDataChanges(load);
    return () => {
      alive = false;
      unsub();
    };
  }, [key]);

  const fresh = state.key === key;
  return { data: fresh ? state.data : undefined, loading: !fresh };
}

export type { DataSource } from "./source";
export * from "./types";

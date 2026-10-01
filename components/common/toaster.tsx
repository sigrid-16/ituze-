"use client";

import { useSyncExternalStore } from "react";
import { CheckCircle2 } from "lucide-react";

type Toast = { id: number; message: string };
let toasts: Toast[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(message: string) {
  const id = Date.now() + Math.random();
  toasts = [...toasts, { id, message }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 3200);
}

const EMPTY: Toast[] = [];

export function Toaster() {
  const items = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => toasts,
    () => EMPTY,
  );
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-8"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className="animate-rise flex items-center gap-2 rounded-full bg-text px-5 py-3 text-sm font-semibold text-background shadow-lg"
        >
          <CheckCircle2 className="size-4" /> {t.message}
        </div>
      ))}
    </div>
  );
}

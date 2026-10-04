"use client";

import { useState } from "react";

/** The current time, captured once when the component mounts (keeps renders pure). */
export function useNow(): number {
  const [now] = useState(() => Date.now());
  return now;
}

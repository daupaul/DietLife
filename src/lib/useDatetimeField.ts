"use client";

import { useState, useSyncExternalStore } from "react";
import { taipeiNowInput } from "./datetime";

const subscribe = () => () => {};

/**
 * Datetime form field that defaults to "now" without a hydration mismatch:
 * useSyncExternalStore returns "" on the server / during hydration, then the
 * client's current Taipei time afterwards (React handles the swap). Editing
 * pins a user value; reset() returns to the live default.
 */
export function useDatetimeField() {
  const now = useSyncExternalStore(
    subscribe,
    () => taipeiNowInput(),
    () => "",
  );
  const [edited, setEdited] = useState<string | null>(null);

  return {
    value: edited ?? now,
    setValue: (v: string) => setEdited(v),
    reset: () => setEdited(null),
  };
}

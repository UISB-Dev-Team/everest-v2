"use client";

import { useState, useCallback, useRef } from "react";

type Phase = "enter" | "exit";

/**
 * Two-phase view transition:
 *   1. animate current view out (200 ms)
 *   2. swap to the new view
 *   3. animate new view in
 *
 * Returns the current view, a className to apply to the wrapper div,
 * and a `navigate` function that triggers the transition.
 */
export function useViewTransition<T>(initial: T) {
  const [view, setView]   = useState<T>(initial);
  const [phase, setPhase] = useState<Phase>("enter");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useCallback((next: T) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setPhase("exit");
    timerRef.current = setTimeout(() => {
      setView(next);
      setPhase("enter");
    }, 210); // matches auth-exit duration (0.2s)
  }, []);

  const className = phase === "enter" ? "auth-enter" : "auth-exit";

  return { view, navigate, className } as const;
}

"use client";

import { useEffect, useState } from "react";
import dormitoriesFixture from "@/mocks/fixtures/dormitories.json";
import type { Tables } from "@/database.types";

type Dormitory = Tables<"dormitories">;

const dormitories = dormitoriesFixture as Dormitory[];

export function useDormitory(dormitoryId: string | null) {
  const [dormitory, setDormitory] = useState<Dormitory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dormitoryId) {
      setDormitory(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    new Promise<Dormitory | null>((resolve) => {
      setTimeout(() => {
        resolve(dormitories.find((d) => d.id === dormitoryId) ?? null);
      }, 100);
    }).then((d) => {
      if (!cancelled) {
        setDormitory(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dormitoryId]);

  return { dormitory, loading };
}

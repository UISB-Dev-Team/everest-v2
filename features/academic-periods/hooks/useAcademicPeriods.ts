"use client";

import { useEffect, useState } from "react";
import { academicPeriodsData } from "@/features/academic-periods/data";
import type { AcademicPeriod } from "@/features/academic-periods/data";

export function useAcademicPeriods() {
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    academicPeriodsData
      .list()
      .then((p) => !cancelled && setPeriods(p))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { periods, loading };
}

export function useCurrentAcademicPeriod() {
  const [period, setPeriod] = useState<AcademicPeriod | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    academicPeriodsData
      .getCurrent()
      .then((p) => !cancelled && setPeriod(p))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { period, loading };
}

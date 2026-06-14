"use client";

import { useEffect, useState } from "react";
import { academicPeriodsData } from "@/features/academic-periods/data";
import type { AcademicPeriod } from "@/features/academic-periods/data";

export function useAcademicPeriodsData() {
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await academicPeriodsData.list();
      setAcademicPeriods(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    academicPeriodsData
      .list()
      .then((list) => {
        if (!cancelled) setAcademicPeriods(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { academicPeriods, loading, refresh };
}

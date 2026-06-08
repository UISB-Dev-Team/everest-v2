"use client";

import { useEffect, useState } from "react";
import { eventsData } from "@/features/events/data";
import type { EventPayable } from "@/features/events/data";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";

export function useAllEventPayables() {
  const { dormitoryId } = useDormitory();
  const { selected: academicPeriod } = useAcademicPeriod();

  const [payables, setPayables] = useState<EventPayable[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!dormitoryId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await eventsData.listAllEventPayables(
        dormitoryId,
        academicPeriod?.id ?? ""
      );
      setPayables(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!dormitoryId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const list = await eventsData.listAllEventPayables(
        dormitoryId,
        academicPeriod?.id ?? ""
      );
      if (cancelled) return;
      setPayables(list);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [dormitoryId, academicPeriod]);

  return { payables, loading, refresh };
}

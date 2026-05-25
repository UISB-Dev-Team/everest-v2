"use client";

import { useEffect, useState } from "react";
import { eventsData } from "@/features/events/data";
import type {
  Event,
  EventDormerData,
} from "@/features/events/data";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";

export function useEventDetail(eventId: string | null) {
  const { dormitoryId } = useDormitory();
  const { selected: academicPeriod } = useAcademicPeriod();
  const [event, setEvent] = useState<Event | null>(null);
  const [dormers, setDormers] = useState<EventDormerData[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const [e, list] = await Promise.all([
        eventsData.getById(eventId),
        eventsData.listDormersForEvent(eventId, academicPeriod?.id ?? ""),
      ]);
      setEvent(e);
      setDormers(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [e, list] = await Promise.all([
        eventsData.getById(eventId),
        eventsData.listDormersForEvent(eventId, academicPeriod?.id ?? ""),
      ]);
      if (cancelled) return;
      setEvent(e);
      setDormers(list);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId, academicPeriod]);

  return { event, dormers, loading, refresh };
}

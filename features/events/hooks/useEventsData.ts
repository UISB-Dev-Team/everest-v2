"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { eventsData } from "@/features/events/data";
import { dormersData } from "@/features/dormers/data";
import type { Event, EventPayment } from "@/features/events/data";
import type { Dormer } from "@/features/dormers/data";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";

export interface EventWithStats extends Event {
  paidCount: number;
  waivedCount: number;
  unpaidCount: number;
  dormerTotal: number;
  progressPercentage: number;
}

export function useEventsData() {
  const { dormitoryId } = useDormitory();
  const { selected: academicPeriod } = useAcademicPeriod();
  const [events, setEvents] = useState<Event[]>([]);
  const [paymentsByEvent, setPaymentsByEvent] = useState<
    Record<string, EventPayment[]>
  >({});
  const [dormers, setDormers] = useState<Dormer[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!dormitoryId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [eventList, dormerList] = await Promise.all([
        eventsData.listForDormitory(dormitoryId, academicPeriod?.id ?? ""),
        dormersData.listForDormitory(dormitoryId, academicPeriod?.id ?? ""),
      ]);
      setEvents(eventList);
      setDormers(dormerList);
      const paymentMap: Record<string, EventPayment[]> = {};
      await Promise.all(
        eventList.map(async (event) => {
          const payments = await eventsData.listPaymentsForEvent(event.id, academicPeriod?.id ?? "", dormitoryId);
          paymentMap[event.id] = payments;
        })
      );
      setPaymentsByEvent(paymentMap);
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
      const [eventList, dormerList] = await Promise.all([
        eventsData.listForDormitory(dormitoryId, academicPeriod?.id ?? ""),
        dormersData.listForDormitory(dormitoryId, academicPeriod?.id ?? ""),
      ]);
      if (cancelled) return;
      setEvents(eventList);
      setDormers(dormerList);
      const paymentMap: Record<string, EventPayment[]> = {};
      await Promise.all(
        eventList.map(async (event) => {
          const payments = await eventsData.listPaymentsForEvent(event.id, academicPeriod?.id ?? "", dormitoryId);
          paymentMap[event.id] = payments;
        })
      );
      if (cancelled) return;
      setPaymentsByEvent(paymentMap);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [dormitoryId, academicPeriod]);

  const eventsWithStats: EventWithStats[] = useMemo(() => {
    return events.map((event) => {
      const payments = paymentsByEvent[event.id] ?? [];
      const paidCount = payments.filter((p) => p.status === "Paid").length;
      const waivedCount = payments.filter(
        (p) => p.status === "Waived"
      ).length;

      const dormerTotal = dormers.length - waivedCount;
      const unpaidCount = Math.max(0, dormerTotal - paidCount);
      const progressPercentage =
        dormerTotal > 0 ? (paidCount / dormerTotal) * 100 : 0;
      return {
        ...event,
        paidCount,
        waivedCount,
        unpaidCount,
        dormerTotal,
        progressPercentage,
      };
    });
  }, [events, paymentsByEvent, dormers]);

  return { loading, events, eventsWithStats, dormers, refresh };
}

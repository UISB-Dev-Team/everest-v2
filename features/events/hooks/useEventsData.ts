"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { eventsData } from "@/features/events/data";
import { dormersData } from "@/features/dormers/data";
import type { Event, EventPayment } from "@/features/events/data";
import type { Dormer } from "@/features/dormers/data";

export interface EventWithStats extends Event {
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  dormerTotal: number;
  progressPercentage: number;
}

export function useEventsData() {
  const { user } = useAuth();
  const dormitoryId = user?.dormitoryId ?? null;

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
        eventsData.listForDormitory(dormitoryId),
        dormersData.listForDormitory(dormitoryId),
      ]);
      setEvents(eventList);
      setDormers(dormerList);
      const paymentMap: Record<string, EventPayment[]> = {};
      await Promise.all(
        eventList.map(async (event) => {
          const payments = await eventsData.listPaymentsForEvent(event.id);
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
        eventsData.listForDormitory(dormitoryId),
        dormersData.listForDormitory(dormitoryId),
      ]);
      if (cancelled) return;
      setEvents(eventList);
      setDormers(dormerList);
      const paymentMap: Record<string, EventPayment[]> = {};
      await Promise.all(
        eventList.map(async (event) => {
          const payments = await eventsData.listPaymentsForEvent(event.id);
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
  }, [dormitoryId]);

  const eventsWithStats: EventWithStats[] = useMemo(() => {
    return events.map((event) => {
      const payments = paymentsByEvent[event.id] ?? [];
      const dormerTotal = dormers.length;
      const paidCount = payments.filter((p) => p.status === "Paid").length;
      const partialCount = payments.filter(
        (p) => p.status === "Pending" && p.amount > 0
      ).length;
      const unpaidCount = Math.max(0, dormerTotal - paidCount - partialCount);
      const progressPercentage =
        dormerTotal > 0 ? (paidCount / dormerTotal) * 100 : 0;
      return {
        ...event,
        paidCount,
        partialCount,
        unpaidCount,
        dormerTotal,
        progressPercentage,
      };
    });
  }, [events, paymentsByEvent, dormers]);

  return { loading, events, eventsWithStats, dormers, refresh };
}

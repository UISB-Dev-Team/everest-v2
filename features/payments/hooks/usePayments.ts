"use client";

import { useEffect, useState } from "react";
import { paymentsData } from "@/features/payments/data";
import type {
  Bill,
  BillWithDormer,
  PaymentSummary,
} from "@/features/payments/data";

export function useDormerPayments(dormerId: string | null) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dormerId) {
      setBills([]);
      setSummary(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      paymentsData.listBillsForDormer(dormerId),
      paymentsData.summaryForDormer(dormerId),
    ])
      .then(([b, s]) => {
        if (cancelled) return;
        setBills(b);
        setSummary(s);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dormerId]);

  return { bills, summary, loading };
}

export function useDormitoryBills(dormitoryId: string | null) {
  const [bills, setBills] = useState<BillWithDormer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dormitoryId) {
      setBills([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    paymentsData
      .listBillsForDormitory(dormitoryId)
      .then((b) => {
        if (!cancelled) setBills(b);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dormitoryId]);

  return { bills, loading };
}

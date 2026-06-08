"use client";

import { useEffect, useState } from "react";
import { paymentsData } from "@/features/payments/data";
import type {
  Bill,
  BillWithDormer,
  PaymentSummary,
} from "@/features/payments/data";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";

export function useDormerPayments(dormerId: string | null) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { selected: academicPeriod } = useAcademicPeriod();
  const { dormitoryId } = useDormitory()
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
      paymentsData.listBillsForDormer(dormerId, academicPeriod?.id ?? ""),
      paymentsData.summaryForDormer(dormerId, academicPeriod?.id ?? ""),
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
  }, [dormerId, academicPeriod]);

  return { bills, summary, loading };
}

export function useDormitoryBills() {
  const [bills, setBills] = useState<BillWithDormer[]>([]);
  const [loading, setLoading] = useState(true);
  const { selected: academicPeriod } = useAcademicPeriod();
  const { dormitoryId } = useDormitory()

  useEffect(() => {
    if (!dormitoryId) {
      setBills([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    paymentsData
      .listBillsForDormitory(dormitoryId, academicPeriod?.id!)
      .then((b) => {
        if (!cancelled) setBills(b);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dormitoryId, academicPeriod]);

  return { bills, loading };
}

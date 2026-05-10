"use client";

import { useEffect, useState } from "react";
import { clearanceData } from "@/features/clearance/data";
import type { ClearanceStatus } from "@/features/clearance/data";

export function useClearanceStatus(
  dormerId: string | null,
  academicPeriodId: string | null
) {
  const [status, setStatus] = useState<ClearanceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dormerId || !academicPeriodId) {
      setStatus(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    clearanceData
      .getStatusForDormer(dormerId, academicPeriodId)
      .then((s) => !cancelled && setStatus(s))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dormerId, academicPeriodId]);

  return { status, loading };
}

export function useDormitoryClearance(
  dormitoryId: string | null,
  academicPeriodId: string | null
) {
  const [list, setList] = useState<ClearanceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dormitoryId || !academicPeriodId) {
      setList([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    clearanceData
      .listForDormitory(dormitoryId, academicPeriodId)
      .then((l) => !cancelled && setList(l))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dormitoryId, academicPeriodId]);

  return { list, loading };
}

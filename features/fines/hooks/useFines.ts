"use client";

import { useEffect, useState } from "react";
import { finesData } from "@/features/fines/data";
import type {
  FineImpositionWithCategory,
  FineSummary,
} from "@/features/fines/data";

export function useDormerFines(dormerId: string | null) {
  const [impositions, setImpositions] = useState<FineImpositionWithCategory[]>(
    []
  );
  const [summary, setSummary] = useState<FineSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dormerId) {
      setImpositions([]);
      setSummary(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      finesData.listImpositionsForDormer(dormerId),
      finesData.summaryForDormer(dormerId),
    ])
      .then(([imps, sum]) => {
        if (cancelled) return;
        setImpositions(imps);
        setSummary(sum);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dormerId]);

  return { impositions, summary, loading };
}

export function useDormitoryFines(dormitoryId: string | null) {
  const [impositions, setImpositions] = useState<FineImpositionWithCategory[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dormitoryId) {
      setImpositions([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    finesData
      .listImpositionsForDormitory(dormitoryId)
      .then((imps) => {
        if (!cancelled) setImpositions(imps);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dormitoryId]);

  return { impositions, loading };
}

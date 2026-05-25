"use client";

import { useCallback, useEffect, useState } from "react";
import { dashboardData } from "@/features/dashboard/data";
import type {
  AdminDashboardSnapshot,
  DormerDashboardSnapshot,
  SuperAdminDashboardSnapshot,
} from "@/features/dashboard/data";
import { DashboardStats, getDashboardStats } from "../data/supabase";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";

interface UseDashboardReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}


export function useDashboard(): UseDashboardReturn {
  const { dormitoryId, loading: dormitoryLoading } = useDormitory();
  const { selected: currentPeriod, loading: periodLoading } = useAcademicPeriod();
 
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  const fetch = useCallback(async () => {
    if (!dormitoryId || !currentPeriod?.id) return;
 
    setLoading(true);
    setError(null);
 
    try {
      const data = await getDashboardStats(dormitoryId, currentPeriod.id);
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [dormitoryId, currentPeriod?.id]);
 
  useEffect(() => {
    if (!dormitoryLoading && !periodLoading) {
      fetch();
    }
  }, [fetch, dormitoryLoading, periodLoading]);
 
  return { stats, loading: loading || dormitoryLoading || periodLoading, error, refetch: fetch };
}

export function useDormerDashboard(dormerId: string | null) {
  const [snapshot, setSnapshot] = useState<DormerDashboardSnapshot | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dormerId) {
      setSnapshot(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    dashboardData
      .getDormerSnapshot(dormerId)
      .then((s) => !cancelled && setSnapshot(s))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dormerId]);

  return { snapshot, loading };
}

export function useAdminDashboard(dormitoryId: string | null) {
  const [snapshot, setSnapshot] = useState<AdminDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dormitoryId) {
      setSnapshot(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    dashboardData
      .getAdminSnapshot(dormitoryId)
      .then((s) => !cancelled && setSnapshot(s))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [dormitoryId]);

  return { snapshot, loading };
}

export function useSuperAdminDashboard() {
  const [snapshot, setSnapshot] =
    useState<SuperAdminDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    dashboardData
      .getSuperAdminSnapshot()
      .then((s) => !cancelled && setSnapshot(s))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { snapshot, loading };
}

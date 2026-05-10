"use client";

import { useEffect, useState } from "react";
import { dashboardData } from "@/features/dashboard/data";
import type {
  AdminDashboardSnapshot,
  DormerDashboardSnapshot,
  SuperAdminDashboardSnapshot,
} from "@/features/dashboard/data";

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

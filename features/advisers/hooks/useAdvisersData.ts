"use client";

import { useEffect, useState } from "react";
import { advisersData } from "@/features/advisers/data";
import { dormitoriesData } from "@/features/dormitories/data";
import type { Adviser } from "@/features/advisers/data";
import type { Dormitory } from "@/features/dormitories/data";

export function useAdvisersData() {
  const [advisers, setAdvisers] = useState<Adviser[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const [a, d] = await Promise.all([
        advisersData.list(),
        dormitoriesData.list(),
      ]);
      setAdvisers(a);
      setDormitories(d);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([advisersData.list(), dormitoriesData.list()])
      .then(([a, d]) => {
        if (cancelled) return;
        setAdvisers(a);
        setDormitories(d);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { advisers, dormitories, loading, refresh };
}

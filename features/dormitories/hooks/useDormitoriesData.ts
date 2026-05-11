"use client";

import { useEffect, useState } from "react";
import { dormitoriesData } from "@/features/dormitories/data";
import type { DormitoryWithStats } from "@/features/dormitories/data";

export function useDormitoriesData() {
  const [dormitories, setDormitories] = useState<DormitoryWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await dormitoriesData.listWithStats();
      setDormitories(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    dormitoriesData
      .listWithStats()
      .then((list) => {
        if (!cancelled) setDormitories(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { dormitories, loading, refresh };
}

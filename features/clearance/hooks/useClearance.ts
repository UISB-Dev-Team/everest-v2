"use client";

import { useEffect, useState } from "react";
import { clearanceData } from "@/features/clearance/data";
import type { ClearanceStatus } from "@/features/clearance/data";

const ITEMS_PER_PAGE = 6;
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    setTotalPages(totalPages);
    
    
    return () => {
      cancelled = true;
    };
  }, [dormitoryId, academicPeriodId]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return { list, loading, currentPage, totalPages, handlePreviousPage, handleNextPage };
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { dormersData } from "@/features/dormers/data";
import { finesData } from "@/features/fines/data";
import type { Dormer } from "@/features/dormers/data";
import type {
  FineImpositionWithCategory,
  FineStatistics,
} from "@/features/fines/data";

/**
 * Mirrors the old admin-side `useFinesData` hook surface but uses the seam.
 * Returns dormers + impositions for the active dormitory, applies search and
 * status filters, paginates, and provides aggregate statistics.
 */
export function useFinesAdminData() {
  const { user } = useAuth();
  const dormitoryId = user?.dormitoryId ?? null;

  const [dormers, setDormers] = useState<Dormer[]>([]);
  const [impositions, setImpositions] = useState<FineImpositionWithCategory[]>(
    []
  );
  const [statistics, setStatistics] = useState<FineStatistics>({
    totalFines: 0,
    collectedFines: 0,
    collectibleFines: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!dormitoryId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      dormersData.listForDormitory(dormitoryId),
      finesData.listImpositionsForDormitory(dormitoryId),
      finesData.statisticsForDormitory(dormitoryId),
    ])
      .then(([d, i, s]) => {
        if (cancelled) return;
        setDormers(d);
        setImpositions(i);
        setStatistics(s);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dormitoryId]);

  const filteredDormers = useMemo(() => {
    return dormers.filter((dormer) => {
      const matchesSearch = `${dormer.first_name} ${dormer.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (statusFilter === "All") return matchesSearch;
      const own = impositions.filter((i) => i.dormer_id === dormer.id);
      const hasUnpaid = own.some((i) => i.amount_paid < i.amount);
      const hasPaid = own.some((i) => i.status === "Paid");
      if (statusFilter === "Unpaid") return matchesSearch && hasUnpaid;
      if (statusFilter === "Paid")
        return matchesSearch && hasPaid && !hasUnpaid;
      return matchesSearch;
    });
  }, [dormers, impositions, searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDormers.length / itemsPerPage)
  );
  const paginatedDormers = filteredDormers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return {
    dormers,
    impositions,
    statistics,
    loading,
    paginatedDormers,
    filteredDormers,
    totalPages,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    handleNextPage,
    handlePreviousPage,
    dormitoryId,
  };
}

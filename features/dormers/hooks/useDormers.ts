"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { dormersData } from "@/features/dormers/data";
import { paymentsData } from "@/features/payments/data";
import { regularChargesData } from "@/features/regular-charges/data";
import type { Dormer, DormerWithBills } from "@/features/dormers/data";
import type { Bill } from "@/features/payments/data";
import type { RegularCharge } from "@/features/regular-charges/data";

/**
 * Mirrors the old `useDormers` hook surface: pulls dormers + bills + regular
 * charges for the active dormitory, applies search/filter, paginates.
 */
export function useDormers() {
  const { user } = useAuth();
  const dormitoryId = user?.dormitoryId ?? null;

  const [dormers, setDormers] = useState<Dormer[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [payables, setPayables] = useState<RegularCharge[]>([]);
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
      paymentsData.listBillsForDormitory(dormitoryId),
      regularChargesData.listForDormitory(dormitoryId),
    ])
      .then(([d, b, p]) => {
        if (cancelled) return;
        setDormers(d);
        setBills(b);
        setPayables(p);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dormitoryId]);

  const dormersWithBills: DormerWithBills[] = useMemo(() => {
    if (!dormers.length) return [];
    return dormers.map((dormer) => ({
      ...dormer,
      bills: bills
        .filter((bill) => bill.dormer_id === dormer.id)
        .sort((a, b) =>
          a.billing_month < b.billing_month
            ? 1
            : a.billing_month > b.billing_month
              ? -1
              : 0
        ),
    }));
  }, [dormers, bills]);

  const filteredDormers = useMemo(() => {
    return dormersWithBills.filter((dormer) => {
      const matchesSearch = `${dormer.first_name} ${dormer.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || dormer.room_number === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [dormersWithBills, searchTerm, statusFilter]);

  const paginatedDormers = useMemo(() => {
    const lastIndex = currentPage * itemsPerPage;
    return filteredDormers.slice(lastIndex - itemsPerPage, lastIndex);
  }, [filteredDormers, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredDormers.length / itemsPerPage));

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
    bills,
    payables,
    loading,
    paginatedDormers,
    filteredDormers,
    totalPages,
    currentPage,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    handleNextPage,
    handlePreviousPage,
  };
}

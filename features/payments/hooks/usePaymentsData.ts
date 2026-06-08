"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { paymentsData } from "@/features/payments/data";
import type { BillWithPayments } from "@/features/payments/data";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";

export function usePaymentsData() {
  const {dormitoryId} = useDormitory();
  const { selected: selectedPeriod } = useAcademicPeriod();
  const academicPeriodId = selectedPeriod?.id ?? null;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [billingPeriodFilter, setBillingPeriodFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [combinedBillData, setCombinedBillData] = useState<BillWithPayments[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dormitoryId || !academicPeriodId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    paymentsData
      .listBillsForDormitoryWithPayments(dormitoryId, academicPeriodId)
      .then((rows) => {
        if (!cancelled) setCombinedBillData(rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dormitoryId, academicPeriodId]);

  const uniqueBillingPeriods = useMemo(() => {
    if (!combinedBillData.length) return [];
    return [
      ...new Set(combinedBillData.map((bill) => bill.billing_month)),
    ].sort();
  }, [combinedBillData]);

  const filteredBills = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return combinedBillData.filter((bill) => {
      const matchesSearch =
        bill.dormer_full_name.toLowerCase().includes(q) ||
        (bill.dormer_room ?? "").toLowerCase().includes(q) ||
        bill.billing_month.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All" || bill.status === statusFilter;
      const matchesBillingPeriod =
        billingPeriodFilter === "All" ||
        bill.billing_month === billingPeriodFilter;
      return matchesSearch && matchesStatus && matchesBillingPeriod;
    });
  }, [searchTerm, statusFilter, billingPeriodFilter, combinedBillData]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBills.length / itemsPerPage)
  );
  const paginatedBills = filteredBills.slice(
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
  }, [searchTerm, statusFilter, billingPeriodFilter]);

  const summaryStats = useMemo(() => {
    return combinedBillData.reduce(
      (acc, bill) => {
        const amountPaid = bill.amount_paid;
        acc.totalAmountDue += bill.total_amount_due;
        acc.totalAmountPaid += amountPaid;
        acc.totalRemainingBalance += bill.remaining_balance;
        return acc;
      },
      { totalAmountDue: 0, totalAmountPaid: 0, totalRemainingBalance: 0 }
    );
  }, [combinedBillData]);

  return {
    loading,
    paginatedBills,
    uniqueBillingPeriods,
    filteredBills,
    combinedBillData,
    setCombinedBillData,
    summaryStats,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    billingPeriodFilter,
    setBillingPeriodFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    handleNextPage,
    handlePreviousPage,
    dormitoryId,
  };
}

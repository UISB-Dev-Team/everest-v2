"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { expensesData } from "@/features/expenses/data";
import type { ExpenseSummaryStats, ExpenseWithRecorder } from "@/features/expenses/data";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";

export function useExpensesData() {
  const { dormitoryId } = useDormitory();
  const { selected: selectedPeriod } = useAcademicPeriod();

  const [expenses, setExpenses] = useState<ExpenseWithRecorder[]>([]);
  const [summary, setSummary] = useState<ExpenseSummaryStats>({
    totalExpenses: 0,
    monthlyExpenses: 0,
    topCategory: "—",
    expensesByCategory: {},
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // refresh just bumps the key — the effect below re-runs with fresh closure values
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!dormitoryId || !selectedPeriod?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      expensesData.listForDormitory(dormitoryId, selectedPeriod.id),
      expensesData.summaryForDormitory(dormitoryId, selectedPeriod.id),
    ])
      .then(([list, stats]) => {
        if (cancelled) return;
        setExpenses(list);
        setSummary(stats);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [dormitoryId, selectedPeriod?.id, refreshKey]);

  const filteredExpenses = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return expenses.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(q) ||
        (e.description ?? "").toLowerCase().includes(q) ||
        (e.recordedByFullName ?? "").toLowerCase().includes(q);
      const matchesCategory =
        categoryFilter === "All" || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / itemsPerPage));
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [searchTerm, categoryFilter]);

  return {
    expenses,
    filteredExpenses,
    paginatedExpenses,
    summary,
    loading,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    handleNextPage: () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); },
    handlePreviousPage: () => { if (currentPage > 1) setCurrentPage(currentPage - 1); },
    refresh,
  };
}
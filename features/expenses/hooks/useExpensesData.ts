"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { expensesData } from "@/features/expenses/data";
import type {
  ExpenseSummaryStats,
  ExpenseWithRecorder,
} from "@/features/expenses/data";

export function useExpensesData() {
  const { user } = useAuth();
  const dormitoryId = user?.dormitoryId ?? null;

  const [expenses, setExpenses] = useState<ExpenseWithRecorder[]>([]);
  const [summary, setSummary] = useState<ExpenseSummaryStats>({
    totalExpenses: 0,
    monthlyExpenses: 0,
    topCategory: "—",
    expensesByCategory: {},
  });
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const refresh = async () => {
    if (!dormitoryId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [list, stats] = await Promise.all([
        expensesData.listForDormitory(dormitoryId),
        expensesData.summaryForDormitory(dormitoryId),
      ]);
      setExpenses(list);
      setSummary(stats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!dormitoryId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      expensesData.listForDormitory(dormitoryId),
      expensesData.summaryForDormitory(dormitoryId),
    ])
      .then(([list, stats]) => {
        if (cancelled) return;
        setExpenses(list);
        setSummary(stats);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dormitoryId]);

  const filteredExpenses = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return expenses.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(q) ||
        (e.description ?? "").toLowerCase().includes(q) ||
        (e.recorded_by_full_name ?? "").toLowerCase().includes(q);
      const matchesCategory =
        categoryFilter === "All" || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredExpenses.length / itemsPerPage)
  );
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

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
    handleNextPage,
    handlePreviousPage,
    refresh,
  };
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useExpensesData } from "@/features/expenses/hooks/useExpensesData";
import { useExpensesActions } from "@/features/expenses/hooks/useExpensesActions";
import { handleExport } from "@/features/expenses/lib/csv-export";
import ExpensesHeader from "@/features/expenses/components/admin/expenses-header";
import SummaryExpense from "@/features/expenses/components/admin/summary-expenses";
import ExpensesFilter from "@/features/expenses/components/admin/expenses-filter";
import ExpensesTable from "@/features/expenses/components/admin/expenses-table";
import { ExpensesPageSkeleton } from "@/features/expenses/components/admin/expenses-page-skeleton";
import AddExpenseModal from "@/features/expenses/components/admin/add-expense-modal";
import ViewEditExpenseModal from "@/features/expenses/components/admin/view-edit-expense-modal";
import { expensesData, type ExpenseWithRecorder } from "@/features/expenses/data";
import { listForDormitory } from "@/features/dormers/data/supabase";

type ModalType = "add" | "view" | null;

export function AdminExpensesPage() {
  // ── 1. data ───────────────────────────────────────────────────────────────
  const {
    expenses,
    paginatedExpenses,
    filteredExpenses,
    summary,
    loading,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    currentPage,
    totalPages,
    handleNextPage,
    handlePreviousPage,
    refresh,
  } = useExpensesData();

  // ── 2. actions ────────────────────────────────────────────────────────────
  const {
    addExpense,
    updateExpense,
    deleteExpense,
    sendReport,
    isSendingEmail,
  } = useExpensesActions();

  // ── 3. ui state ───────────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithRecorder | null>(null);

  // ── 4. handlers ───────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setSelectedExpense(null);
    setModal("add");
  };

  const handleOpenView = (expense: ExpenseWithRecorder) => {
    setSelectedExpense(expense);
    setModal("view");
  };

  const handleCloseModal = () => {
    setModal(null);
    setSelectedExpense(null);
  };

  const handleAddExpense = async (input: any) => {
    await addExpense(input);
    refresh();
    handleCloseModal();
  };

  const handleUpdateExpense = async (id: string, input: any) => {
    await updateExpense(id, input);
    refresh();
    handleCloseModal();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await deleteExpense(expenseId);
    refresh();
  };

  const handleSendExpenses = async () => {
    await sendReport(expenses);
  };

  // ── 5. guard ──────────────────────────────────────────────────────────────
  if (loading) return <ExpensesPageSkeleton />;

  // ── 6. render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <ExpensesHeader
        onAdd={handleOpenAdd}
        onExport={() => handleExport(filteredExpenses)}
        onEmailReport={handleSendExpenses}
        isSendingEmail={isSendingEmail}
      />

      <SummaryExpense {...summary} />

      <ExpensesFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        paginatedExpenses={paginatedExpenses}
        filteredExpenses={filteredExpenses}
      />

      <ExpensesTable
        expenses={paginatedExpenses}
        onViewDetails={handleOpenView}
        onDelete={handleDeleteExpense}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 sm:py-4">
        <span className="text-xs sm:text-sm text-gray-600 font-medium">
          Page {currentPage} of {totalPages || 1}
        </span>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="flex-1 sm:flex-none border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="flex-1 sm:flex-none border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={modal === "add"}
        onClose={handleCloseModal}
        onSave={handleAddExpense}
      />

      <ViewEditExpenseModal
        isOpen={modal === "view"}
        onClose={handleCloseModal}
        expense={selectedExpense}
        onSave={handleUpdateExpense}
      />
    </div>
  );
}

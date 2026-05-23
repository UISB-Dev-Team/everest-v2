"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { handleExport } from "@/features/payments/lib/csv-export";
import { usePaymentsData } from "@/features/payments/hooks/usePaymentsData";
import { usePaymentActions } from "@/features/payments/hooks/usePaymentActions";
import PaymentHeader from "@/features/payments/components/admin/payment-header";
import SummaryCards from "@/features/payments/components/admin/summary-cards";
import PaymentsFilter from "@/features/payments/components/admin/payments-filter";
import PaymentsTable from "@/features/payments/components/admin/payments-table";
import PaymentDetailsModal from "@/features/payments/components/admin/list-of-payments-modal";
import PaymentModal from "@/features/payments/components/admin/payment-modal";
import { PaymentsPageSkeleton } from "@/features/payments/components/admin/payments-page-skeleton";
import type { BillWithPayments } from "@/features/payments/data";

type ModalType = "details" | "payment" | null;

export function AdminPaymentsPage() {
  // ── 1. data ───────────────────────────────────────────────────────────────
  const {
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
  } = usePaymentsData();

  // ── 2. actions ────────────────────────────────────────────────────────────
  const { handleRecordPayment } = usePaymentActions();

  // ── 3. ui state ───────────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedBill, setSelectedBill] = useState<BillWithPayments | null>(null);

  // Derive the live version of the selected bill so modals always reflect
  // the latest payment data without a round-trip re-fetch.
  const currentBill = selectedBill
    ? (combinedBillData.find((b) => b.id === selectedBill.id) ?? selectedBill)
    : null;

  // ── 4. handlers ───────────────────────────────────────────────────────────
  const handleOpenDetails = (bill: BillWithPayments) => {
    setSelectedBill(bill);
    setModal("details");
  };

  const handleOpenPayment = (bill: BillWithPayments) => {
    setSelectedBill(bill);
    setModal("payment");
  };

  const handleCloseModal = () => {
    setModal(null);
    setSelectedBill(null);
  };

  const handleSavePayment = async (paymentInput: any) => {
    await handleRecordPayment(paymentInput);

    // Optimistic update: reflect the new payment immediately in the list.
    setCombinedBillData((prev) =>
      prev.map((b) => {
        if (b.id !== selectedBill?.id) return b;
        const newAmountPaid = Math.min(
          (b.amount_paid ?? 0) + paymentInput.amount,
          b.total_amount_due
        );
        const remaining = Math.max(b.total_amount_due - newAmountPaid, 0);
        return {
          ...b,
          amount_paid: newAmountPaid,
          remaining_balance: remaining,
          status: remaining === 0 ? "Paid" : newAmountPaid > 0 ? "Partial" : "Unpaid",
          payments: [...b.payments, paymentInput],
        };
      })
    );

    handleCloseModal();
  };

  // ── 5. guard ──────────────────────────────────────────────────────────────
  if (loading) return <PaymentsPageSkeleton />;

  // ── 6. render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <PaymentHeader onExport={() => handleExport(filteredBills)} />

      <SummaryCards
        totalAmountDue={summaryStats.totalAmountDue}
        totalAmountPaid={summaryStats.totalAmountPaid}
        totalRemainingBalance={summaryStats.totalRemainingBalance}
      />

      <PaymentsFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        billingPeriodFilter={billingPeriodFilter}
        setBillingPeriodFilter={setBillingPeriodFilter}
        billingPeriods={uniqueBillingPeriods}
        paginatedBills={paginatedBills}
        filteredBills={filteredBills}
        setCurrentPage={setCurrentPage}
      />

      <PaymentsTable
        bills={paginatedBills}
        onViewDetails={handleOpenDetails}
        onRecordPayment={handleOpenPayment}
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
      <PaymentDetailsModal
        isOpen={modal === "details"}
        onClose={handleCloseModal}
        bill={currentBill}
      />

      <PaymentModal
        isOpen={modal === "payment"}
        onClose={handleCloseModal}
        bill={currentBill}
        onSavePayment={handleSavePayment}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
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
import { useAuth } from "@/features/auth/hooks/useAuth";

export function AdminPaymentsPage() {
  
  const user = useAuth()
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

  const { handleRecordPayment } = usePaymentActions();

  const [selectedBill, setSelectedBill] = useState<BillWithPayments | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Keep selectedBill in sync with live data so the details modal
  // always reflects the latest payments after a new payment is recorded.
  useEffect(() => {
    if (!selectedBill) return;
    const updated = combinedBillData.find((b) => b.id === selectedBill.id);
    if (updated) setSelectedBill(updated);
  }, [combinedBillData]);

  if (loading) return <PaymentsPageSkeleton />;

  const handleViewDetails = (bill: BillWithPayments) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const openPaymentModalForBill = (bill: BillWithPayments) => {
    setSelectedBill(bill);
    setIsPaymentModalOpen(true);
  };

  const handlePayment = async (paymentInput: any) => {
    await handleRecordPayment(paymentInput);

    setCombinedBillData(prev =>
      prev.map(b => {
        if (b.id !== selectedBill?.id) return b;

        const newAmountPaid = Math.min((b.amount_paid ?? 0) + paymentInput.amount, b.total_amount_due);
        const remaining = Math.max(b.total_amount_due - newAmountPaid, 0);
        const newStatus = remaining == 0 ? "Paid" : newAmountPaid > 0 ? "Partial" : "Unpaid";

        return {
          ...b,
          amount_paid: newAmountPaid,
          remaining_balance: Math.max(0, remaining),
          status: newStatus,
          payments: [
            ...b.payments,
            {
              ...paymentInput,
              recorded_by_full_name: user.user?.fullName, // fill in if you have the recorder's name in context
              recorded_by_email: user.user?.email,
            },
          ],
        };
      })
    );

    closePaymentModal();
  };

  const closePaymentModal = () => setIsPaymentModalOpen(false);

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
        onViewDetails={handleViewDetails}
        onRecordPayment={openPaymentModalForBill}
      />

      <PaymentDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bill={selectedBill}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        bill={selectedBill}
        onSavePayment={handlePayment}
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
    </div>
  );
}

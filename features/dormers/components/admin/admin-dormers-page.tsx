"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBillingPeriodLabel } from "@/lib/utils/billing-periods";
import { useDormers } from "@/features/dormers/hooks/useDormers";
import { useDormerActions } from "@/features/dormers/hooks/useDormerActions";
import { useModal } from "@/features/dormers/hooks/useModal";
import { useBills } from "@/features/dormers/hooks/usBills";
import { useRegularCharges } from "@/features/regular-charges/hooks/useRegularCharges";
import { usePaymentActions } from "@/features/payments/hooks/usePaymentActions";
import { handleExport } from "@/features/dormers/lib/csv-export";
import DormerHeader from "@/features/dormers/components/admin/dormer-header";
import DormerFilters from "@/features/dormers/components/admin/dormer-filters";
import DormersTable from "@/features/dormers/components/admin/dormers-table";
import AddDormerModal from "@/features/dormers/components/admin/add-dormer-modal";
import EditDormerModal from "@/features/dormers/components/admin/edit-dormer-modal";
import DeleteDormerModal from "@/features/dormers/components/admin/delete-dormer-modal";
import { DormersPageSkeleton } from "@/features/dormers/components/admin/dormers-page-skeleton";
import { PlaceholderModal } from "@/features/dormers/components/admin/placeholder-modal";
import BillsModal from "./bills-modal";
import GenerateBillModal from "./generate-bill-modal";
import PaymentModal from "./payments-modal";
import type { Bill } from "@/features/payments/data";
import ImportDormerModal from "./import-dormer-modal";
import { CreateDormerInput, ImportedBill } from "../../data";
import ImportBillsModal from "./import-bills-modal";
import { RegularCharge } from "@/features/regular-charges/data";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { BILLING_PERIODS } from "@/lib/constants/billing-periods";
import { DataPagination } from "@/components/ui/shared";

export function AdminDormersPage() {
  // ── 1. data ───────────────────────────────────────────────────────────────
  const {
    dormers,
    setDormers,
    bills,
    setBills,
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
  } = useDormers();

  // ── 2. actions ────────────────────────────────────────────────────────────
  const { saveDormer, updateDormer, deleteDormer, importDormers } = useDormerActions(
    dormers,
    bills,
    setDormers,
    setBills
  );
  const { payables } = useRegularCharges();
  const { generateBill, generateBillsBulk, deleteBill, importBills } = useBills();
  const { handleRecordPayment, handlePayAllBills } = usePaymentActions();

  // ── 3. modal state ────────────────────────────────────────────────────────
  const { modal, selectedDormer, openModal, closeModal } = useModal();

  // ── 4. ui state (confirm-dialog level only) ───────────────────────────────
  // `pendingBill` holds bill data staged for creation/overwrite confirmation.
  // This is intentionally separate from useModal's selectedBill, which tracks
  // an already-existing bill for payment recording.
  const [pendingBill, setPendingBill] = useState<Bill | null>(null);
  const [bulkDuplicates, setBulkDuplicates] = useState<any[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showBulkConfirmDialog, setShowBulkConfirmDialog] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isBillSubmitting, setIsBillSubmitting] = useState(false);
  const [isImportingBills, setIsImportingBills] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // ── 5. handlers ───────────────────────────────────────────────────────────
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
  };

  const handleGenerateBill = async (billData: any) => {
    setIsBillSubmitting(true);
    try {
      const dormer = selectedDormer;
      const newBill = await generateBill(billData, dormer!);
      if (!newBill) return;
      const bill = newBill as Bill;

      setDormers((prev) =>
        prev.map((d) => {
          if (d.id !== billData.dormer_id) return d;
          const exists = d.bills.some((b) => b.id === bill.id);
          return {
            ...d,
            bills: exists
              ? d.bills.map((b) => (b.id === bill.id ? bill : b))
              : [...d.bills, bill],
          };
        })
      );

      setBills((prev: Bill[]) => {
        const exists = prev.some((b) => b.id === bill.id);
        return exists
          ? prev.map((b) => (b.id === bill.id ? bill : b))
          : [...prev, bill];
      });

      closeModal();
    } catch (err) {
      console.error("Failed to generate bill:", err);
    } finally {
      setIsBillSubmitting(false);
    }
  };

  const handleGenerateBulkBills = async (billsData: any[]) => {
    setIsBillSubmitting(true);
    try {
      const newBills = await generateBillsBulk(billsData, selectedDormer!);
      if (!newBills) return;
      const bills = newBills as Bill[];

      setDormers((prev) =>
        prev.map((d) => {
          const dormerBills = bills.filter((b) => b.dormer_id === d.id);
          if (dormerBills.length === 0) return d;

          const updatedBills = [...d.bills];
          for (const bill of dormerBills) {
            const idx = updatedBills.findIndex((b) => b.id === bill.id);
            if (idx !== -1) updatedBills[idx] = bill;
            else updatedBills.push(bill);
          }
          return { ...d, bills: updatedBills };
        })
      );

      setBills((prev: Bill[]) => {
        const updated = [...prev];
        for (const bill of bills) {
          const idx = updated.findIndex((b) => b.id === bill.id);
          if (idx !== -1) updated[idx] = bill;
          else updated.push(bill);
        }
        return updated;
      });

      closeModal();
    } catch (err) {
      console.error("Failed to generate bill:", err);
    } finally {
      setIsBillSubmitting(false);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    setIsBillSubmitting(true);
    await deleteBill(billId);
    setBills((prev) => prev.filter((b) => b.id !== billId));
    setIsBillSubmitting(false);
    closeModal();
  };

  const handleSavePayment = async (paymentData: any) => {
    setIsBillSubmitting(true);
    await handleRecordPayment(paymentData, selectedDormer!);
    setBills((prev: Bill[]) =>
      prev.map((b) => {
        if (b.id !== paymentData.bill_id) return b;
        const newAmountPaid = (b.amount_paid ?? 0) + paymentData.amount_paid;
        const remaining = b.total_amount_due - newAmountPaid;
        return {
          ...b,
          amount_paid: newAmountPaid,
          status: remaining <= 0 ? "Paid" : newAmountPaid > 0 ? "Partial" : "Unpaid",
        };
      })
    );
    setIsBillSubmitting(false);
    closeModal();
  };

  const handleImportDormers = async (dormers: CreateDormerInput[]) => {
    await importDormers(dormers);
    closeModal();
  }

  const handlePayAll = async () => {
    if (!selectedDormer) return;

    const unpaidBills: Bill[] = bills.filter(
      (b) =>
        b.dormer_id === selectedDormer.id &&
        (b.status === "Unpaid" || b.status === "Partial")
    );
    if (unpaidBills.length === 0) return;

    await handlePayAllBills(unpaidBills, selectedDormer!)

    setBills((prev: Bill[]) =>
      prev.map((b) => {
        if (!unpaidBills.some((ub) => ub.id === b.id)) return b;
        return { ...b, amount_paid: b.total_amount_due, status: "Paid" };
      })
    );

    setDormers((prev) =>
      prev.map((d) => {
        if (d.id !== selectedDormer.id) return d;
        return {
          ...d,
          bills: d.bills.map((b) =>
            unpaidBills.some((ub) => ub.id === b.id)
              ? { ...b, amount_paid: b.total_amount_due, status: "Paid" }
              : b
          ),
        };
      })
    );
  };

  const handleConfirmCreateBill = async (billData: any) => {
    setIsBillSubmitting(true);
    await generateBill(billData, selectedDormer!);
    setIsBillSubmitting(false);
    setShowConfirmDialog(false);
  };

  const handleConfirmBulkOverwrite = async () => {
    setIsImportingBills(true);
    const billsData = bulkDuplicates.map((d) => d.bill);
    await generateBillsBulk(billsData, selectedDormer!);
    setIsImportingBills(false);
    setShowBulkConfirmDialog(false);
  };

  const handleImportBills = async (bills: ImportedBill[], payable: RegularCharge | null) => {
    setIsImportingBills(true);
    const result = await importBills(bills, payable!);
    setIsImportingBills(false);
    setShowBulkConfirmDialog(false);
    
    if (result.createdBills && result.createdBills.length > 0) {
      const newBills = result.createdBills;
      
      setDormers((prev) =>
        prev.map((d) => {
          const dormerBills = newBills.filter((b) => b.dormer_id === d.id);
          if (dormerBills.length === 0) return d;

          const updatedBills = [...d.bills];
          for (const bill of dormerBills) {
            const idx = updatedBills.findIndex((b) => b.id === bill.id);
            if (idx !== -1) updatedBills[idx] = bill;
            else updatedBills.push(bill);
          }
          return { ...d, bills: updatedBills };
        })
      );

      setBills((prev: Bill[]) => {
        const updated = [...prev];
        for (const bill of newBills) {
          const idx = updated.findIndex((b) => b.id === bill.id);
          if (idx !== -1) updated[idx] = bill;
          else updated.push(bill);
        }
        return updated;
      });
    }

    return result;
  }

  // ── 6. guard ──────────────────────────────────────────────────────────────
  if (loading) return <DormersPageSkeleton />;

  // ── 7. render ─────────────────────────────────────────────────────────────
  const hasFilters = searchTerm !== "" || statusFilter !== "All";

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <DormerHeader
        onAddDormer={() => openModal("add")}
        onImport={() => openModal("import")}
        onImportBills={() => openModal("importBills")}
        onExport={() => handleExport(dormers)}
      />

      <DormerFilters
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        count={filteredDormers.length}
        resetFilter={handleResetFilters}
      />

      <DormersTable
        dormers={paginatedDormers}
        onGenerateBill={(d) => openModal("generateBill", d)}
        onViewBills={(d) => openModal("bills", d)}
        onEdit={(d) => openModal("edit", d)}
        onDelete={(d) => openModal("deleteDormer", d)}
        hasFilters={hasFilters}
        onResetFilters={handleResetFilters}
      />

      {totalPages > 1 && (
        <DataPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          totalItems={filteredDormers.length}
          itemLabel="dormer"
        />
      )}

      {/* ── Modals ── */}
      <AddDormerModal
        isOpen={modal === "add"}
        onClose={closeModal}
        onSave={saveDormer}
      />

      <EditDormerModal
        isOpen={modal === "edit"}
        onClose={closeModal}
        onUpdate={updateDormer}
        dormerData={selectedDormer}
      />

      <DeleteDormerModal
        isOpen={modal === "deleteDormer"}
        onClose={closeModal}
        dormer={selectedDormer}
        onConfirm={deleteDormer}
      />

      <BillsModal
        isOpen={modal === "bills"}
        onClose={closeModal}
        dormer={selectedDormer}
        onRecordPayment={(b) => { openModal("payment", selectedDormer); setSelectedBill(b as Bill); }}
        onPayAll={handlePayAll}
        payables={payables}
        onDeleteBill={handleDeleteBill}
      />

      <GenerateBillModal
        isOpen={modal === "generateBill"}
        onClose={closeModal}
        dormer={selectedDormer}
        onGenerateBill={handleGenerateBill}
        onGenerateBillsBulk={handleGenerateBulkBills}
        payables={payables}
        bills={bills}
        setShowConfirmDialog={setShowConfirmDialog}
        setShowErrorModal={setShowErrorModal}
        setBillToCreate={setPendingBill}
      />

      <PaymentModal
        isOpen={modal === "payment"}
        onClose={closeModal}
        dormer={selectedDormer}
        bill={selectedBill}
        onSavePayment={handleSavePayment}
      />

      <ImportDormerModal
        isOpen={modal === "import"}
        onClose={closeModal}
        onImport={handleImportDormers}
        isSubmitting={false}
      />

      <ImportBillsModal
        isOpen={modal === "importBills"}
        onClose={closeModal}
        onImport={handleImportBills}
        isSubmitting={isImportingBills}
        payables={payables}
        billingPeriods={BILLING_PERIODS}
      />

      {/* ── Confirm dialogs ── */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-red-100 text-red-800">
          <DialogTitle className={undefined}>Overwrite Existing Bill?</DialogTitle>
          <DialogDescription className={undefined}>
            A bill for this dormer and billing period already exists. Do you
            want to overwrite it with the new data?
          </DialogDescription>
          <DialogFooter className={undefined}>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isBillSubmitting}
              className={undefined}
              size={undefined}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleConfirmCreateBill(pendingBill)}
              disabled={isBillSubmitting}
              variant={undefined}
              size={undefined}
            >
              {isBillSubmitting ? "Overwriting..." : "Overwrite Bill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className={undefined}>
          <DialogTitle className={undefined}>Error</DialogTitle>
          <DialogDescription className={undefined}>
            An existing payment for this bill already exists. You cannot
            override or delete it.
          </DialogDescription>
          <DialogFooter className={undefined}>
            <Button
              onClick={() => setShowErrorModal(false)}
              className={undefined}
              variant={undefined}
              size={undefined}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkConfirmDialog} onOpenChange={setShowBulkConfirmDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogTitle className="text-red-600">
            Confirm Overwrite of Existing Bills
          </DialogTitle>
          <DialogDescription className="mb-4">
            The following bills already exist and will be overwritten with new
            data. This action cannot be undone.
          </DialogDescription>
          <div className="max-h-96 overflow-y-auto border rounded-md">
            <Table className={undefined}>
              <TableHeader className={undefined}>
                <TableRow className={undefined}>
                  <TableHead className="w-16">Row</TableHead>
                  <TableHead className={undefined}>Name</TableHead>
                  <TableHead className={undefined}>Email</TableHead>
                  <TableHead className={undefined}>Billing Period</TableHead>
                  <TableHead className={undefined}>Room</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={undefined}>
                {bulkDuplicates.map(({ bill }) => (
                  <TableRow
                    key={`${bill.email}-${bill.billingPeriod}`}
                    className={undefined}
                  >
                    <TableCell className="font-medium">{bill.rowNumber}</TableCell>
                    <TableCell className={undefined}>
                      {bill.firstName} {bill.lastName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {bill.email}
                    </TableCell>
                    <TableCell className={undefined}>
                      {getBillingPeriodLabel(bill.billingPeriod)}
                    </TableCell>
                    <TableCell className={undefined}>
                      {dormers.find((d) => d.id === bill.dormerId)?.room_number ?? "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowBulkConfirmDialog(false)}
              disabled={isImportingBills}
              className={undefined}
              size={undefined}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmBulkOverwrite}
              disabled={isImportingBills}
              variant={undefined}
              size={undefined}
            >
              {isImportingBills ? "Overwriting..." : "Overwrite Bills"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

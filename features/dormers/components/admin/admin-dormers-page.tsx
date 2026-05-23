"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBillingPeriodLabel } from "@/lib/utils/billing-periods";
import { useDormers } from "@/features/dormers/hooks/useDormers";
import { useDormerActions } from "@/features/dormers/hooks/useDormerActions";
import { useModal } from "@/features/dormers/hooks/useModal";
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
import { useRegularCharges } from "@/features/regular-charges/hooks/useRegularCharges";
import { Bill } from "@/features/payments/data";
import GenerateBillModal from "./generate-bill-modal";
import { regularChargesData } from "@/features/regular-charges/data";
import { useBills } from "../../hooks/usBills";
import { useState } from "react";
import PaymentModal from "./payments-modal";
import { DormerWithBills } from "../../data";
import { usePaymentActions } from "@/features/payments/hooks/usePaymentActions";

export function AdminDormersPage() {

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showBulkConfirmDialog, setShowBulkConfirmDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [bulkDuplicates, setBulkDuplicates] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImportingBills, setIsImportingBills] = useState(false);
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

  const {
    saveDormer,
    updateDormer,
    deleteDormer,
    payAllBills,
  } = useDormerActions(dormers, bills, setDormers, setBills);

  const { payables } = useRegularCharges();

  const { generateBill, generateBillsBulk, deleteBill } = useBills()

  const { modal, selectedDormer, openModal, closeModal } = useModal();

  const { handleRecordPayment, handlePayAllBills } = usePaymentActions();

  const saveBill = async (billData: any, user: any) => {
    setIsSubmitting(true);
    await generateBill(billData);
    setIsSubmitting(false);
    setShowConfirmDialog(false);
  };

  const handleConfirmBulkOverwrite = async () => {
    setIsImportingBills(true);
    const billsData = bulkDuplicates.map(d => d.bill);
    await generateBillsBulk(billsData);
    setIsImportingBills(false);
    setShowBulkConfirmDialog(false);
  };

  const handleDeleteBill = async (billId: string) => {
    setIsSubmitting(true);
    await deleteBill(billId);
    setBills((prev) => prev.filter((b) => b.id !== billId));
    setIsSubmitting(false);
    closeModal();
  };

  const handleGenerateBill = async (billData: any) => {
    setIsSubmitting(true);
    try {
      const newBill = await generateBill(billData);
      if(!newBill) return;
      const bill = newBill as Bill; // ✅ narrow the type once

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
      setIsSubmitting(false);
    }
  };
  const handleSavePayment = async(paymentData: any) => {
    setIsSubmitting(true);
    await handleRecordPayment(paymentData);
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
    setIsSubmitting(false);
    closeModal();
  }

  if (loading) return <DormersPageSkeleton />;

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
  };

  const handlePayAll = async () => {
    if (!selectedDormer) return;

    const unpaidBills: Bill[] = bills.filter(
      (b) => b.dormer_id === selectedDormer.id && (b.status === "Unpaid" || b.status === "Partial")
    );

    if (unpaidBills.length === 0) return;

    await handlePayAllBills(unpaidBills);

    // ✅ optimistic update for bills list
    setBills((prev: Bill[]) =>
      prev.map((b) => {
        if (!unpaidBills.some((ub) => ub.id === b.id)) return b;
        return {
          ...b,
          amount_paid: b.total_amount_due,
          status: "Paid",
        };
      })
    );

    // ✅ optimistic update for dormers
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
        resetFilter={resetFilters}
      />

      <DormersTable
        dormers={paginatedDormers}
        onGenerateBill={(d) => openModal("generateBill", d)}
        onViewBills={(d) => openModal("bills", d)}
        onEdit={(d) => openModal("edit", d)}
        onDelete={(d) => openModal("deleteDormer", d)}
        hasFilters={hasFilters}
        onResetFilters={resetFilters}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-3 py-2">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            size="sm"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            size="sm"
          >
            Next
          </Button>
        </div>
      )}

      {/* Wired modals */}
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
        onRecordPayment={(b) => {
          setSelectedBill(b as Bill);   // ✅ set bill first
          openModal("payment", selectedDormer, b as Bill);          // ✅ don't pass bill as dormer
        }}
        onPayAll={handlePayAll}
        payables={payables}
        onDeleteBill={handleDeleteBill}
      />

      <GenerateBillModal
        isOpen={modal === "generateBill"}
        onClose={closeModal}
        dormer={selectedDormer}
        onGenerateBill={handleGenerateBill}
        onGenerateBillsBulk={generateBillsBulk}
        payables={payables}
        bills={bills}
        setShowConfirmDialog={setShowConfirmDialog}
        setShowErrorModal={setShowErrorModal}
        setBillToCreate={setSelectedBill}
      />

      <PaymentModal
        isOpen={modal === "payment"}
        onClose={closeModal}
        dormer={selectedDormer}        // ✅ actual dormer from useModal
        bill={selectedBill}            // ✅ actual bill from state
        onSavePayment={handleSavePayment}
      />

      {/* Placeholders — to be ported in a follow-up batch */}

      <PlaceholderModal
        isOpen={modal === "import"}
        onClose={closeModal}
        title="Import Dormers (CSV)"
        description="CSV import flow with preview, validation, and error reporting. Full ImportDormerModal port pending."
      />
      <PlaceholderModal
        isOpen={modal === "importBills"}
        onClose={closeModal}
        title="Import Bills (CSV)"
        description="Bulk bill import with conflict detection. Full ImportBillsModal port pending."
      />

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-red-100 text-red-800">
          <DialogTitle className={undefined}>
            Overwrite Existing Bill?
          </DialogTitle>
          <DialogDescription className={undefined}>
            A bill for this dormer and billing period already exists. Do you
            want to overwrite it with the new data?
          </DialogDescription>
          <DialogFooter className={undefined}>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
              className={undefined}
              size={undefined}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => generateBill(selectedBill)}
              disabled={isSubmitting}
              variant={undefined}
              size={undefined}
            >
              {isSubmitting ? "Overwriting..." : "Overwrite Bill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showErrorModal}
        onOpenChange={setShowErrorModal}
      >
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
            The following bills already exist and will be overwritten with new data. This action cannot be undone.
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
                  <TableRow key={`${bill.email}-${bill.billingPeriod}`} className={undefined}>
                    <TableCell className="font-medium">{bill.rowNumber}</TableCell>
                    <TableCell className={undefined}>{bill.firstName} {bill.lastName}</TableCell>
                    <TableCell className="text-sm text-gray-600">{bill.email}</TableCell>
                    <TableCell className={undefined}>{getBillingPeriodLabel(bill.billingPeriod)}</TableCell>
                    <TableCell className={undefined}>{dormers.find(d => d.id === bill.dormerId)?.room_number || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowBulkConfirmDialog(false)}
              disabled={isImportingBills} className={undefined} size={undefined}            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmBulkOverwrite}
              disabled={isImportingBills} variant={undefined} size={undefined}            >
              {isImportingBills ? "Overwriting..." : "Overwrite Bills"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

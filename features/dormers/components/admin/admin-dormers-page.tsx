"use client";

import { Button } from "@/components/ui/button";
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

export function AdminDormersPage() {
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
  } = useDormerActions(dormers, bills, setDormers, setBills);

  const { modal, selectedDormer, openModal, closeModal } = useModal();

  if (loading) return <DormersPageSkeleton />;

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
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

      {/* Placeholders — to be ported in a follow-up batch */}
      <PlaceholderModal
        isOpen={modal === "bills"}
        onClose={closeModal}
        title="Bills"
        description={`View bills for ${selectedDormer?.first_name ?? ""} ${selectedDormer?.last_name ?? ""}. Full BillsModal port pending.`}
      />
      <PlaceholderModal
        isOpen={modal === "payment"}
        onClose={closeModal}
        title="Record Payment"
      />
      <PlaceholderModal
        isOpen={modal === "generateBill"}
        onClose={closeModal}
        title="Generate Bill"
        description={`Generate a new bill for ${selectedDormer?.first_name ?? ""} ${selectedDormer?.last_name ?? ""}. Full GenerateBillModal port pending.`}
      />
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
    </div>
  );
}

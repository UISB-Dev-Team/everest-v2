"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";
import { useFinesAdminData } from "@/features/fines/hooks/useFinesAdminData";
import { useFinesActions } from "@/features/fines/hooks/useFinesActions";
import { useFinesModal } from "@/features/fines/hooks/useFinesModal";
import FinesHeader from "@/features/fines/components/admin/fines-header";
import FinesSummary from "@/features/fines/components/admin/fines-summary";
import FinesTable from "@/features/fines/components/admin/fines-table";
import { FinesPageSkeleton } from "@/features/fines/components/admin/fines-page-skeleton";
import FinePaymentModal from "@/features/fines/components/admin/fine-payment-modal";
import RoomFineModal from "@/features/fines/components/admin/room-fine-modal";
import { PlaceholderModal } from "@/features/fines/components/admin/placeholder-modal";
import FinesPaymentModal from "@/features/fines/components/admin/fines-payment-modal";
import { DataPagination, FilterOption, FiltersBar } from "@/components/ui/shared";
import GenerateFinesModal from "./generate-fines-modal";
import { CreateFineImpositionInput } from "../../data";
import { toast } from "sonner";

export function AdminFinesPage() {
  const { user } = useAuth();
  const { selected: period } = useAcademicPeriod();
  const {
    dormers,
    fines,
    statistics,
    loading,
    paginatedDormers,
    filteredDormers,
    rooms,
    totalPages,
    currentPage,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    roomFilter,
    setRoomFilter,
    sortValue,
    setSortValue,
    sortOptions,
    statusOptions,
    roomOptions,
    handleNextPage,
    handlePreviousPage,
  } = useFinesAdminData();

  const {
    imposeRoomFine,
    imposeFine,
    recordFinePayment,
    sendUnpaidReminder,
    isSubmitting,
  } = useFinesActions();

  const { modal, openModal, closeModal, selectedDormer, selectedFineImposition } = useFinesModal();

  if (loading) return <FinesPageSkeleton />;

  const hasFilters = searchTerm !== "" || statusFilter !== "All" || roomFilter !== "All" || sortValue !== "name-asc";
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setRoomFilter("All");
    setSortValue("name-asc");
  };

  const handleGenerateFine = async (input: CreateFineImpositionInput) => {
    await imposeFine(input);
    toast.success("Fine generated successfully");
    closeModal();
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <FinesHeader
        onImportAttendance={() => openModal("import")}
        onExportCSV={() => openModal("export")}
        onSendEmailReminders={() => sendUnpaidReminder()}
        onRoomFine={() => openModal("roomFine")}
      />

      <FinesSummary
        totalFines={statistics.totalFines}
        collectedFines={statistics.collectedFines}
        collectibleFines={statistics.collectibleFines}
      />

      <FiltersBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search dormers by name, room, or email…"
        filters={[
          {
            value: statusFilter,
            onValueChange: setStatusFilter,
            options: statusOptions,
            placeholder: "Filter by status",
            collapseOnMobile: true,
          },
          {
            value: roomFilter,
            onValueChange: setRoomFilter,
            options: roomOptions,
            placeholder: "Filter by room",
            collapseOnMobile: true,
          },
          {
            value: sortValue,
            onValueChange: setSortValue as (v: string) => void,
            options: sortOptions,
            placeholder: "Sort by name",
            collapseOnMobile: false,
          },
        ]}
        hasActiveFilters={hasFilters}
        onReset={resetFilters}
        resultCount={filteredDormers.length}
        resultLabel="dormer"
        activeFilterBadges={
          statusFilter !== "All" ? [{ label: statusFilter }] : []
        }
      />

      <FinesTable
        dormers={paginatedDormers}
        onGenerateFines={(d) => openModal("generate", d)}
        onViewFines={(d) => openModal("fines", d)}
        hasFilters={hasFilters}
        onResetFilters={resetFilters}
      />

      <DataPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        totalItems={filteredDormers.length}
        itemLabel="dormer"
      />

      {/* Wired modals */}
      <RoomFineModal
        isOpen={modal === "roomFine"}
        onClose={closeModal}
        dormers={dormers}
        isSubmitting={isSubmitting}
        onApply={async (roomNumber, amount, reason, dateImposed) => {
          if (!period || !user?.dormitoryId) return;
          const targets = dormers.filter((d) => d.room_number === roomNumber);
          await imposeRoomFine(
            targets.map((d) => ({
              fine_id: "fine-cat-1", // mock: use generic category — backend dev wires real category lookup
              academic_period_id: period.id,
              dormer_id: d.id,
              dormitory_id: user.dormitoryId!,
              amount,
              date_imposed: dateImposed.toISOString().split("T")[0],
              notes: reason,
            }))
          );
        }}
      />
      <FinePaymentModal
        isOpen={modal === "payment"}
        onClose={closeModal}
        fine={null}
        onSavePayment={async (input) => {
          await recordFinePayment(
            input.imposition_id,
            input.amount,
            input.payment_method
          );
          closeModal();
        }}
      />

      {/* Dormer fines management modal */}
      <FinesPaymentModal
        isOpen={modal === "fines"}
        onClose={closeModal}
        dormer={selectedDormer}
        recordFinePayment={recordFinePayment}
        isSubmitting={isSubmitting}
      />

      <GenerateFinesModal
        isOpen={modal === "generate"}
        onClose={closeModal}
        isSubmmitting={isSubmitting}
        dormer={selectedDormer}
        onGenerateFine={handleGenerateFine}
        payables={fines}
      />
      <PlaceholderModal
        isOpen={modal === "import"}
        onClose={closeModal}
        title="Import Attendance CSV"
        description="CSV import flow with preview, validation, and per-row error reporting. Full ImportAttendanceModal port pending."
      />
      <PlaceholderModal
        isOpen={modal === "export"}
        onClose={closeModal}
        title="Export Fines CSV"
        description="Filtered fines export with date range. Full ExportFinesModal port pending."
      />
    </div>
  );
}

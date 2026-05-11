"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCurrentAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";
import { useFinesAdminData } from "@/features/fines/hooks/useFinesAdminData";
import { useFinesActions } from "@/features/fines/hooks/useFinesActions";
import { useFinesModal } from "@/features/fines/hooks/useFinesModal";
import FinesHeader from "@/features/fines/components/admin/fines-header";
import FinesSummary from "@/features/fines/components/admin/fines-summary";
import FinesTable from "@/features/fines/components/admin/fines-table";
import FinesPagination from "@/features/fines/components/admin/fines-pagination";
import { FinesPageSkeleton } from "@/features/fines/components/admin/fines-page-skeleton";
import FinePaymentModal from "@/features/fines/components/admin/fine-payment-modal";
import RoomFineModal from "@/features/fines/components/admin/room-fine-modal";
import { PlaceholderModal } from "@/features/fines/components/admin/placeholder-modal";

export function AdminFinesPage() {
  const { user } = useAuth();
  const { period } = useCurrentAcademicPeriod();
  const {
    dormers,
    statistics,
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
  } = useFinesAdminData();

  const {
    imposeRoomFine,
    recordFinePayment,
    sendUnpaidReminder,
    isSubmitting,
  } = useFinesActions();

  const { modal, openModal, closeModal } = useFinesModal();

  if (loading) return <FinesPageSkeleton />;

  const hasFilters = searchTerm !== "" || statusFilter !== "All";
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
  };

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

      <FinesTable
        dormers={paginatedDormers}
        onGenerateFines={(d) => openModal("generate", d)}
        onViewFines={(d) => openModal("fines", d)}
        hasFilters={hasFilters}
        onResetFilters={resetFilters}
      />

      <FinesPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
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

      {/* Placeholders */}
      <PlaceholderModal
        isOpen={modal === "fines"}
        onClose={closeModal}
        title="Manage Dormer Fines"
        description="Multi-tab fine management (impose / pay / waive / history). Full FinesModal port pending."
      />
      <PlaceholderModal
        isOpen={modal === "generate"}
        onClose={closeModal}
        title="Generate Fine"
        description="Impose a fine on a single dormer. Full GenerateFinesModal port pending."
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

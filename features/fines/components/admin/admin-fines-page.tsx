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
import RoomFineModal from "@/features/fines/components/admin/room-fine-modal";
import { PlaceholderModal } from "@/features/fines/components/admin/placeholder-modal";
import FinesPaymentModal from "@/features/fines/components/admin/fines-payment-modal";
import { DataPagination, FiltersBar } from "@/components/ui/shared";
import GenerateFinesModal from "./generate-fines-modal";
import ImportResultModal from "./import-result-modal";
import AttendanceChecklistModal from "./attendance-checklist-modal";
import { useAttendanceChecklist } from "@/features/fines/hooks/useAttendanceChecklist";
import { CreateFineImpositionInput, FineCategory } from "../../data";
import { toast } from "sonner";
import { dormersData } from "@/features/dormers/data";
import { sendEmail } from "@/lib/email";
import { roomFineImposedTemplate } from "@/emails/fines/roomFineImposed";
import { newFineImposedTemplate } from "@/emails/fines/newFineImposed";

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
    handleExport,
  } = useFinesActions();

  const { modal, openModal, closeModal, selectedDormer, selectedFineImposition } =
    useFinesModal();

  // ── Attendance checklist hook ──────────────────────────────────────────────
  const {
    handleAttendanceSubmit,
    isSubmitting: isAttendanceSubmitting,
    result: attendanceResult,
    clearResult,
  } = useAttendanceChecklist({
    imposeFine,
    academicPeriodId: period?.id ?? "",
    dormitoryId: user?.dormitoryId ?? "",
    dormers,
    payableFines: fines,
  });

  if (loading) return <FinesPageSkeleton />;

  const hasFilters =
    searchTerm !== "" ||
    statusFilter !== "All" ||
    roomFilter !== "All" ||
    sortValue !== "name-asc";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setRoomFilter("All");
    setSortValue("name-asc");
  };

  const handleGenerateFine = async (input: CreateFineImpositionInput) => {
    await imposeFine(input);
    const dormer = await dormersData.getById(input.dormer_id);
    if (!dormer) return;
    const finesPayload = [
      {
        finesRemarks: input.remarks || "No remarks",
        totalAmountDue: input.amount,
        dateImposed: new Date(input.date_imposed),
      },
    ];
    await sendEmail({
      to: dormer.email,
      subject: "Fine Imposed",
      html: newFineImposedTemplate(dormer.first_name, finesPayload),
    });
    toast.success("Fine generated successfully");
    closeModal();
  };

  const handleRoomFines = async (
    roomNumber: string,
    amount: number,
    reason: string,
    dateImposed: Date,
    fineCategorySelected: FineCategory
  ) => {
    if (!period || !user?.dormitoryId || !fineCategorySelected) return;
    const targets = await dormersData.getByRoom(roomNumber, user.dormitoryId, period.id);
    if (!targets || targets.length === 0) {
      console.error("No dormer found for room number:", roomNumber);
      return;
    }
    await imposeRoomFine(
      targets.map((d) => ({
        fine_id: fineCategorySelected.id,
        academic_period_id: period.id,
        dormer_id: d.id,
        dormitory_id: user.dormitoryId!,
        amount,
        date_imposed: dateImposed.toISOString().split("T")[0],
        remarks: reason,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        dormitory_enrollment_id: d.dormer_enrollment_id,
        notes: fineCategorySelected.name,
      }))
    );

    for (const dormer of targets) {
      await sendEmail({
        to: dormer.email,
        subject: "New Room Fine Imposed",
        html: roomFineImposedTemplate(roomNumber, amount, reason, dateImposed, targets.length),
      });
    }
    toast.success("Room fine imposed successfully");
    closeModal();
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <FinesHeader
        onImportAttendance={() => openModal("import")}
        onExportCSV={() => handleExport()}
        onSendEmailReminders={() => sendUnpaidReminder()}
        isSubmitting={isSubmitting}
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
        activeFilterBadges={statusFilter !== "All" ? [{ label: statusFilter }] : []}
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

      {/* ── Attendance checklist modal (replaces PlaceholderModal for "import") */}
      <AttendanceChecklistModal
        isOpen={modal === "import"}
        onClose={closeModal}
        dormers={dormers}
        payableFines={fines}
        roomNumbers={rooms}
        onSubmit={handleAttendanceSubmit}
        isSubmitting={isAttendanceSubmitting}
        // Scope cache per dormitory so concurrent SA sessions don't collide
        cacheKey={user?.dormitoryId ?? "default"}
      />

      {/* Result modal — reuse your existing ImportResultModal */}
      {attendanceResult && (
        <ImportResultModal
          isOpen={attendanceResult !== null}
          onClose={clearResult}
          successCount={attendanceResult.successCount}
          errorCount={attendanceResult.errorCount}
          errors={attendanceResult.errors}
        />
      )}

      {/* ── Existing modals ──────────────────────────────────────────────── */}
      <RoomFineModal
        isOpen={modal === "roomFine"}
        onClose={closeModal}
        dormers={dormers}
        fines={fines}
        isSubmitting={isSubmitting}
        onApply={handleRoomFines}
      />

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
        isOpen={modal === "export"}
        onClose={closeModal}
        title="Export Fines CSV"
        description="Filtered fines export with date range. Full ExportFinesModal port pending."
      />
    </div>
  );
}
"use client";

import { useState } from "react";
import { useAcademicPeriodsData } from "@/features/academic-periods/hooks/useAcademicPeriodsData";
import { useAcademicPeriodsActions } from "@/features/academic-periods/hooks/useAcademicPeriodsActions";
import HeaderAcademicPeriod from "@/features/academic-periods/components/super-admin/header-academic-period";
import AcademicPeriodsTable from "@/features/academic-periods/components/super-admin/academic-periods-table";
import AddEditAcademicPeriodModal from "@/features/academic-periods/components/super-admin/add-edit-academic-period-modal";
import DeleteAcademicPeriodModal from "@/features/academic-periods/components/super-admin/delete-academic-period-modal";
import { AcademicPeriodsPageSkeleton } from "@/features/academic-periods/components/super-admin/academic-periods-page-skeleton";
import type { AcademicPeriod } from "@/features/academic-periods/data";

export function AcademicPeriodsPage() {
  const { academicPeriods, loading, refresh } = useAcademicPeriodsData();
  const {
    addAcademicPeriod,
    updateAcademicPeriod,
    setAsCurrent,
    removeAcademicPeriod,
  } = useAcademicPeriodsActions();

  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<AcademicPeriod | null>(null);

  if (loading) return <AcademicPeriodsPageSkeleton />;

  return (
    <div className="min-h-screen bg-neutral-50">
      <HeaderAcademicPeriod
        onAddPeriod={() => {
          setSelected(null);
          setModal("add");
        }}
      />

      <div className="p-8">
        <AcademicPeriodsTable
          periods={academicPeriods}
          onEdit={(p) => {
            setSelected(p);
            setModal("edit");
          }}
          onDelete={(p) => {
            setSelected(p);
            setModal("delete");
          }}
          onSetCurrent={async (id) => {
            await setAsCurrent(id);
            await refresh();
          }}
        />
      </div>

      <AddEditAcademicPeriodModal
        isOpen={modal === "add" || modal === "edit"}
        mode={modal === "add" ? "add" : "edit"}
        period={selected}
        onClose={() => setModal(null)}
        onAdd={async (input) => {
          await addAcademicPeriod(input);
          await refresh();
        }}
        onUpdate={async (id, input) => {
          await updateAcademicPeriod(id, input);
          await refresh();
        }}
      />

      <DeleteAcademicPeriodModal
        isOpen={modal === "delete"}
        period={selected}
        onClose={() => setModal(null)}
        onDelete={async (id) => {
          await removeAcademicPeriod(id);
          await refresh();
        }}
      />
    </div>
  );
}
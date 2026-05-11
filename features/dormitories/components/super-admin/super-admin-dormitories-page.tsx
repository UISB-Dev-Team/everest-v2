"use client";

import { useState } from "react";
import { useDormitoriesData } from "@/features/dormitories/hooks/useDormitoriesData";
import { useDormitoriesActions } from "@/features/dormitories/hooks/useDormitoriesActions";
import HeaderDormitory from "@/features/dormitories/components/super-admin/header-dormitory";
import DormitoryTable from "@/features/dormitories/components/super-admin/dormitory-table";
import AddEditDormitoryModal from "@/features/dormitories/components/super-admin/add-edit-dormitory-modal";
import DeleteDormitoryModal from "@/features/dormitories/components/super-admin/delete-dormitory-modal";
import { DormitoriesPageSkeleton } from "@/features/dormitories/components/super-admin/dormitories-page-skeleton";
import type { DormitoryWithStats } from "@/features/dormitories/data";

export function SuperAdminDormitoriesPage() {
  const { dormitories, loading, refresh } = useDormitoriesData();
  const { addDormitory, updateDormitory, removeDormitory } =
    useDormitoriesActions();
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<DormitoryWithStats | null>(null);

  if (loading) return <DormitoriesPageSkeleton />;

  return (
    <div className="min-h-screen bg-neutral-50">
      <HeaderDormitory
        onAddDormitory={() => {
          setSelected(null);
          setModal("add");
        }}
      />

      <div className="p-8">
        <DormitoryTable
          dorms={dormitories}
          editDormitory={(d) => {
            setSelected(d);
            setModal("edit");
          }}
          deleteDormitory={(d) => {
            setSelected(d);
            setModal("delete");
          }}
        />
      </div>

      <AddEditDormitoryModal
        isOpen={modal === "add" || modal === "edit"}
        mode={modal === "add" ? "add" : "edit"}
        dormitory={selected}
        onClose={() => setModal(null)}
        onAdd={async (input) => {
          await addDormitory(input);
          await refresh();
        }}
        onUpdate={async (id, input) => {
          await updateDormitory(id, input);
          await refresh();
        }}
      />

      <DeleteDormitoryModal
        isOpen={modal === "delete"}
        dormitory={selected}
        onClose={() => setModal(null)}
        onDelete={async (id) => {
          await removeDormitory(id);
          await refresh();
        }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useAdvisersData } from "@/features/advisers/hooks/useAdvisersData";
import { useAdvisersActions } from "@/features/advisers/hooks/useAdvisersActions";
import AdviserHeader from "@/features/advisers/components/super-admin/adviser-header";
import AdvisersTable from "@/features/advisers/components/super-admin/advisers-table";
import AddEditAdviserModal from "@/features/advisers/components/super-admin/add-edit-adviser-modal";
import DeleteAdviserModal from "@/features/advisers/components/super-admin/delete-adviser-modal";
import { AdvisersPageSkeleton } from "@/features/advisers/components/super-admin/advisers-page-skeleton";
import type { Adviser } from "@/features/advisers/data";

export function SuperAdminAdvisersPage() {
  const { advisers, dormitories, loading, refresh } = useAdvisersData();
  const { addAdviser, updateAdviser, removeAdviser } = useAdvisersActions();
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Adviser | null>(null);

  if (loading) return <AdvisersPageSkeleton />;

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdviserHeader
        onAddAdviser={() => {
          setSelected(null);
          setModal("add");
        }}
      />

      <div className="p-8">
        <AdvisersTable
          advisers={advisers}
          onEdit={(a) => {
            setSelected(a);
            setModal("edit");
          }}
          onDelete={(a) => {
            setSelected(a);
            setModal("delete");
          }}
        />
      </div>

      <AddEditAdviserModal
        isOpen={modal === "add" || modal === "edit"}
        mode={modal === "add" ? "add" : "edit"}
        adviser={selected}
        dormitories={dormitories}
        onClose={() => setModal(null)}
        onAdd={async (input) => {
          await addAdviser(input);
          await refresh();
        }}
        onUpdate={async (input) => {
          await updateAdviser(input);
          await refresh();
        }}
      />

      <DeleteAdviserModal
        isOpen={modal === "delete"}
        adviser={selected}
        onClose={() => setModal(null)}
        onDelete={async (id) => {
          await removeAdviser(id);
          await refresh();
        }}
      />
    </div>
  );
}

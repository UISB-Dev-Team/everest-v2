"use client";

import { useState } from "react";
import type { Dormer } from "@/features/dormers/data";
import type { FineImpositionWithCategory } from "@/features/fines/data";

export type FinesModalType =
  | "fines"
  | "generate"
  | "payment"
  | "roomFine"
  | "import"
  | "importResult"
  | "export"
  | "error"
  | null;

export function useFinesModal() {
  const [modal, setModal] = useState<FinesModalType>(null);
  const [selectedDormer, setSelectedDormer] = useState<Dormer | null>(null);
  const [selectedFineImposition, setSelectedFineImposition] =
    useState<FineImpositionWithCategory | null>(null);

  const openModal = (
    modalType: FinesModalType,
    dormer: Dormer | null = null,
    finePayment: FineImpositionWithCategory | null = null
  ) => {
    setModal(modalType);
    setSelectedDormer(dormer);
    setSelectedFineImposition(finePayment);
  };

  const closeModal = () => {
    setModal(null);
    setSelectedDormer(null);
    setSelectedFineImposition(null);
  };

  return {
    modal,
    selectedDormer,
    selectedFineImposition,
    openModal,
    closeModal,
  };
}

"use client";

import { useState } from "react";
import type { Dormer, DormerWithBills, ModalType } from "@/features/dormers/data";
import type { Bill } from "@/features/payments/data";
import { getBillById } from "@/features/payments/data/supabase";

export function useModal() {
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedDormer, setSelectedDormer] = useState<DormerWithBills | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const openModal =  (
    modalType: ModalType,
    dormer: DormerWithBills | null = null,
    bill: Bill | null = null
  ) => {
    setModal(modalType);
    setSelectedDormer(dormer);
    setSelectedBill(bill);
  };

  const closeModal = () => {
    setModal(null);
    setSelectedDormer(null);
    setSelectedBill(null);
  };

  return {
    modal,
    selectedDormer,
    selectedBill,
    openModal,
    closeModal,
  };
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { finesData } from "@/features/fines/data";
import type {
  CreateFineCategoryInput,
  CreateFineImpositionInput,
  UpdateFineCategoryInput,
  UpdateFineImpositionInput,
} from "@/features/fines/data";
import { dormersData } from "@/features/dormers/data";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";

/**
 * Mirrors the old admin-side `useFinesAction` hook surface but routes every
 * mutation through the data-access seam. Email-sending is mocked with a toast.
 */
export function useFinesActions() {
  const { selected } = useAcademicPeriod();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const addFineCategory = async (input: CreateFineCategoryInput) => {
    setIsSubmitting(true);
    try {
      await finesData.createCategory({
        ...input,
        recorded_by: input.recorded_by ?? user?.id ?? null,
        academic_period_id: selected?.id!
      });
      toast.success("Fine category added!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add fine category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFineCategory = async (
    id: string,
    input: UpdateFineCategoryInput
  ) => {
    setIsSubmitting(true);
    try {
      await finesData.updateCategory(id, input);
      toast.success("Fine category updated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update fine category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteFineCategory = async (id: string) => {
    setIsSubmitting(true);
    try {
      await finesData.removeCategory(id);
      toast.success("Fine category deleted!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete fine category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const imposeFine = async (input: CreateFineImpositionInput) => {
    setIsSubmitting(true);
    try {
      const dormer = await dormersData.getById(input.dormer_id)
      await finesData.imposeFine({
        ...input,
        imposed_by: input.imposed_by ?? user?.id ?? null,
        recorded_by: input.recorded_by ?? user?.id ?? null,
        dormitory_enrollment_id: dormer?.dormer_enrollment_id ?? null,
      });
      toast.success("Fine imposed successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to impose fine.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const imposeRoomFine = async (inputs: CreateFineImpositionInput[]) => {
    setIsSubmitting(true);
    try {
      const stamped = inputs.map((i) => ({
        ...i,
        imposed_by: i.imposed_by ?? user?.id ?? null,
        recorded_by: i.recorded_by ?? user?.id ?? null,
      }));
      await finesData.imposeRoomFine(stamped);
      toast.success(`Imposed ${inputs.length} fines for the room!`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to impose room fine.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateImposition = async (
    id: string,
    input: UpdateFineImpositionInput
  ) => {
    setIsSubmitting(true);
    try {
      await finesData.updateImposition(id, input);
      toast.success("Fine updated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update fine.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const recordFinePayment = async (
    id: string,
    amount: number,
    paymentMethod: string
  ) => {
    setIsSubmitting(true);
    try {
      await finesData.recordFinePayment(id, amount, paymentMethod);
      toast.success("Fine payment recorded!");
      toast.message("(Receipt email would be sent in production.)");
    } catch (e) {
      console.error(e);
      toast.error("Failed to record fine payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendUnpaidReminder = async () => {
    toast.message("(Unpaid fine reminder emails would be sent in production.)");
  };

  return {
    isSubmitting,
    addFineCategory,
    updateFineCategory,
    deleteFineCategory,
    imposeFine,
    imposeRoomFine,
    updateImposition,
    recordFinePayment,
    sendUnpaidReminder,
  };
}

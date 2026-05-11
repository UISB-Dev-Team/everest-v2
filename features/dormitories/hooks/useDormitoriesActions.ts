"use client";

import { useState } from "react";
import { toast } from "sonner";
import { dormitoriesData } from "@/features/dormitories/data";
import type {
  CreateDormitoryInput,
  UpdateDormitoryInput,
} from "@/features/dormitories/data";

export function useDormitoriesActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addDormitory = async (input: CreateDormitoryInput) => {
    setIsSubmitting(true);
    try {
      await dormitoriesData.create(input);
      toast.success("Dormitory registered!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to register dormitory.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDormitory = async (id: string, input: UpdateDormitoryInput) => {
    setIsSubmitting(true);
    try {
      await dormitoriesData.update(id, input);
      toast.success("Dormitory updated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update dormitory.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeDormitory = async (id: string) => {
    setIsSubmitting(true);
    try {
      await dormitoriesData.remove(id);
      toast.success("Dormitory removed.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove dormitory.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { addDormitory, updateDormitory, removeDormitory, isSubmitting };
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { academicPeriodsData } from "@/features/academic-periods/data";
import type {
  CreateAcademicPeriodInput,
  UpdateAcademicPeriodInput,
} from "@/features/academic-periods/data";
import { useAcademicPeriod } from "./useAcademicPeriods";

export function useAcademicPeriodsActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refresh: refreshGlobalStore } = useAcademicPeriod();

  const addAcademicPeriod = async (input: CreateAcademicPeriodInput) => {
    setIsSubmitting(true);
    try {
      await academicPeriodsData.create(input);
      await refreshGlobalStore();
      toast.success("Academic period registered!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to register academic period.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAcademicPeriod = async (id: string, input: UpdateAcademicPeriodInput) => {
    setIsSubmitting(true);
    try {
      await academicPeriodsData.update(id, input);
      await refreshGlobalStore();
      toast.success("Academic period updated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update academic period.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const setAsCurrent = async (id: string) => {
    setIsSubmitting(true);
    try {
      await academicPeriodsData.setCurrent(id);
      await refreshGlobalStore();
      toast.success("Academic period set as current active period!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to set academic period as current.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAcademicPeriod = async (id: string) => {
    setIsSubmitting(true);
    try {
      await academicPeriodsData.remove(id);
      await refreshGlobalStore();
      toast.success("Academic period removed.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove academic period.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addAcademicPeriod,
    updateAcademicPeriod,
    setAsCurrent,
    removeAcademicPeriod,
    isSubmitting,
  };
}

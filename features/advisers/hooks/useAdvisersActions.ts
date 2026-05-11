"use client";

import { useState } from "react";
import { toast } from "sonner";
import { advisersData } from "@/features/advisers/data";
import type {
  CreateAdviserInput,
  UpdateAdviserInput,
} from "@/features/advisers/data";

export function useAdvisersActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addAdviser = async (input: CreateAdviserInput) => {
    setIsSubmitting(true);
    try {
      await advisersData.create(input);
      toast.success("Adviser added!");
      toast.message("(Welcome email would be sent in production.)");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add adviser.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAdviser = async (input: UpdateAdviserInput) => {
    setIsSubmitting(true);
    try {
      await advisersData.update(input);
      toast.success("Adviser updated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update adviser.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAdviser = async (roleId: string) => {
    setIsSubmitting(true);
    try {
      await advisersData.remove(roleId);
      toast.success("Adviser removed.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove adviser.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { addAdviser, updateAdviser, removeAdviser, isSubmitting };
}

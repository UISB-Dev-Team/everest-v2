"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { finesData } from "@/features/fines/data";
import type {
  CreateFineCategoryInput,
  FineCategory,
  UpdateFineCategoryInput,
} from "@/features/fines/data";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";

export function useFineCategories() {
  const { user } = useAuth();
  const { selected } = useAcademicPeriod()
  const dormitoryId = user?.dormitoryId ?? null;
  const [categories, setCategories] = useState<FineCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refresh = async () => {
    if (!dormitoryId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await finesData.listCategoriesForDormitory(dormitoryId, selected?.id!);
      setCategories(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!dormitoryId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    finesData
      .listCategoriesForDormitory(dormitoryId, selected?.id!)
      .then((list) => {
        if (!cancelled) setCategories(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dormitoryId, selected]);

  const saveFineCategory = async (input: {
    id?: string;
    name: string;
    amount: number;
    description: string;
  }) => {
    if (!dormitoryId) {
      toast.error("Missing dormitory.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (input.id) {
        const update: UpdateFineCategoryInput = {
          name: input.name,
          amount: input.amount,
        };
        await finesData.updateCategory(input.id, update);
        toast.success("Fine updated!");
      } else {
        const create: CreateFineCategoryInput = {
          name: input.name,
          amount: input.amount,
          description: input.description,
          dormitory_id: dormitoryId,
          recorded_by: user?.id ?? null,
          academic_period_id: selected?.id!
        };
        await finesData.createCategory(create);
        toast.success("Fine added!");
      }
      await refresh();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save fine.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { categories, loading, isSubmitting, saveFineCategory, refresh };
}

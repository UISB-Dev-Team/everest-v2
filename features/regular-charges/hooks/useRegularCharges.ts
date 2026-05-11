"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { regularChargesData } from "@/features/regular-charges/data";
import type {
  CreateRegularChargeInput,
  RegularCharge,
  UpdateRegularChargeInput,
} from "@/features/regular-charges/data";

export function useRegularCharges() {
  const { user } = useAuth();
  const dormitoryId = user?.dormitoryId ?? null;
  const [payables, setPayables] = useState<RegularCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refresh = async () => {
    if (!dormitoryId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await regularChargesData.listForDormitory(dormitoryId);
      setPayables(list);
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
    regularChargesData
      .listForDormitory(dormitoryId)
      .then((list) => {
        if (!cancelled) setPayables(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dormitoryId]);

  const savePayable = async (input: {
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
        const update: UpdateRegularChargeInput = {
          name: input.name,
          amount: input.amount,
          description: input.description,
        };
        await regularChargesData.update(input.id, update);
        toast.success("Payable updated!");
      } else {
        const create: CreateRegularChargeInput = {
          name: input.name,
          amount: input.amount,
          description: input.description,
          dormitory_id: dormitoryId,
        };
        await regularChargesData.create(create);
        toast.success("Payable added!");
      }
      await refresh();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save payable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { payables, loading, isSubmitting, savePayable, refresh };
}

"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type {
  CreateRegularChargeInput,
  RegularCharge,
  UpdateRegularChargeInput,
} from "@/features/regular-charges/data";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { createRegularCharge, listForDormitory, updateRegularCharge } from "../data/supabase";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";

export function useRegularCharges() {
  const { dormitoryId } = useDormitory()
  const { selected } = useAcademicPeriod() 
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
      const list = await listForDormitory(dormitoryId, selected?.id!);
      console.log(list)
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

  const fetchPayables = async () => {
    try {
      const list = await listForDormitory(dormitoryId, selected?.id!);
      if (!cancelled) setPayables(list);
    } catch (e) {
      console.error(e);
      if (!cancelled) toast.error("Failed to load payables.");
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  fetchPayables();

  return () => {
    cancelled = true;
  };
}, [dormitoryId, selected]);

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
        const updated = await updateRegularCharge(input.id, update);
        toast.success("Payable updated!");
        setPayables((prev) => prev.map((p) => p.id == input.id ? updated: p) )
      } else {
        const create: CreateRegularChargeInput = {
          name: input.name,
          amount: input.amount,
          description: input.description,
          dormitory_id: dormitoryId,
          academic_period_id: selected?.id!
        };
        const created = await createRegularCharge(create);
        setPayables((prev) => [...prev, created])
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
  return { payables, loading, isSubmitting, savePayable, refresh, setPayables };
}

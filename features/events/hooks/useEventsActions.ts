"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCurrentAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";
import { eventsData } from "@/features/events/data";
import type {
  CreateEventInput,
  CreateEventPaymentInput,
  UpdateEventInput,
} from "@/features/events/data";

interface SaveEventInput {
  name: string;
  description: string;
  amount_due: number;
  due_date: string;
}

export function useEventsActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { period } = useCurrentAcademicPeriod();

  const handleSaveEvent = async (input: SaveEventInput) => {
    if (!user?.dormitoryId || !period?.id) {
      toast.error("Missing dormitory or academic period.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: CreateEventInput = {
        name: input.name,
        description: input.description,
        amount_due: input.amount_due,
        due_date: input.due_date,
        status: "Active",
        dormitory_id: user.dormitoryId,
        academic_period_id: period.id,
        created_by: user.id,
      };
      await eventsData.create(payload);
      toast.success("Event created!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateEvent = async (id: string, input: UpdateEventInput) => {
    setIsSubmitting(true);
    try {
      await eventsData.update(id, input);
      toast.success("Event updated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const recordEventPayment = async (input: CreateEventPaymentInput) => {
    setIsSubmitting(true);
    try {
      await eventsData.recordEventPayment({
        ...input,
        recorded_by: input.recorded_by ?? user?.id ?? null,
      });
      toast.success("Event payment recorded!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to record event payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSaveEvent, updateEvent, recordEventPayment };
}

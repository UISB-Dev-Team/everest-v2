"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { eventsData } from "@/features/events/data";
import type {
  CreateEventInput,
  CreateEventPaymentInput,
  UpdateEventInput,
} from "@/features/events/data";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";
import { useDormitory } from "@/lib/hooks/useDormitory";

interface SaveEventInput {
  name: string;
  description: string;
  amount_due: number;
  due_date: string;
}

export function useEventsActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selected: academicPeriod } = useAcademicPeriod();
  const { dormitoryId } = useDormitory();
  const { user } = useAuth();

  const handleSaveEvent = async (input: SaveEventInput) => {
    if (!academicPeriod) {
      toast.error("Missing academic period.");
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
        dormitory_id: dormitoryId ?? "",
        academic_period_id: academicPeriod?.id,
        created_by: user?.id ?? "",
        is_deleted: false
      };
      await eventsData.create(payload, academicPeriod.id);
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

  const waiveEventPayable = async (dormerId: string, eventId: string) => {
    setIsSubmitting(true);
    if(!dormerId) {
      toast.error("Missing dormer ID.")
      return
    }
    if(!eventId) {
      toast.error("Missing event ID.")
      return
    }
    try {
      await eventsData.waiveEventPayable({
        dormer_id: dormerId,
        dormitory_id: dormitoryId!,
        academic_period_id: academicPeriod?.id!,
        amount: 0,
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "Waived",
        status: "Waived",
        recorded_by: user?.id!,
        event_id: eventId,
        created_at: new Date().toISOString().split("T")[0],
        is_deleted: false,
        notes: "Waived this event due to valid justification.",
      });
      toast.success("Event payable waived!");
    } catch (e) {
      console.log(e)
      console.error(e);
      toast.error("Failed to waive event payable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSaveEvent, updateEvent, recordEventPayment, waiveEventPayable };
}

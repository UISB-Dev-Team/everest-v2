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
import { sendEmail } from "@/lib/email";
import { listForDormitory } from "@/features/dormers/data/supabase";
import { newEvent } from "@/emails/events/newEvent";
import { eventPayment } from "@/emails/events/eventPayment";
import { dormersData } from "@/features/dormers/data";
import { eventReminder } from "@/emails/events/eventReminder";

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
      const dormers = await listForDormitory(dormitoryId!, academicPeriod.id!);
      await sendEmail({
        to: dormers.map(d => d.email).join(","),
        subject: `[New Event Created] ${input.name}`,
        html: newEvent(
          input.name,
          input.amount_due,
          input.due_date
        )
      })
      toast.success("Email sent successfully to all dormers!")
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

    const dormers = await listForDormitory(dormitoryId!, academicPeriod?.id!);
    const dormer = dormers.find((dormer) => dormer.id === input.dormer_id);
    if (!dormer) {
      toast.error("Dormer not found.");
      return;
    }

    const event = await eventsData.getById(input.event_id);
    if (!event) {
      toast.error("Event not found.");
      return;
    }

    await sendEmail({
      to: dormer.email,
      subject: `[Event Payment ${input.status === "Paid" ? "Recorded" : input.status}] ${event.name}`,
      html: eventPayment(
        false,              // existingPaymentId — false since this is a new recording
        dormer.first_name,
        event,
        input.amount,
        "Paid"
      ),
    });

    toast.success("Digital receipt sent successfully!");
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
      toast.success("Event payable waived!")
      
      const event = await eventsData.getById(eventId);
      if (!event) {
        toast.error("Event not found.");
        return;
      }

      const dormer = await dormersData.getById(dormerId);
      if(!dormer) {
        toast.error("Dormer not found.")
        return
      }

      await sendEmail({
      to: dormer.email,
      subject: `[Event Payment Waived] ${event.name}`,
      html: eventPayment(
        false,              // existingPaymentId — false since this is a new recording
        dormer.first_name,
        event,
        0,
        "Waived",
      ),
    });

    toast.success("Digital receipt sent successfully!");

    } catch (e) {
      console.error(e);
      toast.error("Failed to waive event payable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remindAllDormers = async (eventId: string) => {
    setIsSubmitting(true);
    try {
      const [dormers, event] = await Promise.all([
        eventsData.listDormersForEvent(eventId, academicPeriod?.id!, dormitoryId!),
        eventsData.getById(eventId),
      ]);

      if (!event) {
        toast.error("Event not found.");
        return;
      }

      const unpaidDormers = dormers.filter((d) => d.payment_status === "Pending");

      if (unpaidDormers.length === 0) {
        toast.success("No dormers with pending payables for this event.");
        return;
      }

      await sendEmail({
        to: unpaidDormers.map((d) => d.email).join(","),
        subject: `[Reminder: Event Payment Due] ${event.name}`,
        html: eventReminder(event),
      });

      toast.success(`Reminders sent to ${unpaidDormers.length} unpaid dormer(s)!`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to send reminders.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSaveEvent, updateEvent, recordEventPayment, waiveEventPayable, remindAllDormers };
}

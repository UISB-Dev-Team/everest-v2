import { createClient } from "@/lib/supabase/client";
import type {
  CreateEventInput,
  CreateEventPaymentInput,
  Event,
  EventDormerData,
  EventPayable,
  EventPayment,
  EventPaymentWithRecorder,
  UpdateEventInput,
} from "./types";
import { getById as getDormerById } from "@/features/dormers/data/supabase";
import { Dormer } from "@/features/dormers/data";

const supabase = createClient();

export async function listForDormitory(
  dormitoryId: string,
  academicPeriodId: string
): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("dormitory_id", dormitoryId)
    .eq("is_deleted", false)
    .eq("academic_period_id", academicPeriodId);
  if (error) throw error;
  return data;
}

export async function getById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();
  if (error) throw error;
  return data;
}

export async function create(input: CreateEventInput, academicPeriodId: string): Promise<Event> {
  const { data, error } = await supabase
    .from("events")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function update(id: string, input: UpdateEventInput): Promise<Event> {
  const { data, error } = await supabase
    .from("events")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase
    .from("events")
    .update({ is_deleted: true })
    .eq("id", id);
  if (error) throw error;
}

export async function listPaymentsForEvent(
  eventId: string,
  academicPeriodId: string
): Promise<EventPaymentWithRecorder[]> {
  const { data, error } = await supabase
    .from("event_payments")
    .select("*, profiles!event_payments_recorded_by_fkey(*)")
    .eq("event_id", eventId)
    .eq("academic_period_id", academicPeriodId)
    .eq("is_deleted", false);
  if (error) throw error;

  return data.map((payment) => {
    const { profiles: profile, ...rest } = payment;
    return {
      ...rest,
      recorded_by_full_name: `${profile?.first_name} ${profile?.last_name}`,
      recorded_by_email: profile?.email,
    } as EventPaymentWithRecorder;
  });
}
export async function listDormersForEvent(
  eventId: string,
  academicPeriodId: string
): Promise<EventDormerData[]> {
  // 1. Get all active dormers enrolled in this academic period
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("dormitory_enrollment")
    .select("*, dormer:profiles!dormitory_enrollment_dormer_id_fkey(*)")
    .eq("academic_period_id", academicPeriodId)
    .eq("status", "active");

  if (enrollmentsError) throw enrollmentsError;
  if (!enrollments) throw new Error("No dormers found");

  // filter by role
  const { data: roles, error: roleError} = await supabase
  .from("dormitory_roles")
  .select("*")
  .eq("role", "dormer")

  if (roleError) throw roleError;
  if (!roles) throw new Error("No roles found");

  const dormers = enrollments.filter((row) => roles.some((role) => role.user_id === row.dormer_id))
  console.log(dormers)
  // 2. Get all payments for this specific event
  const { data: payments, error: paymentsError } = await supabase
    .from("event_payments")
    .select("*, recorder:profiles!event_payments_recorded_by_fkey(*)")
    .eq("event_id", eventId)
    .eq("academic_period_id", academicPeriodId)
    .eq("is_deleted", false);

  if (paymentsError) throw paymentsError;

  const allPayments = payments ?? [];

  // 3. Map each enrolled dormer, merging their payment if it exists
  return dormers.map((enrollment) => {
    const { dormer, ...rest } = enrollment;
    const payment = allPayments.find((p) => p.dormer_id === dormer.id);
    const recorder = payment?.recorder ?? null;

    return {
      ...dormer,
      status: "active",
      dormitory_id: rest.dormitory_id,
      room_number: rest.room_number,
      full_name: dormer ? `${dormer.first_name} ${dormer.last_name}` : null,
      payment_status: payment?.status ?? "Pending",
      amount_paid: payment?.amount ?? 0,
      payment_date: payment?.payment_date ?? null,
      payment_method: payment?.payment_method ?? null,
      recorded_by_full_name: recorder
        ? `${recorder.first_name} ${recorder.last_name}`
        : null,
      recorded_by_email: recorder?.email ?? null,
    } as EventDormerData;
  });
}

export async function recordEventPayment(
  input: CreateEventPaymentInput,
): Promise<EventPayment> {
  const event = await getById(input.event_id);
  if (!event) throw new Error("Event not found");
  input.status = event.amount_due <= input.amount ? "Paid" : "Pending";
  const { data, error } = await supabase
    .from("event_payments")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listAllEventPayables(
  dormitoryId: string,
  academicPeriodId: string
): Promise<EventPayable[]> {
if (!dormitoryId || !academicPeriodId) {
    console.warn("listAllEventPayables: missing dormitoryId or academicPeriodId");
    return [];
  }
  const { data, error } = await supabase
    .from("dormitory_enrollment")
    .select("*, profiles(*)")
    .eq("dormitory_id", dormitoryId)
    .eq("status", "active")
    .eq("academic_period_id", academicPeriodId);

  if (error) {
    console.log(error)
    console.error("Error fetching dormers:", error);
    return [];
  }

  const { data: roles, error: roleError } = await supabase
    .from("dormitory_roles")
    .select("*")
    .eq("dormitory_id", dormitoryId)
    .eq("role", "dormer")

  if (roleError) {
    console.log(error)
    console.error("Error fetching roles:", roleError);
    return [];
  }

  const dormers = data.filter((row) => roles.some((role) => role.user_id === row.profiles?.id));

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .eq("dormitory_id", dormitoryId)
    .eq("academic_period_id", academicPeriodId)
    .eq("is_deleted", false);

  if (eventsError) throw eventsError;
  if (!events || events.length === 0) return [];

  const { data: payments, error: paymentsError } = await supabase
    .from("event_payments")
    .select("*")
    .eq("dormitory_id", dormitoryId)
    .eq("academic_period_id", academicPeriodId)
    .eq("is_deleted", false);

  if (paymentsError) throw paymentsError;

  const allPayments = payments ?? [];

  return dormers.map((dormer) => {
    const dormerPayments = allPayments.filter(
      (p) => p.dormer_id === dormer.profiles.id
    );

    const paidOrWaivedEventIds = new Set(
      dormerPayments
        .filter((p) => p.status === "Paid" || p.status === "Waived")
        .map((p) => p.event_id)
    );

    const pendingEvents = events.filter(
      (event) => !paidOrWaivedEventIds.has(event.id)
    );

    const pendingAmount = pendingEvents.reduce(
      (sum, event) => sum + (event.amount_due ?? 0),
      0
    );

    const {profiles, ...rest} = dormer;

    return {
      ...profiles,
      room_number: rest.room_number,
      pending_payable_amount: pendingAmount,
      pending_payable_events: pendingEvents,
      event_payments: dormerPayments,
    } as EventPayable;
  });
}

export async function waiveEventPayable(payload: Omit<EventPayment, "id">): Promise<EventPayment> {
  const { data, error } = await supabase
    .from("event_payments")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
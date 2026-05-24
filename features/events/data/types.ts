import type { Tables, TablesInsert, TablesUpdate } from "@/database.types";
import type { Dormer } from "@/features/dormers/data/types";

export type Event = Tables<"events">;
export type EventPayment = Tables<"event_payments">;

export type CreateEventInput = TablesInsert<"events">;
export type UpdateEventInput = TablesUpdate<"events">;

export type CreateEventPaymentInput = TablesInsert<"event_payments">;

/** Event payment joined with recorder's profile. */
export interface EventPaymentWithRecorder extends EventPayment {
  recorded_by_full_name: string | null;
  recorded_by_email: string | null;
}

/** A dormer with their event payment status (used by EventDormersTable). */
export interface EventDormerData extends Dormer {
  payment_status: EventPayment["status"] | "Pending";
  amount_paid: number;
  payment_date: string | null;
  payment_method: string | null;
  recorded_by_full_name: string | null;
  recorded_by_email: string | null;
}

export interface EventPayable extends Dormer {
  pending_payable_amount: number;
  pending_payable_events: Event[];
  event_payments: EventPayment[];
}
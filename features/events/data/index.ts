import * as supabase from "./supabase";
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

export interface EventsDataAccess {
  listForDormitory(dormitoryId: string, academicPeriodId: string): Promise<Event[]>;
  getById(id: string): Promise<Event | null>;
  create(input: CreateEventInput, academicPeriodId: string): Promise<Event>;
  update(id: string, input: UpdateEventInput): Promise<Event>;
  remove(id: string): Promise<void>;

  listPaymentsForEvent(eventId: string, academicPeriodId: string, dormitoryId: string): Promise<EventPaymentWithRecorder[]>;
  listDormersForEvent(eventId: string, academicPeriodId: string, dormitoryId: string): Promise<EventDormerData[]>;
  recordEventPayment(input: CreateEventPaymentInput): Promise<EventPayment>;

  listAllEventPayables(dormitoryId: string, academicPeriodId: string): Promise<EventPayable[]>;
  waiveEventPayable(payload: Omit<EventPayment, "id">): Promise<EventPayment>;
}

export const eventsData: EventsDataAccess = supabase;

export type {
  CreateEventInput,
  CreateEventPaymentInput,
  Event,
  EventDormerData,
  EventPayment,
  EventPaymentWithRecorder,
  UpdateEventInput,
  EventPayable
} from "./types";

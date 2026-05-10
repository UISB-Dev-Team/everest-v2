import * as mock from "./mock";
import type {
  CreateEventInput,
  CreateEventPaymentInput,
  Event,
  EventDormerData,
  EventPayment,
  EventPaymentWithRecorder,
  UpdateEventInput,
} from "./types";

export interface EventsDataAccess {
  listForDormitory(dormitoryId: string): Promise<Event[]>;
  getById(id: string): Promise<Event | null>;
  create(input: CreateEventInput): Promise<Event>;
  update(id: string, input: UpdateEventInput): Promise<Event>;
  remove(id: string): Promise<void>;

  listPaymentsForEvent(eventId: string): Promise<EventPaymentWithRecorder[]>;
  listDormersForEvent(eventId: string): Promise<EventDormerData[]>;
  recordEventPayment(input: CreateEventPaymentInput): Promise<EventPayment>;
}

export const eventsData: EventsDataAccess = mock;

export type {
  CreateEventInput,
  CreateEventPaymentInput,
  Event,
  EventDormerData,
  EventPayment,
  EventPaymentWithRecorder,
  UpdateEventInput,
} from "./types";

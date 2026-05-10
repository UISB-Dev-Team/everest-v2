import eventsFixture from "@/mocks/fixtures/events.json";
import paymentsFixture from "@/mocks/fixtures/event-payments.json";
import dormersFixture from "@/mocks/fixtures/dormers.json";
import staffFixture from "@/mocks/fixtures/staff-profiles.json";
import type { Dormer } from "@/features/dormers/data";
import type {
  CreateEventInput,
  CreateEventPaymentInput,
  Event,
  EventDormerData,
  EventPayment,
  EventPaymentWithRecorder,
  UpdateEventInput,
} from "./types";

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

let events: Event[] = eventsFixture as Event[];
let payments: EventPayment[] = paymentsFixture as EventPayment[];
const dormers = dormersFixture as Dormer[];

function decoratePayment(p: EventPayment): EventPaymentWithRecorder {
  const staff = staffFixture.find((s) => s.id === p.recorded_by);
  return {
    ...p,
    recorded_by_full_name: staff
      ? `${staff.first_name} ${staff.last_name}`
      : null,
    recorded_by_email: staff?.email ?? null,
  };
}

export async function listForDormitory(dormitoryId: string): Promise<Event[]> {
  await delay();
  return events
    .filter((e) => e.dormitory_id === dormitoryId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function getById(id: string): Promise<Event | null> {
  await delay();
  return events.find((e) => e.id === id) ?? null;
}

export async function create(input: CreateEventInput): Promise<Event> {
  await delay();
  const now = new Date().toISOString();
  const created: Event = {
    id: input.id ?? `ev-mock-${Date.now()}`,
    academic_period_id: input.academic_period_id,
    dormitory_id: input.dormitory_id,
    name: input.name,
    description: input.description ?? null,
    amount_due: input.amount_due,
    due_date: input.due_date ?? null,
    status: input.status ?? "Active",
    created_by: input.created_by ?? null,
    created_at: input.created_at ?? now,
    updated_at: input.updated_at ?? now,
  };
  events = [...events, created];
  return created;
}

export async function update(
  id: string,
  input: UpdateEventInput
): Promise<Event> {
  await delay();
  const idx = events.findIndex((e) => e.id === id);
  if (idx < 0) throw new Error(`Event ${id} not found`);
  const next: Event = {
    ...events[idx],
    ...input,
    id,
    updated_at: new Date().toISOString(),
  } as Event;
  events = events.map((e, i) => (i === idx ? next : e));
  return next;
}

export async function remove(id: string): Promise<void> {
  await delay();
  events = events.filter((e) => e.id !== id);
}

export async function listPaymentsForEvent(
  eventId: string
): Promise<EventPaymentWithRecorder[]> {
  await delay();
  return payments
    .filter((p) => p.event_id === eventId)
    .map(decoratePayment);
}

export async function listDormersForEvent(
  eventId: string
): Promise<EventDormerData[]> {
  await delay();
  const event = events.find((e) => e.id === eventId);
  if (!event) return [];
  return dormers
    .filter((d) => d.dormitory_id === event.dormitory_id)
    .map((d) => {
      const payment = payments.find(
        (p) => p.event_id === eventId && p.dormer_id === d.id
      );
      const staff = payment
        ? staffFixture.find((s) => s.id === payment.recorded_by)
        : null;
      return {
        ...d,
        payment_status: payment?.status ?? "Pending",
        amount_paid: payment?.amount ?? 0,
        payment_date: payment?.payment_date ?? null,
        payment_method: payment?.payment_method ?? null,
        recorded_by_full_name: staff
          ? `${staff.first_name} ${staff.last_name}`
          : null,
        recorded_by_email: staff?.email ?? null,
      };
    });
}

export async function recordEventPayment(
  input: CreateEventPaymentInput
): Promise<EventPayment> {
  await delay();
  const created: EventPayment = {
    id: input.id ?? `evp-mock-${Date.now()}`,
    academic_period_id: input.academic_period_id,
    event_id: input.event_id,
    dormer_id: input.dormer_id,
    dormitory_id: input.dormitory_id,
    amount: input.amount,
    status: input.status ?? "Pending",
    payment_method: input.payment_method ?? null,
    payment_date: input.payment_date ?? null,
    notes: input.notes ?? null,
    recorded_by: input.recorded_by ?? null,
    created_at: input.created_at ?? new Date().toISOString(),
  };
  payments = [...payments, created];
  return created;
}

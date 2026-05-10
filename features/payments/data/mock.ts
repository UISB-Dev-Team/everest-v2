import paymentsFixture from "@/mocks/fixtures/payments.json";
import billsFixture from "@/mocks/fixtures/bills.json";
import dormersFixture from "@/mocks/fixtures/dormers.json";
import type {
  Bill,
  BillWithDormer,
  CreatePaymentInput,
  Payment,
  PaymentSummary,
} from "./types";

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

const payments = paymentsFixture as Payment[];
const bills = billsFixture as Bill[];

export async function listForDormer(dormerId: string): Promise<Payment[]> {
  await delay();
  return payments.filter((p) => p.dormer_id === dormerId);
}

export async function listBillsForDormer(dormerId: string): Promise<Bill[]> {
  await delay();
  return bills.filter((b) => b.dormer_id === dormerId);
}

export async function listBillsForDormitory(
  dormitoryId: string
): Promise<BillWithDormer[]> {
  await delay();
  return bills
    .filter((b) => b.dormitory_id === dormitoryId)
    .map((b) => {
      const dormer = dormersFixture.find((d) => d.id === b.dormer_id);
      return {
        ...b,
        dormer_full_name: dormer
          ? `${dormer.first_name} ${dormer.last_name}`
          : "Unknown",
        dormer_room: dormer?.room_number ?? null,
      };
    });
}

export async function getById(id: string): Promise<Payment | null> {
  await delay();
  return payments.find((p) => p.id === id) ?? null;
}

export async function create(input: CreatePaymentInput): Promise<Payment> {
  await delay();
  return {
    id: `pay-mock-${Date.now()}`,
    bill_id: input.bill_id,
    academic_period_id: input.academic_period_id,
    dormer_id: input.dormer_id,
    dormitory_id: input.dormitory_id,
    amount: input.amount,
    payment_method: input.payment_method ?? null,
    notes: input.notes ?? null,
    recorded_by: input.recorded_by ?? null,
    created_at: input.created_at ?? new Date().toISOString(),
  };
}

export async function summaryForDormer(
  dormerId: string
): Promise<PaymentSummary> {
  await delay();
  const ownedBills = bills.filter((b) => b.dormer_id === dormerId);
  const totalDue = ownedBills.reduce((sum, b) => sum + b.total_amount_due, 0);
  const totalPaid = ownedBills.reduce((sum, b) => sum + b.amount_paid, 0);
  return {
    totalDue,
    totalPaid,
    remaining: totalDue - totalPaid,
    paidCount: ownedBills.filter((b) => b.status === "Paid").length,
    unpaidCount: ownedBills.filter((b) => b.status !== "Paid").length,
  };
}

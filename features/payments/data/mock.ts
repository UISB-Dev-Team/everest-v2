// import paymentsFixture from "@/mocks/fixtures/payments.json";
// import billsFixture from "@/mocks/fixtures/bills.json";
// import dormersFixture from "@/mocks/fixtures/dormers.json";
// import staffFixture from "@/mocks/fixtures/staff-profiles.json";
// import regularChargesFixture from "@/mocks/fixtures/regular-charges.json";
// import type {
//   Bill,
//   BillWithDormer,
//   BillWithPayments,
//   CreateBillInput,
//   CreatePaymentInput,
//   Payment,
//   PaymentSummary,
//   PaymentWithRecorder,
//   UpdateBillInput,
//   UpdatePaymentInput,
// } from "./types";
// import type { Tables } from "@/database.types";

// const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

// let bills: Bill[] = billsFixture as Bill[];
// let payments: Payment[] = paymentsFixture as Payment[];
// const dormers = dormersFixture as { id: string; first_name: string; last_name: string; room_number: string | null; dormitory_id: string | null }[];
// const staff = staffFixture as Tables<"profiles">[];
// const regularCharges = regularChargesFixture as Tables<"regular_charges">[];

// function decoratePayment(p: Payment): PaymentWithRecorder {
//   const recorder = staff.find((s) => s.id === p.recorded_by);
//   return {
//     ...p,
//     recorded_by_full_name: recorder
//       ? `${recorder.first_name} ${recorder.last_name}`
//       : null,
//     recorded_by_email: recorder?.email ?? null,
//   };
// }

// function decorateBill(b: Bill): BillWithDormer {
//   const dormer = dormers.find((d) => d.id === b.dormer_id);
//   return {
//     ...b,
//     dormer_full_name: dormer
//       ? `${dormer.first_name} ${dormer.last_name}`
//       : "Unknown",
//     dormer_room: dormer?.room_number ?? null,
//   };
// }

// // === Bills ===

// export async function listBillsForDormer(dormerId: string): Promise<Bill[]> {
//   await delay();
//   return bills.filter((b) => b.dormer_id === dormerId);
// }

// export async function listBillsForDormitory(
//   dormitoryId: string
// ): Promise<BillWithDormer[]> {
//   await delay();
//   return bills
//     .filter((b) => b.dormitory_id === dormitoryId)
//     .map(decorateBill);
// }

// export async function listBillsForDormitoryWithPayments(
//   dormitoryId: string
// ): Promise<BillWithPayments[]> {
//   await delay();
//   return bills
//     .filter((b) => b.dormitory_id === dormitoryId)
//     .map((b) => {
//       const decorated = decorateBill(b);
//       const billPayments = payments
//         .filter((p) => p.bill_id === b.id)
//         .map(decoratePayment);
//       return {
//         ...decorated,
//         remaining_balance: Math.max(
//           0,
//           b.total_amount_due - b.amount_paid
//         ),
//         payments: billPayments,
//       };
//     });
// }

// export async function getBillById(id: string): Promise<BillWithDormer | null> {
//   await delay();
//   const b = bills.find((b) => b.id === id);
//   return b ? decorateBill(b) : null;
// }

// export async function createBill(input: CreateBillInput): Promise<Bill> {
//   await delay();
//   const now = new Date().toISOString();
//   const created: Bill = {
//     id: input.id ?? `bill-mock-${Date.now()}`,
//     academic_period_id: input.academic_period_id,
//     dormer_id: input.dormer_id,
//     dormitory_id: input.dormitory_id,
//     billing_month: input.billing_month,
//     description: input.description,
//     total_amount_due: input.total_amount_due,
//     amount_paid: input.amount_paid ?? 0,
//     status: input.status ?? "Unpaid",
//     due_date: input.due_date ?? null,
//     regular_charge_id: input.regular_charge_id ?? null,
//     created_by: input.created_by ?? null,
//     created_at: input.created_at ?? now,
//     updated_at: input.updated_at ?? now,
//   };
//   bills = [...bills, created];
//   return created;
// }

// export async function updateBill(
//   id: string,
//   input: UpdateBillInput
// ): Promise<Bill> {
//   await delay();
//   const idx = bills.findIndex((b) => b.id === id);
//   if (idx < 0) throw new Error(`Bill ${id} not found`);
//   const next = {
//     ...bills[idx],
//     ...input,
//     id,
//     updated_at: new Date().toISOString(),
//   } as Bill;
//   bills = bills.map((b, i) => (i === idx ? next : b));
//   return next;
// }

// export async function removeBill(id: string): Promise<void> {
//   await delay();
//   bills = bills.filter((b) => b.id !== id);
// }

// export async function generateBillsForDormitory(
//   dormitoryId: string,
//   academicPeriodId: string,
//   billingMonth: string,
//   regularChargeId: string
// ): Promise<Bill[]> {
//   await delay();
//   const charge = regularCharges.find((c) => c.id === regularChargeId);
//   if (!charge) throw new Error(`Regular charge ${regularChargeId} not found`);
//   const targets = dormers.filter((d) => d.dormitory_id === dormitoryId);
//   const now = new Date().toISOString();
//   const created: Bill[] = targets.map((d) => ({
//     id: `bill-mock-${Date.now()}-${d.id}`,
//     academic_period_id: academicPeriodId,
//     dormer_id: d.id,
//     dormitory_id: dormitoryId,
//     billing_month: billingMonth,
//     description: `${charge.name} — ${billingMonth}`,
//     total_amount_due: charge.amount,
//     amount_paid: 0,
//     status: "Unpaid",
//     due_date: null,
//     regular_charge_id: regularChargeId,
//     created_by: null,
//     created_at: now,
//     updated_at: now,
//   }));
//   bills = [...bills, ...created];
//   return created;
// }

// // === Payments ===

// export async function listForDormer(dormerId: string): Promise<Payment[]> {
//   await delay();
//   return payments.filter((p) => p.dormer_id === dormerId);
// }

// export async function listPaymentsForDormitory(
//   dormitoryId: string
// ): Promise<PaymentWithRecorder[]> {
//   await delay();
//   return payments
//     .filter((p) => p.dormitory_id === dormitoryId)
//     .map(decoratePayment);
// }

// export async function listPaymentsForBill(
//   billId: string
// ): Promise<PaymentWithRecorder[]> {
//   await delay();
//   return payments.filter((p) => p.bill_id === billId).map(decoratePayment);
// }

// export async function getPaymentById(id: string): Promise<Payment | null> {
//   await delay();
//   return payments.find((p) => p.id === id) ?? null;
// }

// export async function recordPayment(
//   input: CreatePaymentInput
// ): Promise<Payment> {
//   await delay();
//   const created: Payment = {
//     id: input.id ?? `pay-mock-${Date.now()}`,
//     bill_id: input.bill_id,
//     academic_period_id: input.academic_period_id,
//     dormer_id: input.dormer_id,
//     dormitory_id: input.dormitory_id,
//     amount: input.amount,
//     payment_method: input.payment_method ?? null,
//     notes: input.notes ?? null,
//     recorded_by: input.recorded_by ?? null,
//     created_at: input.created_at ?? new Date().toISOString(),
//   };
//   payments = [...payments, created];

//   // Update related bill amount_paid + status
//   const billIdx = bills.findIndex((b) => b.id === input.bill_id);
//   if (billIdx >= 0) {
//     const bill = bills[billIdx];
//     const newPaid = bill.amount_paid + input.amount;
//     const newStatus =
//       newPaid >= bill.total_amount_due
//         ? "Paid"
//         : newPaid > 0
//           ? "Partial"
//           : "Unpaid";
//     bills = bills.map((b, i) =>
//       i === billIdx
//         ? {
//             ...b,
//             amount_paid: newPaid,
//             status: newStatus,
//             updated_at: new Date().toISOString(),
//           }
//         : b
//     );
//   }

//   return created;
// }

// export async function updatePayment(
//   id: string,
//   input: UpdatePaymentInput
// ): Promise<Payment> {
//   await delay();
//   const idx = payments.findIndex((p) => p.id === id);
//   if (idx < 0) throw new Error(`Payment ${id} not found`);
//   const next = { ...payments[idx], ...input, id } as Payment;
//   payments = payments.map((p, i) => (i === idx ? next : p));
//   return next;
// }

// export async function removePayment(id: string): Promise<void> {
//   await delay();
//   payments = payments.filter((p) => p.id !== id);
// }

// // === Aggregates ===

// export async function summaryForDormer(
//   dormerId: string
// ): Promise<PaymentSummary> {
//   await delay();
//   const own = bills.filter((b) => b.dormer_id === dormerId);
//   const totalDue = own.reduce((s, b) => s + b.total_amount_due, 0);
//   const totalPaid = own.reduce((s, b) => s + b.amount_paid, 0);
//   return {
//     totalDue,
//     totalPaid,
//     remaining: totalDue - totalPaid,
//     paidCount: own.filter((b) => b.status === "Paid").length,
//     unpaidCount: own.filter((b) => b.status !== "Paid").length,
//   };
// }

// export async function summaryForDormitory(
//   dormitoryId: string
// ): Promise<PaymentSummary> {
//   await delay();
//   const own = bills.filter((b) => b.dormitory_id === dormitoryId);
//   const totalDue = own.reduce((s, b) => s + b.total_amount_due, 0);
//   const totalPaid = own.reduce((s, b) => s + b.amount_paid, 0);
//   return {
//     totalDue,
//     totalPaid,
//     remaining: totalDue - totalPaid,
//     paidCount: own.filter((b) => b.status === "Paid").length,
//     unpaidCount: own.filter((b) => b.status !== "Paid").length,
//   };
// }

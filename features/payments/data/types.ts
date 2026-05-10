import type { Tables, TablesInsert, TablesUpdate } from "@/database.types";

export type Payment = Tables<"payments">;
export type Bill = Tables<"bills">;

export type CreatePaymentInput = TablesInsert<"payments">;
export type UpdatePaymentInput = TablesUpdate<"payments">;

export type CreateBillInput = TablesInsert<"bills">;
export type UpdateBillInput = TablesUpdate<"bills">;

/** A bill joined with the dormer's name + room. */
export interface BillWithDormer extends Bill {
  dormer_full_name: string;
  dormer_room: string | null;
}

/** A bill with its payments + dormer (matches old BillData shape). */
export interface BillWithPayments extends BillWithDormer {
  remaining_balance: number;
  payments: PaymentWithRecorder[];
}

/** A payment joined with the recorder's profile. */
export interface PaymentWithRecorder extends Payment {
  recorded_by_full_name: string | null;
  recorded_by_email: string | null;
}

export interface PaymentSummary {
  totalDue: number;
  totalPaid: number;
  remaining: number;
  paidCount: number;
  unpaidCount: number;
}

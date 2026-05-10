import type { Tables, TablesInsert } from "@/database.types";

export type Payment = Tables<"payments">;
export type Bill = Tables<"bills">;

export type CreatePaymentInput = TablesInsert<"payments">;

export interface PaymentSummary {
  totalDue: number;
  totalPaid: number;
  remaining: number;
  paidCount: number;
  unpaidCount: number;
}

export interface BillWithDormer extends Bill {
  dormer_full_name: string;
  dormer_room: string | null;
}

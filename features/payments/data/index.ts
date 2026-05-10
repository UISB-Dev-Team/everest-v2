import * as mock from "./mock";
import type {
  Bill,
  BillWithDormer,
  CreatePaymentInput,
  Payment,
  PaymentSummary,
} from "./types";

export interface PaymentsDataAccess {
  listForDormer(dormerId: string): Promise<Payment[]>;
  listBillsForDormer(dormerId: string): Promise<Bill[]>;
  listBillsForDormitory(dormitoryId: string): Promise<BillWithDormer[]>;
  getById(id: string): Promise<Payment | null>;
  create(input: CreatePaymentInput): Promise<Payment>;
  summaryForDormer(dormerId: string): Promise<PaymentSummary>;
}

export const paymentsData: PaymentsDataAccess = mock;

export type {
  Bill,
  BillWithDormer,
  CreatePaymentInput,
  Payment,
  PaymentSummary,
} from "./types";

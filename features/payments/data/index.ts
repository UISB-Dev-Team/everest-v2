import * as supabase from "./supabase";
import type {
  Bill,
  BillWithDormer,
  BillWithPayments,
  CreateBillInput,
  CreatePaymentInput,
  Payment,
  PaymentSummary,
  PaymentWithRecorder,
  UpdateBillInput,
  UpdatePaymentInput,
} from "./types";

export interface PaymentsDataAccess {
  // Bills
  listBillsForDormer(dormerId: string, academicPeriodId: string): Promise<Bill[]>;
  listBillsForDormitory(dormitoryId: string, academicPeriodId: string): Promise<BillWithDormer[]>;
  listBillsForDormitoryWithPayments(
    dormitoryId: string, academicPeriodId: string
  ): Promise<BillWithPayments[]>;
  getBillById(id: string): Promise<BillWithDormer | null>;
  createBill(input: CreateBillInput): Promise<Bill>;
  updateBill(id: string, input: UpdateBillInput): Promise<Bill>;
  removeBill(id: string): Promise<void>;
  generateBillsForDormitory(
    dormitoryId: string,
    academicPeriodId: string,
    billingMonth: string,
    regularChargeId: string
  ): Promise<Bill[]>;

  // Payments
  listForDormer(dormerId: string, academicPeriodId: string): Promise<Payment[]>;
  listPaymentsForDormitory(
    dormitoryId: string, academicPeriodId: string
  ): Promise<PaymentWithRecorder[]>;
  listPaymentsForBill(billId: string, academicPeriodId: string): Promise<PaymentWithRecorder[]>;
  getPaymentById(id: string): Promise<Payment | null>;
  recordPayment(input: any, academicPeriodId: string, dormitoryId: string, recordedBy: string): Promise<Payment>;
  updatePayment(id: string, input: UpdatePaymentInput): Promise<Payment>;
  removePayment(id: string): Promise<void>;

  // Aggregates
  summaryForDormer(dormerId: string, academicPeriodId: string): Promise<PaymentSummary>;
  summaryForDormitory(dormitoryId: string, academicPeriodId: string): Promise<PaymentSummary>;
}

export const paymentsData: PaymentsDataAccess = supabase;

export type {
  Bill,
  BillWithDormer,
  BillWithPayments,
  CreateBillInput,
  CreatePaymentInput,
  Payment,
  PaymentSummary,
  PaymentWithRecorder,
  UpdateBillInput,
  UpdatePaymentInput,
} from "./types";

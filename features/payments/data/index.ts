import * as mock from "./mock";
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
  listBillsForDormer(dormerId: string): Promise<Bill[]>;
  listBillsForDormitory(dormitoryId: string): Promise<BillWithDormer[]>;
  listBillsForDormitoryWithPayments(
    dormitoryId: string
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
  listForDormer(dormerId: string): Promise<Payment[]>;
  listPaymentsForDormitory(
    dormitoryId: string
  ): Promise<PaymentWithRecorder[]>;
  listPaymentsForBill(billId: string): Promise<PaymentWithRecorder[]>;
  getPaymentById(id: string): Promise<Payment | null>;
  recordPayment(input: CreatePaymentInput): Promise<Payment>;
  updatePayment(id: string, input: UpdatePaymentInput): Promise<Payment>;
  removePayment(id: string): Promise<void>;

  // Aggregates
  summaryForDormer(dormerId: string): Promise<PaymentSummary>;
  summaryForDormitory(dormitoryId: string): Promise<PaymentSummary>;
}

export const paymentsData: PaymentsDataAccess = mock;

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

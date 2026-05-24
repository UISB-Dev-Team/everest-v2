"use server";
import { createClient } from "@/lib/supabase/client";
import supabaseAdmin from "@/lib/supabase/admin";
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
import type { Tables } from "@/database.types";
import { getById } from "@/features/dormers/data/supabase";
import { useAcademicPeriod } from "@/lib/hooks/useAcademicPeriod";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { useAuth } from "@/features/auth/hooks/useAuth";

const supabase = createClient();

export async function isPaidBill(dormerId: string, billingMonth: string, regularChargeId: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from("bills")
            .select("status")
            .eq("dormer_id", dormerId)
            .eq("billing_month", billingMonth)
            .eq("regular_charge_id", regularChargeId)
            .maybeSingle();
            
        if (error) {
            throw error;
        }

        return data?.status === "Paid";
    } catch (error) {
        console.error("Error checking if bill is paid: ", error);
        return false;
    }
}

export async function findExistingBill(dormerId: string, billingMonth: string, regularChargeId: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from("bills")
            .select("id")
            .eq("dormer_id", dormerId)
            .eq("billing_month", billingMonth)
            .eq("regular_charge_id", regularChargeId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data?.id ?? null;
    } catch (error) {
        console.error("Error finding existing bill: ", error);
        return null;
    }
}

export async function listBillsForDormer(dormerId: string, academicPeriodId: string): Promise<Bill[]> {
    try{
        const { data, error } = await supabase.from("bills").select("*")
        .eq("dormer_id", dormerId)
        .eq("academic_period_id", academicPeriodId)
        .or("is_deleted.eq.false,is_deleted.is.null");
        
        if(error){
            throw error;
        }

        return data as Bill[];
    }catch(error){
        console.error("Error listing bills for dormer: ", error);
        return [];
    }
}

export async function listBillsForDormitory(
  dormitoryId: string,
  academicPeriodId: string
): Promise<BillWithDormer[]> {
  try {
    const [{ data: billsData, error: billsError }, { data: enrollmentData, error: enrollmentError }] =
      await Promise.all([
        supabase
          .from("bills")
          .select(`
            *,
            profiles!bills_dormer_id_fkey (
              first_name,
              last_name
            )
          `)
          .eq("dormitory_id", dormitoryId)
          .eq("academic_period_id", academicPeriodId)
          .or("is_deleted.eq.false,is_deleted.is.null")
          .order("billing_month", { ascending: true }),

        supabase
          .from("dormitory_enrollment")
          .select("dormer_id, room_number, academic_period_id")
          .eq("dormitory_id", dormitoryId)
          .eq("academic_period_id", academicPeriodId),
      ]);

    if (billsError) throw billsError;
    if (enrollmentError) throw enrollmentError;

    const roomMap = new Map(
      (enrollmentData ?? []).map((e) => [e.dormer_id, e.room_number])
    );

    return (billsData ?? []).map((bill) => {
      const profile = bill.profiles as { first_name: string; last_name: string } | null;

      return {
        ...bill,
        profiles: undefined,
        dormer_full_name: profile
          ? `${profile.first_name} ${profile.last_name}`.trim()
          : "Unknown",
        dormer_room: roomMap.get(bill.dormer_id) ?? null,
      } as BillWithDormer;
    });
  } catch (error) {
    console.error("Error listing bills for dormitory: ", error);
    return [];
  }
}

export async function listBillsForDormitoryWithPayments(
  dormitoryId: string,
  academicPeriodId: string
): Promise<BillWithPayments[]> {
  try {
    const [
      { data: billsData, error: billsError },
      { data: enrollmentData, error: enrollmentError },
      { data: paymentsData, error: paymentsError },
    ] = await Promise.all([
      supabase
        .from("bills")
        .select(`
          *,
          profiles!bills_dormer_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq("dormitory_id", dormitoryId)
        .eq("academic_period_id", academicPeriodId)
        .or("is_deleted.eq.false,is_deleted.is.null")
        .order("billing_month", { ascending: true }),

      supabase
        .from("dormitory_enrollment")
        .select("dormer_id, room_number")
        .eq("dormitory_id", dormitoryId)
        .eq("academic_period_id", academicPeriodId),

      supabase
        .from("payments")
        .select(`
          *,
          profiles!payments_recorded_by_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .eq("dormitory_id", dormitoryId)
        .eq("academic_period_id", academicPeriodId),
    ]);

    if (billsError) throw billsError;
    if (enrollmentError) throw enrollmentError;
    if (paymentsError) throw paymentsError;

    // Lookup maps for O(1) merging
    const roomMap = new Map(
      (enrollmentData ?? []).map((e) => [e.dormer_id, e.room_number])
    );

    // Group payments by bill_id
    const paymentsMap = new Map<string, PaymentWithRecorder[]>();
    for (const payment of paymentsData ?? []) {
      const recorder = payment.profiles as {
        first_name: string;
        last_name: string;
        email: string;
      } | null;

      const mapped: PaymentWithRecorder = {
        ...payment,
        recorded_by_full_name: recorder
          ? `${recorder.first_name} ${recorder.last_name}`.trim()
          : null,
        recorded_by_email: recorder?.email ?? null,
      };

      const existing = paymentsMap.get(payment.bill_id) ?? [];
      paymentsMap.set(payment.bill_id, [...existing, mapped]);
    } 

    return (billsData ?? []).map((bill) => {
      const profile = bill.profiles as {
        first_name: string;
        last_name: string;
      } | null;

      const payments = paymentsMap.get(bill.id) ?? [];
      const remaining_balance = Math.max(
        0,
        bill.total_amount_due - bill.amount_paid
      );

      return {
        ...bill,
        profiles: undefined,
        dormer_full_name: profile
          ? `${profile.first_name} ${profile.last_name}`.trim()
          : "Unknown",
        dormer_room: roomMap.get(bill.dormer_id) ?? null,
        remaining_balance,
        payments,
      } as BillWithPayments;
    });
  } catch (error) {
    console.error("Error listing bills with payments for dormitory: ", error);
    return [];
  }
}

// ─── Bills ───────────────────────────────────────────────────────────────────

export async function getBillById(id: string): Promise<BillWithDormer | null> {
  try {
    const { data: bill, error: billError } = await supabase
      .from("bills")
      .select(`
        *,
        profiles!bills_dormer_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq("id", id)
      .or("is_deleted.eq.false,is_deleted.is.null")
      .single();

    if (billError) throw billError;
    if (!bill) return null;

    const { data: enrollment } = await supabase
      .from("dormitory_enrollment")
      .select("room_number")
      .eq("dormer_id", bill.dormer_id)
      .eq("academic_period_id", bill.academic_period_id)
      .single();

    const profile = bill.profiles as { first_name: string; last_name: string } | null;

    return {
      ...bill,
      profiles: undefined,
      dormer_full_name: profile
        ? `${profile.first_name} ${profile.last_name}`.trim()
        : "Unknown",
      dormer_room: enrollment?.room_number ?? null,
    } as BillWithDormer;
  } catch (error) {
    console.error("Error getting bill by id: ", error);
    return null;
  }
}

export async function createBill(input: CreateBillInput): Promise<Bill> {
  const { data, error } = await supabase
    .from("bills")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBill(id: string, input: UpdateBillInput): Promise<Bill> {
  const { data, error } = await supabase
    .from("bills")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeBill(id: string): Promise<void> {
  const { error } = await supabase
    .from("bills")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) throw error;
}

export async function generateBillsForDormitory(
  dormitoryId: string,
  academicPeriodId: string,
  billingMonth: string,
  regularChargeId: string
): Promise<Bill[]> {
  const { data: charge, error: chargeError } = await supabase
    .from("regular_charges")
    .select("*")
    .eq("id", regularChargeId)
    .single();

  if (chargeError || !charge) throw chargeError ?? new Error("Regular charge not found.");

  const { data: enrollments, error: enrollmentError } = await supabase
    .from("dormitory_enrollment")
    .select("dormer_id")
    .eq("dormitory_id", dormitoryId)
    .eq("academic_period_id", academicPeriodId)
    .eq("status", "active");

  if (enrollmentError) throw enrollmentError;
  if (!enrollments?.length) return [];

  const { data: existingBills } = await supabase
    .from("bills")
    .select("dormer_id")
    .eq("dormitory_id", dormitoryId)
    .eq("academic_period_id", academicPeriodId)
    .eq("billing_month", billingMonth)
    .or("is_deleted.eq.false,is_deleted.is.null")
    .eq("regular_charge_id", regularChargeId);

  const alreadyBilled = new Set((existingBills ?? []).map((b) => b.dormer_id));

  const billsToInsert: CreateBillInput[] = enrollments
    .filter((e) => !alreadyBilled.has(e.dormer_id))
    .map((e) => ({
      dormer_id: e.dormer_id,
      dormitory_id: dormitoryId,
      academic_period_id: academicPeriodId,
      billing_month: billingMonth,
      regular_charge_id: regularChargeId,
      description: charge.name,
      total_amount_due: charge.amount,
      amount_paid: 0,
      status: "Unpaid" as const,
      is_deleted: false,
    }));

  if (!billsToInsert.length) return [];

  const { data, error } = await supabase
    .from("bills")
    .insert(billsToInsert)
    .select();

  if (error) throw error;
  return data;
}

export async function listForDormer(
  dormerId: string,
  academicPeriodId: string
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("dormer_id", dormerId)
    .eq("academic_period_id", academicPeriodId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

async function mapPaymentsWithRecorder(
  payments: (Payment & { profiles: unknown })[]
): Promise<PaymentWithRecorder[]> {
  return payments.map((payment) => {
    const recorder = payment.profiles as {
      first_name: string;
      last_name: string;
      email: string;
    } | null;

    return {
      ...payment,
      profiles: undefined,
      recorded_by_full_name: recorder
        ? `${recorder.first_name} ${recorder.last_name}`.trim()
        : null,
      recorded_by_email: recorder?.email ?? null,
    } as PaymentWithRecorder;
  });
}

const PAYMENT_WITH_RECORDER_SELECT = `
  *,
  profiles!payments_recorded_by_fkey (
    first_name,
    last_name,
    email
  )
`;

export async function listPaymentsForDormitory(
  dormitoryId: string,
  academicPeriodId: string
): Promise<PaymentWithRecorder[]> {
  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_WITH_RECORDER_SELECT)
    .eq("dormitory_id", dormitoryId)
    .eq("academic_period_id", academicPeriodId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return mapPaymentsWithRecorder(data ?? []);
}

export async function listPaymentsForBill(
  billId: string,
  academicPeriodId: string
): Promise<PaymentWithRecorder[]> {
  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_WITH_RECORDER_SELECT)
    .eq("bill_id", billId)
    .eq("academic_period_id", academicPeriodId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return mapPaymentsWithRecorder(data ?? []);
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data ?? null;
}

function mapPayment(input: any, academicPeriodId: string, dormitoryId: string, recordedBy: string) {
  return {
    academic_period_id: academicPeriodId,
    dormitory_id: dormitoryId,
    bill_id: input.bill_id,
    dormer_id: input.dormer_id,
    amount: input.amount_paid ?? input.amount,
    created_at: input.payment_date,
    payment_method: input.payment_method,
    recorded_by: recordedBy,
    notes: input.notes,
  } as CreatePaymentInput;
}

export async function recordPayment(
  input: any,
  academicPeriodId: string,
  dormitoryId: string,
  recordedBy: string
): Promise<Payment & { newStatus: string, newRemaining: number }> {
  const mappedInput = mapPayment(input, academicPeriodId, dormitoryId, recordedBy);
  console.log("mappedInput ", mappedInput)
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert(mappedInput)
    .select()
    .single();

  if (paymentError) throw paymentError;

  const { data: bill, error: billError } = await supabase
    .from("bills")
    .select("total_amount_due, amount_paid")
    .eq("id", input.bill_id)
    .single();

  if (billError) throw billError;

  const newAmountPaid = Math.min((bill.amount_paid ?? 0) + (input.amount_paid ?? input.amount), bill.total_amount_due);
  const remaining = Math.max(0, bill.total_amount_due - newAmountPaid);
  const status =
    remaining == 0 ? "Paid" : newAmountPaid > 0 ? "Partial" : "Unpaid";

  const { error: updateError } = await supabase
  .from("bills")
  .update({ 
    amount_paid: newAmountPaid, 
    status 
  })
  .eq("id", input.bill_id);

  if (updateError) throw updateError;

  return { ...payment, newStatus: status, newRemaining: remaining };
}


export async function updatePayment(
  id: string,
  input: UpdatePaymentInput
): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removePayment(id: string): Promise<void> {
  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  const { error: deleteError } = await supabase
    .from("payments")
    .delete()
    .eq("id", id);

  if (deleteError) throw deleteError;

  const { data: bill, error: billError } = await supabase
    .from("bills")
    .select("total_amount_due, amount_paid")
    .eq("id", payment.bill_id)
    .or("is_deleted.eq.false,is_deleted.is.null")
    .single();

  if (billError) throw billError;

  const newAmountPaid = Math.max(0, bill.amount_paid - payment.amount);
  const remaining = bill.total_amount_due - newAmountPaid;
  const status =
    remaining <= 0 ? "Paid" : newAmountPaid > 0 ? "Partial" : "Unpaid";

  const { error: updateError } = await supabase
    .from("bills")
    .update({ amount_paid: newAmountPaid, status })
    .eq("id", payment.bill_id);

  if (updateError) throw updateError;
}

function computeSummary(bills: { total_amount_due: number; amount_paid: number; status: string }[]): PaymentSummary {
  return bills.reduce(
    (acc, bill) => ({
      totalDue: acc.totalDue + bill.total_amount_due,
      totalPaid: acc.totalPaid + bill.amount_paid,
      remaining: acc.remaining + Math.max(0, bill.total_amount_due - bill.amount_paid),
      paidCount: acc.paidCount + (bill.status === "Paid" ? 1 : 0),
      unpaidCount: acc.unpaidCount + (bill.status !== "Paid" ? 1 : 0),
    }),
    { totalDue: 0, totalPaid: 0, remaining: 0, paidCount: 0, unpaidCount: 0 }
  );
}

export async function summaryForDormer(
  dormerId: string,
  academicPeriodId: string
): Promise<PaymentSummary> {
  const { data, error } = await supabase
    .from("bills")
    .select("total_amount_due, amount_paid, status")
    .eq("dormer_id", dormerId)
    .eq("academic_period_id", academicPeriodId)
    .or("is_deleted.eq.false,is_deleted.is.null");

  if (error) throw error;
  return computeSummary(data ?? []);
}

export async function summaryForDormitory(
  dormitoryId: string,
  academicPeriodId: string
): Promise<PaymentSummary> {
  const { data, error } = await supabase
    .from("bills")
    .select("total_amount_due, amount_paid, status")
    .eq("dormitory_id", dormitoryId)
    .eq("academic_period_id", academicPeriodId)
    .or("is_deleted.eq.false,is_deleted.is.null");

  if (error) throw error;
  return computeSummary(data ?? []);
}
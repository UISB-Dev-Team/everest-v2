import { createClient } from "@/lib/supabase/client";
import { ClearanceCertificate, ClearanceStatus } from "./types";
import { dormersData } from "@/features/dormers/data";

export async function getStatusForDormer(
  dormerId: string,
  academicPeriodId: string
): Promise<ClearanceStatus> {
  const supabase = createClient();

  const dormerData = await dormersData.getById(dormerId);
  if (!dormerData) throw new Error("Dormer not found");

  const [billResult, fineResult, eventsResult] = await Promise.all([
    supabase
      .from("bills")
      .select("*")
      .eq("dormer_id", dormerId)
      .eq("academic_period_id", academicPeriodId)
      .eq("is_deleted", false),
    supabase
      .from("fine_impositions")
      .select("*")
      .eq("dormer_id", dormerId)
      .eq("academic_period_id", academicPeriodId),
    supabase
      .from("events")
      .select("*")
      .eq("academic_period_id", academicPeriodId)
      .eq("is_deleted", false)
      .eq("status", "Active")
  ]);

  if (billResult.error || fineResult.error || eventsResult.error) {
    throw new Error("Failed to fetch clearance status");
  }

  let unpaidBillsCount = 0, unpaidBillsTotal = 0;
  let unpaidFinesCount = 0, unpaidFinesTotal = 0;
  let unpaidEventsCount = 0, unpaidEventsTotal = 0;

  for (const bill of billResult.data ?? []) {
    if (bill.status === "Unpaid") {
      unpaidBillsCount++;
      unpaidBillsTotal += bill.total_amount_due;
    }
  }

  for (const fine of fineResult.data ?? []) {
    if (fine.status === "Unpaid") {
      unpaidFinesCount++;
      unpaidFinesTotal += fine.amount;
    }
  }

  for (const event of eventsResult.data ?? []) {
    const { data: payment, error } = await supabase
      .from("event_payments")
      .select("*")
      .eq("event_id", event.id)
      .eq("dormer_id", dormerId)
      .eq("academic_period_id", academicPeriodId)
      .single();

    if (error || !payment) {
      unpaidEventsCount++;
      unpaidEventsTotal += event.amount_due;
    }
  }

  const outstandingTotal = unpaidBillsTotal + unpaidFinesTotal + unpaidEventsTotal;
  const dormerFullName = `${dormerData.first_name ?? ""} ${dormerData.last_name ?? ""}`.trim();

  return {
    dormerId,
    dormerFullName,
    academicPeriodId,
    unpaidBillsCount,
    unpaidBillsTotal,
    unpaidFinesCount,
    unpaidFinesTotal,
    unpaidEventsCount,
    unpaidEventsTotal,
    outstandingTotal,
    isCleared: outstandingTotal === 0,
  };
}

export async function listForDormitory(
  dormitoryId: string,
  academicPeriodId: string
): Promise<ClearanceStatus[]> {
  const dormersList = await dormersData.listForDormitory(dormitoryId, academicPeriodId);

  return Promise.all(
    dormersList
      .filter(Boolean)
      .map((dormer) => getStatusForDormer(dormer.id, academicPeriodId))
  );
}

export async function issueCertificate(
  dormerId: string,
  academicPeriodId: string
): Promise<ClearanceCertificate> {
  const supabase = createClient();

  // Run both fetches concurrently
  const [dormerData, dormerStatus] = await Promise.all([
    dormersData.getById(dormerId),
    getStatusForDormer(dormerId, academicPeriodId),
  ]);

  if (!dormerData) throw new Error("Dormer not found");
  if (!dormerStatus.isCleared) throw new Error("Dormer is not cleared");

  const { data, error } = await supabase
    .from("clearance_certificates")
    .insert([{ dormer_id: dormerId, academic_period_id: academicPeriodId, issued_at: new Date().toISOString() }])
    .select()
    .single();

  if (error || !data) throw new Error("Failed to issue certificate");

  return {
    dormerId,
    dormerFullName: `${dormerData.first_name ?? ""} ${dormerData.last_name ?? ""}`.trim(),
    academicPeriodId,
    issuedAt: data.issued_at, 
    reference: data.id,
  };
}
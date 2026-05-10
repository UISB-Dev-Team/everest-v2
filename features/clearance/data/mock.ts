import billsFixture from "@/mocks/fixtures/bills.json";
import impositionsFixture from "@/mocks/fixtures/fine-impositions.json";
import dormersFixture from "@/mocks/fixtures/dormers.json";
import type { Bill } from "@/features/payments/data";
import type { FineImposition } from "@/features/fines/data";
import type { ClearanceCertificate, ClearanceStatus } from "./types";

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

const bills = billsFixture as Bill[];
const impositions = impositionsFixture as FineImposition[];

function buildStatus(
  dormerId: string,
  academicPeriodId: string
): ClearanceStatus {
  const dormer = dormersFixture.find((d) => d.id === dormerId);
  const dormerBills = bills.filter(
    (b) => b.dormer_id === dormerId && b.academic_period_id === academicPeriodId
  );
  const dormerFines = impositions.filter(
    (f) => f.dormer_id === dormerId && f.academic_period_id === academicPeriodId
  );

  const unpaidBills = dormerBills.filter(
    (b) => b.amount_paid < b.total_amount_due
  );
  const unpaidFines = dormerFines.filter((f) => f.amount_paid < f.amount);

  const unpaidBillsTotal = unpaidBills.reduce(
    (s, b) => s + (b.total_amount_due - b.amount_paid),
    0
  );
  const unpaidFinesTotal = unpaidFines.reduce(
    (s, f) => s + (f.amount - f.amount_paid),
    0
  );

  return {
    dormerId,
    dormerFullName: dormer
      ? `${dormer.first_name} ${dormer.last_name}`
      : "Unknown",
    academicPeriodId,
    isCleared: unpaidBills.length === 0 && unpaidFines.length === 0,
    unpaidBillsCount: unpaidBills.length,
    unpaidBillsTotal,
    unpaidFinesCount: unpaidFines.length,
    unpaidFinesTotal,
    outstandingTotal: unpaidBillsTotal + unpaidFinesTotal,
  };
}

export async function getStatusForDormer(
  dormerId: string,
  academicPeriodId: string
): Promise<ClearanceStatus> {
  await delay();
  return buildStatus(dormerId, academicPeriodId);
}

export async function listForDormitory(
  dormitoryId: string,
  academicPeriodId: string
): Promise<ClearanceStatus[]> {
  await delay();
  return dormersFixture
    .filter((d) => d.dormitory_id === dormitoryId)
    .map((d) => buildStatus(d.id, academicPeriodId));
}

export async function issueCertificate(
  dormerId: string,
  academicPeriodId: string
): Promise<ClearanceCertificate> {
  await delay();
  const status = buildStatus(dormerId, academicPeriodId);
  if (!status.isCleared) {
    throw new Error("Dormer has outstanding obligations and cannot be cleared.");
  }
  return {
    dormerId,
    dormerFullName: status.dormerFullName,
    academicPeriodId,
    issuedAt: new Date().toISOString(),
    reference: `CLR-MOCK-${Date.now().toString(36).toUpperCase()}`,
  };
}

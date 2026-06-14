"use server";

import { listForDormitory as listDormers } from "@/features/dormers/data/supabase";
import { listForDormitory as listRegularCharges } from "@/features/regular-charges/data/supabase";
import type { Dormer } from "@/features/dormers/data/types";
import type { RegularCharge } from "@/features/regular-charges/data/types";
import { listPaymentsForDormitory, summaryForDormitory } from "@/features/payments/data/supabase";
import { Bill, PaymentSummary, PaymentWithRecorder } from "@/features/payments/data";
import { AdminDashboardSnapshot, DormerDashboardSnapshot, SuperAdminDashboardSnapshot } from "./types";
import { dormersData } from "@/features/dormers/data";
import { clearanceData } from "@/features/clearance/data";
import { finesData } from "@/features/fines/data";
import { dormitoriesData } from "@/features/dormitories/data";
import { academicPeriodsData } from "@/features/academic-periods/data";

export interface DashboardStats {
  summary: PaymentSummary;
  dormers: Dormer[];
  regularCharges: RegularCharge[];
  recentPayments: PaymentWithRecorder[];
}

export async function getDashboardStats(
  dormitoryId: string,
  academicPeriodId: string
): Promise<DashboardStats> {
  const [summary, dormers, regularCharges, recentPayments] = await Promise.all([
    summaryForDormitory(dormitoryId, academicPeriodId),
    listDormers(dormitoryId, academicPeriodId),
    listRegularCharges(dormitoryId, academicPeriodId),
    listPaymentsForDormitory(dormitoryId, academicPeriodId),
  ]);

  return { summary, dormers, regularCharges, recentPayments };
}

export async function getDormerSnapshot(dormerId: string, academicPeriodId: string): Promise<DormerDashboardSnapshot> {
  const dormerBills = await dormersData.getDormerBills(dormerId, academicPeriodId) as Bill[];
  const dormerFines = await finesData.listImpositionsForDormer(dormerId, academicPeriodId);
  const totalBilled = dormerBills.reduce((acc, bill) => acc + bill.total_amount_due, 0);
  const totalPaid = dormerBills.reduce((acc, bill) => acc + bill.amount_paid, 0);
  const totalFines = dormerFines.reduce((acc, fine) => acc + fine.amount, 0);
  const outstanding = totalBilled - totalPaid;

  return { 
    totalBilled,
    totalPaid,
    outstanding,
    totalFines,
    recentBills: dormerBills.slice(0, 5),
    recentFines: dormerFines.slice(0, 5),
   };
}

export async function getAdminSnapshot(dormitoryId: string, academicPeriodId: string): Promise<AdminDashboardSnapshot> {
  return {
    dormerCount: 0,
    totalBilled: 0,
    totalCollected: 0,
    outstanding: 0,
    totalCollectibles: 0,
    totalExpenses: 0,
    dormFundBalance: 0,
    unpaidFinesTotal: 0,
    recentBills: [],
    recentTransactions: [],
  }
}

export async function getSuperAdminSnapshot(): Promise<SuperAdminDashboardSnapshot> {
  const [dormitories, dormers, academicPeriod] = await Promise.all([
    dormitoriesData.list(),
    dormersData.list(),
    academicPeriodsData.getCurrent()
  ]);
  
  return {
    dormitoryCount: dormitories.length,
    dormerCount: dormers.length,
    totalCollected: 0,
    outstanding: 0,
    currentAcademicYear: academicPeriod?.academic_year ?? "",
    currentSemester: academicPeriod?.semester ?? "",
  };
}

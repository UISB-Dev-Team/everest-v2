"use server";

import { listForDormitory as listDormers } from "@/features/dormers/data/supabase";
import { listForDormitory as listRegularCharges } from "@/features/regular-charges/data/supabase";
import type { Dormer } from "@/features/dormers/data/types";
import type { RegularCharge } from "@/features/regular-charges/data/types";
import { listPaymentsForDormitory, summaryForDormitory } from "@/features/payments/data/supabase";
import { PaymentSummary, PaymentWithRecorder } from "@/features/payments/data";

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
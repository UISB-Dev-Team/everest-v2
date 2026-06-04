import * as supabase from "./supabase";
import type { ClearanceCertificate, ClearanceStatus } from "./types";

export interface ClearanceDataAccess {
  getStatusForDormer(
    dormerId: string,
    academicPeriodId: string
  ): Promise<ClearanceStatus>;
  listForDormitory(
    dormitoryId: string,
    academicPeriodId: string
  ): Promise<ClearanceStatus[]>;
  issueCertificate(
    dormerId: string,
    academicPeriodId: string
  ): Promise<ClearanceCertificate>;
}

export const clearanceData: ClearanceDataAccess = supabase;

export type { ClearanceCertificate, ClearanceStatus } from "./types";

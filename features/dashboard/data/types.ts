import type { Bill } from "@/features/payments/data";
import type { FineImpositionWithCategory } from "@/features/fines/data";

export interface DormerDashboardSnapshot {
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  recentBills: Bill[];
  recentFines: FineImpositionWithCategory[];
}

export interface AdminDashboardSnapshot {
  dormerCount: number;
  totalBilled: number;
  totalCollected: number;
  outstanding: number;
  unpaidFinesTotal: number;
  recentBills: Bill[];
}

export interface SuperAdminDashboardSnapshot {
  dormitoryCount: number;
  dormerCount: number;
  totalCollected: number;
  outstanding: number;
  currentAcademicYear: string | null;
  currentSemester: string | null;
}

import type { Bill } from "@/features/payments/data";
import type { FineImpositionWithCategory } from "@/features/fines/data";

export interface DormerDashboardSnapshot {
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  totalFines: number;
  recentBills: Bill[];
  recentFines: FineImpositionWithCategory[];
}

export interface RecentTransaction {
  id: string;
  type: "payment" | "expense";
  date: string;
  amount: number;
  description: string;
}

export interface AdminDashboardSnapshot {
  dormerCount: number;
  totalBilled: number;
  totalCollected: number;
  outstanding: number;
  totalCollectibles: number;
  totalExpenses: number;
  dormFundBalance: number;
  unpaidFinesTotal: number;
  recentBills: Bill[];
  recentTransactions: RecentTransaction[];
}

export interface SuperAdminDashboardSnapshot {
  dormitoryCount: number;
  dormerCount: number;
  totalCollected: number;
  outstanding: number;
  currentAcademicYear: string | null;
  currentSemester: string | null;
}

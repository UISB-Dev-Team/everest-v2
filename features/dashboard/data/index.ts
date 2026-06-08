import * as supabase from "./supabase";
import type {
  AdminDashboardSnapshot,
  DormerDashboardSnapshot,
  SuperAdminDashboardSnapshot,
} from "./types";

export interface DashboardDataAccess {
  getDormerSnapshot(dormerId: string, academicPeriodId: string): Promise<DormerDashboardSnapshot>;
  getAdminSnapshot(dormitoryId: string, academicPeriodId: string): Promise<AdminDashboardSnapshot>;
  getSuperAdminSnapshot(): Promise<SuperAdminDashboardSnapshot>;
}

export const dashboardData: DashboardDataAccess = supabase;

export type {
  AdminDashboardSnapshot,
  DormerDashboardSnapshot,
  SuperAdminDashboardSnapshot,
} from "./types";


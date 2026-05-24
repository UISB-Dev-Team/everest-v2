import * as mock from "./mock";
import type {
  AdminDashboardSnapshot,
  DormerDashboardSnapshot,
  SuperAdminDashboardSnapshot,
} from "./types";

export interface DashboardDataAccess {
  getDormerSnapshot(dormerId: string): Promise<DormerDashboardSnapshot>;
  getAdminSnapshot(dormitoryId: string): Promise<AdminDashboardSnapshot>;
  getSuperAdminSnapshot(): Promise<SuperAdminDashboardSnapshot>;
}

export const dashboardData: DashboardDataAccess = mock;

export type {
  AdminDashboardSnapshot,
  DormerDashboardSnapshot,
  SuperAdminDashboardSnapshot,
} from "./types";


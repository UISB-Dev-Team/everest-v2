import * as supabase from "./supabase";
import type {
  CreateDormitoryInput,
  Dormitory,
  DormitoryWithStats,
  UpdateDormitoryInput,
} from "./types";

export interface DormitoriesDataAccess {
  list(): Promise<Dormitory[]>;
  listWithStats(): Promise<DormitoryWithStats[]>;
  getById(id: string): Promise<Dormitory | null>;
  create(input: CreateDormitoryInput): Promise<Dormitory | null>;
  update(id: string, input: UpdateDormitoryInput): Promise<Dormitory | null>;
  remove(id: string): Promise<void>;
}

export const dormitoriesData: DormitoriesDataAccess = supabase;

export type {
  CreateDormitoryInput,
  Dormitory,
  DormitoryWithStats,
  UpdateDormitoryInput,
} from "./types";

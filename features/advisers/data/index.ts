import * as supabase from "./supabase";
import type {
  Adviser,
  CreateAdviserInput,
  UpdateAdviserInput,
} from "./types";

export interface AdvisersDataAccess {
  list(): Promise<Adviser[]>;
  listForDormitory(dormitoryId: string): Promise<Adviser[]>;
  getById(id: string): Promise<Adviser | null>;
  create(input: CreateAdviserInput): Promise<Adviser | void>;
  update(input: UpdateAdviserInput): Promise<Adviser | void>;
  remove(id: string): Promise<void>;
}

export const advisersData: AdvisersDataAccess = supabase;

export type {
  Adviser,
  CreateAdviserInput,
  DormitoryRole,
  Profile,
  UpdateAdviserInput,
} from "./types";

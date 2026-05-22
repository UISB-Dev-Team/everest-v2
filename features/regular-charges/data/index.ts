import * as supabase from "./supabase";
import type {
  CreateRegularChargeInput,
  RegularCharge,
  UpdateRegularChargeInput,
} from "./types";

export interface RegularChargesDataAccess {
  listForDormitory(dormitoryId: string): Promise<RegularCharge[]>;
  getById(id: string): Promise<RegularCharge | null>;
  createRegularCharge(input: CreateRegularChargeInput): Promise<RegularCharge>;
  updateRegularCharge(
    id: string,
    input: UpdateRegularChargeInput
  ): Promise<RegularCharge>;
  remove(id: string): Promise<void>;
}

export const regularChargesData: RegularChargesDataAccess = supabase;

export type {
  CreateRegularChargeInput,
  RegularCharge,
  UpdateRegularChargeInput,
} from "./types";

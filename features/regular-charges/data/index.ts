import * as mock from "./mock";
import type {
  CreateRegularChargeInput,
  RegularCharge,
  UpdateRegularChargeInput,
} from "./types";

export interface RegularChargesDataAccess {
  listForDormitory(dormitoryId: string): Promise<RegularCharge[]>;
  getById(id: string): Promise<RegularCharge | null>;
  create(input: CreateRegularChargeInput): Promise<RegularCharge>;
  update(
    id: string,
    input: UpdateRegularChargeInput
  ): Promise<RegularCharge>;
  remove(id: string): Promise<void>;
}

export const regularChargesData: RegularChargesDataAccess = mock;

export type {
  CreateRegularChargeInput,
  RegularCharge,
  UpdateRegularChargeInput,
} from "./types";

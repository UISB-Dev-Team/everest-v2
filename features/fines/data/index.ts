import * as mock from "./mock";
import type {
  CreateFineImpositionInput,
  FineCategory,
  FineImposition,
  FineImpositionWithCategory,
  FineSummary,
} from "./types";

export interface FinesDataAccess {
  listCategoriesForDormitory(dormitoryId: string): Promise<FineCategory[]>;
  listImpositionsForDormer(
    dormerId: string
  ): Promise<FineImpositionWithCategory[]>;
  listImpositionsForDormitory(
    dormitoryId: string
  ): Promise<FineImpositionWithCategory[]>;
  imposeFine(input: CreateFineImpositionInput): Promise<FineImposition>;
  summaryForDormer(dormerId: string): Promise<FineSummary>;
}

export const finesData: FinesDataAccess = mock;

export type {
  CreateFineImpositionInput,
  FineCategory,
  FineImposition,
  FineImpositionWithCategory,
  FineSummary,
} from "./types";

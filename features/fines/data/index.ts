import * as mock from "./mock";
import type {
  CreateFineCategoryInput,
  CreateFineImpositionInput,
  FineCategory,
  FineImposition,
  FineImpositionWithCategory,
  FineStatistics,
  FineSummary,
  UpdateFineCategoryInput,
  UpdateFineImpositionInput,
} from "./types";

export interface FinesDataAccess {
  // Categories
  listCategoriesForDormitory(dormitoryId: string): Promise<FineCategory[]>;
  createCategory(input: CreateFineCategoryInput): Promise<FineCategory>;
  updateCategory(
    id: string,
    input: UpdateFineCategoryInput
  ): Promise<FineCategory>;
  removeCategory(id: string): Promise<void>;

  // Impositions
  listImpositionsForDormer(
    dormerId: string
  ): Promise<FineImpositionWithCategory[]>;
  listImpositionsForDormitory(
    dormitoryId: string
  ): Promise<FineImpositionWithCategory[]>;
  imposeFine(input: CreateFineImpositionInput): Promise<FineImposition>;
  imposeRoomFine(
    inputs: CreateFineImpositionInput[]
  ): Promise<FineImposition[]>;
  updateImposition(
    id: string,
    input: UpdateFineImpositionInput
  ): Promise<FineImposition>;
  removeImposition(id: string): Promise<void>;
  recordFinePayment(
    id: string,
    amount: number,
    paymentMethod: string
  ): Promise<FineImposition>;

  // Aggregates
  summaryForDormer(dormerId: string): Promise<FineSummary>;
  statisticsForDormitory(dormitoryId: string): Promise<FineStatistics>;
}

export const finesData: FinesDataAccess = mock;

export type {
  CreateFineCategoryInput,
  CreateFineImpositionInput,
  FineCategory,
  FineImposition,
  FineImpositionWithCategory,
  FineStatistics,
  FineSummary,
  ImportedFine,
  MappedFine,
  UpdateFineCategoryInput,
  UpdateFineImpositionInput,
} from "./types";

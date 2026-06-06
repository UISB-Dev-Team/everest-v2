import * as supabase from "./supabase";
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
  listCategoriesForDormitory(dormitoryId: string, academicPeriodId: string): Promise<FineCategory[]>;
  createCategory(input: CreateFineCategoryInput): Promise<FineCategory>;
  updateCategory(
    id: string,
    input: UpdateFineCategoryInput
  ): Promise<FineCategory | null>;
  removeCategory(id: string): Promise<void>;

  // Impositions
  listImpositionsForDormer(
    dormerId: string
  ): Promise<FineImpositionWithCategory[]>;
  listImpositionsForDormitory(
    dormitoryId: string, academicPeriodId: string
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
  summaryForDormer(dormerId: string, academicPeriodId: string): Promise<FineSummary>;
  statisticsForDormitory(dormitoryId: string, academicPeriodId: string): Promise<FineStatistics>;
}

export const finesData: FinesDataAccess = supabase;

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

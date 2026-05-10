import type { Tables, TablesInsert, TablesUpdate } from "@/database.types";

export type FineCategory = Tables<"fines">;
export type FineImposition = Tables<"fine_impositions">;

export type CreateFineCategoryInput = TablesInsert<"fines">;
export type UpdateFineCategoryInput = TablesUpdate<"fines">;

export type CreateFineImpositionInput = TablesInsert<"fine_impositions">;
export type UpdateFineImpositionInput = TablesUpdate<"fine_impositions">;

/** A fine imposition joined with category + dormer (matches old PaymentFinesData shape). */
export interface FineImpositionWithCategory extends FineImposition {
  category_name: string;
  category_description: string | null;
  dormer_full_name: string;
  dormer_room: string | null;
  /** Set when this imposition is part of a "room fine" (multiple dormers same room/date/category). */
  room_fine_id?: string | null;
  room_number?: string | null;
}

export interface FineSummary {
  totalAmount: number;
  totalPaid: number;
  remaining: number;
  unpaidCount: number;
}

export interface FineStatistics {
  totalFines: number;
  collectedFines: number;
  collectibleFines: number;
}

export interface ImportedFine {
  email: string;
  first_name: string;
  last_name: string;
  amount: number;
  reason: string;
  fine_id: string;
  date_imposed: string;
  rowNumber: number;
  isParsingError?: boolean;
  error?: string;
}

export interface MappedFine extends ImportedFine {
  dormer_id: string;
  dormitory_id: string;
  originalIndex: number;
}

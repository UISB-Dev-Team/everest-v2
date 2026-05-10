import type { Tables, TablesInsert } from "@/database.types";

export type FineCategory = Tables<"fines">;
export type FineImposition = Tables<"fine_impositions">;

export type CreateFineImpositionInput = TablesInsert<"fine_impositions">;

export interface FineImpositionWithCategory extends FineImposition {
  category_name: string;
  dormer_full_name: string;
}

export interface FineSummary {
  totalAmount: number;
  totalPaid: number;
  remaining: number;
  unpaidCount: number;
}

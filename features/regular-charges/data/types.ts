import type { Tables, TablesInsert, TablesUpdate } from "@/database.types";

/** Regular monthly charge / "payable". */
export type RegularCharge = Tables<"regular_charges">;
export type CreateRegularChargeInput = TablesInsert<"regular_charges">;
export type UpdateRegularChargeInput = TablesUpdate<"regular_charges">;

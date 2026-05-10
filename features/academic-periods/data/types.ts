import type { Tables, TablesInsert, TablesUpdate } from "@/database.types";

export type AcademicPeriod = Tables<"academic_periods">;
export type CreateAcademicPeriodInput = TablesInsert<"academic_periods">;
export type UpdateAcademicPeriodInput = TablesUpdate<"academic_periods">;

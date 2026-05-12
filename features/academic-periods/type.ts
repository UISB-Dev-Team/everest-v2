import { Tables } from "@/database.types";

export type AcademicPeriod = Tables<"academic_periods">;

export interface AcademicPeriodStore {
    all: AcademicPeriod[];
    selected: AcademicPeriod | null;
    loading: boolean;
    error: string | null;
    setSelected: (period: AcademicPeriod) => void;
    setAll: (periods: AcademicPeriod[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}
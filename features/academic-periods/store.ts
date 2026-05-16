import { create } from "zustand";
import { AcademicPeriod, AcademicPeriodStore } from "./type";

export const useAcademicPeriodStore = create<AcademicPeriodStore>(set => ({
    all: [],
    selected: null,
    loading: true,
    error: null,
    setSelected: (period: AcademicPeriod) => set({ selected: period }),
    setAll: (periods: AcademicPeriod[]) => set({ all: periods }),
    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: string | null) => set({ error }),
}));
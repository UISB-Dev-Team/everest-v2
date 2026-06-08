import { Tables } from "@/database.types";

export type AcademicPeriod = Tables<"academic_periods">;

import { create } from "zustand";

interface AcademicPeriodStore {
    all:        AcademicPeriod[];
    current:    AcademicPeriod | null;  // always the DB is_current period
    selected:   AcademicPeriod | null;  // user-controlled, defaults to current
    loading:    boolean;
    error:      string | null;

    setAll:      (periods: AcademicPeriod[]) => void;
    setCurrent:  (period: AcademicPeriod) => void;
    setSelected: (period: AcademicPeriod) => void;
    setLoading:  (loading: boolean) => void;
    setError:    (error: string) => void;
}

export const useAcademicPeriodStore = create<AcademicPeriodStore>((set) => ({
    all:      [],
    current:  null,
    selected: null,
    loading:  false,
    error:    null,

    setAll:      (all)     => set({ all }),
    setCurrent:  (current) => set({ current }),
    setSelected: (selected) => set({ selected }),
    setLoading:  (loading)  => set({ loading }),
    setError:    (error)    => set({ error }),
}));
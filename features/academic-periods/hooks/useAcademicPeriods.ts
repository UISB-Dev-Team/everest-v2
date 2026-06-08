"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAcademicPeriodStore } from "../store";
import { AcademicPeriod } from "../type";

const supabase = createClient();

/**
 * Single hook for academic periods.
 *
 * - `all`         — every period, sorted newest first
 * - `current`     — the one marked is_current in the DB (read-only reference)
 * - `selected`    — what the user has picked (defaults to current on first load)
 * - `setSelected` — lets any component switch the active selection
 */
export function useAcademicPeriod() {
    const {
        all,
        current,
        selected,
        loading,
        error,
        setAll,
        setCurrent,
        setSelected,
        setLoading,
        setError,
    } = useAcademicPeriodStore();

    useEffect(() => {
        if (all.length > 0) return; // already loaded — skip refetch

        setLoading(true);
        supabase
            .from("academic_periods")
            .select("id, academic_year, semester, start_date, end_date, is_current, created_at")
            .order("start_date", { ascending: false })
            .then(({ data, error }) => {
                if (error || !data) {
                    setError(error?.message ?? "Failed to load periods");
                    setLoading(false);
                    return;
                }

                const mapped: AcademicPeriod[] = data.map((d) => ({
                    id: d.id,
                    academic_year: d.academic_year,
                    semester: d.semester,
                    start_date: d.start_date,
                    end_date: d.end_date,
                    is_current: d.is_current,
                    created_at: d.created_at,
                }));

                setAll(mapped);

                const activePeriod = mapped.find((p) => p.is_current) ?? mapped[0] ?? null;
                if (activePeriod) {
                    setCurrent(activePeriod);             // permanent reference to the DB-active period
                    if (!selected) setSelected(activePeriod); // default selection, only if not already set
                }

                setLoading(false);
            });
    }, []);

    return { all, current, selected, loading, error, setSelected };
}
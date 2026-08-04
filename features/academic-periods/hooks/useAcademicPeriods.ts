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

    const refresh = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("academic_periods")
                .select("*")
                .eq("is_deleted", false)
                .order("start_date", { ascending: false });

            if (error || !data) {
                setError(error?.message ?? "Failed to load periods");
                return;
            }

            const mapped: AcademicPeriod[] = data.map((d) => ({
                id: d.id,
                academic_year: d.academic_year,
                semester: d.semester as "1st" | "2nd" | "Summer",
                start_date: d.start_date,
                end_date: d.end_date,
                is_current: d.is_current,
                created_at: d.created_at,
                is_deleted: d.is_deleted,
            }));

            setAll(mapped);

            const activePeriod = mapped.find((p) => p.is_current) ?? mapped[0] ?? null;
            if (activePeriod) {
                setCurrent(activePeriod);             // permanent reference to the DB-active period
                if (!selected || !mapped.some((p) => p.id === selected.id)) {
                    setSelected(activePeriod);         // default selection
                }
            }
        } catch (err: any) {
            setError(err?.message ?? "Failed to load periods");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (all.length > 0) return; // already loaded — skip refetch
        refresh();
    }, []);

    return { all, current, selected, loading, error, setSelected, refresh };
}
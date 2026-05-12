"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAcademicPeriodStore } from "../store";
import { AcademicPeriod } from "../type";

const supabase = createClient();

export function useAcademicPeriod() {
    const { all, selected, loading, error, setAll, setSelected, setLoading, setError } =
        useAcademicPeriodStore();

    useEffect(() => {
        if (all.length > 0) return;

        setLoading(true);
        supabase
            .from("academic_periods")
            .select("id, academic_year, semester, start_date, end_date, is_current")
            .order("start_date", { ascending: false })
            .then(({ data, error }) => {
                if (error || !data) {
                    setError(error?.message ?? "Failed to load periods");
                    setLoading(false);
                    return;
                }

                const mapped = data.map((d) => ({
                    id: d.id,
                    academic_year: d.academic_year,
                    semester: d.semester,
                    start_date: d.start_date,
                    end_date: d.end_date,
                    is_current: d.is_current,
                }));

                setAll(mapped as AcademicPeriod[]);
                const current = mapped.find((p) => p.is_current) ?? mapped[0];
                if (current && !selected) setSelected(current as AcademicPeriod);
                setLoading(false);
            });
    }, []);

    return { all, selected, loading, error, setSelected };
}
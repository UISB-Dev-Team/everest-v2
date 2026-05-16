"use client";


import { useEffect, useState } from "react";
import { createClient } from "../supabase/client";

const supabaseClient = createClient();
interface AcademicPeriod {
    id: string;
    academicYear: string;
    semester: string;
    startDate: string;
    endDate: string;
}

interface AcademicPeriodState {
    current: AcademicPeriod | null;
    loading: boolean;
    error: string | null;
}

export function useAcademicPeriod(): AcademicPeriodState {
    const [state, setState] = useState<AcademicPeriodState>({
        current: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        supabaseClient
            .from("academic_periods")
            .select("id, academic_year, semester, start_date, end_date")
            .eq("is_current", true)
            .single()
            .then(({ data, error }) => {
                if (error || !data) {
                    setState({ current: null, loading: false, error: error?.message ?? "Not found" });
                    return;
                }
                setState({
                    current: {
                        id: data.id,
                        academicYear: data.academic_year,
                        semester: data.semester,
                        startDate: data.start_date,
                        endDate: data.end_date,
                    },
                    loading: false,
                    error: null,
                });
            });
    }, []);

    return state;
}
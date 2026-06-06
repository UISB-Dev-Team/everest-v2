"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useEffect, useState } from "react";
import { createClient } from "../supabase/client";

interface DormitoryInfo {
    dormitoryId: string | null;
    enrollmentId: string | null;
    roomNumber: string | null;
    dormitoryName: string | null;
    loading: boolean;
    logoUrl: string | null;
}

const supabaseClient = createClient();

export function useDormitory(): DormitoryInfo {
    const { user } = useAuth();
    const [info, setInfo] = useState<DormitoryInfo>({
        dormitoryId: null,
        enrollmentId: null,
        roomNumber: null,
        dormitoryName: null,
        logoUrl: null,
        loading: true,
    });

    useEffect(() => {
    let cancelled = false;

    if (!user) {
        setInfo({
            dormitoryId: null,
            enrollmentId: null,
            roomNumber: null,
            dormitoryName: null,
            logoUrl: null,
            loading: false,
        });
        return;
    }

    // ✅ Advisers/admins have dormitoryId directly in metadata — no DB query needed
    if (user.dormitoryId && user.role !== "dormer") {
        setInfo({
            dormitoryId: user.dormitoryId,
            enrollmentId: null,
            roomNumber: null,
            dormitoryName: null,
            logoUrl: null,
            loading: true, // still loading name
        });

        // just fetch the name
        supabaseClient
            .from("dormitories")
            .select("name")
            .eq("id", user.dormitoryId)
            .single()
            .then(({ data }) => {
                if (!cancelled) {
                    setInfo(prev => ({
                        ...prev,
                        dormitoryName: data?.name ?? null,
                        loading: false,
                    }));
                }
            });

        return () => { cancelled = true; };
    }

    // Dormers — fetch from enrollment
    setInfo(prev => ({ ...prev, loading: true }));

    const fetchEnrollment = async () => {
        try {
            const { data, error } = await supabaseClient
                .from("dormitory_enrollment")
                .select("id, dormitory_id, room_number, dormitory_id(name, logo_url)")
                .eq("dormer_id", user.id)
                .limit(1)
                .single();

            if (cancelled) return;
            if (error) throw error;

            setInfo({
                dormitoryId: data.dormitory_id,
                enrollmentId: data.id,
                roomNumber: data.room_number,
                dormitoryName: data.dormitory_id?.name ?? null,
                logoUrl: data.dormitory_id?.logo_url ?? null,
                loading: false,
            });
        } catch (e) {
            if (!cancelled) {
                console.error("useDormitory fetch error:", e);
                setInfo({
                    dormitoryId: user.dormitoryId ?? null,
                    enrollmentId: null,
                    roomNumber: null,
                    dormitoryName: null,
                    logoUrl: null,
                    loading: false,
                });
            }
        }
    };

    fetchEnrollment();
    return () => { cancelled = true; };
}, [user?.id, user?.dormitoryId, user?.role]);
    return info;
}
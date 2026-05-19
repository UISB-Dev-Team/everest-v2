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
}

const supabaseClient = createClient();

export function useDormitory(): DormitoryInfo {
    const { user } = useAuth();
    const [info, setInfo] = useState<DormitoryInfo>({
        dormitoryId: null,
        enrollmentId: null,
        roomNumber: null,
        dormitoryName: null,
        loading: true,
    })

    useEffect(() => {
        if (!user) {
            setInfo({
                dormitoryId: null,
                enrollmentId: null,
                roomNumber: null,
                dormitoryName: null,
                loading: false,
            });
            return;
        }

        if(user.dormitoryId) {
            setInfo({
                dormitoryId: user.dormitoryId,
                enrollmentId: null,
                roomNumber: null,
                dormitoryName: null,
                loading: false,
            })
        }

        supabaseClient
            .from("dormitory_enrollment")
            .select("id, dormitory_id, room_number, academic_period_id, dormitory_id(name)")
            .eq("dormer_id", user.id)
            .limit(1)
            .single()
            .then(({data, error}) => {
                if(error) throw error;
                if(data) {
                    setInfo({
                        dormitoryId: data.dormitory_id,
                        enrollmentId: data.id,
                        roomNumber: data.room_number,
                        dormitoryName: data.dormitory_id?.name ?? null,
                        loading: false,
                    })
                } else {
                    setInfo({
                        dormitoryId: null,
                        enrollmentId: null,
                        roomNumber: null,
                        dormitoryName: null,
                        loading: false,
                    })
                }
            })
        
    }, [user?.id, user?.dormitoryId]);
    console.log(info)
    return info;
}
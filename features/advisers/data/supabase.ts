import { createClient } from "@/lib/supabase/client";
import type { Adviser, CreateAdviserInput, UpdateAdviserInput } from "./types";

const supabase = createClient()

export async function list(): Promise<Adviser[]> {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_active", true);


    if (error || !data) {
        console.error("Error fetching profiles:", error);
        return [];
    }

    const { data: roles, error: roleError } = await supabase
        .from("dormitory_roles")
        .select("*")
        .eq("role", "adviser")

    if (roleError) {
        console.error("Error fetching roles:", roleError);
        return [];
    }

    const { data: dormitories, error: dormError } = await supabase
        .from("dormitories")
        .select("id, name");

    if (dormError) {
        console.error("Error fetching dormitories:", dormError);
    }

    const advisers = data.map((row) => {
        const role = roles.find((r) => r.user_id === row.id);

        if (!role) return null;

        const dorm = dormitories?.find((d) => d.id === role.dormitory_id);

        return {
            ...row,
            role_id: role.id,
            role: role.role,
            dormitory_id: role.dormitory_id,
            dormitory_name: dorm?.name ?? null,
        } as Adviser;
    }).filter((a): a is Adviser => a !== null);

    return advisers;
}

export async function listForDormitory(dormitoryId: string): Promise<Adviser[]> {
    // TO DO for Norman  
    return []
}

export async function getById(id: string): Promise<Adviser | null> {
    // TO DO for Norman   
    return null
}

export async function create(input: CreateAdviserInput): Promise<Adviser | void> {
    // TO DO for Norman   
}

export async function update(input: UpdateAdviserInput): Promise<Adviser | void> {
    // TO DO for Norman   
}

export async function remove(id: string): Promise<void> {
    // TO DO for Norman   
}
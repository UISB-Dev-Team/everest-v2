"use server";

import { createClient } from "@/lib/supabase/client";
import supabaseAdmin from "@/lib/supabase/admin";
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

    const { data: roles, error: roleError } = await supabase
        .from("dormitory_roles")
        .select("*")
        .eq("dormitory_id", dormitoryId)
        .eq("role", "adviser");

    if (roleError || !roles || roles.length === 0) {
        if (roleError) console.error("Error fetching dormitory roles:", roleError);
        return [];
    }

    const userIds = roles.map((r) => r.user_id);

    const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds)
        .eq("is_active", true);

    if (profileError || !profiles) {
        console.error("Error fetching dormitory profiles:", profileError);
        return [];
    }

    const { data: dorm } = await supabase
        .from("dormitories")
        .select("name")
        .eq("id", dormitoryId)
        .single();

    const advisers = profiles.map((row) => {
        const role = roles.find((r) => r.user_id === row.id);
        if (!role) return null;

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

export async function getById(id: string): Promise<Adviser | null> {
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

    if (profileError || !profile) {
        console.error("Error fetching dormitory profiles:", profileError);
        return null;
    }

    const { data: role, error: roleError } = await supabase
        .from("dormitory_roles")
        .select("*")
        .eq("user_id", id)
        .eq("role", "adviser")
        .single();

    if (roleError || !role) {
        console.error("Error fetching dormitory roles:", roleError);
        return null;
    }

    if (!role.dormitory_id) {
        console.error("Adviser role is missing a dormitory_id");
        return null;
    }

    const { data: dormitory, error: dormError } = await supabase
        .from("dormitories")
        .select("id, name")
        .eq("id", role.dormitory_id)
        .single();

    if (dormError) {
        console.error("Error fetching dormitories:", dormError);
    }

    return {
        ...profile,
        role_id: role.id,
        role: role.role,
        dormitory_id: role.dormitory_id,
        dormitory_name: dormitory?.name ?? null,
    } as Adviser;
}

export async function create(input: CreateAdviserInput): Promise<Adviser | void> {
    const { dormitory_id, role, ...profileInput } = input;

    if (!dormitory_id) throw new Error("dormitory_id is required.");

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: profileInput.email,
        password: "DefaultPassword123!",
        email_confirm: true,
        user_metadata: {
            first_name: profileInput.first_name,
            last_name: profileInput.last_name,
            full_name: `${profileInput.first_name} ${profileInput.last_name}`,
            role: role,
            dormitory_id: dormitory_id,
        },
    });

    if (authError || !authData.user) {
        console.error("Error creating auth user:", authError);
        throw authError;
    }

    const userId = authData.user.id;

    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
            ...profileInput,
            id: userId,
        })
        .select()
        .single();

    if (profileError) {
        console.error("Error creating profile:", profileError);
        throw profileError;
    }

    const { data: newRole, error: roleError } = await supabaseAdmin
        .from("dormitory_roles")
        .insert({
            user_id: userId,
            dormitory_id: dormitory_id,
            role: role,
        })
        .select()
        .single();

    if (roleError) {
        console.error("Error creating role:", roleError);
        throw roleError;
    }

    const { data: dorm } = await supabaseAdmin
        .from("dormitories")
        .select("name")
        .eq("id", dormitory_id)
        .single();

    return {
        ...profile,
        role_id: newRole.id,
        role: role,
        dormitory_id: dormitory_id,
        dormitory_name: dorm?.name ?? null,
    } as Adviser;
}

export async function update(input: UpdateAdviserInput): Promise<Adviser | void> {
    // 1. Extract `id` so it isn't part of `profileInput`
    const { id, dormitory_id, role, ...profileInput } = input;

    // 2. Only update if there are actual profile fields to change
    if (Object.keys(profileInput).length > 0) {
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .update(profileInput)
            .eq("id", id);

        if (profileError) throw new Error(profileError.message);
    }

    // 3. Only update the role if dormitory_id or role is provided
    if (dormitory_id !== undefined || role !== undefined) {
        const updates: any = {};
        if (dormitory_id !== undefined) updates.dormitory_id = dormitory_id;
        if (role !== undefined) updates.role = role;

        const { error: roleError } = await supabaseAdmin
            .from("dormitory_roles")
            .update(updates)
            .eq("user_id", id);

        if (roleError) {
            console.error("Error updating role:", roleError);
            throw roleError;
        }
    }

    // 4. Fetch the fully updated adviser object to return
    const updatedAdviser = await getById(id);
    if (!updatedAdviser) {
        throw new Error("Failed to retrieve updated adviser");
    }

    return updatedAdviser;
}

export async function remove(id: string): Promise<void> {
    try {
        const { error: roleError } = await supabaseAdmin
            .from("dormitory_roles")
            .update({ is_active: false })
            .eq("user_id", id);

        if (roleError) {
            console.error("Error removing adviser role:", roleError);
            throw new Error(roleError.message);
        }

        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .update({ is_active: false })
            .eq("id", id);

        if (profileError) {
            console.error("Error removing adviser profile:", profileError);
            throw new Error(profileError.message);
        }
        await supabaseAdmin.auth.admin.updateUserById(id, {
            ban_duration: "876000h"
        })
    } catch (e) {
        console.error("Failed to remove adviser", e);
        throw e;
    }
}
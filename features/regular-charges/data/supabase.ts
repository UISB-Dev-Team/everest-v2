"use server"

import { createClient } from "@/lib/supabase/client";
import type { CreateRegularChargeInput, RegularCharge, UpdateRegularChargeInput } from "./types";

const supabase = createClient();

export async function listForDormitory(dormitoryId: string, academicPeriodId: string): Promise<RegularCharge[]> {
    try{
        console.log(academicPeriodId)
        const { data, error } = await supabase.from("regular_charges").select("*")
        .eq("dormitory_id", dormitoryId)
        .eq("academic_period_id", academicPeriodId)
        .or("is_deleted.eq.false,is_deleted.is.null");

        console.log("data here", data)
        if(error){
            throw error;
        }
        return data as RegularCharge[];
    }catch(error){
        console.error("Error listing regular charges for dormitory: ", error);
        return [];
    }
}

export async function getById(id: string): Promise<RegularCharge | null> {
    try{
        const { data, error } = await supabase.from("regular_charges")
                                                .select("*")
                                                .eq("id", id)
                                                .single();
        if(error){
            throw error;
        }
        return data as RegularCharge;
    }catch(error){
        console.error("Error getting regular charge by ID: ", error);
        return null;
    }
}

export async function createRegularCharge(input: CreateRegularChargeInput): Promise<RegularCharge> {
    try{
        const { data, error } = await supabase
            .from("regular_charges")
            .insert([input])
            .select("*")
            .single();
        if(error){
            throw error;
        }
        return data as RegularCharge;
    }catch(error){
        console.error("Error creating regular charge: ", error);
        throw error;
    }
}
  
export async function updateRegularCharge(
    id: string,
    input: UpdateRegularChargeInput
  ): Promise<RegularCharge> {
    try{
        const { data, error } = await supabase.from("regular_charges").update(input).eq("id", id).select("*").single();
        if(error){
            throw error;
        }
        return data as RegularCharge;
    }catch(error){
        console.error("Error updating regular charge: ", error);
        throw error;
    }
}

export async function remove(id: string): Promise<void> {
    try{
        const { error } = await supabase
            .from("regular_charges")
            .update({"is_deleted": true})
            .eq("id", id);
        if(error){
            throw error;
        }
    }catch(error){
        console.error("Error removing regular charge: ", error);
    }
}
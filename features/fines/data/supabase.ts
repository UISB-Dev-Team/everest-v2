import { createClient } from "@/lib/supabase/client";
import type { CreateFineCategoryInput, CreateFineImpositionInput, FineCategory, FineImposition, FineImpositionWithCategory, FineStatistics, FineSummary, UpdateFineCategoryInput, UpdateFineImpositionInput } from "./types";

const supabase = createClient()

export async function listCategoriesForDormitory(dormitoryId: string, academicPeriodId: string): Promise<FineCategory[]> {
  const { data, error } = await supabase
    .from("fines")
    .select("*")
    .eq("dormitory_id", dormitoryId)
    .eq("academic_period_id", academicPeriodId)
  
  if (error) {
    console.error("Error fetching fine categories:", error)
    throw error
  }
  
  if (data) {
    return data
  } 
  return []
}

export async function createCategory(input: CreateFineCategoryInput): Promise<FineCategory> {
  const { data, error } = await supabase
    .from("fines")
    .insert([input])
    .select("*")
    .single()
  
  if (error) {
    console.error("Error creating fine category:", error)
    throw error
  }
  
  if(!data) {
    console.error("No fine category created")
    throw new Error("No fines")
  }
  
  return data
}
export async function updateCategory(
  id: string,
  input: UpdateFineCategoryInput
): Promise<FineCategory | null> {
  const { data, error } = await supabase
    .from("fines")
    .update(input)
    .eq("id", id)
    .select("*")
    .single()
  
  if (error) {
    console.error("Error updating fine category:", error)
    throw error
  }
  
  if(!data) {
    console.error("No fine category updated")
    return null
  }
  
  return data
}

export async function removeCategory(id: string): Promise<void>{
  const { error } = await supabase
    .from("fines")
    .delete()
    .eq("id", id)
  
  if (error) {
    console.error("Error removing fine category:", error)
    throw error
  }
}
// Impositions
export async function listImpositionsForDormer(
    dormerId: string
): Promise<FineImpositionWithCategory[]> {
    const { data, error } = await supabase
        .from("fine_impositions")
        .select(`
            *,
            fines!fine_impositions_fine_id_fkey(name, description),
            profiles!fine_impositions_dormer_id_fkey(first_name, last_name),
            dormitory_enrollment(room_number)
        `)
        .eq("dormer_id", dormerId);

    if (error) {
        console.error("Error fetching fine impositions:", error);
        throw error;
    }

    if (!data || data.length === 0) return [];

    return data.map((row) => {
        const { fines, profiles, dormitory_enrollment, ...imposition } = row;

        // dormitory_enrollment is an array (one-to-many); grab the first one
        const enrollment = Array.isArray(dormitory_enrollment)
            ? dormitory_enrollment[0]
            : dormitory_enrollment;

        return {
            ...imposition,
            category_name: fines?.name ?? "Unknown",
            category_description: fines?.description ?? null,
            dormer_full_name: `${profiles?.first_name ?? ""} ${profiles?.last_name ?? ""}`.trim(),
            dormer_room: enrollment?.room_number ?? null,
            room_fine_id: null,
            room_number: enrollment?.room_number ?? null,
        };
    });
}

export async function listImpositionsForDormitory(
    dormitoryId: string,
    academicPeriodId: string
): Promise<FineImpositionWithCategory[]> {
    if(!dormitoryId) {
        throw new Error("No dormitory ID")
    }
    if(!academicPeriodId) {
        throw new Error("No Academic Period ID")
    }
    const { data, error } = await supabase
        .from("fine_impositions")
        .select(`
            *,
            fines!fine_impositions_fine_id_fkey(name, description),
            profiles!fine_impositions_dormer_id_fkey(first_name, last_name),
            dormitory_enrollment(room_number)
        `)
        .eq("dormitory_id", dormitoryId)
        .eq("dormitory_enrollment.academic_period_id", academicPeriodId);

    if (error) {
        console.error("Error fetching fine impositions for dormitory:", error);
        throw error;
    }

    if (!data || data.length === 0) return [];

    return data.map((row) => {
        const { fines, profiles, dormitory_enrollment, ...imposition } = row;

        const enrollment = Array.isArray(dormitory_enrollment)
            ? dormitory_enrollment[0]
            : dormitory_enrollment;

        return {
            ...imposition,
            category_name: fines?.name ?? "Unknown",
            category_description: fines?.description ?? null,
            dormer_full_name: `${profiles?.first_name ?? ""} ${profiles?.last_name ?? ""}`.trim(),
            dormer_room: enrollment?.room_number ?? null,
            room_fine_id: null,
            room_number: enrollment?.room_number ?? null,
        };
    });
}

export async function imposeFine(
    input: CreateFineImpositionInput
): Promise<FineImposition> {
    const { data, error } = await supabase
        .from("fine_impositions")
        .insert(input)
        .select()
        .single();

    if (error) {
        console.error("Error imposing fine:", error);
        throw error;
    }

    return data;
}

export async function imposeRoomFine(
    inputs: CreateFineImpositionInput[]
): Promise<FineImposition[]> {
    if (inputs.length === 0) return [];

    const { data, error } = await supabase
        .from("fine_impositions")
        .insert(inputs)
        .select();

    if (error) {
        console.error("Error imposing room fines:", error);
        throw error;
    }

    return data ?? [];
}

export async function updateImposition(
    id: string,
    input: UpdateFineImpositionInput
): Promise<FineImposition> {
    const { data, error } = await supabase
        .from("fine_impositions")
        .update(input)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating imposition:", error);
        throw error;
    }

    return data;
}

export async function removeImposition(id: string): Promise<void> {
    const { error } = await supabase
        .from("fine_impositions")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error removing imposition:", error);
        throw error;
    }
}

export async function recordFinePayment(
    id: string,
    amount: number,
    paymentMethod: string,
): Promise<FineImposition> {
    // Fetch current amounts to compute new paid total and status
    const { data: current, error: fetchError } = await supabase
        .from("fine_impositions")
        .select("amount, amount_paid")
        .eq("id", id)
        .single();

    if (fetchError) {
        console.error("Error fetching imposition for payment:", fetchError);
        throw fetchError;
    }

    const newAmountPaid = (current.amount_paid ?? 0) + amount;
    const newStatus: "Unpaid" | "Paid" = newAmountPaid >= current.amount ? "Paid" : "Unpaid";

    const { data, error } = await supabase
        .from("fine_impositions")
        .update({
            amount_paid: newAmountPaid,
            payment_method: paymentMethod,
            payment_date: new Date().toISOString(),
            status: newStatus,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error recording fine payment:", error);
        throw error;
    }

    return data;
}

// Aggregates
export async function summaryForDormer(dormerId: string, academicPeriodId: string): Promise<FineSummary> {
    const { data, error } = await supabase
        .from("fine_impositions")
        .select("amount, amount_paid, status")
        .eq("dormer_id", dormerId)
        .eq("academic_period_id", academicPeriodId);

    if (error) {
        console.error("Error fetching fine summary for dormer:", error);
        throw error;
    }

    const rows = data ?? [];

    const totalAmount  = rows.reduce((sum, r) => sum + (r.amount ?? 0), 0);
    const totalPaid    = rows.reduce((sum, r) => sum + (r.amount_paid ?? 0), 0);
    const unpaidCount  = rows.filter((r) => r.status === "Unpaid").length;

    return {
        totalAmount,
        totalPaid,
        remaining: totalAmount - totalPaid,
        unpaidCount,
    };
}

export async function statisticsForDormitory(
    dormitoryId: string,
    academicPeriodId: string
): Promise<FineStatistics> {
    const { data, error } = await supabase
        .from("fine_impositions")
        .select("*")
        .eq("dormitory_id", dormitoryId)
        .eq("academic_period_id", academicPeriodId);

    if (error) {
        console.error("Error fetching fine statistics for dormitory:", error);
        throw error;
    }

    const rows = data ?? [];

    const totalFines       = rows.reduce((sum, r) => sum + (r.amount ?? 0), 0);
    const collectedFines   = rows.reduce((sum, r) => sum + (r.amount_paid ?? 0), 0);
    const collectibleFines = totalFines - collectedFines;

    return {
        totalFines,
        collectedFines,
        collectibleFines,
    };
}
"use server";
import { createClient } from "@/lib/supabase/client";
import supabaseAdmin from "@/lib/supabase/admin";
import type {
    CreateExpenseInput,
    Expense,
    ExpenseSummaryStats,
    ExpenseWithRecorder,
    UpdateExpenseInput,
} from "./types";

const supabase = createClient();

export async function listForDormitory(
    dormitoryId: string,
    academicPeriodId: string
): Promise<ExpenseWithRecorder[]> {
    const { data, error } = await supabase
        .from("expenses")
        .select("*, profiles(*)")
        .eq("dormitory_id", dormitoryId)
        .eq("academic_period_id", academicPeriodId)
        .eq("is_deleted", false);

    if (error) {
        console.error("Error fetching expenses:", error);
        return [];
    }

    return data.map((expense) => {
        const profile = expense.profiles as {
            first_name: string;
            last_name: string;
            email: string;
        } | null;

        return {
            ...expense,
            profiles: undefined,
            recordedByFullName: profile
                ? `${profile.first_name} ${profile.last_name}`.trim()
                : "Unknown",
            recordedByEmail: profile?.email ?? null,
        } as ExpenseWithRecorder;
    });
}

export async function getById(id: string): Promise<ExpenseWithRecorder | null> {
    const { data, error } = await supabase
        .from("expenses")
        .select("*, profiles(*)")
        .eq("id", id)
        .eq("is_deleted", false)
        .maybeSingle();

    if (error || !data) {
        console.error("Error fetching expense:", error);
        return null;
    }


    return {
        ...data,
        recordedByFullName: data.profiles?.first_name + " " + data.profiles?.last_name,
        recordedByEmail: data.profiles?.email
    } as ExpenseWithRecorder;
}

export async function create(input: CreateExpenseInput, academicPeriodId: string): Promise<Expense> {
    const { dormitory_id, ...expenseInput } = input;
    const { data, error } = await supabase
        .from("expenses")
        .insert({
            ...expenseInput,
            dormitory_id,
            academic_period_id: academicPeriodId,
            is_deleted: false,
        })
        .select("*")
        .single();

    if (error || !data) {
        console.error("Error creating expense:", error);
        throw new Error("Failed to create expense");
    }

    return data as Expense;
}

export async function update(id: string, input: UpdateExpenseInput): Promise<Expense> {
    const { data, error } = await supabase
        .from("expenses")
        .update(input)
        .eq("id", id)
        .select("*")
        .maybeSingle();

    if (error || !data) {
        console.error("Error updating expense:", error);
        throw new Error("Failed to update expense");
    }

    return data as Expense;
}

export async function remove(id: string): Promise<void> {
    const { error } = await supabase
        .from("expenses")
        .update({ is_deleted: true })
        .eq("id", id);

    if (error) {
        console.error("Error deleting expense:", error);
        throw new Error("Failed to delete expense");
    }
}

export async function summaryForDormitory(dormitoryId: string, academicPeriodId: string): Promise<ExpenseSummaryStats> {
    const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("dormitory_id", dormitoryId)
        .eq("academic_period_id", academicPeriodId)
        .eq("is_deleted", false);

    if (error || !data) {
        console.error("Error fetching expenses:", error);
        return {
            totalExpenses: 0,
            monthlyExpenses: 0,
            topCategory: "",
            expensesByCategory: {}
        };
    }

    const monthlyExpenses = data.reduce((acc, expense) => acc + expense.amount, 0);
    const totalExpenses = data.reduce((acc, expense) => acc + expense.amount, 0);
    let topCategory = ""
    let maxAmount = 0
    for (const expense of data) {
        if (expense.amount > maxAmount) {
            maxAmount = expense.amount;
            topCategory = expense?.category!;
        }
    }
    const expensesByCategory: Record<string, number> = {}
    for (const expense of data) {
        if (expense.category !== null) {
            expensesByCategory[expense.category!] = (expensesByCategory[expense.category!] || 0) + expense.amount
        }
    }

    return {
        totalExpenses,
        monthlyExpenses,
        topCategory,
        expensesByCategory,
    };
}

export async function uploadReceiptImage(file: File) {
    const { data, error } = await supabaseAdmin.storage
        .from("receipt-images")
        .upload(`${Date.now()}-${file.name}`, file);

    if (error) {
        console.error("Error uploading receipt:", error);
        throw new Error("Failed to upload receipt");
    }

    const { data: urlData } = supabaseAdmin.storage
        .from("receipt-images")
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}
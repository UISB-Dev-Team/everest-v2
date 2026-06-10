import { createClient } from "@/lib/supabase/client";
import type { AcademicPeriod, CreateAcademicPeriodInput, UpdateAcademicPeriodInput } from "./types";

const supabase = createClient();

export async function list(): Promise<AcademicPeriod[]> {
  const { data, error } = await supabase
    .from("academic_periods")
    .select("*")
    .eq("is_deleted", false)
    .order("start_date", { ascending: false });

  if (error || !data) {
    throw error;
  }

  return data;
}

export async function getCurrent(): Promise<AcademicPeriod | null> {
  const { data, error } = await supabase
    .from("academic_periods")
    .select("*")
    .eq("is_current", true)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getById(id: string): Promise<AcademicPeriod | null> {
  const { data, error } = await supabase
    .from("academic_periods")
    .select("*")
    .eq("is_deleted", false)
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function create(input: CreateAcademicPeriodInput): Promise<AcademicPeriod> {
  if (input.is_current) {
    const { error: resetError } = await supabase
      .from("academic_periods")
      .update({ is_current: false })
      .neq("id", "");
    if (resetError) throw resetError;
  }

  const { data, error } = await supabase
    .from("academic_periods")
    .insert([input])
    .select("*")
    .single();

  if (error || !data) {
    throw error;
  }

  return data;
}

export async function update(id: string, input: UpdateAcademicPeriodInput): Promise<AcademicPeriod> {
  if (input.is_current) {
    const { error: resetError } = await supabase
      .from("academic_periods")
      .update({ is_current: false })
      .neq("id", id);
    if (resetError) throw resetError;
  }

  const { data, error } = await supabase
    .from("academic_periods")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw error;
  }

  return data;
}

export async function setCurrent(id: string): Promise<AcademicPeriod> {
  const { error: resetError } = await supabase
    .from("academic_periods")
    .update({ is_current: false })
    .neq("id", id);
  if (resetError) throw resetError;

  const { data, error } = await supabase
    .from("academic_periods")
    .update({ is_current: true })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw error;
  }

  return data;
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase
    .from("academic_periods")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) {
    throw error;
  }
}
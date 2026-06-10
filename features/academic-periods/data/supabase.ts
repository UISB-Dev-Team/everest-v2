import { createClient } from "@/lib/supabase/client";
import type { AcademicPeriod, CreateAcademicPeriodInput, UpdateAcademicPeriodInput } from "./types";

const supabase = createClient();

export async function list(): Promise<AcademicPeriod[]> {
  const { data, error } = await supabase
    .from("academic_periods")
    .select("id, academic_year, semester, start_date, end_date, is_current, created_at")
    .order("start_date", { ascending: false });

  if (error || !data) {
    throw error;
  }

  return data;
}

export async function getCurrent(): Promise<AcademicPeriod | null> {
  const { data, error } = await supabase
    .from("academic_periods")
    .select("id, academic_year, semester, start_date, end_date, is_current, created_at")
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
    .select("id, academic_year, semester, start_date, end_date, is_current, created_at")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function create(input: CreateAcademicPeriodInput): Promise<AcademicPeriod> {
  const { data, error } = await supabase
    .from("academic_periods")
    .insert([input])
    .select("id, academic_year, semester, start_date, end_date, is_current, created_at")
    .single();

  if (error || !data) {
    throw error;
  }

  return data;
}

export async function update(id: string, input: UpdateAcademicPeriodInput): Promise<AcademicPeriod> {
  const { data, error } = await supabase
    .from("academic_periods")
    .update(input)
    .eq("id", id)
    .select("id, academic_year, semester, start_date, end_date, is_current, created_at")
    .single();

  if (error || !data) {
    throw error;
  }

  return data;
}

export async function setCurrent(id: string): Promise<AcademicPeriod> {
  const { data, error } = await supabase
    .from("academic_periods")
    .update({ is_current: true })
    .eq("id", id)
    .select("id, academic_year, semester, start_date, end_date, is_current, created_at")
    .single();

  if (error || !data) {
    throw error;
  }

  return data;
}
import { createClient } from "@/lib/supabase/client";
import type { CreateDormitoryInput, Dormitory, DormitoryWithStats, UpdateDormitoryInput } from "./types";

const supabase = createClient();

export async function list(): Promise<Dormitory[]> {
  const { data, error } = await supabase
    .from("dormitories")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listWithStats(): Promise<DormitoryWithStats[]> {
  const { data, error } = await supabase
    .from("dormitories")
    .select("*")
    .eq("is_deleted", false);

  if (error) throw error;
  if (!data) return [];

  return Promise.all(
    data.map(async (dorm) => {
      const [
        { data: enrollments, error: enrollmentError },
        { data: adviser, error: adviserError },
      ] = await Promise.all([
        supabase
          .from("dormitory_enrollment")
          .select("*")
          .eq("dormitory_id", dorm.id),
        supabase
          .from("dormitory_roles")
          .select("*, profiles!dormitory_roles_user_id_fkey(*)")
          .eq("dormitory_id", dorm.id)
          .eq("role", "adviser")
          .eq("primary_adviser", true)
          .maybeSingle(),
      ]);

      if (enrollmentError) throw enrollmentError;
      if (adviserError) throw adviserError;

      const occupancy = enrollments?.length ?? 0;
      const occupancy_percentage =
        dorm.capacity > 0 ? (occupancy / dorm.capacity) * 100 : 0;

      const adviser_full_name = adviser
        ? `${adviser.profiles.first_name} ${adviser.profiles.last_name}`.trim()
        : null;

      return {
        ...dorm,
        occupancy,
        occupancy_percentage,
        adviser_full_name,
      };
    })
  );
}

export async function getById(id: string): Promise<Dormitory | null> {
  const { data, error } = await supabase.from("dormitories").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}
export async function create(input: CreateDormitoryInput): Promise<Dormitory> {
  const { data, error } = await supabase.from("dormitories").insert(input).single();
  if (error) throw error;
  return data;
}
export async function update(id: string, input: UpdateDormitoryInput): Promise<Dormitory> {
  const { data, error } = await supabase.from("dormitories").update(input).eq("id", id).single();
  if (error) throw error;
  return data;
}
export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from("dormitories").delete().eq("id", id);
  if (error) throw error;
}
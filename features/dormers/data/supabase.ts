"use server";
import { createClient } from "@/lib/supabase/client";
import supabaseAdmin from "@/lib/supabase/admin";
import type {
  CreateDormerInput,
  Dormer,
  DormerProfile,
  DormerWithBills,
  UpdateDormerInput,
} from "./types";


// export interface DormersDataAccess {
//   list(): Promise<Dormer[]>;
//   listForDormitory(dormitoryId: string): Promise<Dormer[]>;
//   listForDormitoryWithBills(dormitoryId: string): Promise<DormerWithBills[]>;
//   getById(id: string): Promise<Dormer | null>;
//   create(input: CreateDormerInput): Promise<Dormer>;
//   update(id: string, input: UpdateDormerInput): Promise<Dormer>;
//   remove(id: string): Promise<void>;
//   importMany(inputs: CreateDormerInput[]): Promise<Dormer[]>;
// }

const supabase = createClient();

export async function list(academicPeriodId?: string): Promise<Dormer[]> {
  let query = supabase
    .from("dormitory_enrollment")
    .select("*, profiles(*)");

  if (academicPeriodId) {
    query = query.eq("academic_period_id", academicPeriodId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching dormers:", error);
    return [];
  }

  console.log(data);
  return data as unknown as Dormer[];
}

export async function listForDormitory(
  dormitoryId: string,
  academicPeriodId?: string
): Promise<Dormer[]> {
  const periodId = academicPeriodId || await getCurrentAcademicPeriodId();

  const { data, error } = await supabase
    .from("dormitory_enrollment")
    .select("*, profiles(*)")
    .eq("dormitory_id", dormitoryId)
    .eq("academic_period_id", periodId);

  if (error) {
    console.error("Error fetching dormers:", error);
    return [];
  }

  return data.map((row) => ({
    ...(row.profiles as DormerProfile),
    dormitory_id: row.dormitory_id,
    room_number: row.room_number,
  })) as Dormer[];
}

export async function listForDormitoryWithBills(
  dormitoryId: string,
  academicPeriodId?: string
): Promise<DormerWithBills[]> {
  const periodId = academicPeriodId || await getCurrentAcademicPeriodId();

  const { data: enrollments, error: enrollError } = await supabase
    .from("dormitory_enrollment")
    .select("*, profiles(*)")
    .eq("dormitory_id", dormitoryId)
    .eq("academic_period_id", periodId);

  if (enrollError || !enrollments) {
    console.error("Error fetching dormers:", enrollError);
    return [];
  }

  const profileIds = enrollments
    .map((e) => (e.profiles as DormerProfile)?.id)
    .filter(Boolean) as string[];

  const { data: bills, error: billsError } = await supabase
    .from("bills")
    .select("*")
    .in("dormer_id", profileIds)
    .eq("academic_period_id", periodId);

  if (billsError) {
    console.error("Error fetching bills:", billsError);
  }

  return enrollments.map((row) => {
    const profile = row.profiles as DormerProfile;
    return {
      ...profile,
      dormitory_id: row.dormitory_id,
      room_number: row.room_number,
      bills: (bills ?? []).filter((b) => b.dormer_id === profile.id),
    } as DormerWithBills;
  });
}

async function getCurrentAcademicPeriodId(): Promise<string> {
  const { data, error } = await supabase
    .from("academic_periods")
    .select("id")
    .eq("is_current", true)
    .single();
  console.log(data)
  console.log(error)

  if (error || !data) {
    throw new Error("Could not find the current active academic period.");
  }
  return data.id;
}

export async function getById(id: string): Promise<Dormer | null> {
  let periodId: string | null = null;
  try {
    periodId = await getCurrentAcademicPeriodId();
    console.log(periodId)
  } catch (e) {
    // Ignore if no active period
  }

  if (periodId) {
    const { data, error } = await supabase
      .from("dormitory_enrollment")
      .select("*, profiles(*)")
      .eq("dormer_id", id)
      .eq("academic_period_id", periodId)
      .maybeSingle();

    if (data) {
      return {
        ...(data.profiles as DormerProfile),
        dormitory_id: data.dormitory_id,
        room_number: data.room_number,
      } as Dormer;
    }
  }

  // Fallback to just profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!profile) return null;

  return {
    ...profile,
    dormitory_id: null,
    room_number: null,
  } as Dormer;
}

export async function create(input: CreateDormerInput) {
  const { dormitory_id, room_number, ...profileInput } = input;

  if (!dormitory_id) throw new Error("dormitory_id is required to create a dormer.");

  // Step 1: Create auth user (triggers profile row creation)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: profileInput.email,
    password: "DefaultPass123!",
    email_confirm: true,
    user_metadata: {
      first_name: profileInput.first_name,
      last_name: profileInput.last_name,
      full_name: `${profileInput.first_name} ${profileInput.last_name}`,
      role: "dormer",
      dormitory_id,
    },
  });

  if (authError || !authData.user) throw authError;

  const userId = authData.user.id;

  // Step 2: Upsert profile (trigger may have already created it)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .upsert({
      ...profileInput,
      id: userId,
    })
    .select()
    .single();

  if (profileError) throw profileError;

  // Step 3: Get current academic period (required for enrollment)
  const academicPeriod = await getCurrentAcademicPeriodId()

  if (!academicPeriod) {
    throw new Error("No active academic period found. Please set a current academic period before enrolling a dormer.");
  }

  // Step 4: Create dormitory enrollment
  const { error: enrollmentError } = await supabase
    .from("dormitory_enrollment")
    .insert({
      dormer_id: userId,
      dormitory_id,
      academic_period_id: academicPeriod,
      room_number: room_number ?? null,
      status: "active",
    });

  if (enrollmentError) throw enrollmentError;

  // Step 5: Create dormitory role as dormer
  const { error: roleError } = await supabase
    .from("dormitory_roles")
    .insert({
      user_id: userId,
      dormitory_id,
      role: "dormer",
    });

  if (roleError) throw roleError;

  return profile;
}

export async function update(
  id: string,
  input: UpdateDormerInput
): Promise<Dormer> {
  const { dormitory_id, room_number, ...profileInput } = input;

  if (Object.keys(profileInput).length > 0) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileInput)
      .eq("id", id);

    if (profileError) throw new Error(profileError.message);
  }

  if (dormitory_id !== undefined || room_number !== undefined) {
    try {
      const periodId = await getCurrentAcademicPeriodId();

      const { data: existing } = await supabase
        .from("dormitory_enrollment")
        .select("id")
        .eq("dormer_id", id)
        .eq("academic_period_id", periodId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("dormitory_enrollment")
          .update({
            dormitory_id: dormitory_id ?? undefined,
            room_number: room_number ?? undefined,
          })
          .eq("id", existing.id);
      } else if (dormitory_id) {
        await supabase.from("dormitory_enrollment").insert({
          dormer_id: id,
          dormitory_id: dormitory_id,
          room_number: room_number ?? null,
          academic_period_id: periodId,
        });
      }
    } catch (e) {
      console.error("Failed to update enrollment", e);
    }
  }

  const updated = await getById(id);
  if (!updated) throw new Error("Failed to retrieve updated dormer");
  return updated;
}

export async function remove(id: string): Promise<void> {
  try {
    const periodId = await getCurrentAcademicPeriodId();
    const { error } = await supabase
      .from("dormitory_enrollment")
      .delete()
      .eq("dormer_id", id)
      .eq("academic_period_id", periodId);

    if (error) {
      console.error("Error removing dormer enrollment:", error);
      throw new Error(error.message);
    }
  } catch (e) {
    console.error("Failed to remove enrollment", e);
  }
}

export async function importMany(
  inputs: CreateDormerInput[]
): Promise<Dormer[]> {
  const created: Dormer[] = [];
  for (const input of inputs) {
    //created.push(await create(input));
  }
  return created;
}
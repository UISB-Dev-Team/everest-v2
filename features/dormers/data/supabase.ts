"use server";
import { createClient } from "@/lib/supabase/client";
import supabaseAdmin from "@/lib/supabase/admin";
import type {
  CreateDormerInput,
  Dormer,
  DormerProfile,
  DormerWithBills,
  Room,
  UpdateDormerInput,
} from "./types";
import { sendEmail } from "@/lib/email";
import { welcomeAdviser } from "@/emails/dormers/welcomeAdviser";
import { Profile } from "@/features/advisers/data";
import { Bill } from "@/features/payments/data";


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

  if (error || !data) {
    console.error("Error fetching enrollments:", error);
    return [];
  }

  const { data: roles, error: roleError } = await supabase
    .from("dormitory_roles")
    .select("*")
    .eq("role", "dormer")

  if (roleError) {
    console.error("Error fetching roles:", roleError);
    return [];
  }

  const dormers = data.filter((row) => roles.some((role) => role.user_id === row.profiles?.id));

  if (error) {
    console.error("Error fetching dormers:", error);
    return [];
  }

  return dormers as unknown as Dormer[];
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
    .eq("status", "active")
    .eq("academic_period_id", periodId);

  if (error) {
    console.error("Error fetching dormers:", error);
    return [];
  }

  const { data: roles, error: roleError } = await supabase
    .from("dormitory_roles")
    .select("*")
    .eq("dormitory_id", dormitoryId)
    .eq("role", "dormer")

  if (roleError) {
    console.error("Error fetching roles:", roleError);
    return [];
  }

  const dormers = data.filter((row) => roles.some((role) => role.user_id === row.profiles?.id));

  return dormers.map((row) => ({
    ...(row.profiles as DormerProfile),
    dormitory_id: row.dormitory_id,
    dormer_enrollment_id: row.id,
    room_number: row.room_number,
  })) as Dormer[];
}

export async function listRoomsForDormitory(
  dormitoryId: string
) : Promise<Room[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("dormitory_id", dormitoryId)

  if(error || !data) {
    console.error("Error fetching rooms:", error);
    return [];
  }

  return data
}

export async function getDormerByEmail(email: string) : Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle()
  
  if(error) {
    throw new Error(error.message)
  }

  return data ?? null
}

export async function getDormerBills(dormerId: string, academicPeriodId: string): Promise<Bill[]> {
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("dormer_id", dormerId)
    .eq("academic_period_id", academicPeriodId);

  if (error) {
    console.error("Error fetching bills:", error);
    return [];
  }

  return data as Bill[];
}

/**
 * Re-enrolls an existing profile (from a previous sem) into the given academic period.
 * Does NOT create a new auth user or profile — only inserts a dormitory_enrollment row
 * and upserts the dormitory role.
 */
export async function enrollExistingDormer(
  profileId: string,
  input: Pick<CreateDormerInput, "dormitory_id" | "room_number" | "role">,
  academicPeriodId: string
): Promise<void> {
  const { dormitory_id, room_number, role } = input;

  if (!dormitory_id) throw new Error("dormitory_id is required.");

  // ── 1. Enrollment ──────────────────────────────────────────────────────────

  const { data: existingEnrollment } = await supabase
    .from("dormitory_enrollment")
    .select("id")
    .eq("dormer_id", profileId)
    .eq("academic_period_id", academicPeriodId)
    .maybeSingle();

  if (existingEnrollment) {
    // Already enrolled — reactivate and update room/dormitory
    const { error } = await supabase
      .from("dormitory_enrollment")
      .update({
        status: "active",
        dormitory_id,
        room_number: room_number ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingEnrollment.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("dormitory_enrollment")
      .insert({
        dormer_id: profileId,
        dormitory_id,
        academic_period_id: academicPeriodId,
        room_number: room_number ?? null,
        status: "active",
      });
    if (error) throw error;
  }

  // ── 2. Dormitory role — check-then-insert, no onConflict ──────────────────
  // dormitory_roles has no unique constraint on (user_id, dormitory_id),
  // so onConflict upsert throws 42P10. Check manually instead.

  const { data: existingRole } = await supabase
    .from("dormitory_roles")
    .select("id")
    .eq("user_id", profileId)
    .eq("dormitory_id", dormitory_id)
    .maybeSingle();

  if (existingRole) {
    // Role exists — update role type and reactivate
    const { error } = await supabase
      .from("dormitory_roles")
      .update({ role, is_active: true })
      .eq("id", existingRole.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("dormitory_roles")
      .insert({ user_id: profileId, dormitory_id, role, is_active: true });
    if (error) throw error;
  }
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
    .eq("status", "active")
    .eq("academic_period_id", periodId);

  if (enrollError || !enrollments) {
    console.error("Error fetching dormers:", enrollError);
    return [];
  }

  const profileIds = enrollments
    .map((e) => (e.profiles as DormerProfile)?.id)
    .filter(Boolean) as string[];

  const { data: roles, error: roleError } = await supabase
    .from("dormitory_roles")
    .select("*")
    .in("user_id", profileIds)
    .eq("role", "dormer")

  if (roleError) {
    console.error("Error fetching roles:", roleError);
    return [];
  }

  const dormers = enrollments.filter((row) => roles.some((role) => role.user_id === row.profiles?.id));

  const { data: bills, error: billsError } = await supabase
    .from("bills")
    .select("*")
    .in("dormer_id", profileIds)
    .or("is_deleted.eq.false,is_deleted.is.null")
    .eq("academic_period_id", periodId);

  if (billsError) {
    console.error("Error fetching bills:", billsError);
  }

  return dormers.map((row) => {
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

  if (error || !data) {
    throw new Error("Could not find the current active academic period.");
  }
  return data.id;
}

export async function getById(id: string): Promise<Dormer | null> {
  let periodId: string | null = null;
  try {
    periodId = await getCurrentAcademicPeriodId();
  } catch (e) {
    // Ignore if no active period
  }

  if (periodId) {
    const { data, error } = await supabase
      .from("dormitory_enrollment")
      .select("*, profiles(*)")
      .eq("dormer_id", id)
      .eq("status", "active")
      .eq("academic_period_id", periodId)
      .maybeSingle();

    if (data) {
      return {
        ...(data.profiles as DormerProfile),
        dormitory_id: data.dormitory_id,
        room_number: data.room_number,
        dormer_enrollment_id: data.id,
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

export async function getByRoom(roomNumber: string, dormitoryId: string, academicPeriodId: string): Promise<Dormer[]> {
  const { data, error } = await supabase
    .from("dormitory_enrollment")
    .select("*, profiles(*)")
    .eq("room_number", roomNumber)
    .eq("dormitory_id", dormitoryId)
    .eq("academic_period_id", academicPeriodId)

  if (error || !data) {
    console.error("Error fetching dormers:", error);
    return [];
  }

  return data.map((row) => ({
    ...(row.profiles as DormerProfile),
    dormitory_id: row.dormitory_id,
    room_number: row.room_number,
    dormer_enrollment_id: row.id,
  })) as Dormer[];
}
export async function create(input: CreateDormerInput, password: string) {
  const { dormitory_id, room_number, role, ...profileInput } = input;

  if (!dormitory_id) throw new Error("dormitory_id is required to create a dormer.");

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: profileInput.email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: profileInput.first_name,
      last_name: profileInput.last_name,
      full_name: `${profileInput.first_name} ${profileInput.last_name}`,
      role:  role,
      dormitory_id,
    },
  });

  if (authError || !authData.user) throw authError;

  const userId = authData.user.id;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .upsert({
      ...profileInput,
      id: userId,
    })
    .select()
    .single();

  if (profileError) throw profileError;

  const academicPeriod = await getCurrentAcademicPeriodId()

  if (!academicPeriod) {
    throw new Error("No active academic period found. Please set a current academic period before enrolling a dormer.");
  }

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

  const { error: roleError } = await supabase
    .from("dormitory_roles")
    .insert({
      user_id: userId,
      dormitory_id,
      role: role,
    });

  if (roleError) throw roleError;

  return {
    ...profile,
    dormitory_id,
    room_number,
    status: "active",
  } as Dormer;
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
      .update({ status: "inactive" })
      .eq("dormer_id", id)
      .eq("academic_period_id", periodId);

    if (error) {
      console.error("Error removing dormer enrollment:", error);
      throw new Error(error.message);
    }

    const { error: roleError } = await supabase
      .from("dormitory_roles")
      .update({ is_active: false })
      .eq("user_id", id);

    if (roleError) {
      console.error("Error removing dormer role:", roleError);
      throw new Error(roleError.message);
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ is_active: false })
      .eq("id", id);

    if (profileError) {
      console.error("Error removing dormer profile:", profileError);
      throw new Error(profileError.message);
    }

    const { error: billsError } = await supabase
      .from("bills")
      .update({ is_deleted: true })
      .neq("status", "Paid")
      .eq("dormer_id", id)
      .or("is_deleted.eq.false,is_deleted.is.null")
      .eq("academic_period_id", periodId);

    if (billsError) throw new Error(billsError.message);
  } catch (e) {
    console.error("Failed to remove enrollment", e);
    throw e;
  }
}

// export async function importMany(
//   inputs: CreateDormerInput[]
// ): Promise<Dormer[]> {
//   const created: Dormer[] = [];
//   for (const input of inputs) {
//     created.push(await create(input));
//   }
//   return created;
// }

export async function deleteBillData(id: string): Promise<void> {
  const { error } = await supabase
    .from("bills")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
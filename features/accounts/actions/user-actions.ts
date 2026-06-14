"use server";

import supabaseAdmin from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type AccountUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_banned: boolean;
};

export async function getUsers(): Promise<AccountUser[]> {
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error("Error fetching users:", error);
      throw new Error(error.message);
    }

    return users.map(user => ({
      id: user.id,
      email: user.email || "No email",
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at || null,
      is_banned: !!user.banned_until,
    }));
  } catch (error) {
    console.error("Failed to list users:", error);
    throw new Error("Failed to list users");
  }
}

export async function toggleUserStatus(userId: string, isBanned: boolean) {
  try {
    const banDuration = isBanned ? "none" : "876000h"; // Ban for 100 years if currently active (isBanned=false)
    
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: banDuration,
    });

    if (error) {
      console.error("Error updating user status:", error);
      throw new Error(error.message);
    }
    
    revalidatePath("/super-admin/accounts");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user status:", error);
    throw new Error("Failed to update user status");
  }
}

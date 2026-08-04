import { Metadata } from "next";
import AccountsPage from "@/features/accounts/components/accounts-page";
import { getUsers } from "@/features/accounts/actions/user-actions";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Manage Accounts | Everest",
  description: "Manage registered user accounts",
};

export default async function AccountsRoute() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/sign-in");
  }

  // TODO: Add role check for super-admin if necessary
  
  // Fetch users server-side to pass as initial data
  const users = await getUsers();

  return <AccountsPage initialUsers={users} />;
}

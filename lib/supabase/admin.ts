// lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/database.types";

// This client uses the service role key — NEVER expose this to the browser
// This should only be used in server-side code (Server Actions, API routes)
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // NOT the anon key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabaseAdmin;
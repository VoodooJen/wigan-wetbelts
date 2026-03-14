import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { getServerEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  const env = getServerEnv();

  return createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

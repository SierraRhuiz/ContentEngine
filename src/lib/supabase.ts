import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy-loaded client to avoid build-time errors when env vars aren't available
let _supabase: SupabaseClient | null = null;

// Client-side Supabase instance (uses anon key)
export function getSupabaseClient() {
  if (_supabase) return _supabase;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

// Backward compatibility - lazy getter
export const supabase = {
  get client() {
    return getSupabaseClient();
  }
};

// Server-side Supabase instance (uses service role key for admin access)
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

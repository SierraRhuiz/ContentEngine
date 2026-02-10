import { createServerClient as createSSRServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Create a Supabase client for server components/actions
 * This handles cookie management for auth
 * 
 * Use this in:
 * - Server Components
 * - API Routes
 * - Server Actions
 * 
 * For client components, use:
 * import { createClient } from '@/lib/supabase-auth';
 */
export async function createServerAuthClient() {
  const cookieStore = await cookies();

  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * Get current user from server context
 */
export async function getServerUser() {
  const supabase = await createServerAuthClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    return { error: error.message };
  }

  return { user };
}

/**
 * Get current session from server context
 */
export async function getServerSession() {
  const supabase = await createServerAuthClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    return { error: error.message };
  }

  return { session };
}

/**
 * Get user profile from server context
 */
export async function getServerProfile(userId: string) {
  const supabase = await createServerAuthClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { profile: data };
}

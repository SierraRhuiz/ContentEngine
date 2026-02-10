import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Create a Supabase client for browser/client components
 * Use this for all client-side auth operations
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Note: For server-side auth operations, use:
 * import { createServerAuthClient } from '@/lib/supabase-server';
 */

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Sign up with email, password, and optional invite token
 */
export async function signUp(
  email: string,
  password: string,
  fullName?: string,
  inviteToken?: string
) {
  const supabase = createClient();

  // If invite token provided, verify it first
  if (inviteToken) {
    const { data: invite, error: inviteError } = await supabase
      .rpc('check_invite', { invite_token: inviteToken });

    if (inviteError || !invite || invite.length === 0) {
      return { error: 'Invalid or expired invite' };
    }

    const inviteData = invite[0];
    if (!inviteData.is_valid) {
      return { error: 'Invite has expired or already been used' };
    }

    // Verify email matches invite
    if (inviteData.email.toLowerCase() !== email.toLowerCase()) {
      return { error: 'Email does not match invite' };
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient();
  
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Update password (after reset)
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Get current session
 */
export async function getSession() {
  const supabase = createClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    return { error: error.message };
  }

  return { session };
}

/**
 * Get current user
 */
export async function getUser() {
  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    return { error: error.message };
  }

  return { user };
}

/**
 * Get user profile from profiles table
 */
export async function getProfile(userId: string) {
  const supabase = createClient();

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

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: { full_name?: string; avatar_url?: string }
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { profile: data };
}

/**
 * Create team invite (admin only)
 */
export async function createInvite(email: string, role: 'admin' | 'member' = 'member') {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('team_invites')
    .insert({ email, role })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { invite: data };
}

/**
 * Get all team invites (admin only)
 */
export async function getInvites() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('team_invites')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { invites: data };
}

/**
 * Validate invite token
 */
export async function validateInvite(token: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .rpc('check_invite', { invite_token: token });

  if (error) {
    return { error: error.message };
  }

  if (!data || data.length === 0) {
    return { error: 'Invalid invite token' };
  }

  const invite = data[0];
  if (!invite.is_valid) {
    return { error: 'Invite has expired or already been used' };
  }

  return { invite };
}

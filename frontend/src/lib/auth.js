import { createClient } from '@supabase/supabase-js';

// Safely check if Supabase is properly configured
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  envUrl &&
  envUrl !== 'YOUR_SUPABASE_URL' &&
  /^https?:\/\//i.test(envUrl) &&
  envKey &&
  envKey !== 'YOUR_SUPABASE_ANON_KEY'
);

// Fallback to placeholder URL if not configured so createClient does not throw at startup
const supabaseUrl = isSupabaseConfigured ? envUrl : 'https://placeholder.supabase.co';
const supabaseKey = isSupabaseConfigured ? envKey : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Signs up a new user and passes their full name and role into the metadata.
 * Our Postgres Trigger will automatically catch this metadata to populate the profiles table.
 */
export async function signUp(email, password, fullName, role = 'job_seeker') {
  if (!isSupabaseConfigured) {
    const mockUser = {
      id: 'local-' + Date.now(),
      email,
      user_metadata: {
        full_name: fullName,
        role: role
      }
    };
    localStorage.setItem('career_ladder_local_user', JSON.stringify(mockUser));
    return { data: { user: mockUser }, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error during sign up:', error.message);
    return { data: null, error };
  }
}

/**
 * Signs in an existing user.
 */
export async function signIn(email, password) {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem('career_ladder_local_user');
    if (saved) {
      const mockUser = JSON.parse(saved);
      return { data: { user: mockUser }, error: null };
    }
    // Default fallback
    const mockUser = {
      id: 'demo-user-id',
      email,
      user_metadata: {
        full_name: email.split('@')[0],
        role: 'job_seeker'
      }
    };
    return { data: { user: mockUser }, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error during sign in:', error.message);
    return { data: null, error };
  }
}

/**
 * Signs out the current user.
 */
export async function signOut() {
  localStorage.removeItem('career_ladder_local_user');
  try {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    return { error: null };
  } catch (error) {
    console.error('Error during sign out:', error.message);
    return { error };
  }
}

/**
 * Retrieves the currently authenticated user's session and 
 * fetches their role and full name from the public.profiles table.
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem('career_ladder_local_user');
    if (saved) {
      const u = JSON.parse(saved);
      return {
        user: u,
        profile: {
          full_name: u.user_metadata?.full_name || 'Member',
          role: u.user_metadata?.role || 'job_seeker'
        },
        error: null
      };
    }
    return { user: null, profile: null, error: null };
  }

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    const session = sessionData.session;
    if (!session) return { user: null, profile: null, error: null };

    const user = session.user;

    // Fetch the corresponding profile data using the authenticated user's ID
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single();

    const role = profileData?.role || user.user_metadata?.role || 'job_seeker';
    const fullName = profileData?.full_name || user.user_metadata?.full_name || 'Member';

    return { 
      user, 
      profile: { full_name: fullName, role }, 
      error: profileError ? null : null 
    };
  } catch (error) {
    console.error('Error fetching current user:', error.message);
    return { user: null, profile: null, error };
  }
}

export function isRecruiter(profile) {
  return profile?.role === 'recruiter';
}

export function isJobSeeker(profile) {
  return profile?.role === 'job_seeker' || !profile?.role;
}

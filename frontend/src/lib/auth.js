import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client. 
// Replace these with your actual environment variables depending on your framework (e.g., import.meta.env for Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Signs up a new user and passes their full name into the metadata.
 * Our Postgres Trigger will automatically catch this metadata to populate the profiles table.
 */
export async function signUp(email, password, fullName) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
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
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
  try {
    // 1. Get the current active session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    
    const session = sessionData.session;
    if (!session) return { user: null, profile: null, error: null };

    const user = session.user;

    // 2. Fetch the corresponding profile data using the authenticated user's ID
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    return { 
      user, 
      profile: profileData, 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching current user:', error.message);
    return { user: null, profile: null, error };
  }
}

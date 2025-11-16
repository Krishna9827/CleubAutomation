import { supabase } from './config';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  date_of_birth: string | null;
  house_number: string | null;
  area: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export const userService = {
  /**
   * Sign up with email and password using Supabase Auth
   */
  async signUpWithEmail(
    email: string,
    password: string,
    userData: Partial<UserProfile>
  ): Promise<any> {
    try {
      const trimmedEmail = email.trim().toLowerCase();

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
        options: {
          data: {
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Create user profile in database
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone_number: userData.phone_number || null,
          date_of_birth: userData.date_of_birth || null,
          house_number: userData.house_number || null,
          area: userData.area || null,
          city: userData.city || null,
          state: userData.state || null,
          postal_code: userData.postal_code || null,
          profile_complete: true,
        } as any);

      if (profileError) throw profileError;

      return authData.user;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  },

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<any> {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (error) throw error;
      return data.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<any> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Get user profile by ID
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const { error } = await (supabase
        .from('users') as any)
        .update(updates)
        .eq('id', uid);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Get user projects
   */
  async getUserProjects(uid: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/supabase/config';
import { UserProfile } from '@/supabase/userService';

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signUpWithEmail: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      
      if (session?.user) {
        loadUserData(session.user.id, session.user.email);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string, email: string | undefined) => {
    try {
      // Fetch profile
      const { data: profile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profile) {
        console.log('✅ User profile found');
        setUserProfile(profile);
      } else if (!fetchError) {
        // Profile doesn't exist - create it for first-time login
        console.log('📝 Profile not found, creating for first-time login...');
        await createUserProfileOnFirstLogin(userId, email);
      } else {
        console.log('ℹ️ Could not fetch user profile:', fetchError.message);
      }

      // Check admin status
      if (email) {
        const { data: adminData } = await supabase
          .from('admins')
          .select('is_active')
          .eq('email', email)
          .maybeSingle();

        setIsAdmin((adminData as any)?.is_active || false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfileOnFirstLogin = async (userId: string, email: string | undefined) => {
    try {
      if (!email) {
        console.warn('⚠️ No email provided, cannot create profile');
        return;
      }

      console.log('🔄 Attempting to create profile for user:', userId);

      const { data: newProfile, error: insertError } = await (supabase
        .from('users') as any)
        .insert({
          id: userId,
          email: email,
          first_name: '',
          last_name: '',
          phone_number: null,
          date_of_birth: null,
          house_number: null,
          area: null,
          city: null,
          state: null,
          postal_code: null,
          profile_complete: false,
        })
        .select()
        .single();

      if (insertError) {
        // If it's a conflict error, try to fetch again
        if (insertError.code === '23505') {
          console.log('ℹ️ Profile already exists, fetching...');
          const { data: existingProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
          if (existingProfile) {
            setUserProfile(existingProfile);
          }
        } else {
          console.error('❌ Error creating profile:', insertError);
        }
      } else if (newProfile) {
        console.log('✅ User profile created on first login');
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('❌ Error in createUserProfileOnFirstLogin:', error);
    }
  };

  const signUpWithEmail = async (email: string, password: string, userData: Partial<UserProfile>) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('User not created');

    console.log('✅ User account created. Profile will be created on first login.');
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    const { error } = await (supabase
      .from('users') as any)
      .update(data)
      .eq('id', user.id);

    if (error) throw error;

    // Reload profile
    const { data: updatedProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (updatedProfile) {
      setUserProfile(updatedProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, isAdmin, loading, signUpWithEmail, signInWithEmail, signInWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

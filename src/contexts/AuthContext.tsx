import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase/config'
import { userService as supabaseUserService, UserProfile } from '@/services/supabase/userService'
import { adminService } from '@/supabase/adminService';

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
    // Listen to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session: Session | null) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        setIsAdmin(false);
        setUserProfile(null);
        
        if (currentUser) {
          try {
            // Fetch profile from Supabase
            let profile = await supabaseUserService.getUserProfile(currentUser.id);
            
            if (profile) {
              setUserProfile(profile);
            } else {
              // Auto-create profile for first-time users
              const [firstName, lastName] = (currentUser.user_metadata?.full_name || '').split(' ');
              
              await supabase.from('users').insert({
                id: currentUser.id,
                email: currentUser.email!,
                first_name: firstName || currentUser.user_metadata?.name || '',
                last_name: lastName || '',
                profile_complete: false,
              });

              profile = await supabaseUserService.getUserProfile(currentUser.id);
              setUserProfile(profile);
            }

            // Check if user is admin
            if (currentUser.email) {
              const adminRecord = await adminService.getAdminByEmail(currentUser.email);
              if (adminRecord?.is_active) {
                setIsAdmin(true);
              }
            }
          } catch (error) {
            console.error('❌ Auth error:', error);
          }
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signUpWithEmail = async (email: string, password: string, userData: Partial<UserProfile>) => {
    // Sign up with Supabase Auth
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

    try {
      // Create user profile in Supabase
      // Use .select() to confirm the insert was successful
      console.log('📝 Creating user profile for:', data.user.id);
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
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
        });

      if (insertError) {
        console.error('❌ Profile creation error:', insertError);
        throw insertError;
      }

      console.log('✅ Profile created successfully');
      setUser(data.user);
    } catch (profileError: any) {
      // If profile creation fails but auth succeeded, log it
      console.error('❌ Failed to create user profile:', profileError);
      throw new Error('Account created but profile setup failed. Please try logging in.');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) throw error;
    setUser(data.user);
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });

    if (error) throw error;

    // The user will be set by the onAuthStateChange listener after OAuth redirect
  };

  const logout = async () => {
    try {
      // Sign out from Supabase first - this clears the session from storage
      await supabase.auth.signOut();
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Always clear local state regardless of Supabase success
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (user) {
      // Update in Supabase using Supabase user.id (not Firebase uid)
      await supabaseUserService.updateUserProfile(user.id, data);
      const updatedProfile = await supabaseUserService.getUserProfile(user.id);
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

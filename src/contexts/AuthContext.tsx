import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { userService as supabaseUserService, UserProfile } from '@/supabase/userService';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Fetch profile from Supabase instead of Firebase
          const profile = await supabaseUserService.getUserProfile(currentUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, password: string, userData: Partial<UserProfile>) => {
    // Still using Firebase Auth for authentication
    // But profile will be stored in Supabase
    const { createUserWithEmailAndPassword, updateProfile: updateAuthProfile } = await import('firebase/auth');
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    const newUser = userCredential.user;
    
    // Create user profile in Supabase
    const { supabase } = await import('@/supabase/config');
    await supabase.from('users').insert({
      id: newUser.uid,
      email: newUser.email!,
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
    
    await updateAuthProfile(newUser, {
      displayName: `${userData.first_name} ${userData.last_name}`,
    });
    
    setUser(newUser);
  };

  const signInWithEmail = async (email: string, password: string) => {
    // Still using Firebase Auth
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const userCredential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    setUser(userCredential.user);
  };

  const signInWithGoogle = async () => {
    // Still using Firebase Auth
    const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const newUser = userCredential.user;
    
    // Check if user profile exists in Supabase, create if not
    const { supabase } = await import('@/supabase/config');
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', newUser.uid)
      .single();
    
    if (!existingProfile) {
      await supabase.from('users').insert({
        id: newUser.uid,
        email: newUser.email!,
        first_name: newUser.displayName?.split(' ')[0] || '',
        last_name: newUser.displayName?.split(' ').slice(1).join(' ') || '',
        profile_complete: false,
      });
    }
    
    setUser(newUser);
  };

  const logout = async () => {
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (user) {
      // Update in Supabase
      await supabaseUserService.updateUserProfile(user.uid, data);
      const updatedProfile = await supabaseUserService.getUserProfile(user.uid);
      setUserProfile(updatedProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signUpWithEmail, signInWithEmail, signInWithGoogle, logout, updateProfile }}>
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

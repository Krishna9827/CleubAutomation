import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  User,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './config';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  houseNumber: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Email validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const userService = {
  // Register with email and password
  async signUpWithEmail(
    email: string,
    password: string,
    userData: Partial<UserProfile>
  ): Promise<User> {
    try {
      // Validate email format
      const trimmedEmail = email.trim().toLowerCase();
      console.log('🔍 SIGNUP DEBUG:');
      console.log('Raw email input:', JSON.stringify(email));
      console.log('Trimmed email:', JSON.stringify(trimmedEmail));
      console.log('Email validation result:', validateEmail(trimmedEmail));
      
      if (!validateEmail(trimmedEmail)) {
        throw new Error('Invalid email format. Please enter a valid email address.');
      }

      console.log('✅ Email validation passed, attempting Firebase signup...');
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;
      console.log('✅ Firebase user created:', user.uid);

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phoneNumber: userData.phoneNumber || '',
        dateOfBirth: userData.dateOfBirth || '',
        houseNumber: userData.houseNumber || '',
        area: userData.area || '',
        city: userData.city || '',
        state: userData.state || '',
        postalCode: userData.postalCode || '',
        profileComplete: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      });

      return user;
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Better error messages for common Firebase errors
      if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email format. Please use a valid email address.');
      } else if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please log in or use a different email.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Use at least 6 characters.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/password signup is not enabled. Please contact support.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(error.message || 'Failed to create account');
    }
  },

  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      if (!validateEmail(trimmedEmail)) {
        throw new Error('Invalid email format.');
      }
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Sign in with Google
  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create minimal profile for Google users
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          phoneNumber: '',
          dateOfBirth: '',
          houseNumber: '',
          area: '',
          city: '',
          state: '',
          postalCode: '',
          profileComplete: false, // Profile needs completion
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get user profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Update user profile
  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get user projects
  async getUserProjects(uid: string): Promise<any[]> {
    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', uid)
      );
      const querySnapshot = await getDocs(projectsQuery);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
};

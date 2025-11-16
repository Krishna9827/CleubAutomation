import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase initialization - ONLY used for legacy admin pages (Firestore data)
// Auth is now handled exclusively by Supabase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Export a null auth to prevent Firebase Auth from interfering with Supabase Auth
export const auth = null as any; // Legacy export - no longer used for authentication
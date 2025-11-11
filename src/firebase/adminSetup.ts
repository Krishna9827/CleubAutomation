/**
 * Admin Setup Utility
 * Provides functions to set admin custom claims for users
 * Uses Firebase Cloud Function for secure server-side operations
 */

/**
 * Set admin custom claim for a user
 * User must log out and back in for changes to take effect
 * 
 * @param uid - User's Firebase UID
 * @returns Promise<boolean> - Success status
 */
export async function setAdminClaim(uid: string): Promise<boolean> {
  try {
    console.log('🔄 Setting admin claim for user:', uid);

    // Call the Cloud Function
    const response = await fetch(
      'https://us-central1-cleub-29887.cloudfunctions.net/setAdminClaim',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to set admin claim');
    }

    console.log('✅ Admin claim set successfully');
    console.log('⚠️  User must log out and back in for changes to take effect');

    return true;
  } catch (error) {
    console.error('❌ Error setting admin claim:', error);
    throw error;
  }
}

/**
 * Get current user's UID (for debugging/testing)
 * Run this in browser console to get your UID
 * 
 * Example in console:
 * import { auth } from '@/firebase/config'
 * auth.currentUser?.uid
 */
export function getCurrentUserUID(): string | null {
  // This is exported for convenience when debugging in console
  // In actual code, use useAuth() hook instead
  return null; // Return null - use from component context instead
}

/**
 * Browser console helper
 * Paste this in your browser console (F12) to set admin claim:
 * 
 * fetch('https://us-central1-cleub-29887.cloudfunctions.net/setAdminClaim', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ uid: 'YOUR_UID_HERE' })
 * }).then(r => r.json()).then(d => console.log(d))
 */

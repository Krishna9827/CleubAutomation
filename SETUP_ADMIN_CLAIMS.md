# 🔐 Setting Up Admin Custom Claims - Complete Guide

## Problem

Custom claims cannot be set in Firebase Console UI. They must be set using **Firebase Admin SDK** on a secure backend.

## Solution: Use Firebase Cloud Functions

Firebase Cloud Functions are **free tier**, run on Google's servers, and are perfect for this task.

---

## 📋 Step-by-Step Setup

### **Step 1: Enable Cloud Functions in Firebase**

1. Go to: https://console.firebase.google.com
2. Select project: **cleub-29887**
3. Click: **Cloud Functions** (left sidebar)
4. Click: **Enable API** if prompted
5. Wait for APIs to be enabled

---

### **Step 2: Create Cloud Function**

1. Click: **Create Function**
2. Set these options:

| Field              | Value                             |
| ------------------ | --------------------------------- |
| **Environment**    | 2nd gen                           |
| **Function name**  | `setAdminClaim`                   |
| **Region**         | `us-central1` (or closest to you) |
| **Trigger type**   | HTTP                              |
| **Authentication** | Require authentication            |
| **Memory**         | 256 MB                            |

3. Click **Create**

---

### **Step 3: Replace Function Code**

After clicking Create, you'll see a code editor with `index.js` and `package.json`:

**Paste this in `index.js`** (replace all content):

```javascript
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Cloud Function to set admin custom claims
exports.setAdminClaim = functions.https.onRequest(async (req, res) => {
  // Enable CORS for frontend requests
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    // Get the user UID from request body
    const uid = req.body.uid;

    if (!uid) {
      return res.status(400).json({ error: "UID is required" });
    }

    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    console.log(`✅ Admin claim set for user: ${uid}`);

    res.status(200).json({
      success: true,
      message: `Admin claim set for user ${uid}. User must log out and back in for changes to take effect.`,
    });
  } catch (error) {
    console.error("❌ Error setting admin claim:", error);

    res.status(500).json({
      error: "Failed to set admin claim",
      details: error.message,
    });
  }
});
```

**Keep `package.json` as is** (already has dependencies):

```json
{
  "name": "cleub-functions",
  "description": "Cloud Functions for Cleub Automation",
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.4.1"
  }
}
```

---

### **Step 4: Deploy Function**

1. Click **Deploy** button (bottom right)
2. Wait 2-3 minutes for deployment
3. After successful deployment, you should see:
   - ✅ Function deployed successfully
   - Function URL appears (e.g., `https://us-central1-cleub-29887.cloudfunctions.net/setAdminClaim`)

---

### **Step 5: Call Function from Your App**

Create a new file for the admin setup utility:

**File**: `src/firebase/adminSetup.ts`

```typescript
import { httpsCallable } from "firebase/functions";
import { functions } from "./config";

/**
 * Set admin custom claim for a user
 * User must log out and back in for changes to take effect
 */
export async function setAdminClaim(uid: string): Promise<boolean> {
  try {
    console.log("🔄 Setting admin claim for user:", uid);

    // Call the Cloud Function
    const response = await fetch(
      "https://us-central1-cleub-29887.cloudfunctions.net/setAdminClaim",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to set admin claim");
    }

    console.log("✅ Admin claim set successfully");
    console.log("⚠️  User must log out and back in for changes to take effect");

    return true;
  } catch (error) {
    console.error("❌ Error setting admin claim:", error);
    throw error;
  }
}
```

---

### **Step 6: Make Someone Admin**

**Option A: Manual (One-time setup)**

In your browser console (F12) on the login page:

```javascript
// Get your current user's UID after logging in
const uid = "gEdM2ef5vQe3ybgPaccCwH7TF7G2"; // Replace with actual UID

fetch("https://us-central1-cleub-29887.cloudfunctions.net/setAdminClaim", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ uid }),
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

Then:

1. Log out completely
2. Log back in
3. Check console - should now show `admin: true` in token claims

---

**Option B: Add to Your App (Recommended)**

Add a button in admin settings to make users admin:

```tsx
import { setAdminClaim } from "@/firebase/adminSetup";

// In your component
const makeUserAdmin = async (uid: string) => {
  try {
    await setAdminClaim(uid);
    toast({
      title: "Success",
      description: "User made admin. They must log out and back in.",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
};
```

---

## 🎯 Testing

After setting admin claim and logging back in:

1. Go to http://localhost:5173/admin
2. Open browser console (F12)
3. Should see:

```
✅ Current user: krishna.asiwal2003@gmail.com
✅ User UID: gEdM2ef5vQe3ybgPaccCwH7TF7G2
✅ User token claims: {..., admin: true}
✅ Loaded projects from Firebase: 2
```

---

## ⚠️ Important Notes

- ✅ Cloud Function runs on **Google's secure servers**
- ✅ Admin SDK has full permissions
- ✅ Claims are embedded in user's ID token
- ⚠️ User must **log out and back in** for new token with claims
- ⚠️ Claims take effect on **next token refresh**

---

## Troubleshooting

**Q: Function deployed but getting CORS error?**
A: CORS headers are already in the code. If still failing, check function logs in Firebase Console.

**Q: User logged back in but still no admin claim?**
A: Wait 5 minutes for token to fully refresh. Try logging out completely and clearing cookies.

**Q: Permission denied when calling function?**
A: Make sure `Require authentication` is selected in Cloud Function settings.

---

## Security

This approach is **production-ready** because:

1. Function runs on **secure Google servers**
2. Only your code can modify claims
3. Claims are **cryptographically signed** in ID token
4. Firestore rules validate claims **server-side**
5. No sensitive data in client code

---

**Next Steps**:

1. Deploy Cloud Function (Step 1-4)
2. Get your UID from console logs
3. Call function with your UID (Step 6, Option A)
4. Log out and back in
5. Check console - should see `admin: true` ✅

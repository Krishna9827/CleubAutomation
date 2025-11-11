# Component Migration Guide: Firebase to Supabase

## Quick Reference

Replace all Firebase imports with Supabase imports:

```typescript
// OLD (Firebase)
import { projectService } from "@/firebase/projectService";
import { userService } from "@/firebase/userService";
import { db } from "@/firebase/config";
import { collection, doc, addDoc, updateDoc, getDoc } from "firebase/firestore";

// NEW (Supabase)
import { projectService } from "@/supabase/projectService";
import { userService } from "@/supabase/userService";
import { adminService } from "@/supabase/adminService";
import { supabase } from "@/supabase/config";
```

## Updated Files

### ✅ Core Files

- [x] `/src/supabase/config.ts` - Supabase client configuration
- [x] `/src/supabase/types.ts` - TypeScript database types
- [x] `/src/supabase/userService.ts` - User operations
- [x] `/src/supabase/projectService.ts` - Project operations
- [x] `/src/supabase/adminService.ts` - Admin operations
- [x] `/src/contexts/AuthContext.tsx` - Auth context (hybrid Firebase Auth + Supabase DB)

### ⏳ Components to Update

#### Pages

- [ ] `/src/pages/Index.tsx` - Landing/home page
- [ ] `/src/pages/ProjectPlanning.tsx` - Project planning page
- [ ] `/src/pages/RoomSelection.tsx` - Room selection page
- [ ] `/src/pages/RequirementSheet2.tsx` - Requirements page
- [ ] `/src/pages/Planner.tsx` - Main planner page
- [ ] `/src/pages/Inquiry.tsx` - Contact/inquiry form
- [ ] `/src/pages/AdminSettings.tsx` - Admin settings page
- [ ] `/src/pages/AdminProjectHistory.tsx` - Admin project history
- [ ] `/src/pages/UserHistory.tsx` - User history page

#### Components

- [ ] `/src/components/InventoryManagement.tsx` - Migrate from localStorage to Supabase
- [ ] `/src/components/admin/TestimonialManager.tsx` - Migrate from localStorage to Supabase

## Migration Steps for Each Component

### Step 1: Update Imports

```typescript
// Change this:
import { projectService } from "@/firebase/projectService";

// To this:
import { projectService } from "@/supabase/projectService";
```

### Step 2: Update Service Calls

The API remains mostly the same, but note these changes:

#### Projects

```typescript
// Firebase & Supabase - Same API
await projectService.createProject(data, userId);
await projectService.updateProject(projectId, updates);
await projectService.getProject(projectId);
```

#### Users

```typescript
// Firebase & Supabase - Same API
await userService.getUserProfile(uid);
await userService.updateUserProfile(uid, updates);
```

#### Admin Operations

```typescript
// NEW in Supabase - consolidated admin service
import { adminService } from "@/supabase/adminService";

// Inquiries
await adminService.getAllInquiries();
await adminService.createInquiry(data);
await adminService.updateInquiryStatus(id, status);

// Testimonials
await adminService.getAllTestimonials();
await adminService.createTestimonial(data);
await adminService.updateTestimonial(id, updates);
await adminService.deleteTestimonial(id);

// Inventory
await adminService.getAllInventory();
await adminService.createInventoryItem(item);
await adminService.updateInventoryItem(id, updates);
await adminService.deleteInventoryItem(id);
await adminService.bulkImportInventory(items);

// Settings
await adminService.getSettings("general");
await adminService.updateSettings("general", settings);
```

### Step 3: Update Direct Firestore Calls

If components use Firestore directly, convert to Supabase:

```typescript
// OLD - Firebase Firestore
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const q = query(collection(db, "projects"), where("status", "==", "completed"));
const snapshot = await getDocs(q);
const projects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

// NEW - Supabase
const { data: projects } = await supabase
  .from("projects")
  .select("*")
  .eq("status", "completed");
```

### Step 4: Update localStorage to Supabase

For components using localStorage (Inventory, Testimonials):

```typescript
// OLD - localStorage
const items = JSON.parse(localStorage.getItem("inventoryPrices") || "[]");
localStorage.setItem("inventoryPrices", JSON.stringify(items));

// NEW - Supabase
const items = await adminService.getAllInventory();
await adminService.updateInventoryItem(id, updates);
```

## Component-Specific Notes

### InventoryManagement.tsx

- Currently uses localStorage
- Should fetch from `inventory` table
- Need admin permissions to create/update/delete
- Keep local state for UI performance
- Sync with Supabase on mount and on changes

### TestimonialManager.tsx

- Currently uses localStorage
- Should fetch from `testimonials` table
- Need admin permissions to manage
- Public can view on landing page

### Inquiry.tsx

- Anyone can create inquiries
- Only admins can view/manage
- Use `adminService.createInquiry()`

### AdminSettings.tsx

- Currently uses Firestore directly
- Migrate to `adminService.getSettings()` and `adminService.updateSettings()`
- Settings stored as JSONB in `admin_settings` table

## Testing Checklist

After migration, test these scenarios:

### User Operations

- [ ] Sign up with email
- [ ] Sign in with email
- [ ] Sign in with Google
- [ ] View user profile
- [ ] Update user profile
- [ ] Sign out

### Project Operations

- [ ] Create new project
- [ ] Update project
- [ ] View project history
- [ ] Delete project
- [ ] Save room selection
- [ ] Save requirements
- [ ] Calculate total cost

### Admin Operations

- [ ] View all inquiries
- [ ] Update inquiry status
- [ ] View all projects (admin)
- [ ] Manage testimonials (CRUD)
- [ ] Manage inventory (CRUD)
- [ ] Update admin settings

### Data Integrity

- [ ] Verify RLS policies work correctly
- [ ] Test unauthorized access (should fail)
- [ ] Verify foreign key relationships
- [ ] Test JSONB queries
- [ ] Verify timestamps auto-update

## Common Issues & Solutions

### Issue: RLS Policy Blocks Access

```typescript
// Solution: Ensure user is authenticated
const user = await supabase.auth.getUser();
if (!user.data.user) {
  throw new Error("Not authenticated");
}
```

### Issue: Type Mismatch

```typescript
// Solution: Use proper types from Database schema
import { Database } from "@/supabase/types";
type Project = Database["public"]["Tables"]["projects"]["Row"];
```

### Issue: JSONB Query

```typescript
// Solution: Use proper JSONB operators
.eq('client_info->>email', 'test@example.com')  // Extract text
.contains('client_info', { email: 'test@example.com' })  // Contains
```

## Rollback Plan

If issues arise, you can temporarily revert:

1. Change imports back to Firebase
2. Database will remain in Supabase (no data loss)
3. Fix issues
4. Re-migrate

## Next Steps

1. Update all components listed above
2. Test thoroughly in development
3. Migrate existing Firebase data to Supabase
4. Update documentation
5. Deploy to production
6. Monitor for issues
7. Plan Firebase Auth migration (Phase 2)

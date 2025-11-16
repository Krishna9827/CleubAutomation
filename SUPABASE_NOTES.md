# Supabase Integration Documentation

## Cleub Automation / Lux Home Planner

**Last Updated:** November 11, 2025  
**Project ID:** dalqnrkpjzlcklhqsoum  
**Supabase URL:** https://dalqnrkpjzlcklhqsoum.supabase.co

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Supabase Configuration](#supabase-configuration)
3. [Database Schema](#database-schema)
4. [Setup Instructions](#setup-instructions)
5. [Migration Instructions](#migration-instructions)
6. [Service Layer](#service-layer)
7. [Row Level Security (RLS)](#row-level-security-rls)
8. [Admin Configuration](#admin-configuration)
9. [API Usage Examples](#api-usage-examples)
10. [Common Operations](#common-operations)
11. [Troubleshooting](#troubleshooting)
12. [Future Enhancements](#future-enhancements)

---

## Project Overview

This project is migrating from Firebase to Supabase for database operations. The migration includes:

- User profiles
- Project data (home automation planning)
- Inquiries (contact form submissions)
- Admin settings
- Testimonials
- Inventory/pricing data

**Current State:** Firebase Auth is still active, Supabase handles database only.  
**Future Plan:** Full migration to Supabase Auth.

---

## Supabase Configuration

### Environment Variables

Located in `.env` file:

```env
VITE_SUPABASE_URL=https://dalqnrkpjzlcklhqsoum.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhbHFucmtwanpsY2tsaHFzb3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODE5NDYsImV4cCI6MjA3ODQ1Nzk0Nn0.aQej-F-ow9_2xS_WbKF6GUM7Ra3-2gJEeUcNC5d6MKE
```

### Service Role Key (Admin Operations Only - DO NOT expose in client)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhbHFucmtwanpsY2tsaHFzb3VtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg4MTk0NiwiZXhwIjoyMDc4NDU3OTQ2fQ.3fq_dePNzjJj6HIfBxKzVsdPRMezruBZYUrM6i6JvN4
```

---

## Database Schema

### Tables Overview

| Table Name       | Purpose                              | Key Features                                 |
| ---------------- | ------------------------------------ | -------------------------------------------- |
| `users`          | User profiles and account data       | RLS enabled, user-owned records              |
| `projects`       | Home automation project planning     | JSONB columns for flexible data, RLS enabled |
| `inquiries`      | Contact form submissions             | Public insert, admin-only view               |
| `admin_settings` | System configuration                 | Admin-only access                            |
| `testimonials`   | Client testimonials and case studies | Public view, admin manage                    |
| `inventory`      | Product catalog and pricing          | Public view, admin manage                    |
| `admins`         | Admin users with email-based access  | Email-based identification, active flag      |

### Detailed Schema

#### 1. Users Table

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    date_of_birth TEXT,
    house_number TEXT,
    area TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    profile_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**

- `idx_users_email` on `email`

#### 2. Projects Table

```sql
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    client_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    property_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
    rooms JSONB[] DEFAULT ARRAY[]::JSONB[],
    sections JSONB[] DEFAULT ARRAY[]::JSONB[],
    total_cost NUMERIC(12, 2) DEFAULT 0,
    status TEXT CHECK (status IN ('draft', 'in-progress', 'completed')),
    last_saved_page TEXT DEFAULT 'index',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**JSONB Structure:**

- `client_info`: `{ name, email, phone, address }`
- `property_details`: `{ type, size, budget }`
- `rooms`: Array of `{ id, name, type, features[], appliances[] }`
- `sections`: Array of `{ id, name, items[] }`

**Indexes:**

- `idx_projects_user_id` on `user_id`
- `idx_projects_status` on `status`
- `idx_projects_created_at` on `created_at DESC`
- `idx_projects_client_email` on `(client_info->>'email')`

#### 3. Inquiries Table

```sql
CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**

- `idx_inquiries_status` on `status`
- `idx_inquiries_created_at` on `created_at DESC`

#### 4. Admin Settings Table

```sql
CREATE TABLE public.admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. Testimonials Table

```sql
CREATE TABLE public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    property_type TEXT NOT NULL,
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    quote TEXT NOT NULL,
    project_details TEXT NOT NULL,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    results TEXT[] DEFAULT ARRAY[]::TEXT[],
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. Inventory Table

```sql
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    subcategory TEXT,
    wattage INTEGER,
    price_per_unit NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**

- `idx_inventory_category` on `category`
- `idx_inventory_subcategory` on `subcategory`

#### 7. Admins Table

```sql
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**

- `idx_admins_email` on `email`
- `idx_admins_is_active` on `is_active`

**Purpose:** Email-based admin identification. Admins are verified by checking if their email exists in this table and is_active=true.

---

## Setup Instructions

### Step 1: Run SQL Migrations

1. Log in to your Supabase Dashboard: https://supabase.com/dashboard/project/dalqnrkpjzlcklhqsoum
2. Navigate to **SQL Editor**
3. Run migrations in order:
   - `supabase/migrations/001_initial_schema.sql` - Core tables (users, projects, inquiries, etc.)
   - `supabase/migrations/002_create_admins_table.sql` - Admin users table
4. Verify all tables in **Database** > **Tables**

### Step 2: Configure Authentication (Future)

When ready to migrate from Firebase Auth to Supabase Auth:

1. Enable Email authentication in **Authentication** > **Providers**
2. Enable Google OAuth provider
3. Configure redirect URLs
4. Update auth service to use Supabase Auth

### Step 3: Add Admin Users

To grant admin access to a user:

1. Go to **Supabase Dashboard** > **SQL Editor**
2. Insert the admin user (example):

```sql
INSERT INTO public.admins (email, full_name, is_active)
VALUES ('newadmin@example.com', 'Admin Name', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;
```

3. Verify admin access by logging in with that email
4. AdminService will verify the email exists in the admins table

---

## Migration Instructions

### Migrating Existing Data from Firebase

#### Option 1: Manual Export/Import (Recommended for small datasets)

1. **Export from Firebase:**

   - Use Firebase Console to export collections
   - Or use Firebase Admin SDK to fetch data

2. **Transform data format:**

   ```javascript
   // Example: Transform Firebase timestamp to ISO string
   const transformedData = firebaseData.map((doc) => ({
     ...doc,
     created_at: doc.createdAt.toDate().toISOString(),
     updated_at: doc.updatedAt.toDate().toISOString(),
   }));
   ```

3. **Import to Supabase:**

   ```javascript
   import { supabase } from "./src/supabase/config";

   await supabase.from("projects").insert(transformedData);
   ```

#### Option 2: Programmatic Migration Script

Create a migration script to automate the process:

```typescript
// migration-script.ts
import { db as firebaseDb } from "./src/firebase/config";
import { supabase } from "./src/supabase/config";
import { collection, getDocs } from "firebase/firestore";

async function migrateProjects() {
  const snapshot = await getDocs(collection(firebaseDb, "projects"));
  const projects = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    created_at: doc.data().createdAt?.toDate().toISOString(),
    updated_at: doc.data().updatedAt?.toDate().toISOString(),
  }));

  const { error } = await supabase.from("projects").insert(projects);
  if (error) console.error("Migration error:", error);
  else console.log(`Migrated ${projects.length} projects`);
}
```

---

## Service Layer

The application uses three main service files:

### 1. User Service (`src/supabase/userService.ts`)

Handles user authentication and profile management:

- `signUpWithEmail()` - Create new user account
- `signInWithEmail()` - Login with email/password
- `signInWithGoogle()` - OAuth login
- `getUserProfile()` - Fetch user profile
- `updateUserProfile()` - Update user data
- `signOut()` - Logout user
- `getCurrentUser()` - Get current session user
- `getUserProjects()` - Get user's projects

### 2. Project Service (`src/supabase/projectService.ts`)

Manages project/automation planning data:

- `createProject()` - Create new project
- `updateProject()` - Update project data
- `getProject()` - Fetch single project
- `getClientProjects()` - Get projects by client email
- `getUserProjects()` - Get projects by user ID
- `getAllProjects()` - Get all projects (admin)
- `deleteProject()` - Delete project
- `saveRoomSelection()` - Save room data
- `saveRequirements()` - Save requirements
- `updateTotalCost()` - Recalculate project cost

### 3. Admin Service (`src/supabase/adminService.ts`)

Admin operations for all resources:

- **Inquiries:** `getAllInquiries()`, `createInquiry()`, `updateInquiryStatus()`, `deleteInquiry()`
- **Settings:** `getSettings()`, `updateSettings()`
- **Testimonials:** `getAllTestimonials()`, `createTestimonial()`, `updateTestimonial()`, `deleteTestimonial()`
- **Inventory:** `getAllInventory()`, `getInventoryByCategory()`, `createInventoryItem()`, `updateInventoryItem()`, `deleteInventoryItem()`, `bulkImportInventory()`

---

## Row Level Security (RLS)

All tables have RLS enabled. Policies are configured as follows:

### Users Table

- Users can view/update/insert their own profile only
- Match: `auth.uid() = id`
- RLS enforced by auth.users(id) foreign key reference

### Projects Table

- Users can view/create/update/delete their own projects
- Match: `auth.uid() = user_id`
- Note: Admins view own projects, not all projects (same RLS applies)

### Inquiries Table

- Anyone can create inquiries (public contact form)
- Anyone can view inquiries (no auth required)

### Admins Table

- Only admins can query their own email record
- Policy: `email = auth.jwt() ->> 'email' AND is_active = true`
- Used during login: AuthContext checks if user email exists in admins table

### Admin Settings Table

- Only admins can view/insert/update settings

### Testimonials Table

- Anyone can view testimonials (public)
- Only admins can create/update/delete

### Inventory Table

- Anyone can view inventory
- Only admins can create/update/delete

---

## Admin Configuration

### Admin Verification (Email-based)

Admins are identified by checking if their email exists in the `admins` table with `is_active=true`:

**In Code:**

```typescript
const adminRecord = await adminService.getAdminByEmail(userEmail);
if (adminRecord) {
  setIsAdmin(true);
}
```

**In Database:**

```sql
SELECT * FROM admins WHERE email = 'user@example.com' AND is_active = true
```

### Adding a New Admin

1. Insert user email into admins table:

```sql
INSERT INTO public.admins (email, full_name, is_active)
VALUES ('newalamin@example.com', 'Admin Name', true)
```

2. Or use admin service method:

```typescript
await adminService.createAdmin("newadmin@example.com", "Admin Name");
```

3. Verify in Supabase Dashboard > admins table

**Note:** User must be logged in via Supabase Auth first before they can be added as admin.

### Revoking Admin Access

```sql
UPDATE public.admins SET is_active = false WHERE email = 'admin@example.com'
```

Or use service method:

```typescript
await adminService.deactivateAdmin(adminId);
```

---

## API Usage Examples

### Creating a Project

```typescript
import { projectService } from "@/supabase/projectService";

const projectId = await projectService.createProject(
  {
    client_info: {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      address: "123 Main St",
    },
    property_details: {
      type: "Villa",
      size: 3000,
      budget: 50000,
    },
    requirements: ["Smart Lighting", "Security System"],
  },
  userId
);
```

### Fetching Inventory

```typescript
import { adminService } from "@/supabase/adminService";

const items = await adminService.getAllInventory();
const switchesOnly = await adminService.getInventoryByCategory("Switches");
```

### Creating a Testimonial

```typescript
import { adminService } from "@/supabase/adminService";

await adminService.createTestimonial({
  client_name: "Jane Smith",
  property_type: "Luxury Villa",
  location: "Mumbai",
  date: "October 2025",
  quote: "Amazing automation system!",
  project_details: "Complete home automation...",
  features: ["Voice Control", "Smart Lighting"],
  results: ["30% energy savings", "Enhanced security"],
  video_url: "https://youtube.com/...",
});
```

---

## Common Operations

### 1. Querying with Filters

```typescript
const { data } = await supabase
  .from("projects")
  .select("*")
  .eq("status", "completed")
  .gte("total_cost", 10000)
  .order("created_at", { ascending: false });
```

### 2. Updating Records

```typescript
await supabase
  .from("projects")
  .update({ status: "completed" })
  .eq("id", projectId);
```

### 3. Working with JSONB

```typescript
// Query JSONB field
const { data } = await supabase
  .from("projects")
  .select("*")
  .contains("client_info", { email: "john@example.com" });

// Update JSONB field
await supabase
  .from("projects")
  .update({
    client_info: { name: "John Doe", email: "john@example.com" },
  })
  .eq("id", projectId);
```

### 4. Real-time Subscriptions

```typescript
const channel = supabase
  .channel("projects-changes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "projects" },
    (payload) => {
      console.log("Change received!", payload);
    }
  )
  .subscribe();
```

---

## Troubleshooting

### Common Issues

#### 1. RLS Policy Blocking Access

**Error:** "new row violates row-level security policy"

**Solution:**

- Verify user is authenticated
- Check if user has correct permissions
- For admin operations, verify `is_admin` in user metadata

#### 2. JSONB Query Not Working

**Error:** JSONB queries returning no results

**Solution:**

```typescript
// Use contains for exact match
.contains('client_info', { email: 'test@example.com' })

// Use ->> for text extraction
.eq('client_info->>email', 'test@example.com')
```

#### 3. Timestamp Issues

**Error:** Invalid timestamp format

**Solution:**

```typescript
// Always use ISO format
created_at: new Date().toISOString();
```

#### 4. Foreign Key Violations

**Error:** "violates foreign key constraint"

**Solution:**

- Ensure referenced user exists before creating project
- Use `ON DELETE SET NULL` to handle user deletions gracefully

---

## Future Enhancements

### Phase 1: Complete Database Migration (Current)

- ✅ Set up Supabase tables
- ✅ Create service layer
- ✅ Configure RLS policies
- ⏳ Update all React components to use Supabase
- ⏳ Test all CRUD operations
- ⏳ Migrate existing Firebase data

### Phase 2: Auth Migration

- Migrate from Firebase Auth to Supabase Auth
- Set up email templates
- Configure OAuth providers
- Update AuthContext to use Supabase Auth
- Test authentication flow

### Phase 3: Real-time Features

- Implement real-time project updates
- Live inquiry notifications for admins
- Real-time inventory updates

### Phase 4: Advanced Features

- Add file storage using Supabase Storage
- Implement full-text search
- Add analytics and reporting tables
- Set up automated backups

### Phase 5: Performance Optimization

- Add database indexes based on query patterns
- Implement caching strategy
- Optimize JSONB queries
- Set up connection pooling

---

## Maintenance Notes

### Regular Tasks

1. **Weekly:** Review and optimize slow queries
2. **Monthly:** Check database size and plan scaling
3. **Quarterly:** Review and update RLS policies
4. **As needed:** Update inventory pricing data

### Backup Strategy

- Supabase automatically backs up database daily
- For critical operations, create manual backup via Dashboard
- Export important data periodically for safety

### Monitoring

- Monitor query performance in Supabase Dashboard
- Set up alerts for failed queries
- Track API usage and rate limits

---

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Dashboard:** https://supabase.com/dashboard/project/dalqnrkpjzlcklhqsoum
- **SQL Editor:** https://supabase.com/dashboard/project/dalqnrkpjzlcklhqsoum/sql
- **API Docs:** https://supabase.com/dashboard/project/dalqnrkpjzlcklhqsoum/api

---

## Change Log

| Date       | Version | Changes                              | Author |
| ---------- | ------- | ------------------------------------ | ------ |
| 2025-11-11 | 1.0.0   | Initial Supabase setup and migration | System |

---

**End of Documentation**

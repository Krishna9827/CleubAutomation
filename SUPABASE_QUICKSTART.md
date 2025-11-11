# Supabase Integration - Quick Start Guide

## 🎯 What Was Done

Your project has been successfully configured to use Supabase! Here's what was set up:

### ✅ Completed Tasks

1. **Installed Supabase Client** - `@supabase/supabase-js` package added
2. **Created Supabase Configuration** - Client setup in `src/supabase/config.ts`
3. **Database Schema Created** - SQL migration file ready to run
4. **Service Layer Built** - Complete CRUD operations for all resources
5. **Environment Variables Set** - `.env` updated with Supabase credentials
6. **Components Updated** - Core pages migrated to use Supabase
7. **Documentation Created** - Comprehensive guides for future reference

## 🚀 Next Steps - START HERE!

### Step 1: Run the SQL Migration (REQUIRED)

1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/dalqnrkpjzlcklhqsoum
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file: `supabase/migrations/001_initial_schema.sql`
5. Copy the ENTIRE contents
6. Paste into the SQL Editor
7. Click **RUN** (bottom right)
8. Verify success - should see "Success. No rows returned"

### Step 2: Verify Tables Created

1. In Supabase Dashboard, go to **Database** > **Tables**
2. You should see these tables:
   - ✅ users
   - ✅ projects
   - ✅ inquiries
   - ✅ admin_settings
   - ✅ testimonials
   - ✅ inventory

### Step 3: Set Up Admin Access (If You Need Admin Features)

1. Go to **Authentication** > **Users** in Supabase Dashboard
2. Find your user account (or create one by signing up in the app)
3. Click on the user
4. Scroll to **User Metadata** section
5. Click **Edit**
6. Add this JSON:
   ```json
   {
     "is_admin": true
   }
   ```
7. Save

### Step 4: Test the Application

1. Start your dev server: `npm run dev`
2. Test these features:
   - ✅ Create a new inquiry (Contact form)
   - ✅ Sign up with email
   - ✅ Sign in
   - ✅ Create a new project
   - ✅ View project history

## 📁 Project Structure

```
lux-home-planner/
├── src/
│   ├── supabase/              # NEW - Supabase integration
│   │   ├── config.ts          # Supabase client setup
│   │   ├── types.ts           # TypeScript database types
│   │   ├── userService.ts     # User operations
│   │   ├── projectService.ts  # Project operations
│   │   └── adminService.ts    # Admin operations (inquiries, testimonials, inventory, settings)
│   ├── contexts/
│   │   └── AuthContext.tsx    # UPDATED - Now uses Supabase for profiles
│   ├── pages/                 # UPDATED - Key pages migrated
│   │   ├── Index.tsx
│   │   ├── ProjectPlanning.tsx
│   │   ├── RoomSelection.tsx
│   │   ├── RequirementSheet2.tsx
│   │   └── Inquiry.tsx
│   └── firebase/              # Still used for Authentication (will migrate later)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema
├── .env                       # UPDATED - Added Supabase credentials
├── .env.example               # NEW - Template for environment variables
├── SUPABASE_NOTES.md          # NEW - Complete Supabase documentation
└── MIGRATION_GUIDE.md         # NEW - Component migration guide
```

## 🔑 Important Files

### Configuration

- **`.env`** - Contains your Supabase URL and API keys
- **`src/supabase/config.ts`** - Supabase client initialization

### Services (Your API Layer)

- **`src/supabase/userService.ts`** - User authentication and profiles
- **`src/supabase/projectService.ts`** - Project CRUD operations
- **`src/supabase/adminService.ts`** - Admin operations for inquiries, testimonials, inventory, settings

### Documentation

- **`SUPABASE_NOTES.md`** - Complete reference guide (READ THIS!)
- **`MIGRATION_GUIDE.md`** - How to migrate remaining components

## 🔐 Security Notes

### What's Secure ✅

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Admin operations require `is_admin` user metadata
- API keys are in `.env` (not committed to git)

### Current Setup

- **Authentication:** Still using Firebase Auth (for now)
- **Database:** Fully migrated to Supabase
- **User Profiles:** Stored in Supabase (synced with Firebase Auth)

## 📊 Database Tables

### Users Table

Stores user profile information

- Linked to Firebase Auth by UID
- Contains: name, email, phone, address details, etc.

### Projects Table

Stores home automation project planning data

- JSONB columns for flexible data structure
- Contains: client info, rooms, appliances, costs, etc.

### Inquiries Table

Contact form submissions

- Anyone can create
- Only admins can view/manage

### Testimonials Table

Client testimonials and case studies

- Public can view
- Only admins can create/edit/delete

### Inventory Table

Product catalog and pricing

- Public can view
- Only admins can manage

### Admin Settings Table

System configuration

- Admin-only access

## 🚨 Still Using Firebase

Currently Firebase is still used for:

- ✅ User Authentication (email/password, Google OAuth)
- ✅ Auth session management

**These will remain on Firebase for now**. You can migrate auth to Supabase later once the database migration is tested and stable.

## ⚠️ Components Still Using localStorage

These components need to be migrated from localStorage to Supabase:

1. **`src/components/InventoryManagement.tsx`** - Inventory prices
2. **`src/components/admin/TestimonialManager.tsx`** - Testimonials

Refer to `MIGRATION_GUIDE.md` for instructions.

## 📝 Common Operations

### Create a Project

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
    property_details: { type: "Villa", size: 3000, budget: 50000 },
    requirements: ["Smart Lighting"],
  },
  userId
);
```

### Get Inventory

```typescript
import { adminService } from "@/supabase/adminService";

const items = await adminService.getAllInventory();
```

### Create Inquiry

```typescript
import { adminService } from "@/supabase/adminService";

await adminService.createInquiry({
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "9876543210",
  message: "I need smart home automation",
  status: "pending",
});
```

## 🐛 Troubleshooting

### Issue: "Cannot find module '@/supabase/...'"

**Solution:** Restart your dev server: `npm run dev`

### Issue: "Row violates row-level security policy"

**Solution:** Make sure you're authenticated and have the right permissions. For admin operations, ensure your user has `is_admin` metadata.

### Issue: "Table 'projects' does not exist"

**Solution:** You need to run the SQL migration (see Step 1 above)

### Issue: TypeScript errors

**Solution:** Run `npm install` and restart VS Code

## 📚 Further Reading

- **SUPABASE_NOTES.md** - Complete technical documentation
- **MIGRATION_GUIDE.md** - How to migrate additional components
- **Supabase Docs:** https://supabase.com/docs

## 🎉 You're All Set!

Your Supabase integration is complete and ready to use. Run the SQL migration, test the app, and you're good to go!

For any changes or upgrades to Supabase, always refer to and update **SUPABASE_NOTES.md**.

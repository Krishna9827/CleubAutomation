# CleubAutomation - File Structure & Architecture

## Quick Reference Map

### 🎯 Root Files

- **App.tsx** - Main React app component with routing configuration
- **main.tsx** - Vite entry point, renders App to DOM

### 📁 Directory Structure

#### `/components` - UI & Feature Components

**`/admin`** - Admin dashboard components

- `AdminLayout.tsx` - Layout wrapper for admin pages
- `AdminTable.tsx` - Generic reusable data table
- `TestimonialManager.tsx` - Testimonial CRUD interface
- `index.ts` - Exports admin components

**`/features`** - Core feature components

- `AddApplianceDialog.tsx` - Add appliance modal form
- `AddRoomDialog.tsx` - Add room modal form
- `AutomationBilling.tsx` - Billing/automation cost display
- `BrandLogos.tsx` - Brand logo carousel
- `EstimatedCost.tsx` - Cost calculation & display
- `InventoryManagement.tsx` - Inventory admin interface
- `ProjectSummary.tsx` - Project overview card
- `RoomCard.tsx` - Individual room display component
- `SectionItemsDialog.tsx` - Edit project sections modal
- `TestimonialDialog.tsx` - Testimonial display modal
- `TouchPanelDialog.tsx` - Touch panel configuration modal
- `index.ts` - Exports feature components

**`/inventory`** - Inventory management UI

- `AddItemForm.tsx` - Form to add inventory items
- `ImportInventory.tsx` - CSV import interface
- `PriceTable.tsx` - Inventory price display table
- `constants.ts` - Inventory category constants
- `types.ts` - Inventory-specific TypeScript types
- `index.ts` - Exports inventory components

**`/ui`** - shadcn/ui component library (60+ components)

- All standard UI elements (button, card, dialog, input, etc.)
- Custom components: `profile-menu.tsx`, `navigation-menu.tsx`, `orbiting-circles.tsx`, `brand-logos.tsx`

#### `/contexts` - Global State Management

- **AuthContext.tsx** - Firebase + Supabase auth state, user profile, admin status

#### `/hooks` - Custom React Hooks

- **use-mobile.tsx** - Responsive mobile detection hook
- **use-toast.ts** - Toast notification hook

#### `/lib` - Utility Libraries

- **utils.ts** - Class name utility (cn function for TailwindCSS)

#### `/pages` - Application Pages (Route Components)

**`/admin`** - Admin-only pages

- `AdminLogin.tsx` - Admin authentication page
- `AdminProjectHistory.tsx` - View all user projects (admin view)
- `AdminSettings.tsx` - Admin configuration panel
- `AdminTestimonials.tsx` - Manage testimonials

**`/public`** - Public/unauthenticated pages

- `Login.tsx` - User login/signup page
- `Inquiry.tsx` - Lead inquiry form
- `PremiumLanding.tsx` - Marketing landing page
- `NotFound.tsx` - 404 page

**`/user`** - Authenticated user pages

- `HomePage.tsx` - User dashboard/home
- `ProjectPlanning.tsx` - Initial project intake form
- `RoomSelection.tsx` - Room selection step
- `RequirementsForm.tsx` - Requirements & property details form
- `FinalReview.tsx` - Review before creating project
- `Planner.tsx` - Project editor/planner
- `ProjectHistory.tsx` - User's saved projects (default export as UserHistory)
- `ProjectDashboard.tsx` - Project detail view

#### `/services` - Service Layer Configuration

- **index.ts** - Central export for Supabase (kept minimal)

#### `/supabase` - Supabase Database & Auth Services

- **config.ts** - Supabase client initialization & auth setup
- **types.ts** - Auto-generated Supabase database types from schema
- **userService.ts** - User auth & profile operations (signup, signin, profile CRUD)
- **projectService.ts** - Project CRUD & state management (create, update, save progress)
- **adminService.ts** - Admin operations: admins, inquiries, settings, testimonials, inventory

#### `/types` - TypeScript Type Definitions

- **database.ts** - Database schema types (Supabase auto-generated)
- **user.ts** - User, Auth, Inquiry, Testimony types (camelCase - UI layer)
- **project.ts** - Project, Room, Appliance, Section types
- **inventory.ts** - InventoryItem, PriceData, TouchPanel types
- **index.ts** - Central export for all types

#### `/constants` - Global Constants

- **inventory.ts** - Category, subcategory, wattage constants
- **index.ts** - Central export

#### `/utils` - Utility Functions

- **pageFlow.ts** - Multi-step form navigation logic & page constants
- **pdfExport.ts** - General project PDF generation
- **costPdfExport.ts** - Cost estimate PDF export
- **automationBillingPdfExport.ts** - Automation billing PDF export

### 🔑 Key Patterns

**Service Layer** (Supabase operations)

- All DB calls in `/supabase/*Service.ts` files
- Types match Supabase schema (snake_case)
- Consistent error handling with console logging

**Type System** (TypeScript)

- `/types/*` - UI layer types (camelCase)
- `/supabase/types.ts` - Database types (snake_case)
- No type duplication - single source of truth

**Component Organization**

- `/components/ui/` - Reusable UI primitives
- `/components/features/` - Business logic components
- `/components/admin/` - Admin-specific components
- `/components/inventory/` - Inventory management UI

**Page Structure**

- `/pages/public/` - No auth required
- `/pages/user/` - Authenticated users only
- `/pages/admin/` - Admin users only (role-based)

---

## Status: ✅ Clean & Organized

- ✅ No duplicate files or folders
- ✅ All files in correct locations
- ✅ Proper separation of concerns
- ✅ Single source of truth for types & services
- ✅ Firebase completely removed
- ✅ ~115 source files, properly structured

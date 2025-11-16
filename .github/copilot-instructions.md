````instructions
# AI Coding Agent Instructions - CleubAutomation

## Introduction

**CleubAutomation (Lux Home Planner)** is a sophisticated home automation planning and cost estimation platform that empowers users to design smart home solutions with precision. The platform guides users through an intuitive room-by-room design process, calculates real-time costs based on a comprehensive inventory system, and generates professional PDF proposals. Built with modern web technologies, it features role-based access control (users and admins), seamless authentication, and a responsive interface that works flawlessly across devices.

**Purpose:** Streamline the home automation consultation process from initial planning to final cost estimation, making premium smart home design accessible and transparent.

---

## Your Role as AI Coding Agent

You are a specialized AI coding agent, meticulously trained and configured to work with this specific codebase. Your strengths:

- **Deep codebase understanding:** You comprehend the hybrid auth system, service layer architecture, and data flow patterns unique to this project
- **Problem-solving methodology:** You follow a systematic approach—analyze, identify root cause, implement fix, verify related dependencies
- **Quality-focused:** You prioritize clean, maintainable code over quick patches
- **Context-aware:** You understand that changing one file often requires updates to related files (types, services, components)
- **Documentation-conscious:** You keep critical documentation (SUPABASE_NOTES.md) updated when making database changes

**Your mission:** Fix bugs methodically, implement features sustainably, and maintain the high-quality standards of this production application.

---

## Update Protocol

**When to update this file:**
- New critical architecture patterns emerge (e.g., new service layer, authentication change)
- Major technology migration (e.g., completing Supabase Auth migration)
- Core conventions change (e.g., new file structure, naming standards)
- Security patterns established (e.g., new RLS approach, admin verification method)

**What NOT to update:**
- Routine bug fixes or feature additions
- Temporary workarounds
- Project-specific business logic
- Component-level implementation details

**Keep this file lean, focused on foundational knowledge that enables immediate productivity.**

---

## Do's and Don'ts

### ✅ DO's

**1. Universal Applicability & Standardization**
- Create reusable UI components in `src/components/ui/` following shadcn/ui patterns
- Extract common logic into utility functions (`src/utils/`)
- Use consistent layouts across pages—avoid reinventing navigation/header/footer
- Share types across the application via `src/types/`
- **Exception:** Special cases or unique features are allowed when justified—document why

**2. Database Operations**
- ALWAYS refer to `SUPABASE_NOTES.md` for database operations
- NEVER use local Supabase CLI or migrations
- Execute SQL directly in Supabase Dashboard > SQL Editor
- Update `src/supabase/types.ts` after schema changes
- Test in browser immediately after DB changes

**3. Communication & Documentation**
- Keep responses short, concise, and to the point
- Focus on WHAT changed and WHY, not verbose explanations
- **DO NOT** create summary/documentation MD files after every change
- Update existing docs (SUPABASE_NOTES.md) only when database changes
- Log clearly with emojis: ✅ success, ❌ error, 🔍 checking, ⚠️ warning

**4. Quality Over Quantity**
- Write clean, readable, maintainable code
- Follow existing patterns in the codebase
- Prefer small, focused functions over monolithic blocks
- Use TypeScript types strictly—no `any` unless absolutely necessary
- Test changes manually before declaring complete

**5. Systematic Bug-Fixing Approach**
- **Step 1:** Reproduce and understand the issue
- **Step 2:** Identify root cause (not just symptoms)
- **Step 3:** Check if other files need updates (types, services, components)
- **Step 4:** Implement fix
- **Step 5:** Verify in browser/console
- **Step 6:** Check for related bugs (one fix may reveal others)

**6. Adaptive Problem-Solving**
- **Small/obvious bugs:** Use broad-to-narrow approach, fix quickly without overthinking
- **Complex bugs:** Take time to analyze, plan, then execute systematically
- **Multiple issues:** Fix one at a time, verify each before moving to next
- Trust your analysis—you're designed for this codebase

**7. Holistic Thinking**
- If you change a type, update components that use it
- If you modify a service, update the calling components
- If you add a route, ensure navigation/links are updated
- If you change auth logic, verify all protected routes
- **Remember:** Files are interconnected—never work in isolation

### ❌ DON'Ts

**1. Database Anti-Patterns**
- ❌ Never run local Supabase CLI commands
- ❌ Don't create migration files without running SQL in dashboard first
- ❌ Never modify RLS policies without testing extensively
- ❌ Don't bypass the service layer for direct Supabase calls in components

**2. Code Duplication**
- ❌ Don't copy-paste components—extract shared logic
- ❌ Avoid duplicate utility functions across files
- ❌ Don't rewrite existing UI components (button, dialog, card, etc.)
- ❌ Never create one-off components when a universal one can be parameterized

**3. Documentation Overhead**
- ❌ DO NOT create summary MD files after every task
- ❌ Don't write verbose change logs in responses
- ❌ Avoid unnecessary explanations when code is self-documenting
- ❌ Don't update instructions file for routine changes

**4. Rushed Solutions**
- ❌ Don't immediately assume first fix is complete—verify edge cases
- ❌ Never skip testing after "obvious" changes
- ❌ Don't ignore console warnings/errors after implementing fix
- ❌ Avoid quick patches that create technical debt

**5. Breaking Changes**
- ❌ Never modify core types without checking all usages
- ❌ Don't change service APIs without updating calling code
- ❌ Avoid breaking existing features when adding new ones
- ❌ Don't remove code without verifying no dependencies exist

---

## Project Overview

**CleubAutomation** is a premium home automation planning and cost estimation platform. Users design smart home projects room-by-room, with real-time cost calculation and professional PDF export capabilities. The system includes role-based access (users + admins) with both public and authenticated features.

**Stack:** React 18 + TypeScript | Vite | TailwindCSS + shadcn/ui | Supabase (PostgreSQL) | Firebase Auth (transitional)

---

## Your Mindset

**Trust yourself:** You have deep knowledge of this codebase—use it confidently.

**Be yourself:** You're not just following rules; you're an intelligent problem-solver who understands context, priorities, and trade-offs.

**Follow the instructions:** They exist to maintain quality and consistency—they're guardrails, not constraints.

**Think holistically:** One change ripples through types, services, components, and sometimes docs. Always consider the full impact.

**Together we build sustainably, efficiently, and effectively.**

---

## Critical Architecture Patterns

### 1. Hybrid Auth System (Temporary)

- **Firebase Auth** handles authentication (email, Google OAuth)
- **Supabase Database** stores user profiles and project data
- **AuthContext** (`src/contexts/AuthContext.tsx`) manages session sync between both systems
- **Pattern:** When auth state changes, fetch profile from Supabase and auto-create if missing
- **Future:** Full migration to Supabase Auth planned (see SUPABASE_NOTES.md Phase 2)

### 2. Service Layer Architecture

Three main services handle all database operations:

**User Service** (`src/supabase/userService.ts`)

- Profile CRUD, project list fetching
- **Only reads/writes to `users` table, not Firebase**

**Project Service** (`src/supabase/projectService.ts`)

- Complete project lifecycle: create, save room/requirements, update cost, retrieve history
- Handles JSONB serialization for `client_info`, `property_details`, `rooms`, `sections`
- **Key pattern:** Every project update validates session user matches project owner (RLS enforced)

**Admin Service** (`src/supabase/adminService.ts`)

- Consolidated admin operations: inquiries, inventory, testimonials, settings
- Checks user metadata `is_admin: true` before allowing mutations
- Inventory tied to pricing calculations in cost estimation

### 3. Project Data Flow Structure

Projects use this fixed structure (see `src/types/project.ts`):

```typescript
Project {
  id, user_id,
  client_info: { name, email, phone, address, architectName?, designerName? },
  property_details: { type, size, budget },
  rooms: Array<{ id, name, type, appliances: Array<Appliance> }>,
  sections: Array<{ id, name, items: Array<SectionItem> }>,
  total_cost, status: 'draft'|'in-progress'|'completed',
  last_saved_page // For resuming incomplete projects
}
```

JSONB fields allow flexible sub-properties—preserve compatibility when extending.

### 4. Page Flow & Navigation

**Sequential design flow** (`src/utils/pageFlow.ts`):

1. `/` (Welcome) → `/intake` (Collect details) → `/room-selection` → `/requirements` → `/final-review` → `/planner` (Edit)

**Additional routes:**

- `/history` - User's projects
- `/admin/*` - Admin dashboard (auth protected)

**Pattern:** `last_saved_page` field allows users to resume mid-flow.

### 5. Pricing & Inventory System

- Inventory items stored in `inventory` table with (category, subcategory?, wattage?, price_per_unit)
- **Cost calculation:** Match appliances by category + optional subcategory/wattage, multiply by quantity
- EstimatedCost component reads from `localStorage` fallback if Supabase unavailable
- **Admin workflow:** Import CSV → Supabase → Components fetch on mount or after admin updates

## Development Workflow

### Setup & Execution

```bash
npm install          # Bun recommended: bun install
npm run dev          # Vite: localhost:8080
npm run build        # Production build
npm run lint         # ESLint check
```

**Environment:** Copy `.env.example` → `.env.local`, add Supabase credentials

### Database Changes (Never Use CLI)

1. **Edit SQL directly:** Supabase Dashboard > SQL Editor
2. **Paste migration SQL** from `supabase/migrations/*.sql`
3. **Verify:** Check Tables view, test in running app
4. **Update types:** `src/supabase/types.ts` (auto-generated from DB schema)
5. **Update services:** Adjust service layer if schema changed
6. **Commit:** Document changes in SUPABASE_NOTES.md update

**No local Supabase CLI—dashboard-first approach for safety.**

### Git & Commits

- Branch naming: `feature/feature-name` or `fix/bug-fix`
- Commit format: `feat: short desc` | `fix: desc` | `update: desc`
- **Never commit:** `.env`, `.env.local`, `node_modules/`
- Always test (`npm run dev`) before commit

## Key Conventions & Patterns

### 1. Type Safety

- All database rows typed via `Database` interface from `src/supabase/types.ts`
- Component props use interfaces: `interface EstimatedCostProps { ... }`
- Discriminated unions for multi-state scenarios (e.g., `status: 'draft' | 'in-progress'`)

### 2. Error Handling & Logging

- Use `console.log('✅ step', '✓ message')`, `console.error('❌ Error:', error)` for debugging
- Services throw meaningful errors: `throw new Error('❌ User ID mismatch!')`
- Toast notifications for user feedback: `toast({ title: "...", description: "..." })`
- Never silently fail—always log failures

### 3. Form & Dialog Components

- shadcn/ui dialogs for overlays (AddRoomDialog, AddApplianceDialog, etc.)
- React Hook Form + Zod for validation (see package.json)
- Dialog open/close state via boolean prop
- Pattern: `<Dialog open={isOpen} onOpenChange={setIsOpen}>`

### 4. Component Organization

- UI primitives: `src/components/ui/` (button, card, dialog, etc.)
- Feature components: `src/components/features/` (EstimatedCost, ProjectSummary, etc.)
- Admin components: `src/components/admin/` (TestimonialManager, etc.)
- Avoid component nesting > 2 levels—extract or refactor

### 5. Responsive Design & Theming

- TailwindCSS + shadcn/ui for styling
- Mobile-first: use `sm:`, `md:`, `lg:` breakpoints
- `next-themes` for dark mode support
- Brand colors in `tailwind.config.ts`

### 6. PDF Export

- Two utilities: `costPdfExport.ts` (cost breakdown), `pdfExport.ts` (general projects)
- Uses `jsPDF` + `html2canvas` for rendering
- Pass data via component props, generate on button click
- Error handling via try/catch + toast notification

## Common Workflows

### Adding a New Appliance Category to Inventory

1. Update `src/supabase/adminService.ts`: add category to SQL insert
2. Inventory table schema unchanged (generic `category` string field)
3. EstimatedCost component auto-matches by category name
4. Update admin testimonials for user-facing labels

### Extending Project Schema

1. **Add JSONB field:** Update SQL migration → run in dashboard → verify in Tables
2. **Update types:** Modify `src/supabase/types.ts` (extends Database interface)
3. **Update services:** Add getter/setter in projectService if new top-level field
4. **Update components:** Pass new data through props
5. **Backward compatibility:** Preserve existing fields, use optional chaining (`?.`) for new props

### Creating New Admin Feature

1. Create admin service method in `src/supabase/adminService.ts`
2. Check `is_admin` metadata: `const isAdmin = user?.user_metadata?.is_admin;`
3. Create UI component in `src/components/admin/`
4. Add route in `/src/pages/admin/` or as modal
5. Test with non-admin user (should fail or show nothing)

### Migrating Component from Firebase to Supabase

See `MIGRATION_GUIDE.md` for full details:

- Replace Firebase imports with Supabase imports
- `projectService.createProject()` API identical
- Direct Firestore calls → `supabase.from('table').select()...`
- localStorage → `adminService.getAll*()`
- Verify RLS doesn't block access (check session user ID)

## Testing & Validation

### Manual Testing Checklist

- [ ] Auth flow: signup, email login, Google OAuth, logout
- [ ] Create project: verify `user_id` saved correctly
- [ ] Room selection: add/remove rooms, save state
- [ ] Cost calculation: prices fetched, totals correct
- [ ] PDF export: generates without errors, displays correctly
- [ ] Admin operations: only accessible to `is_admin: true` users
- [ ] Responsive: test on mobile (use DevTools)

### Common Issues & Debug Steps

1. **RLS policy blocks access:** Verify user authenticated + correct user_id + check metadata for admins
2. **JSONB serialization error:** Ensure nested objects aren't undefined—use `{ ...obj }` pattern
3. **Missing inventory prices:** Check localStorage fallback OR admin imported data to DB
4. **Auth state mismatch:** Check AuthContext—may need profile auto-creation for new OAuth users
5. **Type errors in projects:** Validate optional fields with `?.` chaining—schema uses nulls

## File Quick Reference

| File/Directory                                | Purpose                                |
| --------------------------------------------- | -------------------------------------- |
| `src/supabase/config.ts`                      | Supabase client initialization         |
| `src/supabase/types.ts`                       | Database schema TypeScript definitions |
| `src/supabase/{user,project,admin}Service.ts` | Database service layer                 |
| `src/contexts/AuthContext.tsx`                | Firebase + Supabase auth sync          |
| `src/utils/pageFlow.ts`                       | Multi-step form navigation constants   |
| `src/types/project.ts`                        | Project data shape                     |
| `SUPABASE_NOTES.md`                           | Full database documentation            |
| `MIGRATION_GUIDE.md`                          | Firebase → Supabase migration steps    |
| `GIT_WORKFLOW.md`                             | Git conventions and commands           |

## Important Gotchas

1. **Don't modify Firebase files** (`src/firebase/`) without explicit request—auth still uses it
2. **RLS is enforced**—all inserts/updates must respect `user_id` match or admin check
3. **JSONB nulls propagate**—test with undefined values; use `null` explicitly
4. **Timestamps are ISO strings** in Supabase (not JS Date objects)—convert on serialization
5. **Mobile responsiveness required**—test all new features on phone-sized viewport
6. **Admin features public?** Double-check RLS policy before shipping—deny by default

## Questions? Resources

- **Supabase Dashboard:** https://supabase.com/dashboard/project/dalqnrkpjzlcklhqsoum
- **SUPABASE_NOTES.md:** Full schema, RLS policies, common operations
- **README.md:** Feature overview, setup, deployment
- **GIT_WORKFLOW.md:** Git best practices and commands
````

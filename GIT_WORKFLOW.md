# Git Workflow Guidelines

**Last Updated:** November 16, 2025

---

## Core Principles

This document outlines the exact Git workflow and coding approach used in this project. The goal is **clarity, precision, and intentional version control**.

### Golden Rules

1. **No automatic commits** - Always ask before committing changes
2. **Concise communication** - Explain WHAT changed and WHY, not verbose narratives
3. **Precision-first approach** - Break problems into smaller steps, fix with precision
4. **Verify after changes** - Run lint/build checks after code modifications
5. **Document intentions** - Comments should explain purpose, not obvious code behavior

---

## Branch Strategy

### Naming Convention

```
feature/feature-name       - New features
fix/bug-description        - Bug fixes
update/description         - Updates or refactors
docs/documentation-update  - Documentation changes
```

Examples:

- `feature/firebase-removal`
- `fix/auth-context-types`
- `update/database-schema`
- `docs/supabase-setup`

### Main Branch Protection

The `main` branch is protected:

- ✅ All changes must come from feature branches
- ✅ Only commit when explicitly asked or given permission
- ✅ Always verify code quality before committing

---

## Commit Message Format

### Standard Format

```
type: short description

Optional body explaining changes if needed
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `update:` - Code refactor or update
- `docs:` - Documentation changes
- `chore:` - Build config, dependencies, etc.
- `test:` - Test additions or modifications

### Examples

```
feat: remove Firebase auth from codebase

- Removed Firebase imports from ProjectHistory, Planner, Inquiry pages
- Replaced with Supabase service calls
- Updated user references from uid to id
- Moved Login.tsx to correct location (pages/public)

fix: resolve Supabase insert type errors in AuthContext

- Added type assertions for insert operations
- Properly typed user profile creation
- Verified RLS policies allow insert operations

update: clean up Firebase comments in components

- Updated Inquiry.tsx: Firebase → Supabase
- Updated RequirementsForm.tsx: Firebase fallback → Supabase

docs: update Git workflow instructions

- Added branch naming conventions
- Documented commit message format
- Established workflow guidelines
```

---

## Workflow Steps

### When Starting a Task

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes incrementally**

   - Don't make large sweeping changes at once
   - Test each change in isolation
   - Run lint after changes: `npm run lint`

3. **Stage changes**

   ```bash
   git add .
   ```

   Or selectively:

   ```bash
   git add src/file-to-change.tsx
   ```

4. **Ask before committing**

   - Message the user/reviewer before running commit
   - Provide summary of changes
   - Confirm they want to proceed

5. **Commit with clear message**

   ```bash
   git commit -m "type: description

   - Change 1
   - Change 2
   - Change 3"
   ```

6. **Push to remote**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## Code Change Approach

### Analysis Phase (Broad → Narrow)

1. Search codebase for affected files: `grep_search`, `semantic_search`
2. Identify all imports/usages of the thing being changed
3. Find all components/services that depend on it
4. Map out the cascade of changes needed

### Implementation Phase (Precision)

1. Make one targeted change at a time
2. Fix compilation errors immediately
3. Run `npm run lint` after each change
4. Verify in browser/console before moving to next change

### Verification Phase

1. Check for new errors: `get_errors()`
2. Run full linting: `npm run lint`
3. Test affected features in browser
4. Look for related bugs that same fix might solve

---

## Common Tasks

### Fixing a Bug

```bash
# 1. Create fix branch
git checkout -b fix/bug-name

# 2. Identify root cause
# 3. Make precise changes
# 4. Run tests
npm run lint

# 5. Ask user before committing
# 6. Commit
git commit -m "fix: short description

- Identified root cause: X
- Applied fix: Y
- Verified: Z"

# 7. Push
git push origin fix/bug-name
```

### Adding a Feature

```bash
# 1. Create feature branch
git checkout -b feature/feature-name

# 2. Implement incrementally
# - Create files/components
# - Connect to services
# - Test each step

# 3. Verify quality
npm run lint
npm run build

# 4. Ask user before committing
# 5. Commit with detailed message
git commit -m "feat: feature description

- Added component X
- Integrated with service Y
- Updated types for Z"

# 6. Push
git push origin feature/feature-name
```

### Updating Documentation

```bash
# 1. Create docs branch
git checkout -b docs/update-description

# 2. Update markdown files
# 3. Verify formatting

# 4. Ask user before committing
# 5. Commit
git commit -m "docs: what was updated

- Updated section X
- Added examples for Y
- Fixed typos in Z"

# 6. Push
git push origin docs/update-description
```

---

## Communication Style

### When Reporting Changes

✅ **DO:**

- "Fixed type errors in AuthContext by adding type assertions to insert calls"
- "Removed Firebase imports from ProjectHistory, Planner, Inquiry (3 files)"
- "✅ ProjectHistory.tsx - no errors found after changes"
- "🔍 Checking: ProjectHistory, Planner, Inquiry, AuthContext"

❌ **DON'T:**

- "Made some changes to the auth stuff"
- "Fixed things in several files"
- "Everything should work now"
- Verbose paragraphs explaining obvious code behavior

### Emoji Usage (For Clarity)

- ✅ Success/completed
- ❌ Error/failed
- 🔍 Investigating/checking
- ⚠️ Warning
- 📝 Note/change
- 🎯 Target/goal
- 📦 Package/module
- 🔒 Security/auth

---

## Pre-Commit Checklist

Before asking to commit, verify:

- [ ] All intended changes made
- [ ] No `console.log()` statements left (except debug logs with emoji prefix)
- [ ] No broken imports or missing dependencies
- [ ] `npm run lint` passes (or pre-existing errors noted)
- [ ] No type errors in modified files
- [ ] Comments updated to reflect changes
- [ ] No Firebase code in active codebase (for auth removal tasks)
- [ ] Backup of environment variables safe (never commit .env)

---

## Special Rules for This Project

### Firebase Removal Task (Completed)

- ✅ All Firebase Auth imports removed from active code
- ✅ Replaced with Supabase equivalents
- ✅ Updated comments mentioning Firebase
- ✅ Verified no Firebase in pages, components, services (except legacy folder)
- ✅ Login functionality moved to pages/public/Login.tsx

### Supabase Integration

- Always reference `SUPABASE_NOTES.md` for schema/types
- Never modify RLS policies without testing
- Use service layer (`projectService`, `userService`, `adminService`)
- Type insert/update operations properly
- Always include error handling with ❌ logging

### Component Updates

- Prefer reusable components in `src/components/ui/`
- Extract logic to services in `src/supabase/`
- Use consistent naming: snake_case for database, camelCase for JS
- Keep components focused on UI, not logic

---

## Troubleshooting

### "I forgot to ask before committing"

**Solution:** If you accidentally committed to feature branch:

```bash
git reset HEAD~1  # Undo last commit, keep changes
git status        # Verify changes are staged
# Now ask user before committing again
```

### "Code compiles but has lint errors"

**Solution:** Fix before committing:

```bash
npm run lint          # See all errors
# Fix files mentioned
npm run lint          # Verify fixed
git add .             # Stage fixed files
# Ask user before commit
```

### "Changes affected unrelated files"

**Solution:** Only add intended files:

```bash
git status                                    # See what changed
git add src/specific-file-1.tsx              # Add only what you changed
git add src/specific-file-2.tsx
git commit -m "..."                          # Clear message about changes
```

---

## Quick Reference

| Action                          | Command                         |
| ------------------------------- | ------------------------------- |
| Create branch                   | `git checkout -b feature/name`  |
| See changed files               | `git status`                    |
| Stage all changes               | `git add .`                     |
| Stage specific file             | `git add src/file.tsx`          |
| Check what will be committed    | `git diff --cached`             |
| Commit with message             | `git commit -m "type: message"` |
| Push to remote                  | `git push origin branch-name`   |
| View commit history             | `git log --oneline`             |
| Undo uncommitted changes        | `git checkout -- src/file.tsx`  |
| Undo last commit (keep changes) | `git reset HEAD~1`              |
| Switch branches                 | `git checkout branch-name`      |

---

## Examples of Good Commits

### Complete Feature Implementation

```
feat: implement Supabase project deletion

- Added deleteProject() method to projectService
- Updated ProjectHistory UI to call new service
- Added error handling with toast notifications
- Verified RLS policy allows user deletion of own projects

Files changed:
- src/supabase/projectService.ts (new method)
- src/pages/user/ProjectHistory.tsx (UI integration)
```

### Bug Fix with Investigation

```
fix: resolve type errors in insert operations

Root cause: Supabase client type generation doesn't recognize
optional 'id' field in Insert type, requires type assertion.

Solution: Added `as any` type assertion to insert calls
in AuthContext where we explicitly set user ID.

Files changed:
- src/contexts/AuthContext.tsx (2 insert operations)

Verified:
- ✅ No compilation errors
- ✅ User profile creation works
- ✅ Type check passes
```

---

## Summary

- **Ask before committing** ✅
- **Make precise, targeted changes** ✅
- **Verify quality after changes** ✅
- **Write clear, concise commit messages** ✅
- **Reference SUPABASE_NOTES.md for schema** ✅
- **Use service layer for database operations** ✅
- **Keep code clean and maintainable** ✅

---

**End of Git Workflow Guidelines**

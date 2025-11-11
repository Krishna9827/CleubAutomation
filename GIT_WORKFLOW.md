# Git Workflow & Project Guidelines

## 📋 Project Summary

**Lux Home Planner / Cleub Automation** is a comprehensive home automation planning and estimation system that helps users design smart home solutions room-by-room. The application features:

- **Project Planning:** Create and manage home automation projects with client details, room configurations, and appliance selections
- **Room-Based Design:** Select rooms, configure automation requirements, and manage appliances per room
- **Cost Estimation:** Real-time cost calculation with detailed billing and PDF export functionality
- **Inventory Management:** Product catalog with pricing for switches, lights, sensors, and automation components
- **Admin Dashboard:** Manage inquiries, testimonials, inventory, and view project history
- **User Authentication:** Firebase Auth integration with Google OAuth support
- **Database:** Supabase PostgreSQL with Row Level Security (RLS) for data storage

**Tech Stack:** React + TypeScript, Vite, TailwindCSS, Shadcn UI, Firebase Auth, Supabase Database

## 🚫 Important Rules

### Documentation

- **DO NOT** create unnecessary MD files
- **DO NOT** create summary files after every change
- Keep responses **short and concise**
- Only create documentation when explicitly requested
- Update existing docs (like `SUPABASE_NOTES.md`) instead of creating new ones

### Database

- **ALWAYS** use Supabase Dashboard for SQL operations
- **NO** local Supabase CLI or migrations
- Run SQL directly in Supabase SQL Editor
- Verify changes in Supabase Dashboard Tables view

## 🔄 Git Workflow

### Initial Setup (One Time)

```bash
# Clone repository
git clone https://github.com/Krishna9827/lux-home-planner.git
cd lux-home-planner

# Install dependencies
npm install

# Create .env file with credentials
cp .env.example .env
# Then edit .env with your keys
```

### Daily Workflow

#### Before Starting Work

```bash
# Pull latest changes
git pull origin main

# Create a new branch for your feature
git checkout -b feature/your-feature-name
```

#### While Working

```bash
# Check what changed
git status

# Stage specific files
git add src/pages/Index.tsx
git add src/supabase/projectService.ts

# Or stage all changes
git add .

# Commit with clear message
git commit -m "feat: add Supabase integration for projects"
```

#### Commit Message Format

```
type: short description

Examples:
- feat: add user authentication with Supabase
- fix: resolve UUID error in project creation
- update: migrate Index.tsx to use Supabase
- refactor: update service layer for new schema
- docs: update SUPABASE_NOTES.md
```

#### Push Changes

```bash
# First time pushing new branch
git push -u origin feature/your-feature-name

# Subsequent pushes
git push
```

#### Merge to Main

```bash
# Switch to main
git checkout main

# Pull latest
git pull origin main

# Merge your feature
git merge feature/your-feature-name

# Push to remote
git push origin main

# Delete feature branch (optional)
git branch -d feature/your-feature-name
```

### Common Commands

```bash
# Check current branch
git branch

# See commit history
git log --oneline

# Discard local changes
git checkout -- src/pages/Index.tsx

# Undo last commit (keep changes)
git reset --soft HEAD~1

# See what changed in a file
git diff src/pages/Index.tsx

# Stash changes temporarily
git stash
git stash pop
```

## 📁 File Structure Guidelines

### Code Organization

```
src/
├── supabase/          # Database services (DO NOT MODIFY without SQL migration)
├── pages/             # Main application pages
├── components/        # Reusable UI components
├── contexts/          # React contexts (Auth, etc.)
├── hooks/             # Custom React hooks
├── utils/             # Utility functions (PDF export, etc.)
└── firebase/          # Firebase Auth (will be phased out)
```

### Files to NEVER Commit

- `.env` - Contains sensitive API keys
- `node_modules/` - Dependencies (already in `.gitignore`)
- `dist/` - Build output
- `.DS_Store` - Mac system files

### Files to ALWAYS Review Before Committing

- `package.json` - Check for unwanted dependency changes
- `.env.example` - Ensure template is up to date
- `SUPABASE_NOTES.md` - Update if schema/database changes

## 🗄️ Database Changes Workflow

### When Schema Changes Are Needed

1. **Update SQL migration file:**

   ```bash
   # Edit the file
   nano supabase/migrations/001_initial_schema.sql
   ```

2. **Run in Supabase Dashboard:**

   - Go to: https://supabase.com/dashboard/project/dalqnrkpjzlcklhqsoum/sql
   - Copy SQL from migration file
   - Paste and click **RUN**
   - Verify in **Tables** view

3. **Update TypeScript types:**

   ```bash
   # Edit if needed
   nano src/supabase/types.ts
   ```

4. **Update service layer:**

   ```bash
   # Edit relevant service files
   nano src/supabase/projectService.ts
   ```

5. **Commit changes:**
   ```bash
   git add supabase/migrations/001_initial_schema.sql
   git add src/supabase/types.ts
   git add src/supabase/projectService.ts
   git commit -m "update: modify projects schema to add new field"
   git push
   ```

### Testing Database Changes

**DO NOT** use local Supabase CLI. Instead:

1. Run SQL in Supabase Dashboard SQL Editor
2. Check **Tables** view to verify structure
3. Test in running application (`npm run dev`)
4. Check browser console for errors
5. Verify data in Supabase **Table Editor**

## 🐛 Troubleshooting

### Merge Conflicts

```bash
# See conflicted files
git status

# Open conflicted file and resolve markers:
# <<<<<<< HEAD
# =======
# >>>>>>> branch-name

# After resolving
git add resolved-file.tsx
git commit -m "fix: resolve merge conflict in Index.tsx"
```

### Reset to Remote State

```bash
# Discard ALL local changes
git reset --hard origin/main

# Pull latest
git pull origin main
```

### See What Changed

```bash
# Uncommitted changes
git diff

# Staged changes
git diff --staged

# Changes in last commit
git show
```

## 📝 Code Review Checklist

Before committing:

- [ ] Code runs without errors (`npm run dev`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Tested changed features manually
- [ ] Removed console.logs and debug code
- [ ] Updated relevant documentation (if schema changed)
- [ ] Meaningful commit message
- [ ] `.env` file not included

## 🚀 Deployment Workflow

### Production Deployment

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Build for production
npm run build

# Test production build locally
npm run preview

# Deploy (depends on your hosting)
# Example for Vercel:
# vercel --prod

# Tag the release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## 🔐 Security Notes

- Never commit API keys or credentials
- Use environment variables for all secrets
- Keep `.env` in `.gitignore`
- Rotate keys if accidentally committed
- Review commits before pushing

## 📚 Quick Reference

| Task                 | Command                    |
| -------------------- | -------------------------- |
| Start dev server     | `npm run dev`              |
| Build for production | `npm run build`            |
| Check for errors     | `npm run lint`             |
| Install dependency   | `npm install package-name` |
| Update dependency    | `npm update package-name`  |
| View git status      | `git status`               |
| Stage all changes    | `git add .`                |
| Commit changes       | `git commit -m "message"`  |
| Push to remote       | `git push`                 |
| Pull from remote     | `git pull`                 |

---

**Remember:** Keep commits atomic (one feature/fix per commit), write clear commit messages, and always pull before pushing!

**Project Repository:** https://github.com/Krishna9827/lux-home-planner  
**Supabase Dashboard:** https://supabase.com/dashboard/project/dalqnrkpjzlcklhqsoum

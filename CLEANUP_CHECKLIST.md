# Phase 12: Post-Migration Cleanup Checklist

## ✅ TODO 12.1: Code Cleanup

### Files to Remove (Old Vite/React Router)

- [ ] `index.html` - Old Vite entry point (not needed in Next.js)
- [ ] `vite.config.ts` - Vite configuration
- [ ] `src/main.tsx` - Old React entry point
- [ ] `src/App.tsx` - Old React root component
- [ ] `src/App.css` - Old app styles
- [ ] `src/vite-env.d.ts` - Vite type definitions
- [ ] `tsconfig.app.json` - Vite-specific TypeScript config
- [ ] `tsconfig.node.json` - Vite node TypeScript config
- [ ] `src/views/**` - Old page components (26 files - replaced by app/ directory)

### Files to Keep (Still in use)

- ✅ `src/components/**` - Shared components
- ✅ `src/contexts/**` - React contexts
- ✅ `src/hooks/**` - Custom hooks
- ✅ `src/lib/**` - Utility libraries
- ✅ `src/services/**` - API services
- ✅ `src/supabase/**` - Supabase services
- ✅ `src/types/**` - TypeScript types
- ✅ `src/utils/**` - Utility functions
- ✅ `src/constants/**` - Constants
- ✅ `src/index.css` - Global styles (imported in app/layout.tsx)

## ✅ TODO 12.2: Documentation Updates

- [ ] Update README.md with Next.js setup
- [ ] Create MIGRATION_NOTES.md
- [ ] Update SUPABASE_NOTES.md if needed
- [ ] Document new folder structure

## ✅ TODO 12.3: Merge & Archive

- [ ] Final testing before merge
- [ ] Merge nextjs-migration → main
- [ ] Tag release v2.0.0-nextjs
- [ ] Archive old branch
- [ ] Clean up npm scripts in package.json

## Estimated Time: 4-6 hours

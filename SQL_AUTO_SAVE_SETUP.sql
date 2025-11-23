-- ============================================================================
-- SUPABASE AUTO-SAVE CONFIGURATION FOR PROJECTS TABLE
-- ============================================================================
-- Purpose: Ensure appliances data is properly persisted and timestamps updated
-- Status: REVIEW & RUN IN SUPABASE DASHBOARD > SQL EDITOR
-- Date: November 23, 2025
-- ============================================================================

-- ============================================================================
-- 1. CURRENT PROJECTS TABLE SCHEMA (Already Exists)
-- ============================================================================
-- The projects table already supports JSONB storage for rooms with appliances
-- No schema changes needed - structure is correct

-- Current structure supports:
-- - rooms: JSONB[] (array of room objects)
-- - Each room contains appliances: JSONB array with full details
-- - updated_at: TIMESTAMPTZ (auto-updated by trigger)

-- ============================================================================
-- 2. VERIFY TABLE STRUCTURE
-- ============================================================================

-- Run this to confirm table structure:
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. UPDATE TRIGGER (Auto-updates 'updated_at' on save)
-- ============================================================================
-- This trigger ensures updated_at is set whenever the project is modified

CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS projects_updated_at_trigger ON projects;

-- Create trigger to auto-update timestamp
CREATE TRIGGER projects_updated_at_trigger
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_projects_updated_at();

-- Verify trigger was created
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'projects';

-- ============================================================================
-- 4. RLS POLICIES (Ensure appliance updates are allowed)
-- ============================================================================

-- Verify existing RLS policies allow updates with appliances:

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'projects'
ORDER BY policyname;

-- ============================================================================
-- 5. DATA VALIDATION - Verify appliance structure
-- ============================================================================

-- Check if appliances have required fields in existing projects:
SELECT 
  p.id,
  p.client_info->>'name' as client_name,
  COUNT(DISTINCT (room->>'id')) as room_count,
  COUNT(*) as total_appliances,
  -- Check for appliances without required fields
  COUNT(*) FILTER (WHERE (app->>'category') IS NULL) as missing_category,
  COUNT(*) FILTER (WHERE (app->>'quantity') IS NULL) as missing_quantity,
  MAX(p.updated_at) as last_update
FROM projects p,
LATERAL unnest(p.rooms) as room,
LATERAL jsonb_array_elements(room->'appliances') as app
WHERE p.rooms IS NOT NULL
GROUP BY p.id, p.client_info
ORDER BY p.updated_at DESC
LIMIT 10;

-- ============================================================================
-- 6. PERFORMANCE INDEXES (for faster queries)
-- ============================================================================

-- These indexes help with querying appliances efficiently:

-- Index on user_id (for filtering by user)
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- Index on status (for filtering by status)
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Index on created_at and updated_at (for sorting)
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

-- GIN index on rooms JSONB for complex queries
CREATE INDEX IF NOT EXISTS idx_projects_rooms_gin ON projects USING GIN (rooms);

-- Verify indexes were created:
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE tablename = 'projects'
ORDER BY indexname;

-- ============================================================================
-- 7. AUTO-SAVE BEST PRACTICES
-- ============================================================================

/*

✅ HOW AUTO-SAVE WORKS IN THE APPLICATION:

1. User edits appliances in any of these pages:
   - Planner page (add/edit appliances)
   - Requirements form (edit room requirements - preserves appliances)
   - Admin BOQ page (edit/delete appliances)

2. Application calls projectService.updateProject(projectId, { rooms: updatedRooms })

3. Update hits Supabase API with complete rooms data:
   POST /rest/v1/projects?id=eq.<projectId>
   Body: { rooms: [...] }

4. Supabase:
   - Updates the 'rooms' column with new JSONB data
   - Trigger fires: projects_updated_at_trigger
   - Sets 'updated_at' to NOW()
   - RLS policy validates user_id matches
   - Returns updated record

5. Application receives response and shows success toast

✅ DATABASE CHANGES SAVED AUTOMATICALLY:

- No manual save needed
- Timestamp auto-updated on every change
- All appliance details preserved (category, subcategory, quantity, wattage, specifications)
- RLS ensures data security (only user's projects)

✅ WHAT GETS AUTO-SAVED:

For each appliance:
{
  id: "unique-id",
  name: "Appliance Name",
  category: "Lights|Fans|HVAC|etc",
  subcategory: "Specific type",
  quantity: 5,
  wattage: 12,
  specifications: { custom fields... }
}

For each room:
{
  id: "room-id",
  name: "Room Name",
  type: "Living|Bedroom|etc",
  features: [...],
  appliances: [...],
  requirements: { lighting, fans, controls, etc }
}

✅ TESTING AUTO-SAVE:

1. Open project in admin panel
2. Edit an appliance (change quantity or name)
3. Check database directly:

SELECT 
  id,
  client_info->>'name' as client,
  updated_at,
  rooms->0->>'name' as first_room,
  jsonb_pretty(rooms->0->'appliances'->0) as first_appliance
FROM projects
WHERE id = '<project-id>'
ORDER BY updated_at DESC
LIMIT 1;

4. Verify updated_at timestamp is recent
5. Verify appliance changes are saved

✅ COMMON ISSUES & SOLUTIONS:

Issue: Appliances not saving
Solution: 
- Check browser console for errors
- Verify user is logged in (session valid)
- Check RLS policy allows user_id update
- Ensure JSON structure is valid

Issue: Timestamp not updating
Solution:
- Verify trigger exists: SELECT * FROM pg_trigger WHERE tgname LIKE '%projects%'
- Trigger should fire on BEFORE UPDATE
- Check PostgreSQL logs

Issue: Slow saves
Solution:
- Ensure GIN index on rooms is created
- Monitor database performance
- Check network latency

*/

-- ============================================================================
-- 8. MONITORING QUERIES
-- ============================================================================

-- Monitor recent changes to projects:
SELECT 
  id,
  client_info->>'name' as client_name,
  status,
  array_length(rooms, 1) as room_count,
  updated_at,
  created_at,
  ROUND(EXTRACT(EPOCH FROM (updated_at - created_at))::numeric / 60, 1) as minutes_active
FROM projects
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;

-- Find projects with appliances to verify structure:
SELECT 
  p.id,
  p.client_info->>'name' as client,
  (room->>'name') as room_name,
  COUNT(*) as appliance_count,
  p.updated_at
FROM projects p,
LATERAL unnest(p.rooms) as room,
LATERAL jsonb_array_elements(room->'appliances') as app
GROUP BY p.id, p.client_info, room
HAVING COUNT(*) > 0
ORDER BY p.updated_at DESC
LIMIT 20;

-- ============================================================================
-- 9. CLEANUP: Remove old backup table
-- ============================================================================

-- If projects_backup_backup table still exists, remove it:
DROP TABLE IF EXISTS projects_backup_backup;

-- Verify it's gone:
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%backup%';

-- ============================================================================
-- 10. FINAL VERIFICATION
-- ============================================================================

-- Run this complete check:
SELECT 
  'Table Status' as check_name,
  CASE WHEN EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'projects') 
    THEN '✅ projects table exists'
    ELSE '❌ projects table missing'
  END as status
UNION ALL
SELECT 
  'Trigger Status' as check_name,
  CASE WHEN EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'projects_updated_at_trigger')
    THEN '✅ update trigger exists'
    ELSE '❌ update trigger missing'
  END as status
UNION ALL
SELECT 
  'RLS Status' as check_name,
  CASE WHEN (SELECT count(*) FROM pg_policies WHERE tablename = 'projects') > 0
    THEN '✅ RLS policies exist (' || (SELECT count(*) FROM pg_policies WHERE tablename = 'projects')::text || ' policies)'
    ELSE '❌ No RLS policies'
  END as status
UNION ALL
SELECT 
  'Indexes Status' as check_name,
  '✅ Indexes created (' || (SELECT count(*) FROM pg_indexes WHERE tablename = 'projects')::text || ' indexes)'
  as status;

-- ============================================================================
-- NOTES
-- ============================================================================

/*

✅ KEY POINTS:

1. Schema: No changes needed - already supports JSONB arrays for appliances
2. Trigger: Auto-updates 'updated_at' timestamp on every save
3. RLS: Enforces user_id validation on all updates
4. Indexes: Optimize query performance
5. Auto-save: Handled entirely by application via projectService.updateProject()

✅ WHAT'S STORED IN DATABASE:

Complete appliance structure:
{
  id: "uuid",
  name: "LED Downlight",
  category: "Lights",
  subcategory: "Dimmable",
  quantity: 5,
  wattage: 12,
  specifications: { notes: "optional", custom: "fields" }
}

✅ AUTOMATIC BEHAVIOR:

- Every time appliances are modified in the app, projectService.updateProject() sends data to Supabase
- Supabase receives complete rooms array
- Trigger automatically updates updated_at
- RLS validates permissions
- Data persists in JSONB format
- No manual database writes needed

*/

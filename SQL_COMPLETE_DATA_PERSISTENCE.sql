-- ============================================================================
-- SUPABASE SQL SETUP INSTRUCTIONS
-- ============================================================================
-- For: Lux Home Planner - Complete Data Persistence Implementation
-- Date: November 23, 2025
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Run ONLY the migration files in supabase/migrations/ in order:
--    - 005_fix_projects_rls_for_admins.sql (if not run yet)
--    - 006_extend_rooms_schema_with_appliances_and_requirements.sql
--    - 007_room_data_persistence_documentation.sql (verification only)
-- 3. This file shows example queries for verification
-- ============================================================================

-- ============================================================================
-- PART 1: VERIFICATION QUERIES (Optional - Run these to verify data)
-- ============================================================================

-- 1. Check if appliances are stored in your first project
-- Replace <YOUR_USER_ID> with actual user ID from auth.users
SELECT 
  p.id as project_id,
  p.client_info->>'name' as client_name,
  json_array_length(p.rooms) as room_count,
  CASE 
    WHEN json_array_length(p.rooms) > 0 
    THEN (p.rooms->>0)::jsonb->>'name'
    ELSE 'No rooms'
  END as first_room_name,
  CASE 
    WHEN json_array_length(p.rooms) > 0 
    THEN json_array_length((p.rooms->>0)::jsonb->'appliances')
    ELSE 0
  END as first_room_appliance_count
FROM public.projects p
WHERE p.user_id = '<YOUR_USER_ID>'
LIMIT 5;

-- 2. View a specific room's appliances (format: category, subcategory, qty, wattage)
-- Replace <PROJECT_ID> with actual project UUID
SELECT 
  room_obj->>'name' as room_name,
  app->>'name' as appliance_name,
  app->>'category' as category,
  app->>'subcategory' as subcategory,
  app->>'quantity' as quantity,
  app->>'wattage' as wattage_watts
FROM public.projects,
     jsonb_array_elements(rooms) as room_obj,
     jsonb_array_elements(room_obj->'appliances') as app
WHERE id = '<PROJECT_ID>'
ORDER BY room_obj->>'name';

-- 3. View a specific room's requirements
-- Replace <PROJECT_ID> with actual project UUID
SELECT 
  room_obj->>'name' as room_name,
  req->>'numLights' as number_of_lights,
  req->>'totalWattage' as total_wattage,
  req->>'fanType' as fan_type,
  req->>'fanControl' as fan_control,
  req->>'acTvControl' as ac_tv_control,
  req->>'smartLighting' as smart_lighting_type,
  req->>'notes' as additional_notes
FROM public.projects,
     jsonb_array_elements(rooms) as room_obj,
     jsonb_to_record((room_obj->'requirements')::jsonb) as req(
       numLights text,
       totalWattage text,
       fanType text,
       fanControl text,
       acTvControl text,
       smartLighting text,
       notes text
     )
WHERE id = '<PROJECT_ID>';

-- 4. Count switch panels/sections per room
-- Replace <PROJECT_ID> with actual project UUID
SELECT 
  room_obj->>'name' as room_name,
  json_array_length(req->'sections') as section_count
FROM public.projects,
     jsonb_array_elements(rooms) as room_obj,
     jsonb_to_record((room_obj->'requirements')::jsonb) as req(sections jsonb)
WHERE id = '<PROJECT_ID>';

-- 5. View all appliances across all rooms for a project (Complete view)
-- Replace <PROJECT_ID> with actual project UUID
SELECT 
  room_obj->>'name' as room_name,
  json_array_length(room_obj->'appliances') as appliance_count,
  string_agg(
    app->>'name' || ' (' || app->>'category' || 
    CASE WHEN app->>'subcategory' IS NOT NULL 
         THEN ' - ' || app->>'subcategory' 
         ELSE '' 
    END || ', Qty: ' || app->>'quantity' || 
    CASE WHEN app->>'wattage' IS NOT NULL 
         THEN ', ' || app->>'wattage' || 'W'
         ELSE ''
    END || ')',
    ' | '
  ) as appliances_list
FROM public.projects,
     jsonb_array_elements(rooms) as room_obj,
     jsonb_array_elements(room_obj->'appliances') as app
WHERE id = '<PROJECT_ID>'
GROUP BY room_obj->>'name'
ORDER BY room_obj->>'name';

-- ============================================================================
-- PART 2: BACKUP & RECOVERY (If needed)
-- ============================================================================

-- 6. Export project data as JSON (for backup or manual review)
-- Replace <PROJECT_ID> with actual project UUID
SELECT jsonb_pretty(
  jsonb_build_object(
    'id', id,
    'client_info', client_info,
    'property_details', property_details,
    'rooms', rooms,
    'total_cost', total_cost,
    'status', status,
    'created_at', created_at,
    'updated_at', updated_at
  )
) as project_data
FROM public.projects
WHERE id = '<PROJECT_ID>';

-- ============================================================================
-- PART 3: TROUBLESHOOTING
-- ============================================================================

-- 7. Check RLS policies for projects table
-- This should show policies allowing users to view own projects AND admins to view all
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- 8. Verify admins table has entries
SELECT email, is_active FROM public.admins WHERE is_active = true;

-- 9. Check if a specific project has RLS issues
-- Replace <PROJECT_ID> and <USER_ID> with actual values
SELECT 
  id,
  user_id,
  (SELECT COUNT(*) FROM public.admins WHERE admins.email = auth.jwt() ->> 'email' AND is_active = true) as is_admin,
  exists(SELECT 1 FROM public.admins a WHERE a.email = (SELECT email FROM auth.users WHERE id = '<USER_ID>') AND a.is_active = true) as user_is_admin
FROM public.projects
WHERE id = '<PROJECT_ID>';

-- ============================================================================
-- PART 4: DATA STATISTICS
-- ============================================================================

-- 10. Overall statistics for all projects
SELECT 
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT p.user_id) as unique_users,
  ROUND(AVG(p.total_cost)::numeric, 2) as avg_project_cost,
  ROUND(SUM(p.total_cost)::numeric, 2) as total_cost_all_projects,
  COUNT(*) FILTER (WHERE p.status = 'draft') as draft_projects,
  COUNT(*) FILTER (WHERE p.status = 'in-progress') as inprogress_projects,
  COUNT(*) FILTER (WHERE p.status = 'completed') as completed_projects
FROM public.projects p;

-- ============================================================================
-- NOTES FOR DEVELOPERS
-- ============================================================================
-- 
-- The room data structure now includes:
-- 
-- rooms JSONB[] = [
--   {
--     "id": "room-uuid",
--     "name": "Living Room",
--     "type": "Living",
--     "appliances": [
--       {
--         "id": "app-id",
--         "name": "LED Light",
--         "category": "Lights",
--         "subcategory": "Dimmable",
--         "quantity": 5,
--         "wattage": 12,
--         "specifications": {"notes": "..."},
--         "panelType": "Touch Screen" (optional),
--         "moduleChannels": 4 (optional),
--         "channelConfig": [...] (optional)
--       }
--     ],
--     "requirements": {
--       "curtains": false,
--       "ethernet": true,
--       "numLights": "5",
--       "totalWattage": "60W",
--       "fanType": "Ceiling Fan",
--       "smartLighting": "RGBW",
--       "sections": [
--         {
--           "id": "section-uuid",
--           "name": "Main Door Panel",
--           "items": [
--             {"channelNumber": 1, "label": "Light", "details": "12W LED"}
--           ]
--         }
--       ]
--     }
--   }
-- ]
--
-- ============================================================================

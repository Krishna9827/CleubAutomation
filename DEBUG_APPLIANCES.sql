-- ============================================================================
-- DEBUGGING: APPLIANCES NOT SHOWING IN BOQ
-- ============================================================================
-- Comprehensive troubleshooting guide
-- Date: November 23, 2025
-- ============================================================================

-- STEP 1: Check if appliances exist in database
-- ============================================================================

SELECT 
  p.id,
  p.client_info->>'name' as client_name,
  array_length(p.rooms, 1) as room_count,
  (SELECT COUNT(*) 
   FROM unnest(p.rooms) r,
   jsonb_array_elements(r->'appliances')) as total_appliances,
  jsonb_pretty(((p.rooms[1])->'appliances'->0)) as first_appliance
FROM projects p
WHERE p.updated_at > NOW() - INTERVAL '7 days'
ORDER BY p.updated_at DESC
LIMIT 10;

-- STEP 2: Check if project has empty appliance arrays
-- ============================================================================

SELECT 
  p.id,
  p.client_info->>'name' as client_name,
  array_length(p.rooms, 1) as room_count,
  (SELECT COUNT(*) FROM unnest(p.rooms) r WHERE jsonb_array_length(r->'appliances') > 0) as rooms_with_appliances,
  p.updated_at as last_update
FROM projects p
WHERE p.updated_at > NOW() - INTERVAL '7 days'
  AND (SELECT COUNT(*) FROM unnest(p.rooms) r WHERE jsonb_array_length(r->'appliances') > 0) > 0
ORDER BY p.updated_at DESC;

-- STEP 3: Check rooms with EMPTY appliances (problematic)
-- ============================================================================

SELECT 
  p.id,
  p.client_info->>'name' as client_name,
  (room->>'name') as room_name,
  (room->>'type') as room_type,
  jsonb_array_length(room->'appliances') as appliance_count,
  p.updated_at
FROM projects p,
LATERAL unnest(p.rooms) as room
WHERE jsonb_array_length(room->'appliances') = 0
  AND p.updated_at > NOW() - INTERVAL '7 days'
ORDER BY p.updated_at DESC
LIMIT 20;

-- STEP 4: Verify RLS allows admin to view projects
-- ============================================================================

-- Check if admin email is in admins table and active
SELECT 
  email,
  is_active,
  created_at
FROM public.admins
WHERE is_active = true
ORDER BY email;

-- STEP 5: Check appliance field structure
-- ============================================================================

-- Verify appliances have required fields (category, subcategory, quantity, etc)
SELECT 
  p.id,
  (room->>'name') as room_name,
  jsonb_pretty(app) as appliance_data,
  -- Check for missing fields
  CASE 
    WHEN (app->>'name') IS NULL THEN 'Missing name'
    WHEN (app->>'category') IS NULL THEN 'Missing category'
    WHEN (app->>'quantity') IS NULL THEN 'Missing quantity'
    ELSE 'Complete'
  END as status
FROM projects p,
LATERAL unnest(p.rooms) as room,
LATERAL jsonb_array_elements(room->'appliances') as app
WHERE p.updated_at > NOW() - INTERVAL '7 days'
ORDER BY p.updated_at DESC
LIMIT 10;

-- STEP 6: Monitor recent updates
-- ============================================================================

SELECT 
  id,
  client_info->>'name' as client,
  status,
  array_length(rooms, 1) as room_count,
  -- Count appliances
  (SELECT COUNT(*) FROM unnest(p.rooms) r, 
          jsonb_array_elements(r->'appliances') a) as total_appliances,
  updated_at,
  NOW() - updated_at as time_since_update
FROM projects p
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;

-- ============================================================================
-- DEBUGGING CHECKLIST (CLIENT SIDE)
-- ============================================================================

/*

✅ IF APPLIANCES ARE NOT SHOWING IN BOQ, CHECK:

1. BROWSER CONSOLE LOGS:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for:
     ✓ "📂 Loading project:" - Project loaded?
     ✓ "✅ Project loaded:" - Shows appliance count
     ✓ "📊 BOQ items generated:" - BOQ items created?
     ✓ "💾 Saving appliance" - When editing
     ✓ "✅ Appliance saved successfully" - After edit

2. NETWORK TAB:
   - Check /rest/v1/projects requests
   - Response should include full "rooms" array with appliances
   - If rooms are empty [], that's the issue

3. CHROME DEVTOOLS:
   - Application > Local Storage
   - Check "currentProjectId" has correct ID
   - Check "inventoryPrices" is loaded

4. ADMIN PAGE LOAD:
   - Open project in Admin BOQ page
   - Wait 2-3 seconds for data to load
   - Check if appliance counts are > 0

*/

-- ============================================================================
-- BROWSER CONSOLE DEBUG COMMANDS
-- ============================================================================

/*

// In browser console, check local data:

// 1. Check if rooms have appliances
localStorage.getItem('currentProjectId')  // Should show project ID

// 2. After page loads, check page state (in React DevTools):
// - Look for "rooms" state
// - Each room should have appliances array
// - Each appliance should have: id, name, category, quantity, wattage, specifications

// 3. Check if priceData is loaded
localStorage.getItem('inventoryPrices')  // Should show price list

*/

-- ============================================================================
-- COMMON ISSUES & SOLUTIONS
-- ============================================================================

/*

ISSUE #1: "appliances is empty array []"
CAUSE: Project was created via RoomSelection which initializes appliances: []
SOLUTION: 
  - Admin must add appliances via AdminBOQGeneration edit dialog
  - OR user adds appliances via Requirements form
  - Verify database shows appliances after adding

ISSUE #2: "Appliances not persisting after edit"
CAUSE: handleSaveAppliance might not be re-fetching data
SOLUTION:
  - Check browser console for "✅ Appliance saved successfully"
  - Verify network request shows updated rooms in response
  - Wait 2 seconds after saving before checking BOQ table

ISSUE #3: "Admin can't view project (RLS blocked)"
CAUSE: Admin email not in admins table or not is_active
SOLUTION:
  - Verify admin email in: SELECT * FROM admins WHERE email = '<admin@email.com>'
  - Ensure is_active = true
  - Verify admin is logged in with correct email

ISSUE #4: "BOQ table shows 0 appliances but rooms exist"
CAUSE: generateBOQItems not called after data loads
SOLUTION:
  - Check generateBOQItems is called in useEffect
  - Verify priceData is loaded before generateBOQItems runs
  - Check console for "📊 BOQ items generated: X items"

ISSUE #5: "Edit dialog saves but appliances don't update"
CAUSE: State not being re-fetched from database
SOLUTION:
  - The fix now re-fetches from database after save
  - Should see "✅ Project loaded:" message with new appliance count
  - If not appearing, check network tab for GET request after update

*/

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

-- Check a specific project has appliances
SELECT 
  p.id,
  p.client_info->>'name' as client,
  (
    SELECT COUNT(*) 
    FROM unnest(p.rooms) r,
    jsonb_array_elements(r->'appliances')
  ) as appliance_count,
  p.updated_at
FROM projects p
WHERE p.client_info->>'name' ILIKE '%<client-name>%'
ORDER BY p.updated_at DESC
LIMIT 1;

-- If appliance_count = 0, appliances were never saved!
-- If appliance_count > 0, check why they're not showing in AdminBOQGeneration


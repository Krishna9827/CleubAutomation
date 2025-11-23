-- ============================================================================
-- PROJECT TABLE SCHEMA FIX - Complete Rooms & Appliances Structure
-- ============================================================================
-- Purpose: Update projects table to properly store all room and appliance data
-- including category, subcategory, wattage, quantity, and specifications
--
-- Status: RUN IN SUPABASE DASHBOARD > SQL EDITOR
-- Date: November 23, 2025
-- ============================================================================

-- No migration needed - the table structure already supports JSONB
-- The schema is correct, we just need to ensure data structure is consistent

-- For reference, here's the COMPLETE Room & Appliance structure that should be stored:

/*
ROOMS ARRAY STRUCTURE:
======================

rooms: [
  {
    id: "room-uuid-1",
    name: "Living Room",
    type: "Living",
    features: ["Smart Lighting", "Climate Control"],
    
    // COMPLETE Appliances array with ALL details
    appliances: [
      {
        id: "app-uuid-1",
        name: "LED Downlight",
        category: "Lights",
        subcategory: "Dimmable",
        quantity: 5,
        wattage: 12,
        specifications: {
          notes: "Optional notes",
          color: "warm-white",
          brightness: "variable"
        }
      },
      {
        id: "app-uuid-2",
        name: "Smart Fan",
        category: "Fans",
        subcategory: "DC Motor",
        quantity: 1,
        wattage: 35,
        specifications: {
          speed: "3-speed",
          remote: true
        }
      }
    ],
    
    // Requirements per room (from requirements form)
    requirements: {
      curtains: true,
      ethernet: false,
      curtainMotor: true,
      panelChange: false,
      numLights: "5",
      totalWattage: "60",
      fanType: "Ceiling",
      fanControl: "Smart",
      acTvControl: true,
      smartLighting: true,
      smartSwitch: true,
      switchboardHeight: "4-5 feet",
      switchboardModule: "6-module",
      controlsInSameBoard: true,
      notes: "Room-specific notes",
      lightTypes: {
        strip: "2",
        cob: "3",
        accent: "1",
        cylinder: "0"
      },
      sections: [
        {
          id: "sect-1",
          name: "Lighting Control Panel",
          items: [
            {
              id: "item-1",
              name: "Smart Switch",
              quantity: 4,
              price: 1500
            }
          ]
        }
      ]
    }
  }
]

COMPLETE APPLIANCE STRUCTURE:
=============================
{
  id: "unique-app-id",
  name: "Device Name",
  category: "Lights|Fans|HVAC|Smart Devices|etc",
  subcategory: "Specific Type (Dimmable, COB, Strip, DC Motor, etc)",
  quantity: 5,
  wattage: 12,
  price: 0,  // Optional - calculated from inventory
  specifications: {
    notes: "any custom notes",
    // Additional custom fields based on device type
  }
}
*/

-- ============================================================================
-- VERIFICATION QUERIES (Run these to check current data)
-- ============================================================================

-- 1. Check rooms structure in existing projects
SELECT 
  p.id,
  (room->>'name') as room_name,
  (room->>'type') as room_type,
  jsonb_array_length(room->'appliances') as appliance_count,
  room->'appliances'->0 as first_appliance
FROM projects p,
LATERAL unnest(p.rooms) as room
WHERE p.rooms IS NOT NULL AND array_length(p.rooms, 1) > 0
LIMIT 5;

-- 2. Check if appliances have required fields
SELECT 
  p.id,
  (room->>'name') as room_name,
  jsonb_pretty(app) as appliance_structure
FROM projects p,
LATERAL unnest(p.rooms) as room,
LATERAL jsonb_array_elements(room->'appliances') as app
WHERE p.rooms IS NOT NULL 
  AND array_length(p.rooms, 1) > 0
  AND jsonb_array_length(room->'appliances') > 0
LIMIT 3;

-- 3. Find projects with incomplete appliance data
SELECT 
  p.id,
  p.client_info->>'name' as client_name,
  COUNT(DISTINCT room->>'name') as room_count,
  COUNT(*) as total_appliances,
  -- Check if appliances are missing fields
  CASE 
    WHEN COUNT(*) FILTER (WHERE app->>'category' IS NULL) > 0 THEN 'Missing category'
    WHEN COUNT(*) FILTER (WHERE app->>'subcategory' IS NULL) > 0 THEN 'Missing subcategory'
    WHEN COUNT(*) FILTER (WHERE app->>'quantity' IS NULL) > 0 THEN 'Missing quantity'
    ELSE 'Complete'
  END as appliance_status
FROM projects p,
LATERAL unnest(p.rooms) as room,
LATERAL jsonb_array_elements(room->'appliances') as app
WHERE p.rooms IS NOT NULL AND array_length(p.rooms, 1) > 0
GROUP BY p.id, p.client_info
ORDER BY p.created_at DESC;

-- ============================================================================
-- DATA STRUCTURE VALIDATION (Run after saving data)
-- ============================================================================

-- Validate rooms have all required fields
SELECT 
  COUNT(*) as total_rooms,
  COUNT(*) FILTER (WHERE room->>'id' IS NOT NULL) as with_id,
  COUNT(*) FILTER (WHERE room->>'name' IS NOT NULL) as with_name,
  COUNT(*) FILTER (WHERE room->>'type' IS NOT NULL) as with_type
FROM projects p,
LATERAL unnest(p.rooms) as room;

-- Validate appliances have all required fields
SELECT 
  COUNT(*) as total_appliances,
  COUNT(*) FILTER (WHERE app->>'id' IS NOT NULL) as with_id,
  COUNT(*) FILTER (WHERE app->>'name' IS NOT NULL) as with_name,
  COUNT(*) FILTER (WHERE app->>'category' IS NOT NULL) as with_category,
  COUNT(*) FILTER (WHERE app->>'quantity' IS NOT NULL) as with_quantity,
  COUNT(*) FILTER (WHERE app->>'wattage' IS NOT NULL) as with_wattage
FROM projects p,
LATERAL unnest(p.rooms) as room,
LATERAL jsonb_array_elements(room->'appliances') as app;

-- ============================================================================
-- CLEANUP: Remove duplicate/corrupted appliance data (if needed)
-- ============================================================================

-- DO NOT RUN - Backup table created for safety (optional cleanup only)
-- If you need to restore data, you can query projects_backup_backup
-- To delete the backup table, run:
-- DROP TABLE IF EXISTS projects_backup_backup;

-- Uncomment below ONLY if you have invalid data and need to reset appliances:
-- UPDATE projects 
-- SET rooms = 
--   jsonb_set(
--     rooms,
--     '{0,appliances}',
--     '[]'::jsonb
--   )
-- WHERE rooms IS NOT NULL;

-- ============================================================================
-- NOTES FOR IMPLEMENTATION
-- ============================================================================

/*

✅ COMPLETE DATA FLOW:

1. Room Selection (/room-selection)
   - Creates rooms with: id, name, type, features[], appliances[]
   - appliances: [] (empty array, filled in planner)

2. Requirements (/requirements)  
   - Adds: requirements object to each room
   - Stores room-specific settings (lights, fans, controls, etc)

3. Planner (/planner)
   - Fills: appliances[] array with complete data
   - Each appliance must have:
     ✓ id (UUID)
     ✓ name (string)
     ✓ category (from inventory)
     ✓ subcategory (specific type)
     ✓ quantity (number)
     ✓ wattage (number, nullable)
     ✓ specifications (object with custom fields)
     
4. Final Review (/final-review)
   - Displays: all rooms with appliances & requirements
   - Calculates: costs based on appliances

5. BOQ Generation (/admin/boq-generation)
   - Reads: complete rooms with all appliance data
   - Generates: Bill of Quantities

✅ KEY REQUIREMENTS:

- Appliances MUST have: category, subcategory, quantity
- Requirements MUST be saved per room
- Wattage is optional but recommended
- Specifications can have custom fields per device type
- All IDs should be UUIDs or unique strings

✅ DEBUGGING:

If appliances aren't showing in BOQ:
1. Check if appliances array exists: rooms[0].appliances
2. Verify fields: category, subcategory, quantity present
3. Check if Planner is actually saving to DB
4. Look for console errors in browser dev tools

*/

-- ============================================================================
-- RUN THIS TO VERIFY TABLE IS READY
-- ============================================================================

-- Final validation
SELECT 
  'projects' as table_name,
  (SELECT COUNT(*) FROM projects) as total_projects,
  (SELECT COUNT(*) FROM projects WHERE rooms IS NOT NULL) as projects_with_rooms,
  (SELECT COUNT(*) FROM projects WHERE rooms::text LIKE '%appliances%') as projects_with_appliances
;

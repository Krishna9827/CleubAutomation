# Quick Migration Execution Guide

## The Problem (1 sentence)

CSV import fails because database table is missing 3 columns: `product_name`, `vendor`, `protocol`

## The Fix (1 sentence)

Execute SQL migration to add these 3 columns to the inventory table

---

## STEP 1️⃣: Run Migration in Supabase (1 minute)

### 🌐 Open Supabase Dashboard

```
URL: https://supabase.com/dashboard/project/dalqnrkpjzlcklhqsoum
```

### 📝 Go to SQL Editor

```
Left Sidebar → SQL Editor → New Query
```

### 📋 Copy-Paste This SQL

```sql
-- Add missing columns to inventory table
ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS vendor TEXT,
ADD COLUMN IF NOT EXISTS protocol TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_product_name ON public.inventory(product_name);
CREATE INDEX IF NOT EXISTS idx_inventory_vendor ON public.inventory(vendor);

-- Add descriptions
COMMENT ON COLUMN public.inventory.product_name IS 'Full product name/title';
COMMENT ON COLUMN public.inventory.vendor IS 'Vendor or manufacturer name';
COMMENT ON COLUMN public.inventory.protocol IS 'Protocol/communication type (e.g., Zigbee, KNX, Wi-Fi)';
```

### ▶️ Execute Query

```
Click: Run button (or Cmd+Enter)
Wait: 2-3 seconds
Check: "✓ Query executed successfully"
```

### ✅ Verify Success

**In Supabase Dashboard:**

1. Left Sidebar → Tables
2. Click: inventory
3. Click: Columns tab
4. Confirm 3 new columns exist:
   - [ ] product_name (TEXT)
   - [ ] vendor (TEXT)
   - [ ] protocol (TEXT)

---

## STEP 2️⃣: Test Import (5 minutes)

### Terminal: Start Dev Server

```bash
cd "/Users/krishnas_mac/Documents/VS_code/Automation Price Estimator/lux-home-planner"
npm run dev
```

### Browser: Open App

```
URL: http://localhost:5173
Login: Admin account
Navigate: Admin → Inventory
```

### Upload: Import CSV File

```
Button: "Import from CSV"
Action: Drag CSV file or click to browse
File: Your inventory CSV (40+ items)
```

### Verify: Success

```
✅ Preview shows: "Total Rows: [X]" "Valid Items: [X]"
✅ Click: "Import X Items"
✅ See: "Imported successfully" toast
✅ Items: Appear in AdminInventory table
✅ Console: No red errors (Cmd+Shift+J)
```

---

## What This Fixes

| Before                             | After                               |
| ---------------------------------- | ----------------------------------- |
| ❌ Import fails                    | ✅ Import succeeds                  |
| ❌ Error: "Failed to import items" | ✅ Success: "Imported successfully" |
| ❌ No items in database            | ✅ Items in database                |
| ❌ BOQ uses hardcoded prices       | ✅ BOQ uses imported prices         |

---

## If Something Goes Wrong

### Error: "Query executed with errors"

```
→ Check SQL syntax
→ Copy-paste exact SQL from above
→ Try again
```

### Error: "Failed to import items to database"

```
→ Migration didn't run successfully
→ Go back to Step 1
→ Verify "✓ Query executed successfully"
→ Try import again
```

### Items don't appear in table

```
→ Hard refresh browser: Cmd+Shift+R
→ Check: Admin account is still logged in
→ Check: Items show in database (Supabase Dashboard)
```

---

## Troubleshooting

| Problem                         | Solution                                        |
| ------------------------------- | ----------------------------------------------- |
| "Unknown column 'product_name'" | Migration failed → Run Step 1 again             |
| "Failed to import items"        | Columns don't exist → Run Step 1                |
| Items not showing               | Cache issue → Hard refresh (Cmd+Shift+R)        |
| Still broken                    | Check browser console (Cmd+Shift+J) for details |

---

## That's It!

After these 2 steps (1 minute + 5 minutes = 6 minutes):

- ✅ Migration applied
- ✅ Import works
- ✅ Items in database
- ✅ Ready to link to BOQ

**Next**: See `INVENTORY_IMPORT_FIX_STEPS.md` for Steps 3-4 (BOQ integration)

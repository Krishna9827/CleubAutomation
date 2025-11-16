-- FIX: Admin Settings RLS Policy
-- Issue: UPSERT (INSERT + UPDATE) was failing because INSERT policy was missing
-- Solution: Add INSERT policy for authenticated users

-- Step 1: Drop existing policies (if any INSERT policies exist)
DROP POLICY IF EXISTS "Allow authenticated users to insert admin settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update admin settings" ON public.admin_settings;

-- Step 2: Create new policies for admin_settings

-- Allow authenticated users to SELECT admin settings
CREATE POLICY "Allow authenticated to select admin settings" ON public.admin_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to INSERT admin settings
-- Required for UPSERT operations
CREATE POLICY "Allow authenticated to insert admin settings" ON public.admin_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to UPDATE admin settings
CREATE POLICY "Allow authenticated to update admin settings" ON public.admin_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verify policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'admin_settings'
ORDER BY policyname;

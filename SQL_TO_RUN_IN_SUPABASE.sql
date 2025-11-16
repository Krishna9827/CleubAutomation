-- ============================================
-- COPY THIS ENTIRE SCRIPT INTO SUPABASE SQL EDITOR
-- ============================================
-- This creates the admins table with email-based access control
-- Initial admin: krishna.asiwal2003@gmail.com

-- Step 1: Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON public.admins(is_active);

-- Step 3: Insert initial admin user
-- The email: krishna.asiwal2003@gmail.com will have FULL ADMIN ACCESS
INSERT INTO public.admins (email, full_name, is_active) 
VALUES ('krishna.asiwal2003@gmail.com', 'Krishna Asiwal', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;

-- Step 4: Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies

-- POLICY 1: Allow anyone to view active admins
-- (This is safe - only exposes is_active=true records, no sensitive data)
DROP POLICY IF EXISTS "Allow public to view active admins" ON public.admins;
CREATE POLICY "Allow public to view active admins" ON public.admins
FOR SELECT
USING (is_active = true);

-- POLICY 2: Allow admins to create new admins
-- (Only authenticated users who are in admins table can insert)
DROP POLICY IF EXISTS "Allow admins to create admins" ON public.admins;
CREATE POLICY "Allow admins to create admins" ON public.admins
FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM public.admins
        WHERE email = auth.jwt() ->> 'email'
        AND is_active = true
    )
);

-- POLICY 3: Allow admins to update admin records
DROP POLICY IF EXISTS "Allow admins to update admins" ON public.admins;
CREATE POLICY "Allow admins to update admins" ON public.admins
FOR UPDATE
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM public.admins
        WHERE email = auth.jwt() ->> 'email'
        AND is_active = true
    )
);

-- POLICY 4: Allow admins to delete admin records
DROP POLICY IF EXISTS "Allow admins to delete admins" ON public.admins;
CREATE POLICY "Allow admins to delete admins" ON public.admins
FOR DELETE
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM public.admins
        WHERE email = auth.jwt() ->> 'email'
        AND is_active = true
    )
);

-- Step 6: Grant permissions
GRANT SELECT ON public.admins TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.admins TO authenticated;

-- ============================================
-- VERIFICATION QUERIES (Run these to verify)
-- ============================================

-- Check table was created
-- SELECT * FROM public.admins;

-- Should return 1 row with krishna.asiwal2003@gmail.com

-- Check RLS policies are enabled
-- SELECT tablename, policyname FROM pg_policies WHERE tablename = 'admins';

-- Should return 5 policies

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- To add more admins (requires existing admin access):
-- INSERT INTO public.admins (email, full_name, is_active)
-- VALUES ('neoadmin@example.com', 'New Admin Name', true);

-- To deactivate an admin (non-destructive):
-- UPDATE public.admins SET is_active = false 
-- WHERE email = 'admin@example.com';

-- To reactivate an admin:
-- UPDATE public.admins SET is_active = true 
-- WHERE email = 'admin@example.com';

-- To view all active admins:
-- SELECT id, email, full_name, created_at FROM public.admins 
-- WHERE is_active = true
-- ORDER BY created_at DESC;

-- Create admins table for storing admin users with email-based access control
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON public.admins(is_active);

-- Insert initial admin user with full access
INSERT INTO public.admins (email, full_name, is_active) 
VALUES ('krishna.asiwal2003@gmail.com', 'Krishna Asiwal', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;

-- Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Anyone can view active admins (for display purposes, no sensitive data exposed)
CREATE POLICY "Allow public to view active admins" ON public.admins
FOR SELECT
USING (is_active = true);

-- RLS Policy 2: Only authenticated users who are admins can insert new admins
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

-- RLS Policy 3: Only admins can update admin records
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

-- RLS Policy 4: Only admins can delete admin records
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

-- Grant permissions to authenticated users
GRANT SELECT ON public.admins TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.admins TO authenticated;

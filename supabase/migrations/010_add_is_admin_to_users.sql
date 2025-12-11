-- Add is_admin column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for faster admin checks
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin) WHERE is_admin = true;

-- Set your account as admin (replace with your email)
UPDATE public.users
SET is_admin = true
WHERE email = 'krishna.asiwal2003@gmail.com';

-- Log the change
COMMENT ON COLUMN public.users.is_admin IS 'Boolean flag to determine if user has admin privileges';

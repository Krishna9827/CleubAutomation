-- ============================================
-- SUPABASE DATABASE MIGRATIONS
-- Project: Cleub Automation / Lux Home Planner
-- Date: November 11, 2025
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: users
-- Description: Stores user profile information
-- Note: id is UUID to match Supabase Auth user.id
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    date_of_birth TEXT,
    house_number TEXT,
    area TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    profile_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Allow signup: new users can create their profile
CREATE POLICY "Users can create their own profile"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ============================================
-- TABLE: projects
-- Description: Stores project/automation planning data
-- Note: user_id is UUID to match Supabase Auth UIDs
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    client_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    property_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
    rooms JSONB[] DEFAULT ARRAY[]::JSONB[],
    sections JSONB[] DEFAULT ARRAY[]::JSONB[],
    total_cost NUMERIC(12, 2) DEFAULT 0,
    status TEXT CHECK (status IN ('draft', 'in-progress', 'completed')) DEFAULT 'draft',
    last_saved_page TEXT DEFAULT 'index',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_client_email ON public.projects((client_info->>'email'));

-- Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects table
-- Allow authenticated users to create projects (they will be owners)
CREATE POLICY "Authenticated users can create projects"
    ON public.projects FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own projects
CREATE POLICY "Users can view own projects"
    ON public.projects FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow users to update their own projects
CREATE POLICY "Users can update own projects"
    ON public.projects FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow users to delete their own projects
CREATE POLICY "Users can delete own projects"
    ON public.projects FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- TABLE: inquiries
-- Description: Stores customer inquiry/contact form submissions
-- ============================================
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- Enable RLS on inquiries table
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inquiries - Anyone can submit (unauthenticated or authenticated)
CREATE POLICY "Anyone can create inquiry"
    ON public.inquiries FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Anyone can view inquiries"
    ON public.inquiries FOR SELECT
    TO public
    USING (true);

-- ============================================
-- TABLE: admin_settings
-- Description: Stores admin configuration settings
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on setting_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON public.admin_settings(setting_key);

-- Enable RLS on admin_settings table
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_settings - Authenticated users can view
CREATE POLICY "Authenticated users can view admin settings"
    ON public.admin_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role can update admin settings"
    ON public.admin_settings FOR UPDATE
    USING (true);

-- ============================================
-- TABLE: testimonials
-- Description: Stores client testimonials and case studies
-- ============================================
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    property_type TEXT NOT NULL,
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    quote TEXT NOT NULL,
    project_details TEXT NOT NULL,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    results TEXT[] DEFAULT ARRAY[]::TEXT[],
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials(created_at DESC);

-- Enable RLS on testimonials table
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for testimonials - Anyone can view, service role can create/update
CREATE POLICY "Anyone can view testimonials"
    ON public.testimonials FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Service role can manage testimonials"
    ON public.testimonials FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can update testimonials"
    ON public.testimonials FOR UPDATE
    USING (true);

-- ============================================
-- TABLE: inventory
-- Description: Stores inventory items and pricing
-- ============================================
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    subcategory TEXT,
    wattage INTEGER,
    price_per_unit NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_category ON public.inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_subcategory ON public.inventory(subcategory);

-- Enable RLS on inventory table
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory - Anyone can view, service role can manage
CREATE POLICY "Anyone can view inventory"
    ON public.inventory FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Service role can manage inventory"
    ON public.inventory FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can update inventory"
    ON public.inventory FOR UPDATE
    USING (true);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant appropriate permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value)
VALUES ('general', '{}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

COMMENT ON TABLE public.users IS 'User profiles and authentication data';
COMMENT ON TABLE public.projects IS 'Home automation project planning data';
COMMENT ON TABLE public.inquiries IS 'Customer inquiry and contact form submissions';
COMMENT ON TABLE public.admin_settings IS 'Admin configuration and settings';
COMMENT ON TABLE public.testimonials IS 'Client testimonials and case studies';
COMMENT ON TABLE public.inventory IS 'Product inventory and pricing information';

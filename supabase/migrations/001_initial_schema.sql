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
-- Note: id is TEXT to match Firebase Auth UIDs (not UUID)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
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

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- TABLE: projects
-- Description: Stores project/automation planning data
-- Note: user_id is TEXT to match Firebase Auth UIDs
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
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

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects table
CREATE POLICY "Users can view own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

-- Admin can view all projects (requires custom claim)
CREATE POLICY "Admins can view all projects"
    ON public.projects FOR SELECT
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

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

-- Enable Row Level Security
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inquiries
CREATE POLICY "Anyone can create inquiry"
    ON public.inquiries FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view all inquiries"
    ON public.inquiries FOR SELECT
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

CREATE POLICY "Admins can update inquiries"
    ON public.inquiries FOR UPDATE
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

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

-- Enable Row Level Security
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_settings
CREATE POLICY "Admins can view settings"
    ON public.admin_settings FOR SELECT
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

CREATE POLICY "Admins can insert settings"
    ON public.admin_settings FOR INSERT
    WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

CREATE POLICY "Admins can update settings"
    ON public.admin_settings FOR UPDATE
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

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

-- Enable Row Level Security
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for testimonials
CREATE POLICY "Anyone can view testimonials"
    ON public.testimonials FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert testimonials"
    ON public.testimonials FOR INSERT
    WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

CREATE POLICY "Admins can update testimonials"
    ON public.testimonials FOR UPDATE
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

CREATE POLICY "Admins can delete testimonials"
    ON public.testimonials FOR DELETE
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

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

-- Enable Row Level Security
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory
CREATE POLICY "Anyone can view inventory"
    ON public.inventory FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert inventory"
    ON public.inventory FOR INSERT
    WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

CREATE POLICY "Admins can update inventory"
    ON public.inventory FOR UPDATE
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

CREATE POLICY "Admins can delete inventory"
    ON public.inventory FOR DELETE
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

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

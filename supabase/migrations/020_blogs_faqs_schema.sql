-- ============================================
-- BLOGS & FAQs SCHEMA UPDATE
-- Run in Supabase Dashboard > SQL Editor
-- ============================================

-- ============================================
-- 1. BLOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.blogs (
    -- Primary Fields
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Content Fields
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content_markdown TEXT NOT NULL,
    cover_image_url TEXT,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- SEO Fields (Required)
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT[] DEFAULT '{}',
    canonical_url TEXT,
    
    -- Status
    is_published BOOLEAN DEFAULT false NOT NULL,
    published_at TIMESTAMPTZ,
    
    -- Reading Stats
    reading_time_minutes INTEGER DEFAULT 5
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON public.blogs(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_author ON public.blogs(author_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_blogs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_blogs_updated_at ON public.blogs;
CREATE TRIGGER trigger_blogs_updated_at
    BEFORE UPDATE ON public.blogs
    FOR EACH ROW
    EXECUTE FUNCTION update_blogs_updated_at();

-- Auto-set published_at when is_published changes to true
CREATE OR REPLACE FUNCTION set_blog_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_published = true AND OLD.is_published = false THEN
        NEW.published_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_blog_published_at ON public.blogs;
CREATE TRIGGER trigger_set_blog_published_at
    BEFORE UPDATE ON public.blogs
    FOR EACH ROW
    EXECUTE FUNCTION set_blog_published_at();

-- ============================================
-- 2. FAQs TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.faqs (
    -- Primary Fields
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Content Fields
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    
    -- Status & Ordering
    is_published BOOLEAN DEFAULT true NOT NULL,
    order_index INTEGER DEFAULT 0 NOT NULL,
    
    -- Optional Blog Relation (for blog-specific FAQs)
    blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
    
    -- Category for general FAQs (optional)
    category TEXT DEFAULT 'General'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_faqs_blog ON public.faqs(blog_id);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON public.faqs(is_published, order_index);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_faqs_updated_at ON public.faqs;
CREATE TRIGGER trigger_faqs_updated_at
    BEFORE UPDATE ON public.faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_faqs_updated_at();

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- BLOGS Policies
-- Public can read published blogs
CREATE POLICY "Public can view published blogs"
    ON public.blogs FOR SELECT
    USING (is_published = true);

-- Admins can do everything with blogs
CREATE POLICY "Admins can manage all blogs"
    ON public.blogs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.is_admin = true
        )
    );

-- FAQs Policies
-- Public can read published FAQs
CREATE POLICY "Public can view published FAQs"
    ON public.faqs FOR SELECT
    USING (is_published = true);

-- Admins can do everything with FAQs
CREATE POLICY "Admins can manage all FAQs"
    ON public.faqs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.is_admin = true
        )
    );

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get next FAQ order index
CREATE OR REPLACE FUNCTION get_next_faq_order(p_blog_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    max_order INTEGER;
BEGIN
    IF p_blog_id IS NULL THEN
        SELECT COALESCE(MAX(order_index), 0) + 1 INTO max_order
        FROM public.faqs
        WHERE blog_id IS NULL;
    ELSE
        SELECT COALESCE(MAX(order_index), 0) + 1 INTO max_order
        FROM public.faqs
        WHERE blog_id = p_blog_id;
    END IF;
    RETURN max_order;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. SAMPLE DATA (Optional - Comment out if not needed)
-- ============================================

-- Sample Blog Post
INSERT INTO public.blogs (
    title,
    slug,
    excerpt,
    content_markdown,
    cover_image_url,
    meta_title,
    meta_description,
    keywords,
    is_published,
    published_at,
    reading_time_minutes
) VALUES (
    'The Future of Luxury Home Automation in 2025',
    'future-luxury-home-automation-2025',
    'Discover how AI-driven automation is transforming ultra-luxury estates with seamless integration and intelligent control systems.',
    E'# The Future of Luxury Home Automation\n\nAs we step into 2025, the landscape of luxury home automation continues to evolve at an unprecedented pace. At Cleub Automation, we''re at the forefront of this transformation, delivering bespoke solutions that redefine what it means to live in an intelligent home.\n\n## The Rise of AI-Driven Control\n\nModern smart homes are no longer about simple automation. They''re about **anticipation**. Our systems learn your preferences, adapt to your lifestyle, and create environments that respond to your needs before you even express them.\n\n### Key Trends We''re Implementing:\n\n1. **Predictive Climate Control** - Systems that adjust based on weather forecasts and occupancy patterns\n2. **Intelligent Security Integration** - AI-powered surveillance with facial recognition\n3. **Seamless Multi-Room Audio** - Distributed audio that follows you throughout your home\n4. **Unified Control Interfaces** - Single-touch control for lighting, climate, entertainment, and security\n\n## The Cleub Difference\n\nWhat sets us apart is our commitment to **invisible technology**. The best automation is the kind you never have to think about. It simply works, enhancing your life without demanding attention.\n\n> "Effortless life, engineered beyond doubt."\n\nContact us to discover how we can transform your estate into an intelligent sanctuary.',
    '/images/blog/luxury-automation-hero.jpg',
    'Future of Luxury Home Automation 2025 | Cleub Automation',
    'Explore how AI-driven automation and intelligent control systems are revolutionizing ultra-luxury estates in 2025. Discover bespoke smart home solutions.',
    ARRAY['luxury home automation', 'smart home 2025', 'AI automation', 'intelligent home', 'Cleub Automation'],
    true,
    now(),
    8
) ON CONFLICT (slug) DO NOTHING;

-- Sample General FAQs
INSERT INTO public.faqs (question, answer, order_index, category, is_published) VALUES
(
    'What makes Cleub Automation different from other smart home providers?',
    'We specialize exclusively in ultra-luxury estates, delivering bespoke solutions with certified system architects. Our focus is on invisible technology that enhances your lifestyle without demanding attention. We integrate premium brands like KNX, Crestron, Control4, and Savant with meticulous attention to detail.',
    1,
    'General',
    true
),
(
    'How long does a typical home automation project take?',
    'Project timelines vary based on scope and complexity. A comprehensive estate automation typically takes 8-16 weeks from design to commissioning. We provide detailed timelines during the consultation phase and keep you informed throughout the process.',
    2,
    'General',
    true
),
(
    'Do you provide ongoing support after installation?',
    'Absolutely. We offer comprehensive maintenance packages and 24/7 support for all our clients. Our team is always available to assist with updates, optimizations, and any questions you may have.',
    3,
    'General',
    true
),
(
    'What areas do you serve?',
    'We currently serve clients across India (Delhi NCR, Mumbai, Bangalore, Hyderabad), UAE (Dubai, Abu Dhabi), and Singapore. For projects outside these regions, please contact us to discuss possibilities.',
    4,
    'General',
    true
),
(
    'Can you integrate with existing systems?',
    'Yes, we specialize in seamless integration. Whether you have existing lighting, security, or entertainment systems, our architects can design solutions that unify all components into a single, elegant control interface.',
    5,
    'General',
    true
)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES (Run after migration)
-- ============================================

-- Check tables created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('blogs', 'faqs');

-- Check blogs columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'blogs' ORDER BY ordinal_position;

-- Check faqs columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'faqs' ORDER BY ordinal_position;

-- Check RLS policies
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('blogs', 'faqs');

-- Create dedicated panel_presets table for storing admin-created panel configurations
-- Separate from inventory table for better data organization

CREATE TABLE IF NOT EXISTS public.panel_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Preset metadata
  name TEXT NOT NULL,
  module_size INTEGER NOT NULL CHECK (module_size IN (2, 4, 6, 8, 12)),
  total_modules_used INTEGER NOT NULL,
  is_full BOOLEAN DEFAULT FALSE,
  
  -- Components configuration (JSONB)
  -- Format: [{ type: 'on_off'|'socket'|'fan_speed'|'scene_controller'|'dimmer', quantity: number, modules_per_pair: 2, total_modules_used: number }]
  components JSONB NOT NULL DEFAULT '[]',
  
  -- Pricing & inventory link
  brand_vendor TEXT,
  price_per_unit DECIMAL(12, 2),
  linked_inventory_id UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
  
  -- Notes and metadata
  notes TEXT,
  metadata JSONB,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_panel_presets_name ON public.panel_presets(name);
CREATE INDEX IF NOT EXISTS idx_panel_presets_module_size ON public.panel_presets(module_size);
CREATE INDEX IF NOT EXISTS idx_panel_presets_brand_vendor ON public.panel_presets(brand_vendor);
CREATE INDEX IF NOT EXISTS idx_panel_presets_linked_inventory ON public.panel_presets(linked_inventory_id);

-- Comments
COMMENT ON TABLE public.panel_presets IS 'Stores admin-created panel preset configurations with component details and pricing';
COMMENT ON COLUMN public.panel_presets.name IS 'Panel configuration name in format: 6M-4S-1ST-1F (size-components)';
COMMENT ON COLUMN public.panel_presets.module_size IS 'Total module capacity (2, 4, 6, 8, or 12 modules)';
COMMENT ON COLUMN public.panel_presets.total_modules_used IS 'Sum of modules used by all components';
COMMENT ON COLUMN public.panel_presets.components IS 'Array of component configurations with quantities and module calculations';
COMMENT ON COLUMN public.panel_presets.brand_vendor IS 'Brand/vendor name for pricing differentiation';
COMMENT ON COLUMN public.panel_presets.linked_inventory_id IS 'Link to inventory table entry for integrated pricing system';
COMMENT ON COLUMN public.panel_presets.metadata IS 'Additional configuration data stored as JSON';

-- Enable RLS
ALTER TABLE public.panel_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow admins full access to panel presets (INSERT, UPDATE, DELETE, SELECT)
-- Check admin status by email (matching AuthContext.tsx logic)
DROP POLICY IF EXISTS panel_presets_admin_all ON public.panel_presets;
CREATE POLICY panel_presets_admin_all ON public.panel_presets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.email = auth.jwt() ->> 'email'
        AND admins.is_active = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.email = auth.jwt() ->> 'email'
        AND admins.is_active = TRUE
    )
  );

-- RLS Policy: Allow all authenticated users to read panel presets
DROP POLICY IF EXISTS panel_presets_user_read ON public.panel_presets;
CREATE POLICY panel_presets_user_read ON public.panel_presets
  FOR SELECT USING (auth.role() = 'authenticated');

-- Trigger for updated_at
DROP TRIGGER IF EXISTS panel_presets_updated_at_trigger ON public.panel_presets;
DROP FUNCTION IF EXISTS update_panel_presets_timestamp();

CREATE OR REPLACE FUNCTION update_panel_presets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER panel_presets_updated_at_trigger
BEFORE UPDATE ON public.panel_presets
FOR EACH ROW
EXECUTE FUNCTION update_panel_presets_timestamp();

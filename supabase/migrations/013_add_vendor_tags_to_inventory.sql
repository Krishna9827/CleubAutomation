-- Add vendor_tags column to inventory table for brand/vendor categorization
-- This allows flexible tagging of products for filtering and brand selection in BOQ

ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS vendor_tags TEXT[] DEFAULT '{}';

-- Add index for faster tag queries
CREATE INDEX IF NOT EXISTS idx_inventory_vendor_tags ON public.inventory USING GIN (vendor_tags);

-- Comment on new column
COMMENT ON COLUMN public.inventory.vendor_tags IS 'Array of vendor/brand tags for flexible categorization (e.g., [''Schneider Electric'', ''Premium''], [''Legrand'', ''Budget''])';

-- Example: Update Touch Panels with vendor tags
-- UPDATE public.inventory 
-- SET vendor_tags = array_append(vendor_tags, 'Schneider Electric')
-- WHERE category = 'Touch Panels' AND vendor = 'Schneider Electric';

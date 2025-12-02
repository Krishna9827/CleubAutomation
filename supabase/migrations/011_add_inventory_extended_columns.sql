-- Add missing columns to inventory table for product information
-- Migration: Add product_name, vendor, and protocol columns

ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS vendor TEXT,
ADD COLUMN IF NOT EXISTS protocol TEXT;

-- Add index for product_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_inventory_product_name ON public.inventory(product_name);

-- Add index for vendor for filtering
CREATE INDEX IF NOT EXISTS idx_inventory_vendor ON public.inventory(vendor);

COMMENT ON COLUMN public.inventory.product_name IS 'Full product name/title';
COMMENT ON COLUMN public.inventory.vendor IS 'Vendor or manufacturer name';
COMMENT ON COLUMN public.inventory.protocol IS 'Protocol/communication type (e.g., Zigbee, KNX, Wi-Fi)';

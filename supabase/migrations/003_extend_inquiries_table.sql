-- Extend inquiries table with additional fields for detailed inquiry capture
-- Run this in Supabase Dashboard > SQL Editor
-- This migration adds new columns to capture more detailed inquiry information

-- Add new columns to inquiries table (if they don't exist)
ALTER TABLE public.inquiries
ADD COLUMN IF NOT EXISTS property_type VARCHAR(255),
ADD COLUMN IF NOT EXISTS property_size VARCHAR(255),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS budget VARCHAR(255),
ADD COLUMN IF NOT EXISTS requirements TEXT,
ADD COLUMN IF NOT EXISTS timeline VARCHAR(255);

-- Create index on email for faster lookups (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries(email);

-- Verify all required columns exist
-- SELECT column_name FROM information_schema.columns WHERE table_name='inquiries';


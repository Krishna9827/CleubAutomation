-- Add timeline and notes columns to projects table
-- Timeline: stores project duration in months (e.g., "1", "3", "6", "12", "18", "24")
-- Notes: stores project notes and site stage references

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS timeline TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.projects.timeline IS 'Project timeline in months (1, 2, 3, 6, 12, 18, 24)';
COMMENT ON COLUMN public.projects.notes IS 'Project notes, site stage references, and additional information';

-- Create index on timeline for filtering projects by timeline
CREATE INDEX IF NOT EXISTS idx_projects_timeline ON public.projects(timeline);

-- Update timestamp trigger to maintain updated_at
-- (Note: Ensure updated_at is set on any update to projects table)

-- Fix RLS policies for projects table to allow admins to view all projects

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own projects
CREATE POLICY "Users can view own projects"
ON public.projects
FOR SELECT
USING (auth.uid() = user_id);

-- Allow admins to view all projects
CREATE POLICY "Admins can view all projects"
ON public.projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.email = auth.jwt() ->> 'email'
    AND admins.is_active = true
  )
);

-- Allow users to create projects
CREATE POLICY "Users can create projects"
ON public.projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own projects
CREATE POLICY "Users can update own projects"
ON public.projects
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own projects
CREATE POLICY "Users can delete own projects"
ON public.projects
FOR DELETE
USING (auth.uid() = user_id);

-- Allow admins to delete projects
CREATE POLICY "Admins can delete projects"
ON public.projects
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.email = auth.jwt() ->> 'email'
    AND admins.is_active = true
  )
);

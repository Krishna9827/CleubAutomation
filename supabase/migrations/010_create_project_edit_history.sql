-- Create project edit history table for version tracking and recovery
-- This table maintains a complete history of all project edits with timestamps

CREATE TABLE public.project_edit_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    edited_by_admin BOOLEAN DEFAULT false,
    admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    
    -- Full project snapshot at this point in time
    client_info JSONB NOT NULL,
    property_details JSONB NOT NULL,
    rooms JSONB[] DEFAULT ARRAY[]::JSONB[],
    total_cost NUMERIC(12, 2) DEFAULT 0,
    status TEXT CHECK (status IN ('draft', 'in-progress', 'completed')),
    
    -- Edit metadata
    change_summary TEXT, -- e.g., "Added 3 appliances to Living Room", "Updated client info"
    change_type TEXT CHECK (change_type IN ('created', 'appliance_added', 'appliance_removed', 'appliance_updated', 'client_info_updated', 'status_changed', 'room_added', 'room_removed', 'other')),
    changed_fields TEXT[], -- Array of field names that changed
    
    -- Timeline and notes
    timeline TEXT, -- 1, 2, 3, 6, 12, 18, 24 months
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Create indexes for efficient querying
CREATE INDEX idx_project_edit_history_project_id ON public.project_edit_history(project_id);
CREATE INDEX idx_project_edit_history_user_id ON public.project_edit_history(user_id);
CREATE INDEX idx_project_edit_history_admin_id ON public.project_edit_history(admin_id);
CREATE INDEX idx_project_edit_history_created_at ON public.project_edit_history(created_at);
CREATE INDEX idx_project_edit_history_change_type ON public.project_edit_history(change_type);

-- Enable RLS
ALTER TABLE public.project_edit_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can view all edit history
CREATE POLICY admin_can_view_all_history ON public.project_edit_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.id = auth.uid()
            AND admins.is_active = true
        )
    );

CREATE POLICY admin_can_insert_history ON public.project_edit_history
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.id = auth.uid()
            AND admins.is_active = true
        )
        OR user_id = auth.uid()
    );

-- Users can view history of their own projects
CREATE POLICY user_can_view_own_history ON public.project_edit_history
    FOR SELECT
    USING (user_id = auth.uid());

-- Admins can delete history (for data cleanup)
CREATE POLICY admin_can_delete_history ON public.project_edit_history
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.id = auth.uid()
            AND admins.is_active = true
        )
    );

-- Comment on table
COMMENT ON TABLE public.project_edit_history IS 'Maintains a complete audit trail and version history of all project edits for recovery and tracking purposes';

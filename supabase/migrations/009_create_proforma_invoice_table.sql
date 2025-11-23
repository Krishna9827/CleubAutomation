-- Create Proforma Invoice (PI) table for BOQ generation
-- This table stores generated BOQs and proforma invoices for projects

CREATE TABLE public.proforma_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    pi_number TEXT UNIQUE NOT NULL, -- Format: PI-YYYYMMDD-XXX
    
    -- BOQ Data (Bill of Quantities)
    boq_items JSONB[] NOT NULL DEFAULT ARRAY[]::JSONB[], -- Array of BOQ line items
    boq_summary JSONB NOT NULL DEFAULT '{}'::jsonb, -- { total_items, total_quantity, total_cost }
    
    -- Project Reference
    project_name TEXT,
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,
    
    -- BOQ Details
    automation_type TEXT CHECK (automation_type IN ('wired', 'wireless')), -- Type of automation
    total_amount NUMERIC(12, 2) DEFAULT 0,
    gst_amount NUMERIC(12, 2) DEFAULT 0,
    grand_total NUMERIC(12, 2) DEFAULT 0,
    
    -- Additional Info
    notes TEXT,
    validity_days INTEGER DEFAULT 30, -- Validity period in days
    terms_conditions TEXT, -- T&C for the quote
    
    -- Status tracking
    status TEXT CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')) DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.admins(id),
    
    -- Tracking
    view_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMPTZ
);

-- Create indexes for efficient querying
CREATE INDEX idx_proforma_invoices_project_id ON public.proforma_invoices(project_id);
CREATE INDEX idx_proforma_invoices_user_id ON public.proforma_invoices(user_id);
CREATE INDEX idx_proforma_invoices_pi_number ON public.proforma_invoices(pi_number);
CREATE INDEX idx_proforma_invoices_status ON public.proforma_invoices(status);
CREATE INDEX idx_proforma_invoices_created_at ON public.proforma_invoices(created_at);

-- Enable RLS
ALTER TABLE public.proforma_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can view and manage all PIs
CREATE POLICY admin_can_view_all_pis ON public.proforma_invoices
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.id = auth.uid()
            AND admins.is_active = true
        )
    );

CREATE POLICY admin_can_insert_pis ON public.proforma_invoices
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.id = auth.uid()
            AND admins.is_active = true
        )
    );

CREATE POLICY admin_can_update_pis ON public.proforma_invoices
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.id = auth.uid()
            AND admins.is_active = true
        )
    );

CREATE POLICY admin_can_delete_pis ON public.proforma_invoices
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE admins.id = auth.uid()
            AND admins.is_active = true
        )
    );

-- Users can view PIs for their own projects
CREATE POLICY user_can_view_own_pis ON public.proforma_invoices
    FOR SELECT
    USING (user_id = auth.uid());

-- Refresh updated_at trigger
CREATE OR REPLACE FUNCTION update_proforma_invoice_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proforma_invoice_timestamp
    BEFORE UPDATE ON public.proforma_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_proforma_invoice_timestamp();

-- Comment on table
COMMENT ON TABLE public.proforma_invoices IS 'Stores generated Bill of Quantities (BOQ) and Proforma Invoices for home automation projects';

-- ============================================================================
-- PHASE 1: J) Kundportal Light - SQL Migration
-- ============================================================================
-- Skapar tabeller för delning av offerter/ÄTA/fakturor via token
-- Multi-tenant med RLS policies
-- ============================================================================

-- Tabell för publika länkar
CREATE TABLE IF NOT EXISTS public_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('quote', 'invoice', 'ata', 'project', 'rot_application')),
    resource_id UUID NOT NULL,
    access_token TEXT NOT NULL UNIQUE, -- JWT eller random string
    password_hash TEXT, -- bcrypt hash om lösenordsskyddad
    expires_at TIMESTAMPTZ,
    max_views INTEGER,
    view_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabell för events på publika länkar (audit)
CREATE TABLE IF NOT EXISTS public_link_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_link_id UUID NOT NULL REFERENCES public_links(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('viewed', 'downloaded', 'signed', 'approved', 'rejected')),
    ip_address INET,
    user_agent TEXT,
    event_data JSONB, -- Extra metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index för performance
CREATE INDEX IF NOT EXISTS idx_public_links_tenant_id ON public_links(tenant_id);
CREATE INDEX IF NOT EXISTS idx_public_links_resource ON public_links(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_public_links_token ON public_links(access_token) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_public_links_expires ON public_links(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_public_link_events_link_id ON public_link_events(public_link_id);
CREATE INDEX IF NOT EXISTS idx_public_link_events_created ON public_link_events(created_at);

-- Unique constraint: en aktiv länk per resource
CREATE UNIQUE INDEX IF NOT EXISTS idx_public_links_unique_active 
ON public_links(tenant_id, resource_type, resource_id) 
WHERE active = true;

-- RLS Policies för public_links
ALTER TABLE public_links ENABLE ROW LEVEL SECURITY;

-- Policy: Employees kan se länkar i sin tenant
CREATE POLICY "public_links_tenant_isolation_select"
ON public_links FOR SELECT
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Employees kan skapa länkar i sin tenant
CREATE POLICY "public_links_tenant_isolation_insert"
ON public_links FOR INSERT
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Employees kan uppdatera länkar i sin tenant
CREATE POLICY "public_links_tenant_isolation_update"
ON public_links FOR UPDATE
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Employees kan ta bort länkar i sin tenant
CREATE POLICY "public_links_tenant_isolation_delete"
ON public_links FOR DELETE
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- RLS Policies för public_link_events
ALTER TABLE public_link_events ENABLE ROW LEVEL SECURITY;

-- Policy: Events är synliga via public_link (ej direkt select från employees)
-- Används via API med service role eller via public_link lookup
CREATE POLICY "public_link_events_select_via_link"
ON public_link_events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public_links pl
        WHERE pl.id = public_link_events.public_link_id
        AND pl.tenant_id IN (
            SELECT tenant_id FROM employees 
            WHERE auth_user_id = auth.uid()
        )
    )
);

-- Policy: Events kan skapas via API (service role) eller när länk används
CREATE POLICY "public_link_events_insert"
ON public_link_events FOR INSERT
WITH CHECK (true); -- Event skapas via API/trigger, inte direkt från client

-- Trigger för att uppdatera updated_at
CREATE OR REPLACE FUNCTION update_public_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_public_links_updated_at
BEFORE UPDATE ON public_links
FOR EACH ROW
EXECUTE FUNCTION update_public_links_updated_at();

-- Trigger för att öka view_count vid view-event
CREATE OR REPLACE FUNCTION increment_public_link_views()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.event_type = 'viewed' THEN
        UPDATE public_links
        SET view_count = view_count + 1
        WHERE id = NEW.public_link_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_public_link_views
AFTER INSERT ON public_link_events
FOR EACH ROW
EXECUTE FUNCTION increment_public_link_views();

-- Kommentarer för dokumentation
COMMENT ON TABLE public_links IS 'Publika länkar för delning av offerter, fakturor, ÄTA etc. med kunder';
COMMENT ON COLUMN public_links.access_token IS 'Unik token för åtkomst, kan vara JWT eller UUID';
COMMENT ON COLUMN public_links.password_hash IS 'bcrypt hash om länken är lösenordsskyddad';
COMMENT ON COLUMN public_links.max_views IS 'Max antal visningar innan länken inaktiveras (NULL = obegränsat)';

COMMENT ON TABLE public_link_events IS 'Audit log för händelser på publika länkar';
COMMENT ON COLUMN public_link_events.event_data IS 'Extra metadata som JSON (t.ex. signeringsdata, download-filnamn)';


-- ============================================================================
-- PHASE 1: D) ÄTA 2.0 - SQL Migration
-- ============================================================================
-- Utökar rot_applications med signering, kostnadsram, bilder, tidslinje
-- Multi-tenant med RLS policies
-- 
-- OBS: Denna migration förutsätter att signatures-tabellen redan finns
-- Kör PHASE1_MIGRATION_SIGNATURES_STUB.sql först!
-- ============================================================================

-- Utöka rot_applications tabell (om den inte redan har dessa kolumner)
DO $$ 
BEGIN
    -- Lägg till signature_id om den saknas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rot_applications' 
        AND column_name = 'signature_id'
    ) THEN
        -- Kontrollera att signatures-tabellen finns
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'signatures'
        ) THEN
            ALTER TABLE rot_applications 
            ADD COLUMN signature_id UUID REFERENCES signatures(id);
        ELSE
            RAISE EXCEPTION 'signatures table does not exist. Please run PHASE1_MIGRATION_SIGNATURES_STUB.sql first.';
        END IF;
    END IF;

    -- Lägg till invoice_mode om den saknas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rot_applications' 
        AND column_name = 'invoice_mode'
    ) THEN
        ALTER TABLE rot_applications 
        ADD COLUMN invoice_mode TEXT DEFAULT 'separate' 
        CHECK (invoice_mode IN ('separate', 'add_to_main'));
    END IF;

    -- Lägg till cost_frame om den saknas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rot_applications' 
        AND column_name = 'cost_frame'
    ) THEN
        ALTER TABLE rot_applications 
        ADD COLUMN cost_frame NUMERIC(10,2);
    END IF;

    -- Lägg till photos om den saknas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rot_applications' 
        AND column_name = 'photos'
    ) THEN
        ALTER TABLE rot_applications 
        ADD COLUMN photos TEXT[]; -- Array av bild-URLs
    END IF;

    -- Lägg till status_timeline om den saknas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rot_applications' 
        AND column_name = 'status_timeline'
    ) THEN
        ALTER TABLE rot_applications 
        ADD COLUMN status_timeline JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Lägg till parent_invoice_id om den saknas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rot_applications' 
        AND column_name = 'parent_invoice_id'
    ) THEN
        ALTER TABLE rot_applications 
        ADD COLUMN parent_invoice_id UUID REFERENCES invoices(id);
    END IF;
END $$;

-- Tabell för ÄTA-items (om den inte finns)
CREATE TABLE IF NOT EXISTS ata_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    rot_application_id UUID NOT NULL REFERENCES rot_applications(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index för ata_items
CREATE INDEX IF NOT EXISTS idx_ata_items_tenant_id ON ata_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ata_items_rot_application_id ON ata_items(rot_application_id);
CREATE INDEX IF NOT EXISTS idx_ata_items_sort_order ON ata_items(rot_application_id, sort_order);

-- Index för rot_applications (för nya kolumner)
CREATE INDEX IF NOT EXISTS idx_rot_applications_signature_id 
ON rot_applications(signature_id) WHERE signature_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rot_applications_parent_invoice_id 
ON rot_applications(parent_invoice_id) WHERE parent_invoice_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rot_applications_invoice_mode 
ON rot_applications(invoice_mode);

-- RLS Policies för ata_items
ALTER TABLE ata_items ENABLE ROW LEVEL SECURITY;

-- Policy: Employees kan se ata_items i sin tenant
CREATE POLICY "ata_items_tenant_isolation_select"
ON ata_items FOR SELECT
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Employees kan skapa ata_items i sin tenant
CREATE POLICY "ata_items_tenant_isolation_insert"
ON ata_items FOR INSERT
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
    AND rot_application_id IN (
        SELECT id FROM rot_applications 
        WHERE tenant_id = ata_items.tenant_id
    )
);

-- Policy: Employees kan uppdatera ata_items i sin tenant
CREATE POLICY "ata_items_tenant_isolation_update"
ON ata_items FOR UPDATE
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Employees kan ta bort ata_items i sin tenant
CREATE POLICY "ata_items_tenant_isolation_delete"
ON ata_items FOR DELETE
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- Funktion för att uppdatera status_timeline i rot_applications
CREATE OR REPLACE FUNCTION update_ata_status_timeline(
    p_rot_application_id UUID,
    p_status TEXT,
    p_user_id UUID DEFAULT NULL,
    p_comment TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_tenant_id UUID;
    v_timeline_entry JSONB;
BEGIN
    -- Hämta tenant_id från rot_application
    SELECT tenant_id INTO v_tenant_id
    FROM rot_applications
    WHERE id = p_rot_application_id;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Rot application not found: %', p_rot_application_id;
    END IF;

    -- Skapa timeline entry
    v_timeline_entry := jsonb_build_object(
        'status', p_status,
        'timestamp', NOW(),
        'user_id', p_user_id,
        'comment', p_comment
    );

    -- Lägg till i timeline array
    UPDATE rot_applications
    SET status_timeline = status_timeline || v_timeline_entry::jsonb
    WHERE id = p_rot_application_id;

    -- Logga audit event
    PERFORM append_audit_event(
        v_tenant_id,
        'rot_applications',
        p_rot_application_id,
        'update',
        p_user_id,
        NULL,
        NULL,
        jsonb_build_object('status', p_status, 'comment', p_comment),
        ARRAY['status_timeline'],
        NULL,
        NULL,
        jsonb_build_object('timeline_update', true)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger för att uppdatera updated_at på ata_items
CREATE OR REPLACE FUNCTION update_ata_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ata_items_updated_at
BEFORE UPDATE ON ata_items
FOR EACH ROW
EXECUTE FUNCTION update_ata_items_updated_at();

-- Kommentarer för dokumentation
COMMENT ON COLUMN rot_applications.signature_id IS 'FK till signatures-tabellen om ÄTA är signerad';
COMMENT ON COLUMN rot_applications.invoice_mode IS 'Om ÄTA ska faktureras separat eller läggas till i huvudfaktura';
COMMENT ON COLUMN rot_applications.cost_frame IS 'Kostnadsram för ÄTA';
COMMENT ON COLUMN rot_applications.photos IS 'Array av bild-URLs (Supabase Storage)';
COMMENT ON COLUMN rot_applications.status_timeline IS 'JSONB array med statusändringar: [{status, timestamp, user_id, comment}]';
COMMENT ON COLUMN rot_applications.parent_invoice_id IS 'FK till huvudfaktura om invoice_mode = add_to_main';

COMMENT ON TABLE ata_items IS 'Radartiklar för ÄTA (beskrivning, kvantitet, pris)';
COMMENT ON FUNCTION update_ata_status_timeline IS 'Uppdaterar status_timeline i rot_applications och loggar audit event';


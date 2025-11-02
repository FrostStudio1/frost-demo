-- ============================================================================
-- PHASE 1: Signatures Stub (för BankID och ÄTA-signering)
-- ============================================================================
-- Skapar signatures-tabellen som stub för framtida BankID-integration
-- Multi-tenant med RLS policies
-- ============================================================================

-- Tabell för signatures (stub - kommer utökas i Fas 2 med BankID)
CREATE TABLE IF NOT EXISTS signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('quote', 'ata', 'work_order', 'time_entry', 'invoice')),
    document_id UUID NOT NULL, -- FK till respektive tabell (polymorphic)
    signer_role TEXT NOT NULL CHECK (signer_role IN ('customer', 'employee', 'admin')),
    signer_user_id UUID, -- FK till auth.users om intern
    signer_email TEXT, -- För externa signatärer
    signature_method TEXT NOT NULL DEFAULT 'email' CHECK (signature_method IN ('bankid', 'email', 'manual')),
    signature_hash TEXT, -- SHA-256 hash av dokumentet vid signering
    signed_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'rejected', 'expired')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabell för signature events (audit log)
CREATE TABLE IF NOT EXISTS signature_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signature_id UUID NOT NULL REFERENCES signatures(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'viewed', 'signed', 'rejected', 'expired')),
    event_data JSONB, -- Extra metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index för performance
CREATE INDEX IF NOT EXISTS idx_signatures_tenant_id ON signatures(tenant_id);
CREATE INDEX IF NOT EXISTS idx_signatures_document ON signatures(document_type, document_id);
CREATE INDEX IF NOT EXISTS idx_signatures_status ON signatures(status);
CREATE INDEX IF NOT EXISTS idx_signatures_expires ON signatures(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_signature_events_signature_id ON signature_events(signature_id);
CREATE INDEX IF NOT EXISTS idx_signature_events_created ON signature_events(created_at);

-- RLS Policies för signatures
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- Policy: Employees kan se signatures i sin tenant
CREATE POLICY "signatures_tenant_isolation_select"
ON signatures FOR SELECT
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Employees kan skapa signatures i sin tenant
CREATE POLICY "signatures_tenant_isolation_insert"
ON signatures FOR INSERT
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Employees kan uppdatera signatures i sin tenant
CREATE POLICY "signatures_tenant_isolation_update"
ON signatures FOR UPDATE
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- RLS Policies för signature_events
ALTER TABLE signature_events ENABLE ROW LEVEL SECURITY;

-- Policy: Events är synliga via signature (ej direkt select från employees)
CREATE POLICY "signature_events_select_via_signature"
ON signature_events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM signatures s
        WHERE s.id = signature_events.signature_id
        AND s.tenant_id IN (
            SELECT tenant_id FROM employees 
            WHERE auth_user_id = auth.uid()
        )
    )
);

-- Policy: Events kan skapas via API (service role) eller när signering sker
CREATE POLICY "signature_events_insert"
ON signature_events FOR INSERT
WITH CHECK (true); -- Event skapas via API/trigger, inte direkt från client

-- Trigger för att uppdatera updated_at
CREATE OR REPLACE FUNCTION update_signatures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_signatures_updated_at
BEFORE UPDATE ON signatures
FOR EACH ROW
EXECUTE FUNCTION update_signatures_updated_at();

-- Kommentarer för dokumentation
COMMENT ON TABLE signatures IS 'Signeringsspår för dokument (stub för BankID-integration i Fas 2)';
COMMENT ON COLUMN signatures.document_type IS 'Typ av dokument som signeras';
COMMENT ON COLUMN signatures.document_id IS 'ID på dokumentet (polymorphic FK)';
COMMENT ON COLUMN signatures.signature_method IS 'Metod för signering (bankid/email/manual)';
COMMENT ON COLUMN signatures.signature_hash IS 'SHA-256 hash av dokumentet vid signering (juridiskt bevismaterial)';

COMMENT ON TABLE signature_events IS 'Audit log för signeringshändelser';


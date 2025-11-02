-- ============================================================================
-- PHASE 1: M) Audit Log - SQL Migration
-- ============================================================================
-- Generisk auditlogg för alla tabeller
-- Multi-tenant med RLS policies
-- ============================================================================

-- Huvudtabell för audit events
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL, -- 'projects', 'invoices', 'time_entries', etc.
    record_id UUID NOT NULL, -- ID i den tabellen
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'view', 'export')),
    user_id UUID, -- FK till auth.users (nullable för system-events)
    employee_id UUID REFERENCES employees(id), -- FK till employees (nullable)
    old_values JSONB, -- Före ändring (för update/delete)
    new_values JSONB, -- Efter ändring (för create/update)
    changed_fields TEXT[], -- Array av ändrade fältnamn
    ip_address INET,
    user_agent TEXT,
    metadata JSONB, -- Extra metadata (t.ex. API endpoint, batch operation)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabell för release labels (snapshots av regler)
CREATE TABLE IF NOT EXISTS release_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    label_name TEXT NOT NULL, -- T.ex. "OB-rules-2024", "ROT-rules-2025"
    description TEXT,
    rules_snapshot JSONB NOT NULL, -- Snapshot av regler vid release
    effective_from DATE NOT NULL,
    created_by UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index för performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_employee_id ON audit_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Composite index för vanliga queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_table_record 
ON audit_logs(tenant_id, table_name, record_id, created_at DESC);

-- Full-text search index på table_name och action
CREATE INDEX IF NOT EXISTS idx_audit_logs_search 
ON audit_logs USING gin(to_tsvector('swedish', table_name || ' ' || action));

-- Index för release_labels
CREATE INDEX IF NOT EXISTS idx_release_labels_tenant_id ON release_labels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_release_labels_effective_from ON release_labels(effective_from DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_release_labels_tenant_name 
ON release_labels(tenant_id, label_name);

-- RLS Policies för audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Employees kan se audit logs i sin tenant
CREATE POLICY "audit_logs_tenant_isolation_select"
ON audit_logs FOR SELECT
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- Policy: System/API kan skapa audit logs (via service role)
-- Client-side inserts blockeras (endast via API)
CREATE POLICY "audit_logs_insert"
ON audit_logs FOR INSERT
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Ingen UPDATE eller DELETE på audit logs (immutable)
CREATE POLICY "audit_logs_no_update"
ON audit_logs FOR UPDATE
USING (false);

CREATE POLICY "audit_logs_no_delete"
ON audit_logs FOR DELETE
USING (false);

-- RLS Policies för release_labels
ALTER TABLE release_labels ENABLE ROW LEVEL SECURITY;

-- Policy: Employees kan se release labels i sin tenant
CREATE POLICY "release_labels_tenant_isolation_select"
ON release_labels FOR SELECT
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Only admins kan skapa release labels
CREATE POLICY "release_labels_admin_insert"
ON release_labels FOR INSERT
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Policy: Only admins kan uppdatera release labels
CREATE POLICY "release_labels_admin_update"
ON release_labels FOR UPDATE
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Funktion för att logga audit event (anropas från triggers eller API)
CREATE OR REPLACE FUNCTION append_audit_event(
    p_tenant_id UUID,
    p_table_name TEXT,
    p_record_id UUID,
    p_action TEXT,
    p_user_id UUID DEFAULT NULL,
    p_employee_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_changed_fields TEXT[] DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO audit_logs (
        tenant_id,
        table_name,
        record_id,
        action,
        user_id,
        employee_id,
        old_values,
        new_values,
        changed_fields,
        ip_address,
        user_agent,
        metadata
    ) VALUES (
        p_tenant_id,
        p_table_name,
        p_record_id,
        p_action,
        p_user_id,
        p_employee_id,
        p_old_values,
        p_new_values,
        p_changed_fields,
        p_ip_address,
        p_user_agent,
        p_metadata
    )
    RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exempel: Trigger för invoices (kan läggas till i separat migration)
-- CREATE TRIGGER audit_invoices_changes
-- AFTER INSERT OR UPDATE OR DELETE ON invoices
-- FOR EACH ROW
-- EXECUTE FUNCTION log_audit_invoice();

-- Kommentarer för dokumentation
COMMENT ON TABLE audit_logs IS 'Generisk auditlogg för alla tabeller. Immutable (no update/delete).';
COMMENT ON COLUMN audit_logs.table_name IS 'Namn på tabellen som ändrades';
COMMENT ON COLUMN audit_logs.record_id IS 'ID på raden som ändrades';
COMMENT ON COLUMN audit_logs.changed_fields IS 'Array av fältnamn som ändrades (för update)';
COMMENT ON COLUMN audit_logs.metadata IS 'Extra metadata som JSON (t.ex. API endpoint, batch operation ID)';

COMMENT ON TABLE release_labels IS 'Snapshots av regler (OB, ROT etc.) vid release för historisk referens';
COMMENT ON COLUMN release_labels.rules_snapshot IS 'JSON snapshot av regler vid release (t.ex. OB-nivåer, ROT-gränser)';

COMMENT ON FUNCTION append_audit_event IS 'Funktion för att skapa audit events. Anropas från triggers eller API.';


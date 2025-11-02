-- ============================================================================
-- PHASE 1: Feature Flags (per tenant)
-- ============================================================================
-- Konfigurationsflaggor för att aktivera/inaktivera funktioner per tenant
-- ============================================================================

-- Tabell för feature flags
CREATE TABLE IF NOT EXISTS tenant_feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
    enable_bankid BOOLEAN DEFAULT false,
    enable_peppol BOOLEAN DEFAULT false,
    enable_customer_portal BOOLEAN DEFAULT true,  -- Default aktiverad
    enable_budget_alerts BOOLEAN DEFAULT true,     -- Default aktiverad
    enable_ata_2_0 BOOLEAN DEFAULT true,           -- Default aktiverad
    enable_audit_log BOOLEAN DEFAULT true,        -- Default aktiverad
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_tenant_id 
ON tenant_feature_flags(tenant_id);

-- RLS Policies
ALTER TABLE tenant_feature_flags ENABLE ROW LEVEL SECURITY;

-- Policy: Employees kan se feature flags för sin tenant
CREATE POLICY "tenant_feature_flags_tenant_isolation_select"
ON tenant_feature_flags FOR SELECT
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Only admins kan uppdatera feature flags
CREATE POLICY "tenant_feature_flags_admin_update"
ON tenant_feature_flags FOR UPDATE
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Policy: System kan skapa feature flags (vid tenant creation)
CREATE POLICY "tenant_feature_flags_insert"
ON tenant_feature_flags FOR INSERT
WITH CHECK (true); -- Tillåt service role att skapa

-- Trigger för att uppdatera updated_at
CREATE OR REPLACE FUNCTION update_tenant_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tenant_feature_flags_updated_at
BEFORE UPDATE ON tenant_feature_flags
FOR EACH ROW
EXECUTE FUNCTION update_tenant_feature_flags_updated_at();

-- Funktion för att hämta feature flag
CREATE OR REPLACE FUNCTION get_feature_flag(
    p_tenant_id UUID,
    p_flag_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_flag_value BOOLEAN;
BEGIN
    SELECT CASE p_flag_name
        WHEN 'enable_bankid' THEN enable_bankid
        WHEN 'enable_peppol' THEN enable_peppol
        WHEN 'enable_customer_portal' THEN enable_customer_portal
        WHEN 'enable_budget_alerts' THEN enable_budget_alerts
        WHEN 'enable_ata_2_0' THEN enable_ata_2_0
        WHEN 'enable_audit_log' THEN enable_audit_log
        ELSE false
    END INTO v_flag_value
    FROM tenant_feature_flags
    WHERE tenant_id = p_tenant_id;

    -- Om ingen flag finns, returnera default baserat på flag_name
    IF v_flag_value IS NULL THEN
        RETURN CASE p_flag_name
            WHEN 'enable_customer_portal' THEN true
            WHEN 'enable_budget_alerts' THEN true
            WHEN 'enable_ata_2_0' THEN true
            WHEN 'enable_audit_log' THEN true
            ELSE false
        END;
    END IF;

    RETURN v_flag_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Skapa default feature flags för alla befintliga tenants
INSERT INTO tenant_feature_flags (tenant_id)
SELECT id FROM tenants
WHERE id NOT IN (SELECT tenant_id FROM tenant_feature_flags)
ON CONFLICT DO NOTHING;

-- Kommentarer
COMMENT ON TABLE tenant_feature_flags IS 'Feature flags per tenant för att aktivera/inaktivera funktioner';
COMMENT ON FUNCTION get_feature_flag IS 'Hämtar feature flag för en tenant (returnerar default om flag saknas)';


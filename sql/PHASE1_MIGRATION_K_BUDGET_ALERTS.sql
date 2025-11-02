-- ============================================================================
-- PHASE 1: K) Budget & Larm - SQL Migration
-- ============================================================================
-- Budgetramar per projekt + tröskel-larm
-- Multi-tenant med RLS policies
-- ============================================================================

-- Tabell för projektbudgetar
CREATE TABLE IF NOT EXISTS project_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    budget_hours NUMERIC(10,2) DEFAULT 0,
    budget_material NUMERIC(10,2) DEFAULT 0,
    budget_total NUMERIC(10,2) GENERATED ALWAYS AS (budget_hours + budget_material) STORED,
    alert_thresholds JSONB DEFAULT '[{"percentage": 70, "notify": true}, {"percentage": 90, "notify": true}]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabell för budget-alerts
CREATE TABLE IF NOT EXISTS budget_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    budget_id UUID NOT NULL REFERENCES project_budgets(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('hours', 'material', 'total')),
    threshold_percentage NUMERIC(5,2) NOT NULL, -- T.ex. 70.00, 90.00
    current_percentage NUMERIC(5,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
    acknowledged_by UUID REFERENCES employees(id),
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index för performance
CREATE INDEX IF NOT EXISTS idx_project_budgets_tenant_id ON project_budgets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_budgets_project_id ON project_budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_tenant_id ON budget_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_project_id ON budget_alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_status ON budget_alerts(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_budget_alerts_created_at ON budget_alerts(created_at DESC);

-- Composite index för vanliga queries
CREATE INDEX IF NOT EXISTS idx_budget_alerts_tenant_status 
ON budget_alerts(tenant_id, status, created_at DESC) WHERE status = 'active';

-- RLS Policies för project_budgets
ALTER TABLE project_budgets ENABLE ROW LEVEL SECURITY;

-- Policy: Employees kan se budgets i sin tenant
CREATE POLICY "project_budgets_tenant_isolation_select"
ON project_budgets FOR SELECT
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- Policy: Only admins kan skapa/uppdatera budgets
CREATE POLICY "project_budgets_admin_insert"
ON project_budgets FOR INSERT
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
        AND role = 'admin'
    )
    AND project_id IN (
        SELECT id FROM projects 
        WHERE tenant_id = project_budgets.tenant_id
    )
);

CREATE POLICY "project_budgets_admin_update"
ON project_budgets FOR UPDATE
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "project_budgets_admin_delete"
ON project_budgets FOR DELETE
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
        AND role = 'admin'
    )
);

-- RLS Policies för budget_alerts
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Employees kan se alerts i sin tenant
CREATE POLICY "budget_alerts_tenant_isolation_select"
ON budget_alerts FOR SELECT
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- Policy: System/API kan skapa alerts (via service role)
CREATE POLICY "budget_alerts_insert"
ON budget_alerts FOR INSERT
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
        OR auth.uid() IS NULL -- Tillåt service role
    )
);

-- Policy: Employees kan uppdatera alerts (acknowledge/resolve)
CREATE POLICY "budget_alerts_update"
ON budget_alerts FOR UPDATE
USING (
    tenant_id IN (
        SELECT tenant_id FROM employees 
        WHERE auth_user_id = auth.uid()
    )
);

-- Funktion för att beräkna budget usage
CREATE OR REPLACE FUNCTION get_budget_usage(
    p_project_id UUID
)
RETURNS TABLE (
    budget_hours NUMERIC,
    budget_material NUMERIC,
    budget_total NUMERIC,
    used_hours NUMERIC,
    used_material NUMERIC,
    used_total NUMERIC,
    hours_percentage NUMERIC,
    material_percentage NUMERIC,
    total_percentage NUMERIC
) AS $$
DECLARE
    v_budget project_budgets%ROWTYPE;
    v_used_hours NUMERIC := 0;
    v_used_material NUMERIC := 0;
BEGIN
    -- Hämta budget
    SELECT * INTO v_budget
    FROM project_budgets
    WHERE project_id = p_project_id;

    IF v_budget.id IS NULL THEN
        -- Ingen budget satt, returnera 0
        RETURN QUERY SELECT 
            0::NUMERIC, 0::NUMERIC, 0::NUMERIC,
            0::NUMERIC, 0::NUMERIC, 0::NUMERIC,
            0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    -- Beräkna använda timmar (summa av time_entries)
    SELECT COALESCE(SUM(hours_total), 0) INTO v_used_hours
    FROM time_entries
    WHERE project_id = p_project_id
    AND is_billed = false; -- Endast obetalda timmar

    -- Beräkna användt material (summa av material_entries)
    -- Notera: material_entries kan saknas, använd 0 som fallback
    SELECT COALESCE(SUM(total_amount), 0) INTO v_used_material
    FROM material_entries
    WHERE project_id = p_project_id;

    -- Returnera resultat
    RETURN QUERY SELECT
        v_budget.budget_hours,
        v_budget.budget_material,
        v_budget.budget_total,
        v_used_hours,
        v_used_material,
        v_used_hours + v_used_material AS used_total,
        CASE 
            WHEN v_budget.budget_hours > 0 
            THEN (v_used_hours / v_budget.budget_hours * 100)
            ELSE 0 
        END AS hours_percentage,
        CASE 
            WHEN v_budget.budget_material > 0 
            THEN (v_used_material / v_budget.budget_material * 100)
            ELSE 0 
        END AS material_percentage,
        CASE 
            WHEN v_budget.budget_total > 0 
            THEN ((v_used_hours + v_used_material) / v_budget.budget_total * 100)
            ELSE 0 
        END AS total_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion för att skapa budget alert
CREATE OR REPLACE FUNCTION create_budget_alert(
    p_project_id UUID,
    p_alert_type TEXT,
    p_threshold_percentage NUMERIC,
    p_current_percentage NUMERIC
)
RETURNS UUID AS $$
DECLARE
    v_tenant_id UUID;
    v_budget_id UUID;
    v_alert_id UUID;
BEGIN
    -- Hämta tenant_id och budget_id
    SELECT pb.tenant_id, pb.id INTO v_tenant_id, v_budget_id
    FROM project_budgets pb
    WHERE pb.project_id = p_project_id;

    IF v_budget_id IS NULL THEN
        RAISE EXCEPTION 'No budget found for project: %', p_project_id;
    END IF;

    -- Kontrollera om alert redan finns för denna threshold
    SELECT id INTO v_alert_id
    FROM budget_alerts
    WHERE project_id = p_project_id
    AND alert_type = p_alert_type
    AND threshold_percentage = p_threshold_percentage
    AND status = 'active';

    IF v_alert_id IS NOT NULL THEN
        -- Uppdatera befintlig alert
        UPDATE budget_alerts
        SET current_percentage = p_current_percentage,
            created_at = NOW()
        WHERE id = v_alert_id;
        RETURN v_alert_id;
    END IF;

    -- Skapa ny alert
    INSERT INTO budget_alerts (
        tenant_id,
        project_id,
        budget_id,
        alert_type,
        threshold_percentage,
        current_percentage,
        status
    ) VALUES (
        v_tenant_id,
        p_project_id,
        v_budget_id,
        p_alert_type,
        p_threshold_percentage,
        p_current_percentage,
        'active'
    )
    RETURNING id INTO v_alert_id;

    RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger för att uppdatera updated_at
CREATE OR REPLACE FUNCTION update_project_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_budgets_updated_at
BEFORE UPDATE ON project_budgets
FOR EACH ROW
EXECUTE FUNCTION update_project_budgets_updated_at();

-- Kommentarer för dokumentation
COMMENT ON TABLE project_budgets IS 'Budgetramar per projekt (timmar + material)';
COMMENT ON COLUMN project_budgets.alert_thresholds IS 'JSONB array med trösklar: [{"percentage": 70, "notify": true}]';
COMMENT ON COLUMN project_budgets.budget_total IS 'Generated column: budget_hours + budget_material';

COMMENT ON TABLE budget_alerts IS 'Aktiva budget-larm när trösklar passerats';
COMMENT ON COLUMN budget_alerts.alert_type IS 'Typ av larm: hours, material, eller total';
COMMENT ON COLUMN budget_alerts.status IS 'active = nytt larm, acknowledged = sett, resolved = åtgärdat';

COMMENT ON FUNCTION get_budget_usage IS 'Beräknar budget usage för ett projekt (timmar + material)';
COMMENT ON FUNCTION create_budget_alert IS 'Skapar budget alert om threshold passerats';


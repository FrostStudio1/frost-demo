-- ============================================================================
-- KRITISK SÄKERHETSFIX - Uppdatera Employee Tenant ID
-- ============================================================================
-- Employee 47224e0b-5809-4894-8696-49dd2b5f71f0 har tenant_id som INTE finns
-- ============================================================================

-- STEG 1: Hitta vilken tenant employee faktiskt tillhör
-- Kolla time_entries för att se vilken tenant employee faktiskt använder
SELECT DISTINCT 
    te.tenant_id,
    COUNT(*) as entry_count,
    MIN(te.created_at) as first_entry,
    MAX(te.created_at) as last_entry
FROM time_entries te
WHERE te.employee_id = '47224e0b-5809-4894-8696-49dd2b5f71f0'
GROUP BY te.tenant_id
ORDER BY entry_count DESC;

-- STEG 2: Kolla projects för att se vilken tenant employee's projekt tillhör
SELECT DISTINCT 
    p.tenant_id,
    COUNT(*) as project_count
FROM projects p
INNER JOIN time_entries te ON te.project_id = p.id
WHERE te.employee_id = '47224e0b-5809-4894-8696-49dd2b5f71f0'
GROUP BY p.tenant_id
ORDER BY project_count DESC;

-- STEG 3: Hitta den mest använda tenant_id (från time_entries eller projects)
-- Kör denna för att få den korrekta tenant_id:
WITH tenant_usage AS (
    SELECT te.tenant_id, COUNT(*) as usage_count
    FROM time_entries te
    WHERE te.employee_id = '47224e0b-5809-4894-8696-49dd2b5f71f0'
      AND EXISTS (SELECT 1 FROM tenants t WHERE t.id = te.tenant_id)
    GROUP BY te.tenant_id
    
    UNION ALL
    
    SELECT p.tenant_id, COUNT(*) as usage_count
    FROM projects p
    INNER JOIN time_entries te ON te.project_id = p.id
    WHERE te.employee_id = '47224e0b-5809-4894-8696-49dd2b5f71f0'
      AND EXISTS (SELECT 1 FROM tenants t WHERE t.id = p.tenant_id)
    GROUP BY p.tenant_id
)
SELECT tenant_id, SUM(usage_count) as total_usage
FROM tenant_usage
GROUP BY tenant_id
ORDER BY total_usage DESC
LIMIT 1;

-- STEG 4: Om ovanstående returnerar en tenant_id, kör denna:
-- (Ersätt '<CORRECT_TENANT_ID>' med tenant_id från query ovan)

-- Uppdatera employee record
-- UPDATE employees
-- SET tenant_id = '<CORRECT_TENANT_ID>'
-- WHERE id = '47224e0b-5809-4894-8696-49dd2b5f71f0'
--   AND auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567';

-- Uppdatera JWT metadata
-- UPDATE auth.users 
-- SET raw_app_meta_data = jsonb_set(
--   COALESCE(raw_app_meta_data, '{}'::jsonb),
--   '{tenant_id}',
--   '"<CORRECT_TENANT_ID>"'
-- )
-- WHERE id = '2941e8db-d533-412e-a292-7ff713e76567';

-- STEG 5: Verifiera fixen
SELECT 
    e.id,
    e.full_name,
    e.tenant_id,
    e.auth_user_id,
    (SELECT COUNT(*) FROM time_entries WHERE employee_id = e.id) as time_entry_count,
    (SELECT COUNT(*) FROM projects WHERE tenant_id = e.tenant_id) as project_count,
    (SELECT COUNT(*) FROM tenants WHERE id = e.tenant_id) as tenant_exists
FROM employees e
WHERE e.id = '47224e0b-5809-4894-8696-49dd2b5f71f0';

-- tenant_exists ska vara 1 (tenant existerar)
-- ============================================================================


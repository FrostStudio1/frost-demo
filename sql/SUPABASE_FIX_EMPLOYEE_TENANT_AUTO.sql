-- ============================================
-- FIX: Update employee record to correct tenant
-- ============================================
-- Your employee record has tenant_id that doesn't exist
-- This will find the correct tenant and update your employee record

-- Step 1: Find which tenant has the most projects (your PRIMARY tenant after fix)
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    COUNT(p.id) as project_count,
    COUNT(te.id) as time_entry_count,
    (COUNT(p.id) + COUNT(te.id)) as total_activity
FROM tenants t
LEFT JOIN projects p ON p.tenant_id = t.id
LEFT JOIN time_entries te ON te.tenant_id = t.id
GROUP BY t.id, t.name
ORDER BY total_activity DESC;

-- Step 2: Check which tenant your time entries belong to
SELECT 
    te.tenant_id,
    t.name as tenant_name,
    COUNT(*) as entry_count
FROM time_entries te
JOIN employees e ON e.id = te.employee_id
LEFT JOIN tenants t ON t.id = te.tenant_id
WHERE e.auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
  AND EXISTS (SELECT 1 FROM tenants WHERE id = te.tenant_id)
GROUP BY te.tenant_id, t.name
ORDER BY entry_count DESC;

-- Step 3: AUTO-FIX - Update employee record to correct tenant
-- This will find the tenant with most projects/time entries and update your employee record
DO $$
DECLARE
    v_correct_tenant_id UUID;
    v_employee_id UUID := '47224e0b-5809-4894-8696-49dd2b5f71f0';
BEGIN
    -- Find tenant with most activity (projects + time entries)
    WITH tenant_activity AS (
        SELECT 
            t.id,
            COUNT(p.id) + COUNT(te.id) as total_activity
        FROM tenants t
        LEFT JOIN projects p ON p.tenant_id = t.id
        LEFT JOIN time_entries te ON te.tenant_id = t.id
        GROUP BY t.id
    )
    SELECT id INTO v_correct_tenant_id
    FROM tenant_activity
    ORDER BY total_activity DESC
    LIMIT 1;

    -- If no tenant found from activity, try to find from time entries
    IF v_correct_tenant_id IS NULL THEN
        SELECT DISTINCT te.tenant_id INTO v_correct_tenant_id
        FROM time_entries te
        JOIN employees e ON e.id = te.employee_id
        WHERE e.auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
          AND EXISTS (SELECT 1 FROM tenants WHERE id = te.tenant_id)
        LIMIT 1;
    END IF;

    -- If still no tenant, use first available tenant
    IF v_correct_tenant_id IS NULL THEN
        SELECT id INTO v_correct_tenant_id
        FROM tenants
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;

    -- Update employee record
    IF v_correct_tenant_id IS NOT NULL THEN
        UPDATE employees 
        SET tenant_id = v_correct_tenant_id,
            updated_at = NOW()
        WHERE id = v_employee_id
        AND auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567';

        RAISE NOTICE '✅ Updated employee record to tenant: %', v_correct_tenant_id;
    ELSE
        RAISE WARNING '⚠️ Could not find correct tenant to update employee record';
    END IF;
END $$;

-- Step 4: Verify fix
SELECT 
    e.id,
    e.full_name,
    e.tenant_id,
    t.name as tenant_name,
    e.role,
    CASE 
        WHEN e.tenant_id IS NULL THEN '❌ NULL tenant_id'
        WHEN NOT EXISTS (SELECT 1 FROM tenants WHERE id = e.tenant_id) THEN '❌ Invalid tenant_id'
        ELSE '✅ Valid tenant_id'
    END as tenant_status,
    (SELECT COUNT(*) FROM projects WHERE tenant_id = e.tenant_id) as project_count,
    (SELECT COUNT(*) FROM time_entries WHERE employee_id = e.id) as time_entry_count
FROM employees e
LEFT JOIN tenants t ON e.tenant_id = t.id
WHERE e.auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
ORDER BY e.created_at DESC;

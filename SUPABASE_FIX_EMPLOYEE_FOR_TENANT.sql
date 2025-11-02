-- ============================================
-- FIX: Create employee record for correct tenant
-- ============================================
-- After fixing orphaned projects, you need an employee record for the PRIMARY tenant

-- Step 1: Find which tenant has the most projects (your PRIMARY tenant after fix)
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    COUNT(p.id) as project_count,
    COUNT(te.id) as time_entry_count
FROM tenants t
LEFT JOIN projects p ON p.tenant_id = t.id
LEFT JOIN time_entries te ON te.tenant_id = t.id
GROUP BY t.id, t.name
ORDER BY (COUNT(p.id) + COUNT(te.id)) DESC
LIMIT 1;

-- Step 2: Check if you have an employee record for this tenant
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
    END as tenant_status
FROM employees e
LEFT JOIN tenants t ON e.tenant_id = t.id
WHERE e.auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
ORDER BY e.created_at DESC;

-- Step 3: Create or update employee record for PRIMARY tenant
-- Replace 'PRIMARY_TENANT_ID' with the tenant_id from Step 1
-- Replace 'YOUR_NAME' and 'YOUR_EMAIL' with your actual name and email

-- Option A: Create new employee record if none exists for this tenant
/*
INSERT INTO employees (
    auth_user_id,
    tenant_id,
    full_name,
    email,
    role,
    created_at,
    updated_at
)
VALUES (
    '2941e8db-d533-412e-a292-7ff713e76567',
    'PRIMARY_TENANT_ID',  -- Replace with tenant_id from Step 1
    'YOUR_NAME',          -- Replace with your name
    'vilmer.frost@gmail.com',
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;
*/

-- Option B: Update existing employee record to point to PRIMARY tenant
-- Replace 'PRIMARY_TENANT_ID' with tenant_id from Step 1
-- Replace 'EXISTING_EMPLOYEE_ID' with the id from Step 2 (the employee you want to update)
/*
UPDATE employees 
SET tenant_id = 'PRIMARY_TENANT_ID',
    updated_at = NOW()
WHERE id = 'EXISTING_EMPLOYEE_ID'
AND auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567';
*/

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
    (SELECT COUNT(*) FROM projects WHERE tenant_id = e.tenant_id) as project_count
FROM employees e
LEFT JOIN tenants t ON e.tenant_id = t.id
WHERE e.auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
ORDER BY e.created_at DESC;

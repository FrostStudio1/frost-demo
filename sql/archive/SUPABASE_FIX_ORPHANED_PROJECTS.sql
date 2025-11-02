-- ============================================
-- FIX SQL: Fix orphaned projects and tenant isolation
-- ============================================
-- This will fix projects that have tenant_id that doesn't exist

-- Step 1: Check which tenants exist
SELECT id, name FROM tenants ORDER BY created_at DESC;

-- Step 2: Check which tenant_id you SHOULD belong to (based on employee records)
SELECT 
    e.id as employee_id,
    e.full_name,
    e.tenant_id,
    t.name as tenant_name,
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

-- Step 3: Identify your PRIMARY tenant (the one you should use)
-- This will be the tenant that has the most projects/time entries for your employees
WITH user_employees AS (
    SELECT DISTINCT e.tenant_id
    FROM employees e
    WHERE e.auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
      AND EXISTS (SELECT 1 FROM tenants WHERE id = e.tenant_id)
),
tenant_activity AS (
    SELECT 
        t.id,
        t.name,
        (SELECT COUNT(*) FROM projects WHERE tenant_id = t.id) as project_count,
        (SELECT COUNT(*) FROM time_entries te 
         JOIN employees e ON e.id = te.employee_id 
         WHERE e.auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567' 
         AND te.tenant_id = t.id) as time_entry_count
    FROM tenants t
    WHERE t.id IN (SELECT tenant_id FROM user_employees)
)
SELECT 
    id,
    name,
    project_count,
    time_entry_count,
    (project_count + time_entry_count) as total_activity
FROM tenant_activity
ORDER BY total_activity DESC
LIMIT 1;

-- Step 4: FIX ORPHANED PROJECTS
-- OPTION A: Move orphaned projects to your PRIMARY tenant
-- First, identify your PRIMARY tenant from Step 3, then run:
-- UPDATE projects 
-- SET tenant_id = 'YOUR_PRIMARY_TENANT_ID'  -- Replace with tenant_id from Step 3
-- WHERE tenant_id IN (
--     '6c7b7f99-3e6b-4125-ac9b-fecab5899a81',
--     '408986dc-38f4-40ed-ac75-028d6690932c',
--     '84da68e3-f74f-4e07-911b-18e8bff02445'
-- )
-- AND NOT EXISTS (SELECT 1 FROM tenants WHERE id = projects.tenant_id);

-- OPTION B: Delete orphaned projects (if they're test data)
-- DELETE FROM projects 
-- WHERE tenant_id NOT IN (SELECT id FROM tenants);

-- Step 5: Fix project "d" - move it to your PRIMARY tenant or delete it
-- UPDATE projects 
-- SET tenant_id = 'YOUR_PRIMARY_TENANT_ID'  -- Replace with tenant_id from Step 3
-- WHERE name = 'd' AND tenant_id = '8ee28f55-b780-4286-8137-9e70ea58ae56';

-- OR delete it:
-- DELETE FROM projects 
-- WHERE name = 'd' AND tenant_id = '8ee28f55-b780-4286-8137-9e70ea58ae56';

-- Step 6: Ensure foreign key constraint exists
-- Check if constraint exists
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table
FROM pg_constraint
WHERE conname = 'projects_tenant_id_fkey';

-- If constraint doesn't exist, create it:
-- ALTER TABLE projects
-- ADD CONSTRAINT projects_tenant_id_fkey 
-- FOREIGN KEY (tenant_id) 
-- REFERENCES tenants(id) 
-- ON DELETE CASCADE 
-- ON UPDATE CASCADE;

-- Step 7: Verify fix
SELECT 
    p.id,
    p.name,
    p.tenant_id,
    CASE 
        WHEN p.tenant_id IS NULL THEN '❌ NULL tenant_id'
        WHEN NOT EXISTS (SELECT 1 FROM tenants WHERE id = p.tenant_id) THEN '❌ Invalid tenant_id'
        ELSE '✅ Valid tenant_id'
    END as tenant_status
FROM projects p
WHERE p.tenant_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM tenants WHERE id = p.tenant_id);
-- Should return 0 rows after fix

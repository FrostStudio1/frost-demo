-- ============================================
-- COMPLETE FIX: Fix orphaned projects and tenant isolation
-- ============================================
-- Run this step by step in Supabase SQL Editor

-- STEP 1: Find your PRIMARY tenant (the one you should use)
-- This finds the tenant with most activity (projects + time entries)
WITH user_employees AS (
    SELECT DISTINCT e.tenant_id, e.id as employee_id
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
         JOIN user_employees ue ON ue.employee_id = te.employee_id
         WHERE te.tenant_id = t.id) as time_entry_count
    FROM tenants t
    WHERE t.id IN (SELECT tenant_id FROM user_employees)
)
SELECT 
    id as PRIMARY_TENANT_ID,
    name as PRIMARY_TENANT_NAME,
    project_count,
    time_entry_count,
    (project_count + time_entry_count) as total_activity
FROM tenant_activity
ORDER BY total_activity DESC
LIMIT 1;

-- STEP 2: After running Step 1, copy the PRIMARY_TENANT_ID and use it below
-- Replace 'YOUR_PRIMARY_TENANT_ID' with the id from Step 1

-- STEP 3: Move orphaned projects to your PRIMARY tenant
-- Uncomment and run this AFTER you have PRIMARY_TENANT_ID from Step 1:
/*
UPDATE projects 
SET tenant_id = 'YOUR_PRIMARY_TENANT_ID'  -- Replace with PRIMARY_TENANT_ID from Step 1
WHERE tenant_id NOT IN (SELECT id FROM tenants)
AND tenant_id IN (
    '6c7b7f99-3e6b-4125-ac9b-fecab5899a81',
    '408986dc-38f4-40ed-ac75-028d6690932c',
    '84da68e3-f74f-4e07-911b-18e8bff02445'
);
*/

-- STEP 4: Delete or move project "d" (it belongs to wrong tenant)
-- Option A: Move project "d" to PRIMARY tenant
-- UPDATE projects 
-- SET tenant_id = 'YOUR_PRIMARY_TENANT_ID'  -- Replace with PRIMARY_TENANT_ID
-- WHERE name = 'd' AND tenant_id = '8ee28f55-b780-4286-8137-9e70ea58ae56';

-- Option B: Delete project "d" if it's not needed
-- DELETE FROM projects 
-- WHERE name = 'd' AND tenant_id = '8ee28f55-b780-4286-8137-9e70ea58ae56';

-- STEP 5: Ensure foreign key constraint exists (prevents future orphaned projects)
-- Check if constraint exists:
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

-- STEP 6: Verify fix - should return 0 rows
SELECT 
    COUNT(*) as orphaned_projects_count
FROM projects p
WHERE p.tenant_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM tenants WHERE id = p.tenant_id);
-- Should be 0 after fix

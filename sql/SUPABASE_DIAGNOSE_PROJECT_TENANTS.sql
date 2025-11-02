-- DIAGNOSTIC SQL: Check which tenant each project belongs to
-- Run this in Supabase SQL Editor to see all projects and their tenants

SELECT 
    p.id,
    p.name,
    p.tenant_id,
    t.name as tenant_name,
    p.created_at,
    p.status
FROM projects p
LEFT JOIN tenants t ON p.tenant_id = t.id
ORDER BY p.created_at DESC;

-- Check for projects with invalid/missing tenant_id
SELECT 
    p.id,
    p.name,
    p.tenant_id,
    CASE 
        WHEN p.tenant_id IS NULL THEN 'NULL tenant_id'
        WHEN NOT EXISTS (SELECT 1 FROM tenants WHERE id = p.tenant_id) THEN 'Invalid tenant_id (does not exist)'
        ELSE 'Valid tenant_id'
    END as tenant_status
FROM projects p
ORDER BY p.created_at DESC;

-- Check current user's tenant
-- Replace 'YOUR_USER_ID' with actual user ID from auth.users
SELECT 
    e.id as employee_id,
    e.full_name,
    e.tenant_id,
    t.name as tenant_name,
    e.auth_user_id
FROM employees e
LEFT JOIN tenants t ON e.tenant_id = t.id
WHERE e.auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'; -- Replace with your user ID

-- List all tenants
SELECT id, name, created_at FROM tenants ORDER BY created_at DESC;

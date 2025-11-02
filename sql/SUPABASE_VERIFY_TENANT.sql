-- ============================================================================
-- VERIFIERA TENANT I DATABASEN
-- ============================================================================
-- Kör denna SQL för att verifiera att din tenant finns i databasen
-- ============================================================================

-- 1. Lista alla tenants
SELECT id, name, created_at 
FROM tenants 
ORDER BY created_at DESC;

-- 2. Kontrollera att din tenant finns (ersätt 'YOUR_TENANT_ID' med ditt tenant ID)
-- Du hittar ditt tenant ID i:
-- - JWT token (app_metadata.tenant_id)
-- - Supabase Dashboard → Authentication → Users → Din användare → app_metadata.tenant_id
-- - Console i webbläsaren (Developer Tools → Application → Cookies → tenant_id)

-- Exempel:
-- SELECT id, name, created_at 
-- FROM tenants 
-- WHERE id = '6c7b7f99-3e6b-4125-ac9b-fecab5899a81';

-- 3. Kontrollera foreign key constraint på time_entries
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table,
    a.attname AS column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE conrelid = 'time_entries'::regclass
  AND contype = 'f'
  AND confrelid = 'tenants'::regclass;

-- 4. Om tenant saknas, skapa en temporär tenant (endast för testning!)
-- VARNING: Kör endast detta om din tenant verkligen saknas!
-- INSERT INTO tenants (id, name, created_at, updated_at)
-- VALUES (
--   '6c7b7f99-3e6b-4125-ac9b-fecab5899a81', -- Ersätt med ditt tenant ID
--   'Test Tenant',
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT (id) DO NOTHING;

-- 5. Kontrollera att employee-record har rätt tenant_id
SELECT 
    e.id,
    e.full_name,
    e.tenant_id,
    e.auth_user_id,
    t.id AS tenant_exists
FROM employees e
LEFT JOIN tenants t ON t.id = e.tenant_id
WHERE e.auth_user_id = 'YOUR_USER_ID' -- Ersätt med ditt user ID
ORDER BY e.created_at DESC;

-- 6. Om employee-record har fel tenant_id, uppdatera den:
-- UPDATE employees
-- SET tenant_id = '6c7b7f99-3e6b-4125-ac9b-fecab5899a81' -- Ersätt med rätt tenant ID
-- WHERE auth_user_id = 'YOUR_USER_ID'; -- Ersätt med ditt user ID

-- ============================================================================
-- TIPS:
-- ============================================================================
-- Om du får foreign key constraint errors:
-- 1. Kontrollera att din tenant verkligen finns (query #2)
-- 2. Kontrollera att employee-record har rätt tenant_id (query #5)
-- 3. Om tenant saknas, skapa den (query #4) ELLER logga ut och in igen
-- 4. Om employee har fel tenant_id, uppdatera den (query #6)
-- ============================================================================


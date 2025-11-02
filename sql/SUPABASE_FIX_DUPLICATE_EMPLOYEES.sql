-- ============================================================================
-- FIXA DUPLIKERADE EMPLOYEE-RECORDS
-- ============================================================================
-- Detta script fixar duplicerade employee-records för samma användare
-- ============================================================================

-- 1. Se alla employee-records för användaren
SELECT 
    e.id,
    e.full_name,
    e.tenant_id,
    e.auth_user_id,
    e.role,
    e.created_at,
    t.id AS tenant_exists,
    t.name AS tenant_name
FROM employees e
LEFT JOIN tenants t ON t.id = e.tenant_id
WHERE e.auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
ORDER BY e.created_at DESC;

-- 2. Kontrollera vilka tenants som faktiskt finns
SELECT id, name, created_at 
FROM tenants 
WHERE id IN (
  '6c7b7f99-3e6b-4125-ac9b-fecab5899a81',
  '7d57f1cb-c33f-4317-96f7-0abac0f2aab6'
)
ORDER BY created_at DESC;

-- 3. Bestäm vilken employee-record som ska behållas
-- Regel: Behåll den med rätt tenant_id som finns i databasen
-- Om båda tenant_id finns, behåll den senaste eller den med roll 'admin'

-- 4. Ta bort duplicerade employee-records
-- VIKTIGT: Ta bort endast de som har fel tenant_id eller är duplicerade
-- 
-- Exempel: Om tenant 6c7b7f99-3e6b-4125-ac9b-fecab5899a81 är den korrekta:
-- Ta bort employee e5ad1c35-146b-4bc2-aed6-521ad30c5d97 (som har fel tenant_id)

-- OPTION A: Ta bort den med fel tenant_id (om tenant 7d57f1cb... inte finns)
-- DELETE FROM employees
-- WHERE id = 'e5ad1c35-146b-4bc2-aed6-521ad30c5d97'
--   AND auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567';

-- OPTION B: Uppdatera den felaktiga employee-record att använda rätt tenant_id
-- UPDATE employees
-- SET tenant_id = '6c7b7f99-3e6b-4125-ac9b-fecab5899a81'  -- Rätt tenant_id
-- WHERE id = 'e5ad1c35-146b-4bc2-aed6-521ad30c5d97'
--   AND auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567';

-- 5. Efter fix - Verifiera att det bara finns en employee-record (eller max två om admin och vanlig)
SELECT 
    id,
    full_name,
    tenant_id,
    auth_user_id,
    role
FROM employees
WHERE auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
ORDER BY created_at DESC;

-- ============================================================================
-- REKOMMENDATION:
-- ============================================================================
-- Baserat på dina data:
-- - Tenant 6c7b7f99-3e6b-4125-ac9b-fecab5899a81 verkar vara den korrekta
-- - Du har två employee-records med den tenant_id (en admin, en vanlig)
-- - Du har en employee-record med tenant_id 7d57f1cb... (som troligen inte finns)
--
-- FIX: Ta bort eller uppdatera employee e5ad1c35-146b-4bc2-aed6-521ad30c5d97
-- ============================================================================


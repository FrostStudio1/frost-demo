-- ============================================================================
-- TA BORT DEMO-ANVÄNDARE "Anna Snickare"
-- ============================================================================
-- Kör denna SQL i Supabase SQL Editor för att ta bort demo-användaren
-- ============================================================================

-- Steg 1: Hitta demo-användaren
SELECT 
  id,
  name,
  full_name,
  email,
  tenant_id
FROM employees
WHERE 
  LOWER(name) LIKE '%anna%' 
  AND LOWER(name) LIKE '%snickare%'
  OR LOWER(full_name) LIKE '%anna%' 
  AND LOWER(full_name) LIKE '%snickare%'
  OR LOWER(name) LIKE '%demo%'
  OR LOWER(full_name) LIKE '%demo%';

-- ============================================================================
-- Steg 2: Ta bort demo-användaren (efter att du har verifierat ID:t ovan)
-- ============================================================================
-- VIKTIGT: Ersätt <EMPLOYEE_ID> med det faktiska ID:t från query ovan
-- ============================================================================

-- DELETE FROM employees
-- WHERE id = '<EMPLOYEE_ID>';

-- ============================================================================
-- ALTERNATIV: Ta bort ALLA demo-användare på en gång (använd med försiktighet!)
-- ============================================================================

-- DELETE FROM employees
-- WHERE 
--   (LOWER(name) LIKE '%anna%' AND LOWER(name) LIKE '%snickare%')
--   OR (LOWER(full_name) LIKE '%anna%' AND LOWER(full_name) LIKE '%snickare%')
--   OR LOWER(name) LIKE '%demo%'
--   OR LOWER(full_name) LIKE '%demo%';


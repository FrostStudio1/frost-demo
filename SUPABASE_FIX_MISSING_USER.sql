-- ============================================================================
-- FIXA SAKNANDE ANVÄNDARE I EMPLOYEES-TABELLEN
-- ============================================================================
-- Kör denna SQL för att skapa employee-poster för alla användare som saknas
-- ============================================================================

-- Steg 1: Se vilka användare som saknas employee-post
-- (Kör denna först för att se vad som saknas)
SELECT 
  au.id as auth_user_id,
  au.email,
  CASE 
    WHEN e.id IS NULL THEN 'SAKNAS I EMPLOYEES'
    ELSE 'FINNS REDAN'
  END as status,
  e.tenant_id,
  e.role
FROM auth.users au
LEFT JOIN employees e ON e.auth_user_id = au.id
ORDER BY au.created_at DESC;

-- ============================================================================
-- Steg 2: Skapa employee-post för specifik användare
-- ============================================================================
-- Ersätt <USER_ID_HERE> med ditt auth.users.id (hitta det i query ovan)
-- Ersätt <TENANT_ID_HERE> med ditt tenant_id
-- ============================================================================

-- Exempel: Skapa admin-employee för en användare
-- INSERT INTO employees (auth_user_id, tenant_id, name, full_name, role)
-- VALUES (
--   '<USER_ID_HERE>',  -- Ersätt med ditt auth.users.id
--   '<TENANT_ID_HERE>', -- Ersätt med ditt tenant_id
--   'Admin',           -- Namn
--   'Admin',           -- Fullständigt namn
--   'admin'            -- Roll (admin eller employee)
-- );

-- ============================================================================
-- ALTERNATIV: Skapa employee-post automatiskt för ALLA användare utan post
-- ============================================================================
-- OBS: Detta skapar en employee-post med 'employee' roll för alla som saknas
-- Du kan behöva uppdatera tenant_id och role manuellt efteråt
-- ============================================================================

-- INSERT INTO employees (auth_user_id, tenant_id, name, full_name, role)
-- SELECT 
--   au.id,
--   (SELECT id FROM tenants ORDER BY created_at DESC LIMIT 1), -- Använder senaste tenant
--   COALESCE(
--     NULLIF(SPLIT_PART(au.email, '@', 1), ''),
--     'Användare'
--   ) as name,
--   COALESCE(
--     NULLIF(SPLIT_PART(au.email, '@', 1), ''),
--     'Användare'
--   ) as full_name,
--   'admin' as role  -- Sätt till 'admin' eller 'employee' beroende på vad du vill
-- FROM auth.users au
-- WHERE NOT EXISTS (
--   SELECT 1 FROM employees e 
--   WHERE e.auth_user_id = au.id
-- );

-- ============================================================================
-- INSTRUKTIONER:
-- ============================================================================
-- 1. Kör Steg 1 för att se vilka användare som saknas employee-post
-- 2. Hitta ditt auth.users.id och tenant_id
-- 3. Kör Steg 2 med dina värden, eller kör ALTERNATIV-scriptet om du vill
--    skapa för alla på en gång
-- ============================================================================


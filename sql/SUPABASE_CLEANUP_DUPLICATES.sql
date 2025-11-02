-- ============================================================================
-- AUTOMATISK CLEANUP AV DUPLIKERADE EMPLOYEE-RECORDS
-- ============================================================================
-- Detta script tar automatiskt bort duplicerade employee-records
-- BEHÅLLER: Den senaste record med rätt tenant_id
-- ============================================================================

-- VIKTIGT: Kör detta i en transaction så du kan ångra om något går fel!
BEGIN;

-- 1. Kontrollera vilka tenants som finns
DO $$
DECLARE
    valid_tenant_id UUID;
    invalid_employee_id UUID := 'e5ad1c35-146b-4bc2-aed6-521ad30c5d97';
    user_id UUID := '2941e8db-d533-412e-a292-7ff713e76567';
BEGIN
    -- Hitta vilken tenant som faktiskt finns
    SELECT id INTO valid_tenant_id
    FROM tenants
    WHERE id = '6c7b7f99-3e6b-4125-ac9b-fecab5899a81'
    LIMIT 1;
    
    IF valid_tenant_id IS NOT NULL THEN
        RAISE NOTICE 'Found valid tenant: %', valid_tenant_id;
        
        -- Uppdatera den felaktiga employee-record att använda rätt tenant_id
        UPDATE employees
        SET tenant_id = valid_tenant_id
        WHERE id = invalid_employee_id
          AND auth_user_id = user_id;
        
        IF FOUND THEN
            RAISE NOTICE 'Updated employee % to use tenant %', invalid_employee_id, valid_tenant_id;
        ELSE
            RAISE NOTICE 'Employee % not found or already updated', invalid_employee_id;
        END IF;
        
        -- ELLER ta bort den helt (om du vill ha bara en record per user)
        -- DELETE FROM employees
        -- WHERE id = invalid_employee_id
        --   AND auth_user_id = user_id;
        -- 
        -- IF FOUND THEN
        --     RAISE NOTICE 'Deleted duplicate employee %', invalid_employee_id;
        -- END IF;
    ELSE
        RAISE WARNING 'Valid tenant not found! Check your tenant IDs.';
    END IF;
END $$;

-- 2. Verifiera resultat
SELECT 
    id,
    full_name,
    tenant_id,
    auth_user_id,
    role,
    created_at
FROM employees
WHERE auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
ORDER BY created_at DESC;

-- 3. Om resultatet ser bra ut, COMMIT (annars ROLLBACK)
-- COMMIT;
-- ROLLBACK;

-- ============================================================================
-- MANUELL FIX (om ovanstående inte fungerar):
-- ============================================================================
-- 
-- OPTION 1: Uppdatera employee-record
-- UPDATE employees
-- SET tenant_id = '6c7b7f99-3e6b-4125-ac9b-fecab5899a81'
-- WHERE id = 'e5ad1c35-146b-4bc2-aed6-521ad30c5d97';
--
-- OPTION 2: Ta bort duplicerad employee-record
-- DELETE FROM employees
-- WHERE id = 'e5ad1c35-146b-4bc2-aed6-521ad30c5d97'
--   AND auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567';
-- ============================================================================


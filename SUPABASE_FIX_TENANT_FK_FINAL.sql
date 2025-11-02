-- ============================================================================
-- KOMPLETT FIX FÖR time_entries_tenant_id_fkey FOREIGN KEY CONSTRAINT
-- ============================================================================
-- Kör HELA denna SQL i Supabase SQL Editor (klistra in allt och kör)
-- ============================================================================

-- STEG 1: Kontrollera att tenant finns
SELECT id, name, created_at 
FROM tenants 
WHERE id = '8ee28f55-b780-4286-8137-9e70ea58ae56';

-- STEG 2: Hitta orphaned time_entries (entries med tenant_id som inte finns)
SELECT 
    COUNT(*) as orphaned_count,
    ARRAY_AGG(DISTINCT tenant_id) as orphaned_tenant_ids
FROM time_entries te
LEFT JOIN tenants t ON t.id = te.tenant_id
WHERE t.id IS NULL;

-- STEG 3: Ta bort eller uppdatera orphaned entries
-- Vi tar bort dem eftersom de är ogiltiga
DO $$ 
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Ta bort alla time_entries med tenant_id som inte finns i tenants
    DELETE FROM time_entries 
    WHERE tenant_id NOT IN (SELECT id FROM tenants);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE '✅ Deleted % orphaned time_entries', deleted_count;
END $$;

-- STEG 4: Ta bort befintlig constraint om den finns
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'time_entries_tenant_id_fkey'
    ) THEN
        ALTER TABLE time_entries 
        DROP CONSTRAINT time_entries_tenant_id_fkey CASCADE;
        RAISE NOTICE '✅ Dropped existing constraint';
    ELSE
        RAISE NOTICE '⚠️ Constraint does not exist yet';
    END IF;
END $$;

-- STEG 5: Skapa ny constraint
DO $$ 
BEGIN
    ALTER TABLE time_entries
    ADD CONSTRAINT time_entries_tenant_id_fkey
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
    NOT DEFERRABLE
    INITIALLY IMMEDIATE;
    
    RAISE NOTICE '✅ Created new constraint';
END $$;

-- STEG 6: Validera constraint
DO $$ 
BEGIN
    ALTER TABLE time_entries VALIDATE CONSTRAINT time_entries_tenant_id_fkey;
    RAISE NOTICE '✅ Validated constraint';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Validation warning: %', SQLERRM;
END $$;

-- STEG 7: Verifiera att constraint fungerar
SELECT 
    conname AS constraint_name,
    contype,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table,
    convalidated AS is_validated,
    CASE 
        WHEN convalidated THEN '✅ Validated - Should work!'
        ELSE '❌ NOT Validated - Problem persists'
    END AS status
FROM pg_constraint
WHERE conname = 'time_entries_tenant_id_fkey';

-- STEG 8: Verifiera att tenant finns och kan refereras
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tenant exists'
        ELSE '❌ Tenant does NOT exist'
    END AS tenant_status,
    COUNT(*) as tenant_count
FROM tenants 
WHERE id = '8ee28f55-b780-4286-8137-9e70ea58ae56';

-- STEG 9: Kontrollera att inga orphaned entries finns kvar
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ No orphaned entries - All good!'
        ELSE '❌ Still have ' || COUNT(*) || ' orphaned entries'
    END AS orphaned_status
FROM time_entries te
LEFT JOIN tenants t ON t.id = te.tenant_id
WHERE t.id IS NULL;

-- ============================================================================
-- RESULTAT:
-- ============================================================================
-- Om steg 7 visar "✅ Validated - Should work!" och steg 9 visar "✅ No orphaned entries"
-- så är allt fixat! Testa att stämpla in igen i appen.
-- ============================================================================


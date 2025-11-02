-- ============================================================================
-- IMMEDIAT FIX FÖR time_entries_tenant_id_fkey FOREIGN KEY CONSTRAINT
-- ============================================================================
-- Kör denna SQL i Supabase SQL Editor för att fixa foreign key constraint
-- ============================================================================

-- 1. Kontrollera att tenant 8ee28f55-b780-4286-8137-9e70ea58ae56 faktiskt finns
SELECT id, name, created_at 
FROM tenants 
WHERE id = '8ee28f55-b780-4286-8137-9e70ea58ae56';

-- Om tenant INTE finns ovan, skapa den:
-- INSERT INTO tenants (id, name, created_at, updated_at)
-- VALUES (
--   '8ee28f55-b780-4286-8137-9e70ea58ae56',
--   'test',
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT (id) DO NOTHING;

-- 2. Kontrollera constraint status
SELECT 
    conname AS constraint_name,
    contype,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table,
    convalidated AS is_validated
FROM pg_constraint
WHERE conname = 'time_entries_tenant_id_fkey';

-- 3. Ta bort och skapa om constraint (FIXAR PROBLEMET)
DO $$ 
BEGIN
    -- Ta bort befintlig constraint om den finns
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'time_entries_tenant_id_fkey'
    ) THEN
        ALTER TABLE time_entries 
        DROP CONSTRAINT IF EXISTS time_entries_tenant_id_fkey;
        RAISE NOTICE '✅ Dropped existing constraint';
    END IF;

    -- Skapa ny constraint (VALIDATED)
    ALTER TABLE time_entries
    ADD CONSTRAINT time_entries_tenant_id_fkey
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
    NOT DEFERRABLE;  -- Säkerställer att constraint valideras omedelbart
    
    RAISE NOTICE '✅ Created new constraint';
    
    -- Validera constraint omedelbart
    ALTER TABLE time_entries VALIDATE CONSTRAINT time_entries_tenant_id_fkey;
    RAISE NOTICE '✅ Validated constraint';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error: %', SQLERRM;
END $$;

-- 4. Verifiera att constraint nu fungerar
SELECT 
    conname AS constraint_name,
    contype,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table,
    convalidated AS is_validated,
    CASE 
        WHEN convalidated THEN '✅ Validated'
        ELSE '❌ NOT Validated'
    END AS validation_status
FROM pg_constraint
WHERE conname = 'time_entries_tenant_id_fkey';

-- 5. Testa att tenant faktiskt kan refereras
SELECT 
    COUNT(*) as tenant_count
FROM tenants 
WHERE id = '8ee28f55-b780-4286-8137-9e70ea58ae56';

-- ============================================================================
-- INSTRUKTIONER:
-- ============================================================================
-- 1. Kör hela scriptet ovan i Supabase SQL Editor
-- 2. Kontrollera att steg 1 returnerar en rad (tenant finns)
-- 3. Om steg 1 returnerar inget, kör INSERT-kommentaren
-- 4. Efter körning ska steg 4 visa "✅ Validated"
-- 5. Testa att stämpla in igen i appen
-- ============================================================================


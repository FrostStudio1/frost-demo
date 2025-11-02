-- ============================================================================
-- FIXA FOREIGN KEY CONSTRAINT FÖR time_entries.tenant_id
-- ============================================================================
-- Kör denna SQL i Supabase SQL Editor om du får foreign key constraint errors
-- ============================================================================

-- 1. Kontrollera constraint och datatyper
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table,
    a.attname AS column_name,
    a.atttypid::regtype AS column_type,
    b.attname AS referenced_column,
    b.atttypid::regtype AS referenced_type
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
JOIN pg_attribute b ON b.attrelid = c.confrelid AND b.attnum = ANY(c.confkey)
WHERE conrelid = 'time_entries'::regclass
  AND contype = 'f'
  AND confrelid = 'tenants'::regclass;

-- 2. Kontrollera att tenants.id är UUID (om den finns)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tenants'
  AND column_name = 'id';

-- 3. Kontrollera att time_entries.tenant_id är UUID (om den finns)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'time_entries'
  AND column_name = 'tenant_id';

-- 4. Kontrollera om det finns orphaned time_entries (time_entries utan korresponderande tenant)
SELECT 
    te.id,
    te.tenant_id,
    te.date,
    te.employee_id
FROM time_entries te
LEFT JOIN tenants t ON t.id = te.tenant_id
WHERE t.id IS NULL
LIMIT 10;

-- 5. OM CONSTRAINT FINNS MEN INTE FUNGERAR - Ta bort och skapa om
-- VARNING: Kör endast detta om du är säker!
-- DO $$ 
-- BEGIN
--     -- Ta bort befintlig constraint om den finns
--     IF EXISTS (
--         SELECT 1 FROM pg_constraint 
--         WHERE conname = 'time_entries_tenant_id_fkey'
--     ) THEN
--         ALTER TABLE time_entries 
--         DROP CONSTRAINT time_entries_tenant_id_fkey;
--         RAISE NOTICE 'Dropped existing constraint';
--     END IF;
-- 
--     -- Skapa ny constraint
--     ALTER TABLE time_entries
--     ADD CONSTRAINT time_entries_tenant_id_fkey
--     FOREIGN KEY (tenant_id)
--     REFERENCES tenants(id)
--     ON DELETE CASCADE
--     ON UPDATE CASCADE;
--     
--     RAISE NOTICE 'Created new constraint';
-- END $$;

-- 6. ALTERNATIV: Om du vill skapa constraint utan att ta bort den gamla (idempotent)
-- DO $$ 
-- BEGIN
--     -- Skapa constraint om den inte redan finns
--     IF NOT EXISTS (
--         SELECT 1 FROM pg_constraint 
--         WHERE conname = 'time_entries_tenant_id_fkey'
--     ) THEN
--         ALTER TABLE time_entries
--         ADD CONSTRAINT time_entries_tenant_id_fkey
--         FOREIGN KEY (tenant_id)
--         REFERENCES tenants(id)
--         ON DELETE CASCADE
--         ON UPDATE CASCADE;
--         
--         RAISE NOTICE 'Created constraint';
--     ELSE
--         RAISE NOTICE 'Constraint already exists';
--     END IF;
-- END $$;

-- 7. Verifiera att constraint nu fungerar
-- SELECT 
--     conname,
--     contype,
--     conrelid::regclass AS table_name,
--     confrelid::regclass AS referenced_table
-- FROM pg_constraint
-- WHERE conname = 'time_entries_tenant_id_fkey';

-- ============================================================================
-- INSTRUKTIONER:
-- ============================================================================
-- 1. Kör query #1 för att se constraint-information
-- 2. Kör query #2 och #3 för att verifiera datatyper matchar
-- 3. Kör query #4 för att se om det finns orphaned entries
-- 4. Om datatyper matchar men constraint inte fungerar:
--    - Kör query #5 (eller #6 för idempotent version) för att skapa om constraint
-- 5. Verifiera med query #7
-- ============================================================================
-- 
-- VANLIGA PROBLEM:
-- - Datatyper matchar inte (t.ex. uuid vs text)
-- - Constraint finns inte
-- - Orphaned entries (time_entries utan korresponderande tenant)
-- - Transaction isolation issues (löses vanligtvis med "touch" update)
-- ============================================================================


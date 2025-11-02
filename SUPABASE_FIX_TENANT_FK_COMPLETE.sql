-- ============================================================================
-- KOMPLETT FIX FÖR time_entries_tenant_id_fkey FOREIGN KEY CONSTRAINT
-- ============================================================================
-- Kör hela denna SQL i Supabase SQL Editor
-- ============================================================================

-- 1. KONTROLLERA ATT TENANT FINNS
SELECT id, name, created_at 
FROM tenants 
WHERE id = '8ee28f55-b780-4286-8137-9e70ea58ae56';

-- Om inget resultat ovan, tenant saknas - skapa den:
-- INSERT INTO tenants (id, name, created_at, updated_at)
-- VALUES (
--   '8ee28f55-b780-4286-8137-9e70ea58ae56',
--   'test',
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT (id) DO NOTHING;

-- 2. KONTROLLERA CONSTRAINT STATUS OCH VAD DEN PEKAR PÅ
SELECT 
    conname AS constraint_name,
    contype,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table,
    a.attname AS column_name,
    a.atttypid::regtype AS column_type,
    b.attname AS referenced_column,
    b.atttypid::regtype AS referenced_type,
    convalidated AS is_validated,
    CASE 
        WHEN convalidated THEN '✅ Validated'
        ELSE '❌ NOT Validated - THIS IS THE PROBLEM!'
    END AS validation_status
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
JOIN pg_attribute b ON b.attrelid = c.confrelid AND b.attnum = ANY(c.confkey)
WHERE conname = 'time_entries_tenant_id_fkey';

-- 3. KONTROLLERA DATATYPER
SELECT 
    'time_entries.tenant_id' AS column_ref,
    column_name,
    data_type,
    udt_name AS udt_type
FROM information_schema.columns
WHERE table_name = 'time_entries'
  AND column_name = 'tenant_id'
UNION ALL
SELECT 
    'tenants.id' AS column_ref,
    column_name,
    data_type,
    udt_name AS udt_type
FROM information_schema.columns
WHERE table_name = 'tenants'
  AND column_name = 'id';

-- 4. TA BORT ALLA CONSTRAINTS OCH SKAPA OM (KRITISKT STEG)
DO $$ 
DECLARE
    constraint_count INTEGER;
BEGIN
    -- Ta bort ALLA constraints med detta namn (om det finns flera)
    FOR constraint_count IN 
        SELECT COUNT(*) FROM pg_constraint WHERE conname = 'time_entries_tenant_id_fkey'
    LOOP
        IF constraint_count > 0 THEN
            ALTER TABLE time_entries 
            DROP CONSTRAINT IF EXISTS time_entries_tenant_id_fkey CASCADE;
            RAISE NOTICE '✅ Dropped existing constraint(s)';
        END IF;
    END LOOP;

    -- Vänta lite för att säkerställa att constraint är borta
    PERFORM pg_sleep(0.1);

    -- Skapa ny constraint MED EXPLICIT VALIDATION
    ALTER TABLE time_entries
    ADD CONSTRAINT time_entries_tenant_id_fkey
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
    NOT DEFERRABLE
    INITIALLY IMMEDIATE;
    
    RAISE NOTICE '✅ Created new constraint';
    
    -- Validera constraint EXPLICITLY
    BEGIN
        ALTER TABLE time_entries VALIDATE CONSTRAINT time_entries_tenant_id_fkey;
        RAISE NOTICE '✅ Validated constraint';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Validation warning: %', SQLERRM;
    END;
    
    -- Testa att constraint fungerar genom att verifiera att tenant kan refereras
    PERFORM 1 
    FROM tenants 
    WHERE id = '8ee28f55-b780-4286-8137-9e70ea58ae56';
    
    IF FOUND THEN
        RAISE NOTICE '✅ Tenant exists and can be referenced';
    ELSE
        RAISE NOTICE '❌ WARNING: Tenant does not exist!';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error: %', SQLERRM;
        RAISE;
END $$;

-- 5. VERIFIERA ATT CONSTRAINT NU FUNGERAR
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

-- 6. TESTA ATT SKAPA EN TEST-TIME_ENTRY (Valfritt - ta bort efteråt!)
-- OBS: Ersätt employee_id och project_id med riktiga värden från din databas
-- DO $$
-- DECLARE
--     test_employee_id UUID;
--     test_project_id UUID;
-- BEGIN
--     -- Hämta första employee för tenant
--     SELECT id INTO test_employee_id 
--     FROM employees 
--     WHERE tenant_id = '8ee28f55-b780-4286-8137-9e70ea58ae56' 
--     LIMIT 1;
--     
--     -- Hämta första project för tenant
--     SELECT id INTO test_project_id 
--     FROM projects 
--     WHERE tenant_id = '8ee28f55-b780-4286-8137-9e70ea58ae56' 
--     LIMIT 1;
--     
--     IF test_employee_id IS NOT NULL AND test_project_id IS NOT NULL THEN
--         INSERT INTO time_entries (
--             tenant_id, 
--             employee_id, 
--             project_id, 
--             date, 
--             start_time,
--             hours_total, 
--             ob_type, 
--             amount_total, 
--             is_billed
--         )
--         VALUES (
--             '8ee28f55-b780-4286-8137-9e70ea58ae56',
--             test_employee_id,
--             test_project_id,
--             CURRENT_DATE,
--             CURRENT_TIME::TIME,
--             1.0,
--             'work',
--             360.0,
--             false
--         );
--         
--         RAISE NOTICE '✅ Test time_entry created successfully!';
--         
--         -- Ta bort test-entry
--         DELETE FROM time_entries 
--         WHERE tenant_id = '8ee28f55-b780-4286-8137-9e70ea58ae56' 
--           AND employee_id = test_employee_id 
--           AND project_id = test_project_id
--           AND date = CURRENT_DATE;
--         
--         RAISE NOTICE '✅ Test time_entry cleaned up';
--     ELSE
--         RAISE NOTICE '⚠️ Cannot test - missing employee or project';
--     END IF;
-- END $$;

-- ============================================================================
-- EFTER KÖRNING:
-- ============================================================================
-- 1. Kontrollera att steg 5 visar "✅ Validated - Should work!"
-- 2. Om den fortfarande visar "❌ NOT Validated", kan det vara:
--    - Orphaned time_entries (se steg 7 nedan)
--    - Fel schema (om du har flera scheman)
-- 3. Testa att stämpla in igen i appen
-- ============================================================================

-- 7. (VALFRITT) KONTROLLERA ORPHANED ENTRIES
-- SELECT 
--     te.id,
--     te.tenant_id,
--     te.date,
--     te.employee_id
-- FROM time_entries te
-- LEFT JOIN tenants t ON t.id = te.tenant_id
-- WHERE t.id IS NULL
-- LIMIT 10;
-- 
-- Om det finns orphaned entries, antingen:
-- - Uppdatera dem till rätt tenant_id, ELLER
-- - Ta bort dem, ELLER
-- - Skapa saknade tenants
-- ============================================================================


-- ============================================================================
-- PHASE 1: Alla Migrationer i Rätt Ordning
-- ============================================================================
-- Kör dessa migrations i denna ordning:
-- 1. Signatures (stub)
-- 2. Audit Log
-- 3. Customer Portal
-- 4. ÄTA 2.0 (kräver signatures)
-- 5. Budget & Alerts
-- ============================================================================

-- Steg 1: Signatures (måste köras först eftersom ÄTA refererar till den)
\i PHASE1_MIGRATION_SIGNATURES_STUB.sql

-- Steg 2: Audit Log
\i PHASE1_MIGRATION_M_AUDIT_LOG.sql

-- Steg 3: Customer Portal
\i PHASE1_MIGRATION_J_CUSTOMER_PORTAL.sql

-- Steg 4: ÄTA 2.0 (kräver signatures)
\i PHASE1_MIGRATION_D_ATA_2.0.sql

-- Steg 5: Budget & Alerts
\i PHASE1_MIGRATION_K_BUDGET_ALERTS.sql

-- Verifiering: Kontrollera att alla tabeller skapats
DO $$
DECLARE
    v_tables TEXT[] := ARRAY[
        'signatures',
        'signature_events',
        'audit_logs',
        'release_labels',
        'public_links',
        'public_link_events',
        'ata_items',
        'project_budgets',
        'budget_alerts'
    ];
    v_table TEXT;
    v_exists BOOLEAN;
BEGIN
    FOREACH v_table IN ARRAY v_tables
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = v_table
        ) INTO v_exists;
        
        IF NOT v_exists THEN
            RAISE WARNING 'Table % does not exist!', v_table;
        ELSE
            RAISE NOTICE '✓ Table % exists', v_table;
        END IF;
    END LOOP;
END $$;

RAISE NOTICE 'All Phase 1 migrations completed!';


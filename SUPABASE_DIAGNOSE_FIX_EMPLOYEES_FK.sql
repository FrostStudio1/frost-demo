-- ============================================================================
-- DIAGNOSTIC AND FIX SCRIPT FOR EMPLOYEES FOREIGN KEY CONSTRAINT
-- ============================================================================
-- Detta script diagnostiserar och fixar foreign key constraint-problem för employees.tenant_id
-- Kör denna SQL i Supabase SQL Editor
-- ============================================================================

-- STEP 1: Check data types of tenant_id columns
-- ============================================================================
SELECT 
    'tenants.id' as column_path,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'tenants'
    AND column_name = 'id';

SELECT 
    'employees.tenant_id' as column_path,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'employees'
    AND column_name = 'tenant_id';

-- STEP 2: Check existing foreign key constraints on employees.tenant_id
-- ============================================================================
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
    AND rc.constraint_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name = 'employees'
    AND kcu.column_name = 'tenant_id';

-- STEP 3: Check for orphaned employees (employees with tenant_id that doesn't exist)
-- ============================================================================
SELECT 
    e.id as employee_id,
    e.name as employee_name,
    e.tenant_id,
    e.tenant_id::text as tenant_id_text,
    t.id as tenant_exists,
    t.name as tenant_name
FROM employees e
LEFT JOIN tenants t ON e.tenant_id = t.id
WHERE t.id IS NULL
LIMIT 10;

-- STEP 4: Fix data type if employees.tenant_id is not UUID
-- ============================================================================
DO $$ 
BEGIN
    -- Check if employees.tenant_id exists and is not UUID
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns
        WHERE table_schema = 'public'
            AND table_name = 'employees'
            AND column_name = 'tenant_id'
            AND udt_name != 'uuid'
    ) THEN
        RAISE NOTICE 'Fixing data type: employees.tenant_id is not UUID, converting...';
        
        -- Drop the constraint if it exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE constraint_name = 'employees_tenant_id_fkey' 
            AND table_name = 'employees'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_tenant_id_fkey;
        END IF;
        
        -- Convert column to UUID
        ALTER TABLE employees 
        ALTER COLUMN tenant_id TYPE UUID USING tenant_id::UUID;
        
        RAISE NOTICE 'Converted employees.tenant_id to UUID';
    ELSE
        RAISE NOTICE 'Data type is correct: employees.tenant_id is already UUID';
    END IF;
END $$;

-- STEP 5: Drop and recreate the foreign key constraint (idempotent)
-- ============================================================================
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'employees_tenant_id_fkey' 
        AND table_name = 'employees'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE employees DROP CONSTRAINT employees_tenant_id_fkey;
        RAISE NOTICE 'Dropped existing employees_tenant_id_fkey constraint';
    END IF;
    
    -- Create the constraint fresh
    BEGIN
        ALTER TABLE employees 
        ADD CONSTRAINT employees_tenant_id_fkey 
        FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Created employees_tenant_id_fkey constraint successfully';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating constraint: %', SQLERRM;
        -- Check if there are orphaned employees causing the issue
        IF EXISTS (
            SELECT 1 
            FROM employees e
            LEFT JOIN tenants t ON e.tenant_id = t.id
            WHERE t.id IS NULL AND e.tenant_id IS NOT NULL
        ) THEN
            RAISE NOTICE 'WARNING: Found orphaned employees with invalid tenant_id. These need to be fixed before constraint can be created.';
        END IF;
    END;
END $$;

-- STEP 6: Verify constraint was created correctly
-- ============================================================================
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    kcu.data_type,
    ccu.data_type as foreign_data_type
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name = 'employees'
    AND kcu.column_name = 'tenant_id';

-- STEP 7: Final check - list all tenants for reference
-- ============================================================================
SELECT 
    id, 
    name, 
    created_at,
    id::text as id_as_text
FROM tenants 
ORDER BY created_at DESC 
LIMIT 10;


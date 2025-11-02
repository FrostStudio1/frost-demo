-- ============================================================================
-- DIAGNOSTIC AND FIX SCRIPT FOR PROJECTS FOREIGN KEY CONSTRAINT
-- ============================================================================
-- Detta script diagnostiserar och fixar foreign key constraint-problem
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
    'projects.tenant_id' as column_path,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'projects'
    AND column_name = 'tenant_id';

-- STEP 2: Check existing foreign key constraints on projects.tenant_id
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
    AND tc.table_name = 'projects'
    AND kcu.column_name = 'tenant_id';

-- STEP 3: Check for orphaned projects (projects with tenant_id that doesn't exist)
-- ============================================================================
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.tenant_id,
    p.tenant_id::text as tenant_id_text,
    t.id as tenant_exists,
    t.name as tenant_name
FROM projects p
LEFT JOIN tenants t ON p.tenant_id = t.id
WHERE t.id IS NULL
LIMIT 10;

-- STEP 4: Fix data type if projects.tenant_id is not UUID
-- ============================================================================
DO $$ 
BEGIN
    -- Check if projects.tenant_id exists and is not UUID
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns
        WHERE table_schema = 'public'
            AND table_name = 'projects'
            AND column_name = 'tenant_id'
            AND udt_name != 'uuid'
    ) THEN
        RAISE NOTICE 'Fixing data type: projects.tenant_id is not UUID, converting...';
        
        -- Drop the constraint if it exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE constraint_name = 'projects_tenant_id_fkey' 
            AND table_name = 'projects'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_tenant_id_fkey;
        END IF;
        
        -- Convert column to UUID
        ALTER TABLE projects 
        ALTER COLUMN tenant_id TYPE UUID USING tenant_id::UUID;
        
        RAISE NOTICE 'Converted projects.tenant_id to UUID';
    ELSE
        RAISE NOTICE 'Data type is correct: projects.tenant_id is already UUID';
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
        WHERE constraint_name = 'projects_tenant_id_fkey' 
        AND table_name = 'projects'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE projects DROP CONSTRAINT projects_tenant_id_fkey;
        RAISE NOTICE 'Dropped existing projects_tenant_id_fkey constraint';
    END IF;
    
    -- Create the constraint fresh
    BEGIN
        ALTER TABLE projects 
        ADD CONSTRAINT projects_tenant_id_fkey 
        FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Created projects_tenant_id_fkey constraint successfully';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating constraint: %', SQLERRM;
        -- Check if there are orphaned projects causing the issue
        IF EXISTS (
            SELECT 1 
            FROM projects p
            LEFT JOIN tenants t ON p.tenant_id = t.id
            WHERE t.id IS NULL AND p.tenant_id IS NOT NULL
        ) THEN
            RAISE NOTICE 'WARNING: Found orphaned projects with invalid tenant_id. These need to be fixed before constraint can be created.';
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
    AND tc.table_name = 'projects'
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


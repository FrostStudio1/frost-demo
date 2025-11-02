-- ============================================================================
-- Fix Projects Foreign Key Constraint
-- ============================================================================
-- Detta script kontrollerar och fixar foreign key constraint för projects.tenant_id
-- Kör denna SQL i Supabase SQL Editor
-- ============================================================================

-- 1. Kolla om constraint finns
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'projects'
    AND kcu.column_name = 'tenant_id';

-- 2. Om constraint inte finns, skapa den (idempotent)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'projects_tenant_id_fkey' 
        AND table_name = 'projects'
    ) THEN
        ALTER TABLE projects 
        ADD CONSTRAINT projects_tenant_id_fkey 
        FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) 
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint created successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- 3. Verifiera att constraint är korrekt konfigurerad
SELECT 
    constraint_name, 
    table_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'projects' 
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%tenant%';

-- 4. DEBUGGING: Kolla om det finns projekt med ogiltiga tenant_id
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.tenant_id,
    t.id as tenant_exists,
    t.name as tenant_name
FROM projects p
LEFT JOIN tenants t ON p.tenant_id = t.id
WHERE t.id IS NULL
LIMIT 10;

-- 5. DEBUGGING: Kolla alla tenants för referens
SELECT id, name, created_at 
FROM tenants 
ORDER BY created_at DESC 
LIMIT 10;


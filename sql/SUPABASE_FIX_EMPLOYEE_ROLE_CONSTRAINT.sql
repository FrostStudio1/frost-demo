-- Fix employees role constraint to ensure it accepts lowercase values
-- This script checks and fixes the role constraint if needed

-- First, check what the current constraint is
DO $$
DECLARE
    constraint_name TEXT;
    constraint_def TEXT;
BEGIN
    SELECT conname, pg_get_constraintdef(oid)
    INTO constraint_name, constraint_def
    FROM pg_constraint
    WHERE conrelid = 'public.employees'::regclass
    AND contype = 'c'
    AND conname LIKE '%role%';
    
    RAISE NOTICE 'Current constraint: % = %', constraint_name, constraint_def;
END $$;

-- Drop existing constraint if it exists (handle both possible names)
DO $$
BEGIN
    -- Try to drop employees_role_check
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.employees'::regclass 
        AND conname = 'employees_role_check'
    ) THEN
        ALTER TABLE public.employees DROP CONSTRAINT employees_role_check;
        RAISE NOTICE 'Dropped constraint: employees_role_check';
    END IF;
    
    -- Try to drop any other role check constraint
    FOR constraint_name IN 
        SELECT conname FROM pg_constraint
        WHERE conrelid = 'public.employees'::regclass
        AND contype = 'c'
        AND conname LIKE '%role%'
    LOOP
        EXECUTE format('ALTER TABLE public.employees DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
END $$;

-- Add new constraint that accepts lowercase values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.employees'::regclass
        AND conname = 'employees_role_check'
    ) THEN
        ALTER TABLE public.employees 
        ADD CONSTRAINT employees_role_check 
        CHECK (role IN ('employee', 'admin', 'Employee', 'Admin'));
        
        RAISE NOTICE 'Added constraint: employees_role_check with values (employee, admin, Employee, Admin)';
    END IF;
END $$;

-- Verify the constraint
DO $$
DECLARE
    constraint_def TEXT;
BEGIN
    SELECT pg_get_constraintdef(oid)
    INTO constraint_def
    FROM pg_constraint
    WHERE conrelid = 'public.employees'::regclass
    AND conname = 'employees_role_check';
    
    RAISE NOTICE 'Final constraint definition: %', constraint_def;
END $$;

-- Show all current employees and their roles for debugging
SELECT 
    id,
    name,
    full_name,
    role,
    tenant_id,
    CASE 
        WHEN role IN ('employee', 'admin', 'Employee', 'Admin') THEN '✅ Valid'
        ELSE '❌ Invalid'
    END as role_status
FROM public.employees
ORDER BY created_at DESC
LIMIT 10;


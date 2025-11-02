-- ============================================================================
-- VERIFY FOREIGN KEY CONSTRAINTS ARE CORRECTLY SET UP
-- ============================================================================
-- This checks that the foreign key constraints are properly configured
-- ============================================================================

-- 1. Check constraint definitions
SELECT 
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table,
  a1.attname as column_name,
  a2.attname as referenced_column,
  condeferrable,
  condeferred
FROM pg_constraint c
JOIN pg_attribute a1 ON a1.attrelid = c.conrelid AND a1.attnum = ANY(c.conkey)
JOIN pg_attribute a2 ON a2.attrelid = c.confrelid AND a2.attnum = ANY(c.confkey)
WHERE conname IN (
  'invoices_tenant_id_fkey',
  'rot_applications_tenant_id_fkey',
  'time_entries_tenant_id_fkey'
)
AND connamespace = 'public'::regnamespace;

-- 2. Check if tenant exists and can be selected
SELECT 
  'Tenant check' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.tenants 
      WHERE id = '8ee28f55-b780-4286-8137-9e70ea58ae56'
    ) THEN '✅ EXISTS'
    ELSE '❌ NOT FOUND'
  END as status,
  (SELECT name FROM public.tenants WHERE id = '8ee28f55-b780-4286-8137-9e70ea58ae56') as tenant_name;

-- 3. Test inserting a dummy row (will be rolled back)
-- This will tell us if the constraint is working
BEGIN;
  -- Try to insert into invoices with the tenant_id
  INSERT INTO public.invoices (tenant_id, amount, status)
  VALUES ('8ee28f55-b780-4286-8137-9e70ea58ae56', 0, 'draft')
  RETURNING id, tenant_id;
ROLLBACK;

-- 4. Check for any orphaned records that might be blocking constraint creation
SELECT 
  'invoices' as table_name,
  COUNT(*) as orphaned_count
FROM public.invoices i
WHERE i.tenant_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.tenants t WHERE t.id = i.tenant_id
  );

SELECT 
  'rot_applications' as table_name,
  COUNT(*) as orphaned_count
FROM public.rot_applications r
WHERE r.tenant_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.tenants t WHERE t.id = r.tenant_id
  );

-- 5. Drop and recreate constraints with explicit validation
-- ============================================================================
-- If orphaned records exist, fix them first, then run this:

DO $$
BEGIN
  -- Drop invoices constraint
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_tenant_id_fkey'
  ) THEN
    ALTER TABLE public.invoices DROP CONSTRAINT invoices_tenant_id_fkey;
    RAISE NOTICE '✅ Dropped invoices_tenant_id_fkey';
  END IF;
  
  -- Recreate with NOT VALID first (allows existing invalid data)
  ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_tenant_id_fkey
  FOREIGN KEY (tenant_id) 
  REFERENCES public.tenants(id) 
  ON DELETE CASCADE
  NOT VALID;
  
  -- Then validate it (this will fail if there are orphaned records)
  ALTER TABLE public.invoices
  VALIDATE CONSTRAINT invoices_tenant_id_fkey;
  
  RAISE NOTICE '✅ Created and validated invoices_tenant_id_fkey';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error with invoices constraint: %', SQLERRM;
END $$;

DO $$
BEGIN
  -- Drop rot_applications constraint
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'rot_applications_tenant_id_fkey'
  ) THEN
    ALTER TABLE public.rot_applications DROP CONSTRAINT rot_applications_tenant_id_fkey;
    RAISE NOTICE '✅ Dropped rot_applications_tenant_id_fkey';
  END IF;
  
  -- Recreate with NOT VALID first
  ALTER TABLE public.rot_applications
  ADD CONSTRAINT rot_applications_tenant_id_fkey
  FOREIGN KEY (tenant_id) 
  REFERENCES public.tenants(id) 
  ON DELETE CASCADE
  NOT VALID;
  
  -- Then validate it
  ALTER TABLE public.rot_applications
  VALIDATE CONSTRAINT rot_applications_tenant_id_fkey;
  
  RAISE NOTICE '✅ Created and validated rot_applications_tenant_id_fkey';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error with rot_applications constraint: %', SQLERRM;
END $$;


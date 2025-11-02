-- ============================================================================
-- FIX FOREIGN KEY CONSTRAINTS FOR invoices AND rot_applications
-- ============================================================================
-- This script diagnoses and fixes foreign key constraint issues for
-- invoices_tenant_id_fkey and rot_applications_tenant_id_fkey
-- ============================================================================

-- 1. CHECK IF TENANT EXISTS
-- ============================================================================
DO $$
DECLARE
  tenant_uuid UUID := '8ee28f55-b780-4286-8137-9e70ea58ae56';
  tenant_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.tenants WHERE id = tenant_uuid) INTO tenant_exists;
  
  IF tenant_exists THEN
    RAISE NOTICE '✅ Tenant % EXISTS in tenants table', tenant_uuid;
  ELSE
    RAISE WARNING '❌ Tenant % DOES NOT EXIST in tenants table!', tenant_uuid;
    RAISE NOTICE 'Available tenants:';
    FOR tenant_rec IN SELECT id, name FROM public.tenants LIMIT 10 LOOP
      RAISE NOTICE '  - %: %', tenant_rec.id, tenant_rec.name;
    END LOOP;
  END IF;
END $$;

-- 2. CHECK FOR ORPHANED invoices
-- ============================================================================
SELECT 
  'invoices' as table_name,
  COUNT(*) as orphaned_count,
  ARRAY_AGG(id) FILTER (WHERE id IS NOT NULL) as sample_ids
FROM public.invoices i
WHERE i.tenant_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.tenants t WHERE t.id = i.tenant_id
  );

-- 3. CHECK FOR ORPHANED rot_applications
-- ============================================================================
SELECT 
  'rot_applications' as table_name,
  COUNT(*) as orphaned_count,
  ARRAY_AGG(id) FILTER (WHERE id IS NOT NULL) as sample_ids
FROM public.rot_applications r
WHERE r.tenant_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.tenants t WHERE t.id = r.tenant_id
  );

-- 4. CHECK FOREIGN KEY CONSTRAINT STATUS
-- ============================================================================
SELECT 
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table,
  CASE 
    WHEN contype = 'f' THEN 'FOREIGN KEY'
    ELSE contype::text
  END as constraint_type
FROM pg_constraint
WHERE conname IN ('invoices_tenant_id_fkey', 'rot_applications_tenant_id_fkey')
  AND connamespace = 'public'::regnamespace;

-- 5. DROP AND RECREATE invoices_tenant_id_fkey IF NEEDED
-- ============================================================================
DO $$
BEGIN
  -- Drop constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_tenant_id_fkey'
  ) THEN
    ALTER TABLE public.invoices DROP CONSTRAINT invoices_tenant_id_fkey;
    RAISE NOTICE '✅ Dropped invoices_tenant_id_fkey constraint';
  END IF;
  
  -- Recreate constraint
  ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_tenant_id_fkey
  FOREIGN KEY (tenant_id) 
  REFERENCES public.tenants(id) 
  ON DELETE CASCADE;
  
  RAISE NOTICE '✅ Created invoices_tenant_id_fkey constraint';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Could not recreate invoices_tenant_id_fkey: %', SQLERRM;
END $$;

-- 6. DROP AND RECREATE rot_applications_tenant_id_fkey IF NEEDED
-- ============================================================================
DO $$
BEGIN
  -- Drop constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'rot_applications_tenant_id_fkey'
  ) THEN
    ALTER TABLE public.rot_applications DROP CONSTRAINT rot_applications_tenant_id_fkey;
    RAISE NOTICE '✅ Dropped rot_applications_tenant_id_fkey constraint';
  END IF;
  
  -- Recreate constraint
  ALTER TABLE public.rot_applications
  ADD CONSTRAINT rot_applications_tenant_id_fkey
  FOREIGN KEY (tenant_id) 
  REFERENCES public.tenants(id) 
  ON DELETE CASCADE;
  
  RAISE NOTICE '✅ Created rot_applications_tenant_id_fkey constraint';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Could not recreate rot_applications_tenant_id_fkey: %', SQLERRM;
END $$;

-- 7. VALIDATE CONSTRAINTS
-- ============================================================================
SELECT 
  'invoices_tenant_id_fkey' as constraint_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'invoices_tenant_id_fkey'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

SELECT 
  'rot_applications_tenant_id_fkey' as constraint_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'rot_applications_tenant_id_fkey'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- 8. FINAL CHECK: LIST ALL TENANTS
-- ============================================================================
SELECT 
  'All tenants in database:' as info,
  id,
  name,
  created_at
FROM public.tenants
ORDER BY created_at DESC
LIMIT 10;


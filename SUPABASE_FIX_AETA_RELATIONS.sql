-- ============================================================================
-- FIX AETA_REQUESTS TABLE - Verifiera foreign key relations
-- ============================================================================
-- Kör denna SQL i Supabase SQL Editor för att verifiera/åtgärda relations
-- ============================================================================

-- Verifiera att project_id foreign key finns
DO $$ 
BEGIN
  -- Check if foreign key constraint exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public' 
    AND table_name = 'aeta_requests' 
    AND constraint_name LIKE '%project_id%fkey%'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    -- Add foreign key if it doesn't exist (should already exist from CREATE TABLE)
    -- This is just a verification script - the FK should already be there
    RAISE NOTICE 'Foreign key constraint for project_id should already exist from CREATE TABLE statement';
  END IF;
END $$;

-- Verifiera att employee_id foreign key finns
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public' 
    AND table_name = 'aeta_requests' 
    AND constraint_name LIKE '%employee_id%fkey%'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    RAISE NOTICE 'Foreign key constraint for employee_id should already exist from CREATE TABLE statement';
  END IF;
END $$;

-- ============================================================================
-- OM RELATIONER SAKNAS - Skapa dem manuellt
-- ============================================================================
-- Kör dessa ALTER TABLE statements OM foreign keys saknas:

-- ALTER TABLE public.aeta_requests 
--   ADD CONSTRAINT aeta_requests_project_id_fkey 
--   FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- ALTER TABLE public.aeta_requests 
--   ADD CONSTRAINT aeta_requests_employee_id_fkey 
--   FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;

-- ============================================================================
-- NOTERA: Om foreign keys redan finns från CREATE TABLE, behövs inte ovanstående.
-- Problemet kan vara att Supabase cache behöver uppdateras.
-- Försök: 
-- 1. Vänta några sekunder och prova igen
-- 2. Uppdatera Supabase dashboard -> Table Editor -> Refresh
-- 3. Koden är redan uppdaterad för att hantera saknade relationer
-- ============================================================================


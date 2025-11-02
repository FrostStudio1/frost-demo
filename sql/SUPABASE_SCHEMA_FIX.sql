-- ============================================================================
-- FIX SCHEMA COLUMNS - Köre denna SQL i Supabase SQL Editor
-- ============================================================================
-- Denna migration fixar alla saknade kolumner och schema-problem
-- Kör hela filen i Supabase Dashboard → SQL Editor
-- ============================================================================

-- 1. FIX EMPLOYEES TABLE
-- ============================================================================

-- Lägg till 'name' kolumn om den saknas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.employees ADD COLUMN name TEXT;
    -- Om full_name finns, kopiera data dit
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'employees' 
      AND column_name = 'full_name'
    ) THEN
      UPDATE public.employees SET name = full_name WHERE name IS NULL AND full_name IS NOT NULL;
    END IF;
  END IF;
END $$;

-- Lägg till 'full_name' kolumn om den saknas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.employees ADD COLUMN full_name TEXT;
    UPDATE public.employees SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL;
  ELSE
    -- Synka full_name från name om name just lades till
    UPDATE public.employees SET full_name = name WHERE (full_name IS NULL OR full_name = '') AND name IS NOT NULL;
  END IF;
END $$;

-- Lägg till 'email' kolumn (nullable)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.employees ADD COLUMN email TEXT;
  END IF;
END $$;

-- Lägg till 'role' kolumn om den saknas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.employees ADD COLUMN role TEXT DEFAULT 'employee' 
    CHECK (role IN ('employee', 'admin', 'Employee', 'Admin'));
  END IF;
END $$;

-- ============================================================================
-- 2. FIX CLIENTS TABLE
-- ============================================================================

-- Lägg till 'org_number' kolumn (nullable för privata kunder)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'org_number'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN org_number TEXT;
  END IF;
END $$;

-- ============================================================================
-- 3. FIX PROJECTS TABLE
-- ============================================================================

-- Lägg till 'status' kolumn
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN status TEXT DEFAULT 'active' 
    CHECK (status IN ('planned', 'active', 'completed', 'archived'));
    UPDATE public.projects SET status = 'active' WHERE status IS NULL;
  END IF;
END $$;

-- Lägg till 'client_id' kolumn (foreign key till clients)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'client_id'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
  END IF;
END $$;

-- ============================================================================
-- 4. FIX INVOICES TABLE
-- ============================================================================

-- Lägg till 'amount' kolumn
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'amount'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN amount DECIMAL(10,2);
  END IF;
END $$;

-- Lägg till 'status' kolumn
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN status TEXT DEFAULT 'draft' 
    CHECK (status IN ('draft', 'sent', 'paid', 'cancelled'));
    UPDATE public.invoices SET status = 'draft' WHERE status IS NULL;
  END IF;
END $$;

-- Lägg till 'issue_date' kolumn
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'issue_date'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN issue_date DATE;
    UPDATE public.invoices SET issue_date = CURRENT_DATE WHERE issue_date IS NULL;
  END IF;
END $$;

-- Lägg till 'client_id' kolumn för att länka till clients
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'client_id'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
  END IF;
END $$;

-- ============================================================================
-- 5. FIX AETA_REQUESTS TABLE - LÄGG TILL BIFOGNINGSUPPORT
-- ============================================================================

-- Lägg till 'attachment_url' för filbifogningar
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aeta_requests' 
    AND column_name = 'attachment_url'
  ) THEN
    ALTER TABLE public.aeta_requests ADD COLUMN attachment_url TEXT;
  END IF;
END $$;

-- Lägg till 'attachment_name' för originalfilnamn
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'aeta_requests' 
    AND column_name = 'attachment_name'
  ) THEN
    ALTER TABLE public.aeta_requests ADD COLUMN attachment_name TEXT;
  END IF;
END $$;

-- ============================================================================
-- 6. SKAPA INDEX FÖR PRESTANDA
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_employees_name ON public.employees(name) WHERE name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_role ON public.employees(role) WHERE role IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status) WHERE status IS NOT NULL;

-- ============================================================================
-- 7. TRIGGER FÖR ATT SYNKA NAME OCH FULL_NAME
-- ============================================================================

-- Funktion för att synka name och full_name
CREATE OR REPLACE FUNCTION sync_employee_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Om name uppdateras, synka till full_name om det är tomt
  IF TG_OP = 'UPDATE' AND NEW.name IS NOT NULL AND (NEW.full_name IS NULL OR NEW.full_name = '') THEN
    NEW.full_name = NEW.name;
  END IF;
  
  -- Om full_name uppdateras, synka till name om det är tomt
  IF TG_OP = 'UPDATE' AND NEW.full_name IS NOT NULL AND (NEW.name IS NULL OR NEW.name = '') THEN
    NEW.name = NEW.full_name;
  END IF;
  
  -- Vid INSERT, se till att båda är satta
  IF TG_OP = 'INSERT' THEN
    IF NEW.name IS NOT NULL AND (NEW.full_name IS NULL OR NEW.full_name = '') THEN
      NEW.full_name = NEW.name;
    ELSIF NEW.full_name IS NOT NULL AND (NEW.name IS NULL OR NEW.name = '') THEN
      NEW.name = NEW.full_name;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ta bort trigger om den finns och skapa ny
DROP TRIGGER IF EXISTS trigger_sync_employee_name ON public.employees;
CREATE TRIGGER trigger_sync_employee_name
  BEFORE INSERT OR UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION sync_employee_name();

-- ============================================================================
-- KLART! Alla kolumner är nu fixade.
-- ============================================================================


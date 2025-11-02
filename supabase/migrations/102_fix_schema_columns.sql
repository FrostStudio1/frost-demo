-- Migration: Fix schema column issues and add missing columns
-- This migration ensures all required columns exist and fixes naming inconsistencies

-- ============================================================================
-- 1. FIX EMPLOYEES TABLE
-- ============================================================================

-- Ensure employees table has both 'name' and 'full_name' columns
-- Standardize on 'name' as primary, but support both for compatibility

-- Add 'name' column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'name'
  ) THEN
    -- If full_name exists, copy data to name, otherwise add as nullable
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'employees' 
      AND column_name = 'full_name'
    ) THEN
      ALTER TABLE public.employees ADD COLUMN name TEXT;
      UPDATE public.employees SET name = full_name WHERE name IS NULL AND full_name IS NOT NULL;
    ELSE
      ALTER TABLE public.employees ADD COLUMN name TEXT;
    END IF;
  END IF;
END $$;

-- Add 'full_name' column if it doesn't exist (for backward compatibility)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.employees ADD COLUMN full_name TEXT;
    -- Copy data from name to full_name if name exists
    UPDATE public.employees SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL;
  ELSE
    -- Sync full_name from name if name was just added
    UPDATE public.employees SET full_name = name WHERE (full_name IS NULL OR full_name = '') AND name IS NOT NULL;
  END IF;
END $$;

-- Ensure 'email' column exists (nullable)
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

-- Ensure 'role' column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.employees ADD COLUMN role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'admin', 'Employee', 'Admin'));
  END IF;
END $$;

-- ============================================================================
-- 2. FIX CLIENTS TABLE
-- ============================================================================

-- Add 'org_number' column if it doesn't exist (nullable - for private customers)
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

-- Add 'status' column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN status TEXT DEFAULT 'planned' 
    CHECK (status IN ('planned', 'active', 'completed', 'archived'));
    
    -- Set existing projects to 'active' by default
    UPDATE public.projects SET status = 'active' WHERE status IS NULL;
  END IF;
END $$;

-- Ensure 'client_id' column exists (foreign key to clients)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'client_id'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
    
    -- Create index for performance
    CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
  END IF;
END $$;

-- ============================================================================
-- 4. FIX INVOICES TABLE
-- ============================================================================

-- Add 'amount' column if it doesn't exist
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

-- Add 'status' column if it doesn't exist
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
    
    -- Set existing invoices to 'draft' by default
    UPDATE public.invoices SET status = 'draft' WHERE status IS NULL;
  END IF;
END $$;

-- Add 'issue_date' column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'issue_date'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN issue_date DATE;
    -- Set existing invoices to today's date if null
    UPDATE public.invoices SET issue_date = CURRENT_DATE WHERE issue_date IS NULL;
  END IF;
END $$;

-- Add 'client_id' column for linking to clients table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'client_id'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
    
    -- Create index for performance
    CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
  END IF;
END $$;

-- ============================================================================
-- 5. FIX AETA_REQUESTS TABLE - ADD ATTACHMENT SUPPORT
-- ============================================================================

-- Add 'attachment_url' column for file attachments
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

-- Add 'attachment_name' column for original filename
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
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index on employees.name for faster lookups
CREATE INDEX IF NOT EXISTS idx_employees_name ON public.employees(name) WHERE name IS NOT NULL;

-- Index on employees.role for admin queries
CREATE INDEX IF NOT EXISTS idx_employees_role ON public.employees(role) WHERE role IS NOT NULL;

-- Index on projects.status for filtering
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status) WHERE status IS NOT NULL;

-- Index on invoices.status for filtering
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status) WHERE status IS NOT NULL;

-- ============================================================================
-- 7. CREATE TRIGGERS FOR DATA SYNC
-- ============================================================================

-- Trigger to sync name and full_name in employees table
CREATE OR REPLACE FUNCTION sync_employee_name()
RETURNS TRIGGER AS $$
BEGIN
  -- If name is updated, sync to full_name if it's empty
  IF TG_OP = 'UPDATE' AND NEW.name IS NOT NULL AND (NEW.full_name IS NULL OR NEW.full_name = '') THEN
    NEW.full_name = NEW.name;
  END IF;
  
  -- If full_name is updated, sync to name if it's empty
  IF TG_OP = 'UPDATE' AND NEW.full_name IS NOT NULL AND (NEW.name IS NULL OR NEW.name = '') THEN
    NEW.name = NEW.full_name;
  END IF;
  
  -- On INSERT, ensure both are set
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

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_sync_employee_name ON public.employees;
CREATE TRIGGER trigger_sync_employee_name
  BEFORE INSERT OR UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION sync_employee_name();

-- ============================================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.employees.name IS 'Primary name field for employee';
COMMENT ON COLUMN public.employees.full_name IS 'Full name (synced with name for compatibility)';
COMMENT ON COLUMN public.clients.org_number IS 'Organization number (null for private customers)';
COMMENT ON COLUMN public.projects.status IS 'Project status: planned, active, completed, archived';
COMMENT ON COLUMN public.invoices.amount IS 'Total invoice amount in SEK';
COMMENT ON COLUMN public.invoices.status IS 'Invoice status: draft, sent, paid, cancelled';
COMMENT ON COLUMN public.aeta_requests.attachment_url IS 'URL to uploaded attachment file (Supabase Storage)';
COMMENT ON COLUMN public.aeta_requests.attachment_name IS 'Original filename of uploaded attachment';


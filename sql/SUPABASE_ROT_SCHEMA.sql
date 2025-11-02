-- ============================================================================
-- ROT-AVDRAG SCHEMA - Skapa tabeller för ROT-avdragsfunktion
-- ============================================================================
-- Kör denna SQL i Supabase SQL Editor
-- ============================================================================

-- 1. ROT APPLICATIONS TABELL
-- ============================================================================
-- OBS: Detta script kan köras flera gånger utan problem (idempotent)
CREATE TABLE IF NOT EXISTS public.rot_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL, -- Koppling till faktura
  
  -- Ansökningsdata (SKV 5017)
  customer_person_number TEXT NOT NULL, -- Personnummer (krypterad)
  property_designation TEXT NOT NULL, -- Fastighetsbeteckning
  work_type TEXT NOT NULL, -- Arbetstyp (renovering, reparation, etc.)
  work_cost_sek NUMERIC(10,2) NOT NULL, -- Arbetskostnad
  material_cost_sek NUMERIC(10,2) NOT NULL DEFAULT 0, -- Materialkostnad
  total_cost_sek NUMERIC(10,2) NOT NULL, -- Totalkostnad
  
  -- Skatteverket data
  case_number TEXT, -- Ärendenummer från Skatteverket
  reference_id TEXT, -- Referens-ID från API
  submission_date TIMESTAMPTZ, -- När ansökan skickades
  last_status_check TIMESTAMPTZ, -- Senaste statuskontroll
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', -- Utkast
    'submitted', -- Inskickad
    'under_review', -- Under handläggning
    'approved', -- Godkänd
    'rejected', -- Avslagen
    'appealed', -- Överklagad
    'closed' -- Avslutad
  )),
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- GDPR och säkerhet
  encrypted_person_number BYTEA, -- Krypterat personnummer (för framtida kryptering)
  
  CONSTRAINT fk_rot_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);

-- 2. ROT STATUS HISTORY TABELL
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rot_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rot_application_id UUID NOT NULL REFERENCES public.rot_applications(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL,
  status_message TEXT, -- Meddelande från Skatteverket
  rejection_reason TEXT, -- Orsak vid avslag
  decision_date TIMESTAMPTZ, -- Beslutsdatum
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_rot_status_app FOREIGN KEY (rot_application_id) REFERENCES public.rot_applications(id)
);

-- 3. ROT API LOGS TABELL (för debugging och efterlevnad)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rot_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rot_application_id UUID REFERENCES public.rot_applications(id) ON DELETE SET NULL,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  api_endpoint TEXT NOT NULL,
  http_method TEXT NOT NULL,
  request_body JSONB,
  response_body JSONB,
  response_status INTEGER,
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ADD MISSING COLUMNS (if not already added)
-- ============================================================================
-- Ensure invoice_id column exists before creating index
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'rot_applications' 
    AND column_name = 'invoice_id'
  ) THEN
    ALTER TABLE public.rot_applications 
    ADD COLUMN invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. INDEXES
-- ============================================================================
-- All indexes use IF NOT EXISTS, so they're safe to run multiple times
CREATE INDEX IF NOT EXISTS idx_rot_applications_tenant ON public.rot_applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rot_applications_project ON public.rot_applications(project_id);
CREATE INDEX IF NOT EXISTS idx_rot_applications_client ON public.rot_applications(client_id);
CREATE INDEX IF NOT EXISTS idx_rot_applications_status ON public.rot_applications(status);
CREATE INDEX IF NOT EXISTS idx_rot_applications_case_number ON public.rot_applications(case_number);
CREATE INDEX IF NOT EXISTS idx_rot_applications_invoice ON public.rot_applications(invoice_id) WHERE invoice_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rot_status_history_app ON public.rot_status_history(rot_application_id);
CREATE INDEX IF NOT EXISTS idx_rot_api_logs_tenant ON public.rot_api_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rot_api_logs_application ON public.rot_api_logs(rot_application_id);

-- 6. TRIGGERS
-- ============================================================================
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_rot_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS trigger_update_rot_applications_updated_at ON public.rot_applications;
CREATE TRIGGER trigger_update_rot_applications_updated_at
  BEFORE UPDATE ON public.rot_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_rot_updated_at();

-- Auto-create status history entry
CREATE OR REPLACE FUNCTION log_rot_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.rot_status_history (
      rot_application_id,
      status,
      created_at
    ) VALUES (
      NEW.id,
      NEW.status,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS trigger_log_rot_status_change ON public.rot_applications;
CREATE TRIGGER trigger_log_rot_status_change
  AFTER UPDATE OF status ON public.rot_applications
  FOR EACH ROW
  EXECUTE FUNCTION log_rot_status_change();

-- 7. RLS POLICIES
-- ============================================================================
ALTER TABLE public.rot_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rot_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rot_api_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view ROT applications from their tenant" ON public.rot_applications;
DROP POLICY IF EXISTS "Users can insert ROT applications for their tenant" ON public.rot_applications;
DROP POLICY IF EXISTS "Users can update ROT applications from their tenant" ON public.rot_applications;
DROP POLICY IF EXISTS "Users can view ROT status history from their tenant" ON public.rot_status_history;
DROP POLICY IF EXISTS "Users can insert ROT status history for their tenant" ON public.rot_status_history;
DROP POLICY IF EXISTS "Users can view ROT API logs from their tenant" ON public.rot_api_logs;

-- Users can only see ROT applications from their tenant
CREATE POLICY "Users can view ROT applications from their tenant"
  ON public.rot_applications FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.employees 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can insert ROT applications for their tenant
CREATE POLICY "Users can insert ROT applications for their tenant"
  ON public.rot_applications FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.employees 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can update ROT applications from their tenant
CREATE POLICY "Users can update ROT applications from their tenant"
  ON public.rot_applications FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.employees 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can view status history for their tenant's applications
CREATE POLICY "Users can view ROT status history from their tenant"
  ON public.rot_status_history FOR SELECT
  USING (
    rot_application_id IN (
      SELECT id FROM public.rot_applications 
      WHERE tenant_id IN (
        SELECT tenant_id FROM public.employees 
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Users can insert status history for their tenant's applications
CREATE POLICY "Users can insert ROT status history for their tenant"
  ON public.rot_status_history FOR INSERT
  WITH CHECK (
    rot_application_id IN (
      SELECT id FROM public.rot_applications 
      WHERE tenant_id IN (
        SELECT tenant_id FROM public.employees 
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Users can view API logs from their tenant
CREATE POLICY "Users can view ROT API logs from their tenant"
  ON public.rot_api_logs FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.employees 
      WHERE auth_user_id = auth.uid()
    )
  );

-- 8. COMMENTS (dokumentation)
-- ============================================================================
COMMENT ON TABLE public.rot_applications IS 'ROT-avdrag ansökningar enligt Skatteverkets SKV 5017';
COMMENT ON COLUMN public.rot_applications.customer_person_number IS 'Kundens personnummer (ska krypteras i produktion)';
COMMENT ON COLUMN public.rot_applications.status IS 'Status: draft, submitted, under_review, approved, rejected, appealed, closed';
COMMENT ON TABLE public.rot_status_history IS 'Statushistorik för ROT-ansökningar';
COMMENT ON TABLE public.rot_api_logs IS 'Logg över alla API-anrop till Skatteverket för debugging och efterlevnad';

-- ============================================================================
-- KLART! ROT-avdrag schema är nu skapat.
-- ============================================================================


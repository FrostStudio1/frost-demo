-- SCHEMA & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS app;

-- Set search_path to include app schema for Supabase client
-- This allows Supabase to access app schema tables without prefix
ALTER DATABASE current_database() SET search_path TO public, app;

-- Alternative: Create a function to set search_path for current session
CREATE OR REPLACE FUNCTION app.set_search_path()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('search_path', 'public, app', true);
END;
$$;

-- Helpers: updated_at trigger
CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ========= INTEGRATIONS =========
CREATE TABLE IF NOT EXISTS app.integrations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('fortnox','visma_eaccounting','visma_payroll')),
  status text NOT NULL DEFAULT 'disconnected' CHECK (status IN ('disconnected','connected','error')),
  client_id text NOT NULL,
  client_secret_encrypted text NOT NULL,
  access_token_encrypted text,
  refresh_token_encrypted text,
  scope text,
  expires_at timestamptz,
  webhook_secret_encrypted text,
  settings jsonb NOT NULL DEFAULT '{}' ,
  last_error text,
  last_synced_at timestamptz,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integrations_tenant ON app.integrations(tenant_id, provider);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON app.integrations(tenant_id, status);
CREATE TRIGGER trg_integrations_updated BEFORE UPDATE ON app.integrations
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

COMMENT ON TABLE app.integrations IS 'OAuth-konfigurationer + krypterade tokens per tenant och provider.';

-- ========= INTEGRATION JOBS =========
CREATE TABLE IF NOT EXISTS app.integration_jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES app.integrations(id) ON DELETE CASCADE,
  job_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','success','failed','retry')),
  attempts int NOT NULL DEFAULT 0,
  max_attempts int NOT NULL DEFAULT 5,
  last_error text,
  scheduled_at timestamptz DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integration_jobs_pick ON app.integration_jobs(tenant_id, status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_integration_jobs_integration ON app.integration_jobs(integration_id);
CREATE TRIGGER trg_integration_jobs_updated BEFORE UPDATE ON app.integration_jobs
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- ========= INTEGRATION MAPPINGS =========
CREATE TABLE IF NOT EXISTS app.integration_mappings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES app.integrations(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  local_id uuid NOT NULL,
  remote_id text NOT NULL,
  remote_extra jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, integration_id, entity_type, local_id),
  UNIQUE (tenant_id, integration_id, entity_type, remote_id)
);

CREATE INDEX IF NOT EXISTS idx_mappings_lookup_local  ON app.integration_mappings(tenant_id, integration_id, entity_type, local_id);
CREATE INDEX IF NOT EXISTS idx_mappings_lookup_remote ON app.integration_mappings(tenant_id, integration_id, entity_type, remote_id);
CREATE TRIGGER trg_integration_mappings_updated BEFORE UPDATE ON app.integration_mappings
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- ========= SYNC LOGS (AUDIT) =========
CREATE TABLE IF NOT EXISTS app.sync_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  integration_id uuid REFERENCES app.integrations(id) ON DELETE SET NULL,
  level text NOT NULL CHECK (level IN ('info','warn','error')),
  message text NOT NULL,
  context jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_tenant ON app.sync_logs(tenant_id, created_at DESC);

-- ========= PUBLIC VIEWS (för Supabase PostgREST API access) =========
-- Supabase PostgREST API hittar bara tabeller i public schema
-- Dessa VIEWs exponerar app schema tabeller via public schema för read-only access
-- För writes, använd app.integrations direkt via admin client

CREATE OR REPLACE VIEW public.integrations AS
SELECT 
  id,
  tenant_id,
  provider,
  status,
  scope,
  last_error,
  last_synced_at,
  created_at,
  updated_at
FROM app.integrations;

CREATE OR REPLACE VIEW public.integration_jobs AS
SELECT * FROM app.integration_jobs;

CREATE OR REPLACE VIEW public.integration_mappings AS
SELECT * FROM app.integration_mappings;

CREATE OR REPLACE VIEW public.sync_logs AS
SELECT * FROM app.sync_logs;

-- ========= RLS =========
ALTER TABLE app.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.integration_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.integration_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.sync_logs ENABLE ROW LEVEL SECURITY;

-- Ensure helper functions app.current_tenant_id() and app.is_admin() exist in your schema.
-- Admin: full read/write
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='integrations_admin_all') THEN
    CREATE POLICY integrations_admin_all ON app.integrations
      USING (tenant_id = app.current_tenant_id() AND app.is_admin())
      WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='jobs_admin_all') THEN
    CREATE POLICY jobs_admin_all ON app.integration_jobs
      USING (tenant_id = app.current_tenant_id() AND app.is_admin())
      WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='mappings_admin_all') THEN
    CREATE POLICY mappings_admin_all ON app.integration_mappings
      USING (tenant_id = app.current_tenant_id() AND app.is_admin())
      WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='logs_admin_all') THEN
    CREATE POLICY logs_admin_all ON app.sync_logs
      USING (tenant_id = app.current_tenant_id() AND app.is_admin())
      WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_admin());
  END IF;
  -- Employees: kan läsa begränsat status/loggar
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='integrations_read') THEN
    CREATE POLICY integrations_read ON app.integrations
      FOR SELECT USING (tenant_id = app.current_tenant_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='jobs_read') THEN
    CREATE POLICY jobs_read ON app.integration_jobs
      FOR SELECT USING (tenant_id = app.current_tenant_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='mappings_read') THEN
    CREATE POLICY mappings_read ON app.integration_mappings
      FOR SELECT USING (tenant_id = app.current_tenant_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='logs_read') THEN
    CREATE POLICY logs_read ON app.sync_logs
      FOR SELECT USING (tenant_id = app.current_tenant_id());
  END IF;
END$$;


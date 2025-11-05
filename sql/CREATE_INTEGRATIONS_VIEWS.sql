-- ========================================
-- CREATE PUBLIC VIEWS FOR INTEGRATIONS
-- ========================================
-- Supabase PostgREST API hittar bara tabeller i public schema
-- Dessa VIEWs exponerar app schema tabeller via public schema för read-only access
-- 
-- VIKTIGT: Kör detta EFTER CREATE_INTEGRATIONS_TABLES.sql
-- ========================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS public.integrations CASCADE;
DROP VIEW IF EXISTS public.integration_jobs CASCADE;
DROP VIEW IF EXISTS public.integration_mappings CASCADE;
DROP VIEW IF EXISTS public.sync_logs CASCADE;

-- ========= PUBLIC VIEWS =========

-- Integrations VIEW (read-only, visar inte känsliga fält)
CREATE VIEW public.integrations AS
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

-- Integration Jobs VIEW
CREATE VIEW public.integration_jobs AS
SELECT * FROM app.integration_jobs;

-- Integration Mappings VIEW
CREATE VIEW public.integration_mappings AS
SELECT * FROM app.integration_mappings;

-- Sync Logs VIEW
CREATE VIEW public.sync_logs AS
SELECT * FROM app.sync_logs;

-- Grant permissions
GRANT SELECT ON public.integrations TO authenticated;
GRANT SELECT ON public.integration_jobs TO authenticated;
GRANT SELECT ON public.integration_mappings TO authenticated;
GRANT SELECT ON public.sync_logs TO authenticated;

COMMENT ON VIEW public.integrations IS 'Public view for Supabase PostgREST API access to app.integrations';
COMMENT ON VIEW public.integration_jobs IS 'Public view for Supabase PostgREST API access to app.integration_jobs';
COMMENT ON VIEW public.integration_mappings IS 'Public view for Supabase PostgREST API access to app.integration_mappings';
COMMENT ON VIEW public.sync_logs IS 'Public view for Supabase PostgREST API access to app.sync_logs';


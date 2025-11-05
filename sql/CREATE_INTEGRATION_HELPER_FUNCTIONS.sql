-- ========================================
-- HELPER FUNCTIONS FOR INTEGRATIONS
-- ========================================
-- Dessa funktioner låter oss skriva till app.integrations via Supabase RPC
-- eftersom Supabase PostgREST inte kan skriva direkt till app schema

-- Function för att skapa en ny integration
CREATE OR REPLACE FUNCTION public.create_integration(
  p_tenant_id uuid,
  p_provider text,
  p_status text,
  p_client_id text,
  p_client_secret_encrypted text,
  p_created_by uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app
AS $$
DECLARE
  v_integration_id uuid;
BEGIN
  INSERT INTO app.integrations (
    tenant_id,
    provider,
    status,
    client_id,
    client_secret_encrypted,
    created_by
  )
  VALUES (
    p_tenant_id,
    p_provider,
    p_status,
    p_client_id,
    p_client_secret_encrypted,
    p_created_by
  )
  RETURNING id INTO v_integration_id;
  
  RETURN v_integration_id;
END;
$$;

-- Function för att uppdatera integration status
CREATE OR REPLACE FUNCTION public.update_integration_status(
  p_integration_id uuid,
  p_status text,
  p_access_token_encrypted text DEFAULT NULL,
  p_refresh_token_encrypted text DEFAULT NULL,
  p_expires_at timestamptz DEFAULT NULL,
  p_scope text DEFAULT NULL,
  p_last_error text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app
AS $$
BEGIN
  UPDATE app.integrations
  SET 
    status = p_status,
    access_token_encrypted = COALESCE(p_access_token_encrypted, access_token_encrypted),
    refresh_token_encrypted = COALESCE(p_refresh_token_encrypted, refresh_token_encrypted),
    expires_at = COALESCE(p_expires_at, expires_at),
    scope = COALESCE(p_scope, scope),
    last_error = COALESCE(p_last_error, last_error),
    updated_at = now()
  WHERE id = p_integration_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_integration TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_integration_status TO authenticated;

COMMENT ON FUNCTION public.create_integration IS 'Skapar en ny integration i app.integrations';
COMMENT ON FUNCTION public.update_integration_status IS 'Uppdaterar status och tokens för en integration';


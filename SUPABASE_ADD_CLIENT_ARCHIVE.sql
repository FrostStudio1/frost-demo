-- ============================================================================
-- LÄGG TILL ARCHIVE-FUNKTIONALITET I CLIENTS-TABELLEN
-- ============================================================================
-- Kör denna SQL i Supabase SQL Editor för att lägga till archive-kolumn
-- ============================================================================

-- Lägg till archived kolumn om den saknas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'archived'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN archived BOOLEAN DEFAULT false;
    COMMENT ON COLUMN public.clients.archived IS 'Om kunden är arkiverad';
  END IF;
END $$;

-- Alternativt: Lägg till status kolumn (om du föredrar status-based)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN status TEXT DEFAULT 'active' 
    CHECK (status IN ('active', 'archived'));
    COMMENT ON COLUMN public.clients.status IS 'Kundens status: active eller archived';
    
    -- Sätt alla befintliga kunder till active
    UPDATE public.clients SET status = 'active' WHERE status IS NULL;
  END IF;
END $$;

-- Lägg till index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_clients_archived ON public.clients(archived);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_tenant_archived ON public.clients(tenant_id, archived);
CREATE INDEX IF NOT EXISTS idx_clients_tenant_status ON public.clients(tenant_id, status);

-- ============================================================================
-- KLART! Archive-funktionalitet är nu tillagd.
-- ============================================================================
-- Du kan nu:
-- - Arkivera kunder: UPDATE clients SET archived = true WHERE id = 'xxx'
-- - Återställa kunder: UPDATE clients SET archived = false WHERE id = 'xxx'
-- - Eller använd status: UPDATE clients SET status = 'archived' WHERE id = 'xxx'
-- ============================================================================


-- ============================================================================
-- FIX INVOICES TABLE - Lägg till customer_name kolumn om den saknas
-- ============================================================================
-- Kör denna SQL i Supabase SQL Editor om customer_name kolumnen saknas
-- ============================================================================

-- Lägg till 'customer_name' kolumn om den inte finns
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN customer_name TEXT;
    
    -- Om det finns client_id, populera customer_name från clients tabellen
    UPDATE public.invoices i
    SET customer_name = c.name
    FROM public.clients c
    WHERE i.client_id = c.id
    AND i.customer_name IS NULL;
    
    -- Kommentar för dokumentation
    COMMENT ON COLUMN public.invoices.customer_name IS 'Kundens namn (deprecated - använd client_id istället)';
  END IF;
END $$;

-- ============================================================================
-- ALTERNATIV: Om du INTE vill ha customer_name kolumnen
-- ============================================================================
-- Kommentera ut koden ovan och använd istället client_id för att länka till clients tabellen.
-- App-koden är redan uppdaterad för att fungera både med och utan customer_name.
-- ============================================================================


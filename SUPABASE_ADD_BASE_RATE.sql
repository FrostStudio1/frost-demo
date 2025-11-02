-- ============================================================================
-- LÄGG TILL BASE_RATE_SEK I EMPLOYEES-TABELLEN
-- ============================================================================
-- Kör denna SQL i Supabase SQL Editor för att lägga till grundlön-kolumn
-- ============================================================================

-- Lägg till base_rate_sek kolumn om den saknas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'base_rate_sek'
  ) THEN
    ALTER TABLE public.employees ADD COLUMN base_rate_sek NUMERIC(10,2) DEFAULT 360;
    COMMENT ON COLUMN public.employees.base_rate_sek IS 'Grundlön per timme i SEK (byggkollektivavtalet)';
  END IF;
END $$;

-- Om default_rate_sek finns men base_rate_sek saknas, kopiera data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'default_rate_sek'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employees' 
    AND column_name = 'base_rate_sek'
  ) THEN
    UPDATE public.employees 
    SET base_rate_sek = COALESCE(default_rate_sek, 360)
    WHERE base_rate_sek IS NULL OR base_rate_sek = 0;
  END IF;
END $$;

-- ============================================================================
-- KLART! base_rate_sek kolumn är nu tillagd.
-- ============================================================================


-- ============================================================================
-- SKAPA STORAGE BUCKET FÖR BILAGOR (PROJEKT & FAKTUROR)
-- ============================================================================
-- Kör denna SQL i Supabase SQL Editor
-- ============================================================================

-- Skapa storage bucket för bilagor
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  true, -- Public bucket så att användare kan ladda ner bilagor
  10485760, -- 10 MB max filstorlek
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES - RLS för storage bucket
-- ============================================================================

-- Tillåt alla autentiserade användare att ladda upp filer
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'attachments' AND
  (
    -- User can upload to their tenant's folders
    (storage.foldername(name))[1] IN (
      SELECT tenant_id::text FROM employees WHERE auth_user_id = auth.uid()
    )
  )
)
ON CONFLICT (name) DO NOTHING;

-- Tillåt alla autentiserade användare att läsa filer från sin tenant
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'attachments' AND
  (
    -- User can read files from their tenant's folders
    (storage.foldername(name))[1] IN (
      SELECT tenant_id::text FROM employees WHERE auth_user_id = auth.uid()
    )
  )
)
ON CONFLICT (name) DO NOTHING;

-- Tillåt admins att ta bort filer
CREATE POLICY "Allow admin deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'attachments' AND
  EXISTS (
    SELECT 1 FROM employees 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'Admin')
    AND tenant_id::text = (storage.foldername(name))[1]
  )
)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- KLART! Storage bucket är nu skapad och konfigurerad.
-- ============================================================================
-- 
-- Filstruktur:
-- attachments/
--   project/
--     {project_id}/
--       {timestamp}_{filename}
--   invoice/
--     {invoice_id}/
--       {timestamp}_{filename}
--
-- ============================================================================


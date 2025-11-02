-- ============================================================================
-- SKAPA STORAGE BUCKET FÖR ÄTA-BIFOGNINGAR
-- ============================================================================
-- Kör denna SQL i Supabase SQL Editor EFTER att du har kört schema-fixen
-- ============================================================================

-- Skapa storage bucket för ÄTA-bifogningar
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'aeta-attachments',
  'aeta-attachments',
  true, -- Public bucket så att admins kan ladda ner bifogningar
  10485760, -- 10 MB max filstorlek
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
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
  bucket_id = 'aeta-attachments' AND
  (storage.foldername(name))[1] = (SELECT tenant_id::text FROM employees WHERE auth_user_id = auth.uid() LIMIT 1)
);

-- Tillåt alla autentiserade användare att läsa filer från sin tenant
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'aeta-attachments' AND
  (storage.foldername(name))[1] = (SELECT tenant_id::text FROM employees WHERE auth_user_id = auth.uid() LIMIT 1)
);

-- Tillåt admins att ta bort filer (om behövs)
CREATE POLICY "Allow admin deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'aeta-attachments' AND
  EXISTS (
    SELECT 1 FROM employees 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'Admin')
    AND tenant_id::text = (storage.foldername(name))[1]
  )
);

-- ============================================================================
-- KLART! Storage bucket är nu skapad och konfigurerad.
-- ============================================================================


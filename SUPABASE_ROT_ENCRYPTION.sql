-- ============================================================================
-- KRYPTERING AV PERSONNUMMER (GDPR/Säkerhet)
-- ============================================================================
-- Kör denna SQL i Supabase SQL Editor EFTER att ROT_SCHEMA är skapat
-- ============================================================================

-- Aktivera pgcrypto extension om den inte redan är aktiverad
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Skapa funktion för att kryptera personnummer
CREATE OR REPLACE FUNCTION encrypt_person_number(pnr TEXT)
RETURNS BYTEA AS $$
BEGIN
  -- Använd AES-256 encryption med en nyckel från miljövariabel
  -- I produktion: Använd Supabase Vault eller miljövariabel
  RETURN pgp_sym_encrypt(pnr, COALESCE(current_setting('app.encryption_key', true), 'default-key-change-in-production'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Skapa funktion för att dekryptera personnummer
CREATE OR REPLACE FUNCTION decrypt_person_number(encrypted BYTEA)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted, COALESCE(current_setting('app.encryption_key', true), 'default-key-change-in-production'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Uppdatera personnummer-kolumnen för att använda kryptering
-- OBS: Detta är en OPTIONELL förbättring. För nu kan vi bara använda TEXT och kryptera i app-koden.
-- För riktig kryptering i databasen behöver vi:
-- 1. Ändra customer_person_number till BYTEA
-- 2. Migrera befintlig data
-- 3. Uppdatera alla queries

-- ALTERNATIV: Kryptera i app-koden istället (enklare)
-- Se: lib/encryption.ts

-- ============================================================================
-- KLART!
-- ============================================================================


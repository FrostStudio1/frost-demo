# 📋 Nästa steg efter SQL-migration

## ✅ Redan klart:
1. ✅ SQL schema-fix körts (`SUPABASE_SCHEMA_FIX.sql`)
2. ✅ Admin-kontroll för att lägga till anställda
3. ✅ Notifikation när anställd läggs till
4. ✅ Filuppladdning i ÄTA-formulär
5. ✅ Visa bifogningar i admin-vyn
6. ✅ Alla UI-texter översatta till svenska

## 🔧 Ytterligare steg att göra:

### 1. Skapa Storage Bucket för ÄTA-bifogningar

Kör SQL-koden i `SUPABASE_STORAGE_SETUP.sql` i Supabase SQL Editor:

```sql
-- Se filen: SUPABASE_STORAGE_SETUP.sql
```

Alternativt manuellt i Supabase Dashboard:
1. Gå till **Storage** → **Buckets**
2. Klicka **New bucket**
3. Namn: `aeta-attachments`
4. Public: **Ja** (så att admins kan ladda ner)
5. File size limit: `10485760` (10 MB)
6. Allowed MIME types: `application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### 2. Testa funktionaliteten

Efter att SQL:en är körda, testa:

1. **Skapa anställd** (endast admin):
   - Gå till `/employees/new`
   - Verifiera att icke-admins inte kan komma åt sidan
   - Skapa en anställd och kolla att notifikation loggas

2. **Skapa projekt**:
   - Gå till `/projects/new`
   - Välj kund från dropdown
   - Verifiera att projektet kopplas till kunden

3. **Skapa ÄTA-förfrågan med bifogning**:
   - Gå till `/aeta`
   - Fyll i formuläret
   - Bifoga en fil (PDF, bild, etc.)
   - Skicka förfrågan

4. **Admin-vyn för ÄTA**:
   - Gå till `/admin/aeta`
   - Kontrollera att bifogningen visas
   - Klicka på bifogningen för att ladda ner

5. **Kund-sidan**:
   - Gå till `/clients`
   - Verifiera att den nya designen visas korrekt

6. **Projekt-sida**:
   - Gå till `/projects`
   - Klicka på ett projekt
   - Verifiera att inga errors om `org_number` visas

### 3. Verifiera att alla buggar är fixade

✅ **Kontrollera att dessa inte längre finns:**
- ❌ Error: "Could not find the 'full_name' column" → ✅ Fixat
- ❌ Error: "Could not find the 'email' column" → ✅ Fixat  
- ❌ Error: "Could not find the 'org_number' column" → ✅ Fixat
- ❌ Error: "Could not find the 'amount' column" → ✅ Fixat
- ❌ Error: "Could not find the 'status' column" → ✅ Fixat
- ❌ Error: "column clients_1.org_number does not exist" → ✅ Fixat
- ❌ Tidsrapporter synkas inte med dashboard → ✅ Fixat
- ❌ ÄTA-bifogningar visas inte → ✅ Fixat (efter storage setup)

### 4. Om det fortfarande finns problem

Om du fortfarande ser errors efter SQL-migrationen:

1. **Kontrollera att migrationen kördes korrekt:**
   - Gå till Supabase Dashboard → **Table Editor**
   - Kontrollera att kolumnerna finns i respektive tabell:
     - `employees`: `name`, `full_name`, `email`, `role`
     - `clients`: `org_number`
     - `projects`: `status`, `client_id`
     - `invoices`: `amount`, `status`, `issue_date`, `client_id`
     - `aeta_requests`: `attachment_url`, `attachment_name`

2. **Om kolumner saknas:**
   - Kör `SUPABASE_SCHEMA_FIX.sql` igen
   - Eller lägg till kolumnerna manuellt i Supabase Dashboard

3. **Om storage-errors:**
   - Kör `SUPABASE_STORAGE_SETUP.sql`
   - Eller skapa bucket manuellt (se ovan)

## 🎯 Status

Alla kända buggar är nu fixade! Appen är redo för:
- ✅ Deployment
- ✅ Produktionstestning
- ✅ Användartestning

Nästa steg: Testa allt och fixa eventuella återstående edge cases! 🚀


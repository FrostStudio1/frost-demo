# 🔧 Fix: "Could not find the table 'public.integrations'"

## Problem
Supabase PostgREST API kan inte hitta tabellen `app.integrations` eftersom den letar efter tabeller i `public` schema.

## Lösning

### Steg 1: Kör SQL-migrationen

1. Öppna **Supabase Dashboard** → **SQL Editor**
2. Kopiera innehållet från `sql/CREATE_INTEGRATIONS_TABLES.sql`
3. Klicka **Run** (eller tryck F5)

Denna fil skapar:
- Tabellerna i `app` schema
- VIEWs i `public` schema (så Supabase kan hitta dem)

### Steg 2: Verifiera att VIEWs skapades

Kör detta i SQL Editor för att kontrollera:

```sql
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'integration%'
ORDER BY table_name;
```

Du bör se:
- `integrations` (VIEW)
- `integration_jobs` (VIEW)
- `integration_mappings` (VIEW)
- `sync_logs` (VIEW)

### Steg 3: Testa API:et

1. Öppna `http://localhost:3000/api/integrations/check-table` i din webbläsare
2. Du bör se: `{"exists": true, "count": 0, ...}`

### Steg 4: Testa sidan

1. Gå till `http://localhost:3000/settings/integrations`
2. Du bör nu se sidan utan fel, eller "Inga integrationer är konfigurerade ännu"

## Om det fortfarande inte fungerar

1. **Kontrollera server console** - Titta efter felmeddelanden i terminalen
2. **Kontrollera Supabase logs** - Dashboard → Logs → Postgres Logs
3. **Kör diagnostic route**: `http://localhost:3000/api/integrations/check-table`

## Teknisk förklaring

Supabase PostgREST API använder sin egen schema cache och letar bara i `public` schema som standard. För att exponera `app` schema tabeller skapar vi VIEWs i `public` schema som pekar på de faktiska tabellerna i `app` schema.

- **READ**: Använder `public.integrations` VIEW (via Supabase client)
- **WRITE**: Använder `app.integrations` direkt (via admin client med service_role key)


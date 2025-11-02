# 🔧 Felsökning: Foreign Key Constraint Error

## Problem
```
Error: insert or update on table "time_entries" violates foreign key constraint "time_entries_tenant_id_fkey"
```

## Tenant ID från dina logs
`7d57f1cb-c33f-4317-96f7-0abac0f2aab6`

## Steg för att fixa:

### 1. Kontrollera om tenant finns i databasen

Kör denna SQL i Supabase SQL Editor:

```sql
-- Kontrollera om tenant finns
SELECT id, name, created_at 
FROM tenants 
WHERE id = '7d57f1cb-c33f-4317-96f7-0abac0f2aab6';
```

**Om den INTE finns:**
- Tenant saknas i databasen
- Lösning: Se steg 3 nedan

**Om den finns:**
- Tenant finns men foreign key constraint fungerar inte
- Lösning: Se steg 4 nedan

### 2. Kontrollera employee-record

```sql
-- Se vilket tenant_id din employee-record har
SELECT 
    e.id,
    e.full_name,
    e.tenant_id,
    e.auth_user_id,
    t.id AS tenant_exists
FROM employees e
LEFT JOIN tenants t ON t.id = e.tenant_id
WHERE e.auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
ORDER BY e.created_at DESC;
```

### 3. Om tenant saknas - Skapa den

```sql
-- Skapa tenant om den saknas
INSERT INTO tenants (id, name, created_at, updated_at)
VALUES (
  '7d57f1cb-c33f-4317-96f7-0abac0f2aab6',
  'Min Företag', -- Ändra till ditt företagsnamn
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
```

**ELLER** om din employee-record har ett annat tenant_id som finns:

```sql
-- Uppdatera employee-record att använda rätt tenant_id
UPDATE employees
SET tenant_id = 'DET_TENANT_ID_SOM_FINNS' -- Ersätt med tenant_id som finns
WHERE auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567';
```

### 4. Om tenant finns men constraint inte fungerar - Fixa constraint

Kör `SUPABASE_FIX_TIME_ENTRIES_FK.sql` i Supabase SQL Editor.

Eller kör manuellt:

```sql
-- Ta bort och skapa om constraint
DO $$ 
BEGIN
    -- Ta bort befintlig constraint om den finns
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'time_entries_tenant_id_fkey'
    ) THEN
        ALTER TABLE time_entries 
        DROP CONSTRAINT time_entries_tenant_id_fkey;
        RAISE NOTICE 'Dropped existing constraint';
    END IF;

    -- Skapa ny constraint
    ALTER TABLE time_entries
    ADD CONSTRAINT time_entries_tenant_id_fkey
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
    
    RAISE NOTICE 'Created new constraint';
END $$;
```

### 5. Verifiera att fixen fungerade

```sql
-- Kontrollera constraint
SELECT 
    conname,
    contype,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE conname = 'time_entries_tenant_id_fkey';

-- Testa att skapa en test-time_entry (ta bort efteråt!)
-- INSERT INTO time_entries (tenant_id, employee_id, project_id, date, hours_total, ob_type, amount_total, is_billed)
-- VALUES (
--   '7d57f1cb-c33f-4317-96f7-0abac0f2aab6',
--   'e5ad1c35-146b-4bc2-aed6-521ad30c5d97',
--   (SELECT id FROM projects LIMIT 1),
--   CURRENT_DATE,
--   1.0,
--   'work',
--   360.0,
--   false
-- );
```

### 6. Om inget fungerar - Logga ut och in igen

1. Logga ut från appen
2. Logga in igen
3. Detta uppdaterar JWT metadata med rätt tenant_id

### 7. Kontakta support

Om inget av ovanstående fungerar:
- Ta screenshot av felmeddelandet
- Ta screenshot av SQL-resultat från steg 1
- Dela med support/utvecklare


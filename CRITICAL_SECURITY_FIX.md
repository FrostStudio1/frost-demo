# 🚨 KRITISK SÄKERHETSFIX - Tenant Isolation

## Problem
Employee har tenant_id `6c7b7f99-3e6b-4125-ac9b-fecab5899a81` som **INTE finns** i tenants-tabellen. Detta är en allvarlig säkerhetsrisk eftersom:
- Data kan hoppa mellan olika kunder
- Foreign key constraints misslyckas
- RLS policies fungerar inte korrekt

## Lösning
Jag har uppdaterat `/api/time-entries/create` så att:
1. ✅ Om tenant_id inte finns, försöker den hitta rätt tenant från employee's faktiska data (projects, time_entries)
2. ✅ Korrigerar tenant_id automatiskt om möjligt
3. ✅ Returnerar tydligt fel om ingen valid tenant kan hittas

## Ytterligare Fix (KRITISKT)
Du måste uppdatera employee-record till en existerande tenant. Kör denna SQL i Supabase:

```sql
-- Hitta rätt tenant för employee genom att kolla projects/time_entries
SELECT DISTINCT t.tenant_id
FROM time_entries t
WHERE t.employee_id = '47224e0b-5809-4894-8696-49dd2b5f71f0'
LIMIT 1;

-- Om ovanstående returnerar en tenant_id, uppdatera employee:
UPDATE employees
SET tenant_id = '<HITTAD_TENANT_ID>'  -- Ersätt med tenant_id från query ovan
WHERE id = '47224e0b-5809-4894-8696-49dd2b5f71f0';

-- ELLER välj en av de existerande tenants från listan:
-- "7229d07c-4eec-4111-ad9b-e709fc84ea04" - Frost Bygg AB
-- "3447729d-0cb6-4d71-a18a-adc7fa134d6d" - test
-- osv...

-- Verifiera:
SELECT id, full_name, tenant_id, auth_user_id
FROM employees
WHERE id = '47224e0b-5809-4894-8696-49dd2b5f71f0';
```

## Säkerhetsåtgärder
Alla queries MÅSTE alltid filtrera på tenant_id för att förhindra data leakage:
- ✅ Projects: `.eq('tenant_id', tenantId)`
- ✅ Clients: `.eq('tenant_id', tenantId)`
- ✅ Employees: `.eq('tenant_id', tenantId)`
- ✅ Time entries: `.eq('tenant_id', tenantId)`
- ✅ Invoices: `.eq('tenant_id', tenantId)`

## Test
Efter SQL-fix:
1. Ladda om appen
2. Försök stämpla in igen
3. Kontrollera att rätt projekt visas
4. Verifiera att data inte hoppar mellan tenants


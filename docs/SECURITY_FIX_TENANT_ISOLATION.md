# 🚨 KRITISK SÄKERHETSFIX - Tenant Isolation

## Problem
Data hoppar mellan olika tenants/kunder - ALLVARLIG säkerhetsrisk!

## Rotorsak
- JWT metadata har fel tenant_id (`7d57f1cb...` - finns inte)
- Queries använder JWT tenant_id istället för employee's tenant_id
- Employee record har rätt tenant_id (`6c7b7f99...`) men den används inte konsekvent

## Lösning
Jag har implementerat följande säkerhetsfixar:

### 1. ✅ TenantContext - Prioriterar Employee API
- Använder `/api/employee/get-current` först (mer pålitligt)
- Filtrerar bort employees med icke-existerande tenants
- Använder bara employee's tenant_id

### 2. ✅ DashboardClient - Verifierar Tenant
- **ALLTID** använder tenantId från employee API
- Verifierar att tenant existerar innan query
- Vägrar hämta projekt om tenant inte finns

### 3. ✅ serverTenant.ts - Service Role Fallback
- Använder service role för att hämta employee record
- Filtrerar bort employees med ogiltiga tenants
- Returnerar första valid employee's tenant_id

### 4. ✅ API Routes - Verifierar Tenant
- `/api/time-entries/create` verifierar tenant innan insert
- Försöker hitta rätt tenant från employee's data om tenant_id saknas
- Vägrar skapa time entry om ingen valid tenant finns

## KRITISK SQL-FIX (Kör NU!)

Du MÅSTE köra denna SQL för att fixa employee-record permanent:

```sql
-- 1. Hitta vilken tenant employee faktiskt tillhör (från time_entries eller projects)
SELECT DISTINCT te.tenant_id, COUNT(*) as entry_count
FROM time_entries te
WHERE te.employee_id = '47224e0b-5809-4894-8696-49dd2b5f71f0'
GROUP BY te.tenant_id
ORDER BY entry_count DESC
LIMIT 1;

-- 2. Om ovanstående returnerar en tenant_id, uppdatera employee:
UPDATE employees
SET tenant_id = '<TENANT_ID_FRÅN_QUERY_OVAN>'
WHERE id = '47224e0b-5809-4894-8696-49dd2b5f71f0'
  AND auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567';

-- 3. ELLER välj en av de existerande tenants från listan:
-- "7229d07c-4eec-4111-ad9b-e709fc84ea04" - Frost Bygg AB
-- "3447729d-0cb6-4d71-a18a-adc7fa134d6d" - test
-- osv...

-- 4. Uppdatera också JWT metadata:
UPDATE auth.users 
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{tenant_id}',
  '"<SAMMA_TENANT_ID_SOM_OVAN>"'
)
WHERE id = '2941e8db-d533-412e-a292-7ff713e76567';

-- 5. Verifiera:
SELECT 
  e.id,
  e.full_name,
  e.tenant_id,
  e.auth_user_id,
  (SELECT COUNT(*) FROM time_entries WHERE employee_id = e.id) as time_entry_count,
  (SELECT COUNT(*) FROM projects WHERE tenant_id = e.tenant_id) as project_count
FROM employees e
WHERE e.id = '47224e0b-5809-4894-8696-49dd2b5f71f0';
```

## Test Checklist

Efter SQL-fix, testa:

1. ✅ Ladda om appen (Ctrl+R)
2. ✅ Kontrollera att TimeClock visar rätt projekt (bara dina)
3. ✅ Kontrollera att Projects-sidan visar rätt projekt
4. ✅ Försök stämpla in - ska fungera utan fel
5. ✅ Kontrollera att inga projekt från andra tenants syns

## Säkerhetsåtgärder Framåt

Alla framtida queries MÅSTE:
- ✅ Alltid filtrera på tenant_id
- ✅ Verifiera tenant_id innan query
- ✅ Använda employee's tenant_id, inte JWT metadata
- ✅ Logga varningar om tenant mismatch upptäcks

---

**Kör SQL:en ovan NU för att fixa problemet permanent! 🚨**


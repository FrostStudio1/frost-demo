# 🚨 OMEDELBAR FIX KRÄVS

## Problemet

Du har en employee-record (`e5ad1c35-146b-4bc2-aed6-521ad30c5d97`) med en tenant_id (`7d57f1cb-c33f-4317-96f7-0abac0f2aab6`) som **INTE finns i databasen**. Detta orsakar foreign key constraint errors.

## Omedelbar lösning

Kör denna SQL i Supabase SQL Editor **NU**:

```sql
-- 1. Kontrollera om employee har data
SELECT 
    'time_entries' AS table_name,
    COUNT(*) AS count
FROM time_entries
WHERE employee_id = 'e5ad1c35-146b-4bc2-aed6-521ad30c5d97';

-- 2. Om count är 0, ta bort direkt:
DELETE FROM employees
WHERE id = 'e5ad1c35-146b-4bc2-aed6-521ad30c5d97'
  AND auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567';

-- 3. Verifiera
SELECT id, full_name, tenant_id, auth_user_id, role
FROM employees
WHERE auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
ORDER BY created_at DESC;
```

## Efter fixen

1. **Ladda om appen** (F5 eller Ctrl+R)
2. **Försök stämpla in igen**
3. Det bör nu fungera! ✅

## Vad jag har fixat

Jag har uppdaterat `/api/employee/get-current` så att den:
- ✅ Filtrerar bort employees med icke-existerande tenants
- ✅ Väljer alltid en employee med en existerande tenant
- ✅ Returnerar INTE employee-records med fel tenant_id

Men **du måste fortfarande ta bort den felaktiga employee-record** för att problemet ska försvinna helt.

---

**Kör SQL:en ovan och testa igen! 🚀**


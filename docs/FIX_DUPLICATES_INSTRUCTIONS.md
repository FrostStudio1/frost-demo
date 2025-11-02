# 🔧 Fixa Duplicerade Employee-Records

## Problemet
Du har **2 duplicerade employee-records** för samma användare (`auth_user_id: 2941e8db-d533-412e-a292-7ff713e76567`):

1. `b545c4a3-685d-4af5-8d22-b7b0dcfce233` - "Admin" - Tenant: `6c7b7f99-3e6b-4125-ac9b-fecab5899a81` ✅
2. `47224e0b-5809-4894-8696-49dd2b5f71f0` - "Vilmer Frost" - Tenant: `6c7b7f99-3e6b-4125-ac9b-fecab5899a81` ✅

**Båda är admin och har samma tenant_id, men olika namn.**

## Lösning

### Steg 1: Kontrollera vilka tenants som finns

Kör i Supabase SQL Editor:

```sql
SELECT id, name, created_at 
FROM tenants 
WHERE id IN (
  '6c7b7f99-3e6b-4125-ac9b-fecab5899a81',
  '7d57f1cb-c33f-4317-96f7-0abac0f2aab6'
)
ORDER BY created_at DESC;
```

### Steg 2: Kontrollera vilken som används

Kör först `SUPABASE_CHECK_EMPLOYEE_USAGE.sql` för att se vilken employee-record som har data kopplad.

### Steg 3: Fixa duplicerade records

**OPTION A: Ta bort "Admin" (om den har ingen data)** (Rekommenderat)

"Admin" verkar vara ett placeholder-namn, så förmodligen kan den tas bort:

```sql
-- Kontrollera först om "Admin" har data
SELECT COUNT(*) AS time_entries_count
FROM time_entries
WHERE employee_id = 'b545c4a3-685d-4af5-8d22-b7b0dcfce233';

-- Om count är 0, ta bort:
DELETE FROM employees
WHERE id = 'b545c4a3-685d-4af5-8d22-b7b0dcfce233'
  AND auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567';
```

**OPTION B: Om "Admin" har data - Migrera till "Vilmer Frost"**

```sql
-- Migrera all data från "Admin" till "Vilmer Frost"
UPDATE time_entries
SET employee_id = '47224e0b-5809-4894-8696-49dd2b5f71f0'  -- Vilmer Frost
WHERE employee_id = 'b545c4a3-685d-4af5-8d22-b7b0dcfce233';  -- Admin

-- Ta sedan bort "Admin"
DELETE FROM employees
WHERE id = 'b545c4a3-685d-4af5-8d22-b7b0dcfce233';
```

### Steg 4: Verifiera fixen

```sql
SELECT 
    id,
    full_name,
    tenant_id,
    auth_user_id,
    role,
    created_at
FROM employees
WHERE auth_user_id = '2941e8db-d533-412e-a292-7ff713e76567'
ORDER BY created_at DESC;
```

Du bör nu se:
- **Bara 1 employee-record** (Vilmer Frost)
- Med tenant_id: `6c7b7f99-3e6b-4125-ac9b-fecab5899a81`
- Med role: `admin`

### Steg 5: Testa igen

1. Ladda om appen (F5)
2. Försök stämpla in igen
3. Det bör fungera nu! ✅

## Automatisk Fix

Eller kör `SUPABASE_CLEANUP_DUPLICATES.sql` för automatisk cleanup (med transaction så du kan ångra).

## Varför hände detta?

Detta hände troligen när:
- Onboarding kördes flera gånger
- Employee-record skapades flera gånger
- Tenant_id ändrades mellan onboarding-sessioner

## Framtida förhindring

Jag har uppdaterat `app/api/employee/get-current/route.ts` för att:
- Prioritera employee-record med rätt tenant_id
- Välja den senaste om flera finns
- Bytte prioritering så rätt tenant väljs

---

**Efter att ha fixat detta, bör stämpelklockan fungera! 🎉**


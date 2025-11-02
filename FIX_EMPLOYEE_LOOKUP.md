# Fix för Employee Lookup

## Problem
Stämpelklockan visar "Du behöver vara registrerad som anställd" trots att employee-record finns.

## Rotorsak
- JWT har fel tenant_id: `7d57f1cb-c33f-4317-96f7-0abac0f2aab6` (finns inte)
- Employee har rätt tenant_id: `6c7b7f99-3e6b-4125-ac9b-fecab5899a81` (finns)
- Employee ID: `47224e0b-5809-4894-8696-49dd2b5f71f0`

## Lösning
Jag har uppdaterat `/api/employee/get-current` så att:
1. ✅ Den hämtar alla employees för användaren
2. ✅ Filtrerar till de som har existerande tenants
3. ✅ Om JWT tenant_id inte matchar, väljer den första valid employee
4. ✅ Returnerar employee-data direkt

## Test
Efter denna fix ska API:et returnera:
```json
{
  "employeeId": "47224e0b-5809-4894-8696-49dd2b5f71f0",
  "role": "admin",
  "name": "Vilmer Frost",
  "email": null,
  "tenantId": "6c7b7f99-3e6b-4125-ac9b-fecab5899a81"
}
```

## Ytterligare Fix (om problemet kvarstår)
Om det fortfarande inte fungerar, kör denna SQL i Supabase för att uppdatera JWT metadata:

```sql
-- Uppdatera user metadata med rätt tenant_id
UPDATE auth.users 
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{tenant_id}',
  '"6c7b7f99-3e6b-4125-ac9b-fecab5899a81"'
)
WHERE id = '2941e8db-d533-412e-a292-7ff713e76567';
```

Eller logga ut och in igen så uppdateras metadata automatiskt.


# 🔧 Fixa saknad användare i employees-tabellen

## Problem
Om du är inloggad men saknar en post i `employees`-tabellen kommer många funktioner inte att fungera, t.ex.:
- Du kan inte se dina tidsrapporter
- Du kan inte skapa ÄTA-förfrågningar
- Dashboard visar fel data

## Lösning

### Metod 1: Via SQL (Rekommenderat)

1. **Öppna Supabase SQL Editor** i Supabase Dashboard

2. **Hitta ditt User ID och Tenant ID:**
   ```sql
   -- Kör denna för att hitta din info
   SELECT 
     au.id as auth_user_id,
     au.email,
     CASE 
       WHEN e.id IS NULL THEN 'SAKNAS I EMPLOYEES'
       ELSE 'FINNS REDAN'
     END as status,
     e.tenant_id,
     e.role
   FROM auth.users au
   LEFT JOIN employees e ON e.auth_user_id = au.id
   WHERE au.email = 'din-email@example.com';  -- Ersätt med din email
   ```

3. **Skapa employee-post:**
   ```sql
   -- Ersätt <USER_ID> med ditt auth_user_id från query ovan
   -- Ersätt <TENANT_ID> med ditt tenant_id
   INSERT INTO employees (auth_user_id, tenant_id, name, full_name, role)
   VALUES (
     '<USER_ID>',      -- Ersätt med ditt auth.users.id
     '<TENANT_ID>',    -- Ersätt med ditt tenant_id
     'Admin',          -- Ditt namn
     'Admin',          -- Fullständigt namn
     'admin'           -- Roll: 'admin' eller 'employee'
   );
   ```

### Metod 2: Gå igenom onboarding igen

Om du redan har ett tenant men saknar employee-post:

1. Gå till `/onboarding`
2. Fyll i steg 1 (företagsnamn) med samma information som tidigare
3. Systemet kommer att skapa employee-post automatiskt

### Metod 3: Skapa via appen (endast om du har en annan admin-användare)

Om du har en annan admin-användare som fungerar:

1. Logga in med den admin-användaren
2. Gå till `/employees/new`
3. Lägg till dig själv som anställd
4. **VIKTIGT:** Du måste använda samma email som du loggar in med i Supabase Auth

## Verifiera att det fungerar

Efter att du har skapat employee-posten:

1. **Logga ut och logga in igen** (för att uppdatera sessionen)
2. Gå till `/dashboard` - ska fungera utan errors
3. Gå till `/reports` - ska visa tidsrapporter
4. Gå till `/employees` - du ska synas i listan

## Om du fortfarande har problem

Kontrollera:
1. ✅ Employee-post finns i `employees`-tabellen med rätt `auth_user_id`
2. ✅ `tenant_id` i employee-posten matchar ditt faktiska tenant
3. ✅ Du har loggat ut och in igen efter att ha skapat posten
4. ✅ `role` är satt till 'admin' om du ska ha admin-rättigheter


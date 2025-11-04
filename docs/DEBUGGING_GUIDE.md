# 🐛 Debugging Guide: Projekt & Anställda synkas inte

## 🔍 Steg-för-steg debugging

### **Steg 1: Kolla server-terminalen**

Öppna terminalen där `npm run dev` körs och leta efter:

```
Error fetching employees: ...
Error fetching projects: ...
No tenant found for user: ...
Service role key not configured
```

**Kopiera exakt felmeddelandet** härifrån.

---

### **Steg 2: Testa API-rutorna direkt**

Öppna dessa URLs i webbläsaren (medan du är inloggad):

1. **Employees:**
   ```
   http://localhost:3000/api/employees/list
   ```
   
   Förväntat svar:
   ```json
   {
     "employees": [
       {
         "id": "...",
         "full_name": "...",
         "email": "...",
         "role": "admin"
       }
     ]
   }
   ```

2. **Projects:**
   ```
   http://localhost:3000/api/projects/list?tenantId=DIN_TENANT_ID
   ```
   
   Förväntat svar:
   ```json
   {
     "projects": [
       {
         "id": "...",
         "name": "...",
         "tenant_id": "..."
       }
     ]
   }
   ```

3. **Admin Check:**
   ```
   http://localhost:3000/api/admin/check
   ```
   
   Förväntat svar:
   ```json
   {
     "isAdmin": true,
     "role": "admin",
     "employeeId": "...",
     "tenantId": "..."
   }
   ```

---

### **Steg 3: Om API-rutorna ger 500 errors**

#### **Problem: "Service role key not configured"**
**Lösning:**
1. Öppna `.env.local` i `frost-demo` mappen
2. Lägg till/uppdatera:
   ```
   SUPABASE_SERVICE_ROLE_KEY=din-service-key-här
   SUPABASE_URL=din-supabase-url
   ```
3. Starta om dev-servern (`Ctrl+C` och sedan `npm run dev`)

#### **Problem: "No tenant found"**
**Lösning:**
1. Kolla att din användare har en employee-post:
   ```sql
   SELECT * FROM employees WHERE auth_user_id = 'DIN_USER_ID';
   ```
2. Om ingen post finns:
   - Skapa en employee-post med rätt `tenant_id`
   - Eller slutför onboarding

#### **Problem: "Access denied"**
**Lösning:**
1. Verifiera att din employee-post har rätt `tenant_id`:
   ```sql
   SELECT id, full_name, tenant_id, role 
   FROM employees 
   WHERE auth_user_id = 'DIN_USER_ID';
   ```
2. Uppdatera om fel:
   ```sql
   UPDATE employees 
   SET tenant_id = 'RÄTT_TENANT_ID' 
   WHERE auth_user_id = 'DIN_USER_ID';
   ```

---

### **Steg 4: Kontrollera databasen**

#### **Kolla att du har anställda:**
```sql
SELECT id, full_name, email, role, tenant_id 
FROM employees 
WHERE tenant_id = 'DIN_TENANT_ID';
```

Om listan är tom:
- Du behöver skapa anställda först
- Gå till `/employees` och skapa en anställd

#### **Kolla att du har projekt:**
```sql
SELECT id, name, tenant_id 
FROM projects 
WHERE tenant_id = 'DIN_TENANT_ID';
```

Om listan är tom:
- Det är OK - projekt är valfritt
- Men om du vill ha projekt: gå till `/projects` och skapa ett

#### **Kolla din admin-status:**
```sql
SELECT id, full_name, role, tenant_id, auth_user_id
FROM employees
WHERE auth_user_id = 'DIN_USER_ID';
```

Om `role` inte är `'admin'`:
```sql
UPDATE employees 
SET role = 'admin' 
WHERE auth_user_id = 'DIN_USER_ID';
```

---

### **Steg 5: Kolla browser console**

1. Öppna Developer Tools (F12)
2. Gå till **Console**-fliken
3. Leta efter errors:
   - `GET http://localhost:3000/api/employees/list 500`
   - `GET http://localhost:3000/api/projects/list 500`
   - `Failed to load resource`

4. Gå till **Network**-fliken
5. Klicka på failed requests
6. Kolla **Response** för felmeddelanden

---

## 🎯 Vanliga problem & lösningar

### **Problem 1: "Inga projekt tillgängliga"**
**Orsak:** Du har inga projekt i databasen för din tenant  
**Lösning:** 
- Det är OK - projekt är valfritt
- Om du vill ha projekt: skapa ett på `/projects` sidan

### **Problem 2: "Inga anställda tillgängliga"**
**Orsak:** Du har inga anställda i databasen för din tenant  
**Lösning:**
- Gå till `/employees` sidan
- Skapa minst en anställd
- Eller kontrollera att dina anställda har rätt `tenant_id`

### **Problem 3: Admin kan inte ändra**
**Orsak:** Din employee-post har inte `role = 'admin'`  
**Lösning:**
```sql
UPDATE employees 
SET role = 'admin' 
WHERE auth_user_id = 'DIN_USER_ID';
```

### **Problem 4: 500 errors på alla API-routes**
**Orsak:** Saknade miljövariabler eller fel service role key  
**Lösning:**
1. Kontrollera `.env.local`:
   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
2. Starta om dev-servern
3. Om problemet kvarstår: kontrollera att service role key är korrekt i Supabase dashboard

---

## 📋 Checklista

- [ ] Server-terminalen visar inga errors
- [ ] `/api/employees/list` returnerar JSON med employees
- [ ] `/api/projects/list?tenantId=...` returnerar JSON med projects
- [ ] `/api/admin/check` returnerar `{"isAdmin": true}`
- [ ] Browser console visar inga errors
- [ ] Du har minst 1 employee i databasen för din tenant
- [ ] Din employee-post har `role = 'admin'`
- [ ] `.env.local` innehåller `SUPABASE_SERVICE_ROLE_KEY`

---

## 🆘 Om inget fungerar

1. **Kopiera dessa uppgifter:**
   - Felmeddelande från server-terminalen
   - Felmeddelande från browser console
   - Response från `/api/employees/list` (öppna i ny flik)
   - Response från `/api/projects/list?tenantId=...`
   - Response från `/api/admin/check`

2. **Kontrollera databasen:**
   ```sql
   -- Din tenant
   SELECT * FROM tenants WHERE id = 'DIN_TENANT_ID';
   
   -- Dina employees
   SELECT * FROM employees WHERE tenant_id = 'DIN_TENANT_ID';
   
   -- Dina projects
   SELECT * FROM projects WHERE tenant_id = 'DIN_TENANT_ID';
   
   -- Din employee-post
   SELECT * FROM employees WHERE auth_user_id = 'DIN_USER_ID';
   ```

3. **Kontakta support** med alla dessa uppgifter.


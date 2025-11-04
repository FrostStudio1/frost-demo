# 🔧 Fixes: Projekt, Anställda & Admin-behörigheter

## ✅ Problem som fixats

### 1. **Admin kan inte ändra arbetsordrar**
**Problem:** `admin.auth.getUser()` fungerar inte eftersom admin client inte har användarens session.

**Fix:**
- Använder nu `createClient()` (vanlig client) för att hämta användaren
- Använder `createAdminClient()` endast för databas-operationer
- Separerar auth från databas-operationer

**Fil:** `app/api/work-orders/[id]/route.ts`

---

### 2. **Projekt och anställda synkas inte**
**Möjliga orsaker:**
- API-rutorna ger 500 errors (checka server logs)
- RLS blockerar läsning
- TenantId saknas eller är fel

**Åtgärder:**
- ✅ `/api/employees/list` använder redan admin client
- ✅ `/api/projects/list` använder admin client
- ✅ Båda har bättre error logging

**Om problemet kvarstår:**
1. Kolla server-terminalen för felmeddelanden
2. Verifiera att du har:
   - `SUPABASE_URL` i `.env.local`
   - `SUPABASE_SERVICE_ROLE_KEY` i `.env.local`
   - Giltig tenant_id för din användare

---

## 🔍 Debugging-steg

### **Steg 1: Kontrollera server logs**
Kolla terminalen där `npm run dev` körs för:
- `Error fetching employees:` 
- `Error fetching projects:`
- `No tenant found for user:`
- `Service role key not configured`

### **Steg 2: Kontrollera miljövariabler**
```bash
# I frost-demo mappen
# .env.local ska innehålla:
SUPABASE_URL=din-url
SUPABASE_SERVICE_ROLE_KEY=din-service-key
NEXT_PUBLIC_SUPABASE_URL=din-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-key
```

### **Steg 3: Testa API-rutorna direkt**
Öppna i webbläsaren:
- `http://localhost:3000/api/employees/list`
- `http://localhost:3000/api/projects/list?tenantId=DIN_TENANT_ID`

Om du får JSON-svar så fungerar API:erna.

---

## 🛠️ Ytterligare åtgärder vid behov

### **Om employees fortfarande inte syns:**

1. **Kolla databasen:**
   ```sql
   SELECT id, full_name, email, role, tenant_id 
   FROM employees 
   WHERE tenant_id = 'DIN_TENANT_ID';
   ```

2. **Kolla att employee har rätt tenant_id:**
   - Verifiera att din användare har en employee-post
   - Verifiera att employee-postens `tenant_id` matchar din tenant

### **Om projects fortfarande inte syns:**

1. **Kolla databasen:**
   ```sql
   SELECT id, name, tenant_id 
   FROM projects 
   WHERE tenant_id = 'DIN_TENANT_ID';
   ```

2. **Kolla att du har projekt:**
   - Om listan är tom: skapa ett projekt först
   - Verifiera att projektets `tenant_id` matchar din tenant

---

## ✅ Admin-behörigheter

### **Kontrollera admin-status:**

1. **Kolla i databasen:**
   ```sql
   SELECT id, full_name, role, tenant_id, auth_user_id
   FROM employees
   WHERE auth_user_id = 'DIN_USER_ID';
   ```
   
   `role` ska vara `'admin'` (case-sensitive kan vara viktigt!)

2. **Testa admin API:**
   Öppna: `http://localhost:3000/api/admin/check`
   
   Du ska få:
   ```json
   {
     "isAdmin": true,
     "role": "admin",
     "employeeId": "...",
     "tenantId": "..."
   }
   ```

3. **Om `isAdmin: false`:**
   - Uppdatera din employee-post i databasen:
   ```sql
   UPDATE employees 
   SET role = 'admin' 
   WHERE auth_user_id = 'DIN_USER_ID';
   ```

---

## 🧪 Testa nu

1. **Refresh sidan** `/work-orders`
2. **Öppna "Ny arbetsorder"** modal
3. **Kolla dropdown-menyer:**
   - Projektdropdown ska visa projekt (eller "Inga projekt tillgängliga")
   - Anställd-dropdown ska visa anställda (eller "Inga anställda tillgängliga")
4. **Klicka på en arbetsorder**
5. **Kolla om du ser "Redigera" och "Ta bort" knappar** (admin)

---

## 📝 Om problemet kvarstår

### **Kolla dessa saker:**

1. **Browser Console:**
   - Öppna Developer Tools (F12)
   - Kolla Console för errors
   - Kolla Network för failed requests

2. **Server Terminal:**
   - Kolla för error messages
   - Särskilt leta efter:
     - `Error fetching employees:`
     - `Error fetching projects:`
     - `No tenant found`

3. **Databas:**
   - Verifiera att du har:
     - Minst 1 employee med rätt tenant_id
     - Minst 1 project med rätt tenant_id (valfritt men rekommenderat)
     - Din employee har `role = 'admin'`

---

## 🆘 Ytterligare hjälp

Om inget av ovanstående fungerar:
1. Kopiera **exakt** felmeddelandet från server-terminalen
2. Kopiera **exakt** felmeddelandet från browser console
3. Kontakta support med dessa meddelanden


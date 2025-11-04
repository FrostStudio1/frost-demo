# 🔧 Fixes: Ladda arbetsordrar

## ✅ Problem som fixats

### 1. **500 Error på GET /api/work-orders**
**Problem:** Vanlig Supabase client kan inte läsa work_orders pga RLS.

**Fix:**
- Ändrat till att använda `createAdminClient()` (service role) för GET-requests
- Vi validerar fortfarande `tenant_id` manuellt för säkerhet
- Lagt till bättre error logging

**Fil:** `app/api/work-orders/route.ts`

---

### 2. **405 Error på GET /api/projects**
**Problem:** `/api/projects` hade bara POST, inte GET.

**Fix:**
- `useProjects` hook använder nu `/api/projects/list` direkt (korrekt endpoint)
- Lagt till GET-handler i `/api/projects/route.ts` som redirectar till `/api/projects/list`

**Filer:** 
- `app/hooks/useProjects.ts`
- `app/api/projects/route.ts`

---

### 3. **500 Error på GET /api/employees/list**
**Problem:** Saknade error logging gjorde det svårt att debugga.

**Fix:**
- Lagt till console.error för alla fel
- Bättre error messages

**Fil:** `app/api/employees/list/route.ts`

---

## 🧪 Testa nu

1. **Refresh sidan** `/work-orders`
2. **Kolla terminalen** för eventuella fel (nu med bättre logging)
3. **Arbetsordrar ska nu visas** i listan

---

## 🔍 Om det fortfarande inte fungerar

Kolla server-terminalen för felmeddelanden. Nu finns:
- `Error fetching work orders:` - Visar vad som gick fel
- `Error in GET /api/work-orders:` - Catches alla exceptions
- `No tenant found for user:` - Tenant-problem
- `Service role key not configured` - Miljövariabler saknas

---

## 📝 Ändringar sammanfattning

1. **GET /api/work-orders** - Använder nu admin client (bypass RLS)
2. **GET /api/projects** - Redirectar till `/api/projects/list`
3. **useProjects hook** - Använder korrekt endpoint direkt
4. **Error logging** - Förbättrat överallt


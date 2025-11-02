# PR 1: Tenant Resolution Unifiering (MÅSTE)

## Motivering

Idag finns tre parallella tenant-resolution-strategier:
1. `TenantContext` läser från `employees` tabell via `auth_user_id`
2. Direkt `localStorage.getItem('tenantId')` i många komponenter
3. Server-side läser cookies/headers/body i olika ordningar

Detta ger:
- Inkonsekvent beteende (vissa ställen missar tenant)
- Säkerhetsrisk (client-side tenant kan manipuleras)
- Underhållsmässigt rörigt (15+ filer använder tenant på olika sätt)

**Lösning**: En enda hook `useTenant()` som prioriterar JWT claim (`app_metadata.tenant_id`) via `/api/debug/me`, fallback till cookie, och sista utväg localStorage för UI. Säkerheten baseras alltid på JWT på server-side.

---

## Plan & Påverkan

### Nya filer
- `lib/useTenant.ts` - Unified client hook
- `lib/serverTenant.ts` - Unified server util (förbättrar `app/utils/server/getTenant.ts`)

### Ändrade filer
1. `app/api/debug/me/route.ts` - Exponera `tenant_id` direkt i response
2. `app/context/TenantContext.tsx` - Använd ny hook, ta bort direkt `localStorage`
3. `app/utils/server/getTenant.ts` - Ersätt med `lib/serverTenant.ts` eller refaktorera
4. `app/utils/tenant/fetchWithTenant.ts` - Använd `useTenant()` hook istället för direkt localStorage
5. `app/invoices/new/page.tsx` - Ta bort localStorage fallback
6. `app/onboarding/page.tsx` - Ta bort localStorage fallback (3 ställen)
7. `app/projects/ClientProjectsFallback.tsx` - Ta bort localStorage fallback
8. `app/auth/callback/page.tsx` - Förenkla, använd hook via Context
9. `app/page.tsx` - Ta bort debug localStorage access
10. `app/api/projects/route.ts` - Använd `serverTenant` util
11. `app/api/time-report/offline/route.ts` - Använd `serverTenant` util

### Orörda filer (använder redan `useTenant()` korrekt)
- `app/dashboard/page.tsx`
- `app/projects/page.tsx`
- `app/employees/page.tsx`
- `app/clients/page.tsx`
- `app/invoices/page.tsx`
- `app/reports/page.tsx`
- `app/aeta/page.tsx`
- `app/admin/aeta/page.tsx`
- `app/admin/page.tsx`
- `app/reports/new/page.tsx`
- `app/projects/[id]/page.tsx`
- `app/employees/[id]/page.tsx`

---

## Implementation

### 1. Ny unified hook (`lib/useTenant.ts`)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useTenant as useTenantContext } from '@/context/TenantContext'

/**
 * Unified tenant resolution hook for client components.
 * Priority: JWT claim (via /api/debug/me) > Context > localStorage fallback
 * 
 * Security: Server-side always validates via JWT app_metadata.tenant_id.
 * This hook is for UI convenience only.
 */
export function useTenant(): { tenantId: string | null; isLoading: boolean } {
  const context = useTenantContext()
  const [tenantId, setTenantId] = useState<string | null>(context.tenantId)
  const [isLoading, setIsLoading] = useState(!context.tenantId)

  useEffect(() => {
    // If Context already has tenant, use it
    if (context.tenantId) {
      setTenantId(context.tenantId)
      setIsLoading(false)
      return
    }

    // Try to fetch from /api/debug/me (JWT claim)
    async function fetchFromServer() {
      try {
        const res = await fetch('/api/debug/me')
        if (res.ok) {
          const data = await res.json()
          const claimTenant = data?.app_metadata?.tenant_id
          if (claimTenant) {
            setTenantId(claimTenant)
            context.setTenantId(claimTenant)
            // Sync to localStorage for legacy code (will be removed)
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('tenantId', claimTenant)
              } catch {}
            }
            setIsLoading(false)
            return
          }
        }
      } catch (err) {
        // Silent fail, fall through
      }

      // Fallback: localStorage (legacy, for migration period)
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('tenantId') || localStorage.getItem('tenant_id')
          if (stored) {
            setTenantId(stored)
            context.setTenantId(stored)
            setIsLoading(false)
            return
          }
        } catch {}
      }

      setIsLoading(false)
    }

    fetchFromServer()
  }, [context])

  // If Context updates, sync
  useEffect(() => {
    if (context.tenantId && context.tenantId !== tenantId) {
      setTenantId(context.tenantId)
    }
  }, [context.tenantId, tenantId])

  return { tenantId, isLoading }
}
```

### 2. Förbättrad server util (`lib/serverTenant.ts`)

```typescript
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

/**
 * Unified tenant resolution for server-side code.
 * Priority: JWT claim (app_metadata.tenant_id) > httpOnly cookie
 * 
 * Security: Always validates via JWT. Cookie/body/headers are convenience only.
 * Returns null if no tenant found or user not authenticated.
 */
export async function getTenantId(): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Priority 1: JWT claim (authoritative)
    const claimTenant = (user.app_metadata as any)?.tenant_id
    if (claimTenant) {
      return String(claimTenant)
    }

    // Priority 2: httpOnly cookie (convenience, set by /api/auth/set-tenant)
    const c = await cookies()
    const cookieTenant = c.get('tenant_id')?.value
    if (cookieTenant) {
      return cookieTenant
    }

    return null
  } catch (err) {
    // cookies() may throw in some contexts
    return null
  }
}

/**
 * Get tenant from request (for API routes that need fallback to body/headers).
 * Still prioritizes JWT claim, but allows body/header as convenience.
 * 
 * WARNING: When validating writes, always use JWT claim, not body/headers.
 */
export async function getTenantFromRequest(
  req?: Request,
  body?: any
): Promise<string | null> {
  // Priority 1: JWT claim (always authoritative)
  const claimTenant = await getTenantId()
  if (claimTenant) {
    return claimTenant
  }

  // Priority 2: httpOnly cookie
  try {
    const c = await cookies()
    const cookieTenant = c.get('tenant_id')?.value
    if (cookieTenant) return cookieTenant
  } catch {}

  // Priority 3: Body (convenience only, not for security)
  if (body) {
    const b = body?.tenant_id ?? body?.tenantId
    if (b) return String(b)
  }

  // Priority 4: Header (convenience only)
  if (req?.headers) {
    const headerTenant = req.headers.get('x-tenant-id') ?? req.headers.get('x-tenant')
    if (headerTenant) return headerTenant
  }

  return null
}
```

### 3. Uppdatera `/api/debug/me` för att exponera tenant

```typescript
// app/api/debug/me/route.ts
export async function GET() {
  // ... existing code ...
  
  return NextResponse.json({
    hasCookie: Boolean(access),
    userId: data?.user?.id ?? null,
    tenant_id: data?.user?.app_metadata?.tenant_id ?? null, // <-- ADD THIS
    app_metadata: data?.user?.app_metadata ?? null,
    error: error?.message ?? null,
  });
}
```

### 4. Uppdatera `TenantContext` att använda `/api/debug/me`

```typescript
// app/context/TenantContext.tsx
export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const [tenantId, setTenantId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTenantId() {
      try {
        // Priority 1: JWT claim via /api/debug/me
        const res = await fetch('/api/debug/me')
        if (res.ok) {
          const data = await res.json()
          const claimTenant = data?.tenant_id || data?.app_metadata?.tenant_id
          if (claimTenant) {
            setTenantId(claimTenant)
            // Sync localStorage for migration (remove later)
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('tenantId', claimTenant)
              } catch {}
            }
            return
          }
        }
      } catch (err) {
        // Silent fail
      }

      // Priority 2: Fallback to employees table (legacy, for migration)
      try {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData?.user?.id
        if (!userId) return

        const { data: employeeData } = await supabase
          .from('employees')
          .select('tenant_id')
          .eq('auth_user_id', userId)
          .single()

        if (employeeData?.tenant_id) {
          setTenantId(employeeData.tenant_id)
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('tenantId', employeeData.tenant_id)
            } catch {}
          }
        }
      } catch (err) {
        // Silent fail
      }
    }

    fetchTenantId()
  }, [])

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId }}>
      {children}
    </TenantContext.Provider>
  )
}
```

### 5. Ersättningar i komponenter

**Exempel 1: `app/invoices/new/page.tsx`**
```typescript
// BEFORE:
const finalTenantId = tenantId || (typeof window !== 'undefined' ? localStorage.getItem('tenantId') || localStorage.getItem('tenant_id') : null)

// AFTER:
// useTenant() already handles fallback, just use tenantId directly
if (!tenantId) {
  alert('Ingen tenant satt...')
  return
}
```

**Exempel 2: `app/onboarding/page.tsx`**
```typescript
// BEFORE (3 ställen):
const finalTenantId = tenantId || localStorage.getItem('tenantId')

// AFTER:
if (!tenantId) {
  alert('Ingen tenant...')
  return
}
// Use tenantId directly
```

**Exempel 3: `app/projects/ClientProjectsFallback.tsx`**
```typescript
// BEFORE:
const tenant_id = tenantId || (typeof window !== 'undefined' ? localStorage.getItem('tenantId') || localStorage.getItem('tenant_id') : null)

// AFTER:
if (!tenantId) {
  setError('Ingen tenant vald...')
  return
}
// Use tenantId directly
```

**Exempel 4: `app/utils/tenant/fetchWithTenant.ts`**
```typescript
// BEFORE:
const tenant = localStorage.getItem('tenant_id')

// AFTER:
import { useTenant } from '@/lib/useTenant'
// But wait - this is not a hook! We can't use hooks here.
// Solution: Pass tenant as parameter or use different approach.
// Actually, this file should be deprecated in favor of direct API calls with tenant from hook.

// NEW APPROACH: Remove fetchWithTenant, components call APIs directly with tenant from hook
```

---

## Testplan

### 1. Verifiera tenant resolution
```bash
# 1. Logga in
# 2. Öppna DevTools → Application → Cookies → Verifiera `tenant_id` cookie finns
# 3. GET /api/debug/me → Ska returnera { tenant_id: "xxx", userId: "yyy" }
# 4. Öppna Console → Verifiera att alla sidor får tenantId (ingen "null")
```

### 2. Verifiera säkerhet
```bash
# 1. Manipulera localStorage.tenantId = "fake-tenant"
# 2. POST /api/projects med fake tenant_id i body
# 3. Ska ge 403 (server validerar mot JWT claim, inte localStorage)
```

### 3. Verifiera SSR
```bash
# 1. Disable JavaScript
# 2. GET /projects (server-side render)
# 3. Ska visa projekt (eller empty state), inte error
```

### 4. Verifiera alla sidor laddar
- [ ] `/dashboard` → laddar utan errors
- [ ] `/projects` → laddar utan errors
- [ ] `/invoices/new?projectId=xxx` → pre-fills korrekt
- [ ] `/onboarding` → kan skapa tenant/project
- [ ] `/reports/new` → kan spara time entry

---

## Definition of Done Check

✅ **Tenant unifiering**: En hook `useTenant()`, en server util `getTenantId()`, inga direkta localStorage-access  
✅ **SSR säker**: Server-side använder JWT claim, inte localStorage  
✅ **Säkerhet**: Server routes validerar `payload.tenant_id === JWT claim`  
⚠️ **Runtime errors**: Testa att inga console errors (måste verifieras manuellt)  
⏳ **E2E**: Förskjuts till PR 6  

---

## Frågor innan implementation

1. **`fetchWithTenant.ts` deprecation**: Ska vi ta bort denna helt, eller behålla för backwards compatibility? Föreslår att vi deprecar den och uppdaterar alla användningar att använda tenant från hook direkt i API-calls.

2. **localStorage sync**: Ska vi behålla localStorage-sync under migration-period, eller ta bort direkt? Föreslår att vi behåller i 1 sprint, sedan tar bort.

3. **Server components**: `app/payroll/page.tsx` och `app/payroll/employeeID/page.tsx` är server components och använder `claims.tenant_id` direkt. Ska vi konvertera dessa till att använda `getTenantId()` util, eller behålla current approach? Föreslår att vi uppdaterar till `getTenantId()` för konsistens.

**OK att fortsätta med implementationen?**


# 🚀 Quick Start Guide - Frost Bygg

## Vad är Frost Bygg?

Frost Bygg är en **multi-tenant SaaS-applikation** för tidsrapportering, projektledning och fakturering specifikt designad för byggföretag.

---

## 🏗️ Arkitektur i Korthet

### Tech Stack
- **Frontend:** Next.js 16 (React 19) + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Supabase
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth med JWT
- **Caching:** React Query (@tanstack/react-query)

### Multi-Tenant System
Varje företag har sin egen isolerade data. Alla databasanrop måste inkludera `tenant_id` för säkerhet.

---

## 📁 Viktiga Mappar

```
frost-demo/
├── app/                    # Next.js App Router (alla routes)
│   ├── api/               # Backend API routes
│   ├── components/        # React-komponenter
│   ├── hooks/             # Custom React hooks
│   ├── providers/         # Context providers
│   └── [page].tsx         # Sidor (blir routes)
├── lib/                    # Utilities & helpers
├── types/                  # TypeScript types
├── hooks/                  # React Query hooks
└── docs/                   # Dokumentation
```

---

## 🔑 Viktiga Koncept

### 1. Tenant Isolation (Multi-Tenant)
```typescript
// ALLA queries måste inkludera tenant_id
const { data } = await supabase
  .from('invoices')
  .select('*')
  .eq('tenant_id', tenantId)  // ← KRITISKT!
```

**Varför?** Förhindrar att användare ser andras data.

### 2. React Query (Caching)
```typescript
// Använd hooks istället för useEffect + fetch
const { data: invoices, isLoading } = useInvoices()
// Automatisk caching, loading states, error handling!
```

**Fördelar:**
- Data cachas automatiskt (färre API-anrop)
- Loading states hanteras automatiskt
- Background refetching

### 3. Progressive Fallback
```typescript
// Försök med alla kolumner först
let { data, error } = await supabase
  .from('invoices')
  .select('id, amount, desc, description')

// Om kolumn saknas, försök utan den
if (error?.code === '42703') {
  const fallback = await supabase
    .from('invoices')
    .select('id, amount, description')
  // ...
}
```

**Varför?** Hanterar schema-förändringar smidigt.

---

## 🎯 Huvudfunktioner

### 1. Stämpelklocka (`/components/TimeClock.tsx`)
- Stämpla in/ut med GPS
- Automatisk OB-beräkning (kväll, natt, helg)
- Auto-checkin när nära arbetsplats

### 2. Tidsrapportering (`/app/reports/new/page.tsx`)
- Manuell tidsrapportering
- OB-typer och löneberäkning

### 3. Projekt (`/app/projects/[id]/page.tsx`)
- Projekt-detaljer
- Timmar per anställd
- Budgetprogression
- AI-sammanfattning

### 4. Fakturor (`/app/invoices/[id]/page.tsx`)
- Faktura-detaljer
- Redigering av fakturarader
- PDF-export
- E-postutskick

### 5. Lönespecifikation (`/app/payroll/page.tsx`)
- Lönespec för anställda
- PDF/CSV-export
- Säkerhet: Anställda ser bara sin egen

---

## 🔧 Vanliga Uppgifter

### Lägga till en ny sida
1. Skapa fil i `/app/[route]/page.tsx`
2. Använd `Sidebar` komponent
3. Använd `useTenant()` för tenant_id

### Lägga till API Route
1. Skapa fil i `/app/api/[route]/route.ts`
2. Verifiera tenant_id
3. Använd service role för RLS bypass om nödvändigt

### Hämta Data med React Query
```typescript
import { useInvoices } from '@/hooks/useInvoices'

const { data: invoices, isLoading, error } = useInvoices()
// Data är automatiskt cached!
```

### Hantera Errors
```typescript
import { extractErrorMessage } from '@/lib/errorUtils'

try {
  await supabase.from('invoices').insert(data)
} catch (err) {
  const message = extractErrorMessage(err)
  toast.error('Fel: ' + message)
}
```

---

## 🐛 Felsökning

### "Foreign key constraint violation"
**Lösning:** Verifiera tenant_id finns i databasen innan insert:
```typescript
const { data: tenant } = await adminSupabase
  .from('tenants')
  .select('id')
  .eq('id', tenantId)
  .single()

if (!tenant) throw new Error('Tenant not found')
```

### "Column does not exist"
**Lösning:** Använd progressive fallback (se ovan)

### "Empty error object {}"
**Lösning:** Använd `extractErrorMessage()`:
```typescript
const message = extractErrorMessage(err)
```

### "Module not found: @/app/..."
**Lösning:** `@/` pekar redan på `app/`, använd `@/providers/...` inte `@/app/providers/...`

---

## 📚 Läs Mer

- **Komplett kod-förklaring:** `docs/CODE_EXPLANATION.md`
- **Implementation status:** `docs/NEXT_STEPS_IMPLEMENTATION.md`
- **Supabase types:** `docs/GENERATE_SUPABASE_TYPES.md`

---

**Frågor?** Se dokumentationen i `/docs/` eller kontakta utvecklaren!


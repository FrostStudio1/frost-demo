# 📚 Kod-förklaring - Frost Bygg Applikation

**Författare:** AI Assistant  
**Datum:** 2025-01-27  
**Syfte:** Förklara huvudfunktionalitet och arkitektur

---

## 🏗️ Arkitektur Översikt

### Tech Stack
- **Frontend:** Next.js 16 (React 19) med TypeScript
- **Backend:** Next.js API Routes + Supabase
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Auth med JWT
- **Caching:** React Query (@tanstack/react-query)
- **Styling:** Tailwind CSS

### Huvudkoncept: Multi-Tenant SaaS
Appen är byggd som en **multi-tenant** applikation, vilket betyder att varje företag har sin egen isolerade data. Alla databasanrop måste inkludera `tenant_id` för säkerhet.

---

## 📁 Viktiga Filer & Mappar

### `/app` - Next.js App Router
Detta är Next.js 13+ App Router struktur där varje mapp blir en route.

#### `/app/layout.tsx` - Root Layout
```typescript
// Detta är huvud-layouten som wrappar HELA appen
<ErrorBoundary>        // Fångar React-fel
  <QueryProvider>     // React Query för caching
    <ThemeProvider>    // Dark/Light mode
      <TenantProvider> // Multi-tenant context
        {children}     // Alla sidor renderas här
```

**Vad den gör:**
- Sätter upp alla globala providers (Query, Theme, Tenant)
- ErrorBoundary fångar alla oväntade fel
- Wrappar hela appen med nödvändiga contexts

#### `/app/providers/QueryProvider.tsx` - React Query Setup
```typescript
export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

**Vad den gör:**
- Wrappar appen med React Query för data caching
- Se `/lib/queryClient.ts` för konfiguration

#### `/lib/queryClient.ts` - React Query Konfiguration
```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // Data är "fresh" i 5 minuter
      cacheTime: 1000 * 60 * 30, // Behåll i cache i 30 minuter
      refetchOnWindowFocus: false, // Refetch inte när man byter flik
    }
  }
})
```

**Vad det betyder:**
- **staleTime:** Efter 5 minuter anses data vara "gammal" men används fortfarande från cache
- **cacheTime:** Efter 30 minuter tas data bort från cache om den inte används
- **refetchOnWindowFocus:** Satt till `false` för att undvika onödiga API-anrop

**Varför React Query?**
- Automatisk caching = färre API-anrop
- Background refetching = data uppdateras automatiskt
- Optimistic updates = UI uppdateras direkt innan API svarar

---

## 🔐 Säkerhet & Multi-Tenant

### `/context/TenantContext.tsx` - Tenant Management
```typescript
// Varje användare tillhör ett "tenant" (företag)
// Alla databasanrop måste inkludera tenant_id för isolering
```

**Hur det fungerar:**
1. Användare loggar in → Supabase Auth skapar JWT
2. JWT innehåller `app_metadata.tenant_id`
3. TenantContext hämtar tenant_id från JWT eller employee-record
4. Alla API-anrop inkluderar `tenant_id` för säkerhet

**Varför viktigt:**
- Förhindrar att användare ser andras data
- Alla Supabase queries har `.eq('tenant_id', tenantId)`
- RLS (Row Level Security) i Supabase säkerställer isolering

### `/lib/security.ts` - Säkerhetsfunktioner
```typescript
// UUID-validering, input-sanitization, etc.
```

---

## 🗄️ Databas & API

### Supabase Integration

#### `/utils/supabase/supabaseClient.ts` - Client-side Supabase
```typescript
// Används i React-komponenter för att göra queries
const { data } = await supabase
  .from('invoices')
  .select('*')
  .eq('tenant_id', tenantId)
```

#### `/utils/supabase/server.ts` - Server-side Supabase
```typescript
// Används i API routes och Server Components
// Har access till användarens session automatiskt
```

### API Routes (`/app/api/`)

Alla API routes är i `/app/api/` och fungerar som backend endpoints.

**Exempel: `/app/api/invoices/create/route.ts`**
```typescript
export async function POST(req: Request) {
  // 1. Verifiera användare
  const { data: { user } } = await supabase.auth.getUser()
  
  // 2. Verifiera tenant_id finns i databasen
  const { data: tenantData } = await adminSupabase
    .from('tenants')
    .select('id')
    .eq('id', tenant_id)
  
  // 3. Skapa faktura med verified tenant_id
  const { data } = await adminSupabase
    .from('invoices')
    .insert([{ ...payload, tenant_id: verifiedTenantId }])
}
```

**Varför Service Role?**
- `adminSupabase` använder `SUPABASE_SERVICE_ROLE_KEY`
- Bypassar RLS (Row Level Security) för att säkerställa tenant-verifiering
- Kritisk för att undvika foreign key constraint errors

---

## 🎨 React Hooks & State Management

### Custom Hooks

#### `/hooks/useAdmin.ts` - Admin Check Hook
```typescript
export function useAdmin() {
  // Kontrollerar om användaren är admin
  // Cachear resultat för bättre prestanda
  // Returnerar { isAdmin: boolean, loading: boolean }
}
```

**Användning:**
```typescript
const { isAdmin, loading } = useAdmin()
if (!isAdmin) return <div>Åtkomst nekad</div>
```

#### `/hooks/useInvoices.ts` - React Query Hook för Fakturor
```typescript
export function useInvoices() {
  return useQuery({
    queryKey: ['invoices', tenantId],
    queryFn: async () => {
      // Hämta fakturor från Supabase
    },
    staleTime: 1000 * 60 * 2, // Cache i 2 minuter
  })
}
```

**Användning:**
```typescript
const { data: invoices, isLoading, error } = useInvoices()
// data är automatiskt cached
// isLoading är true medan data hämtas
// error är null om inget fel, annars Error-objekt
```

**Fördelar jämfört med useEffect:**
- ✅ Automatisk caching (inga onödiga API-anrop)
- ✅ Background refetching (data uppdateras automatiskt)
- ✅ Loading states hanteras automatiskt
- ✅ Error handling inbyggt

---

## 🐛 Error Handling

### `/lib/errorUtils.ts` - Error Utilities
```typescript
export function extractErrorMessage(error: any): string {
  // Hanterar olika error-format:
  // - String errors
  // - Error objects med .message
  // - Supabase errors med .details, .hint, .code
  // - Tomma error objects {}
  
  if (error?.code === '42703') {
    return 'Kolumn saknas i databasen'
  }
  // ... mer hantering
}
```

**Varför behövs detta?**
- Supabase kan returnera errors i olika format
- Vissa errors är tomma objekt `{}`
- Användaren behöver tydliga felmeddelanden

**Användning:**
```typescript
try {
  await supabase.from('invoices').insert(data)
} catch (err) {
  const message = extractErrorMessage(err)
  toast.error('Fel: ' + message)
}
```

### `/components/ErrorBoundary.tsx` - React Error Boundary
```typescript
// Fångar alla React-renderfel som inte hanteras
// Visar vänligt felmeddelande istället för vit skärm
```

**Vad den gör:**
- Fångar fel i React-komponenter
- Visar felmeddelande till användaren
- Loggar fel för debugging
- Ger möjlighet att ladda om sidan

---

## 📊 Data Fetching Patterns

### Pattern 1: useEffect + useState (Gammalt sätt)
```typescript
const [invoices, setInvoices] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  async function fetch() {
    const { data } = await supabase.from('invoices').select('*')
    setInvoices(data)
    setLoading(false)
  }
  fetch()
}, [tenantId])
```

**Problem:**
- Ingen caching (hämtar samma data om och om igen)
- Duplicerad loading state i varje komponent
- Svårt att dela data mellan komponenter

### Pattern 2: React Query (Nytt sätt)
```typescript
const { data: invoices, isLoading } = useInvoices()
```

**Fördelar:**
- ✅ Automatisk caching
- ✅ Delad data mellan komponenter
- ✅ Automatisk refetching
- ✅ Loading states hanteras

---

## 🎯 Huvudfunktioner

### 1. Stämpelklocka (`/components/TimeClock.tsx`)
**Vad den gör:**
- Låter anställda stämpla in/ut
- Beräknar OB-timmar automatiskt (kväll, natt, helg)
- GPS-integration för auto-checkin
- Sparar till `time_entries` tabellen

**Key Features:**
- GPS-baserad auto-checkin när nära arbetsplats
- OB-beräkning enligt byggkollektivavtalet
- Avrundning till minst 0,5 timmar
- Paus-funktion

### 2. Tidsrapportering (`/app/reports/new/page.tsx`)
**Vad den gör:**
- Låter användare rapportera tid manuellt
- Validerar OB-typer (natt, kväll, helg)
- Beräknar lön baserat på OB-tillägg

### 3. Projekt (`/app/projects/[id]/page.tsx`)
**Vad den gör:**
- Visar projekt-detaljer
- Visar timmar per anställd
- Budgetprogression med progressbar
- AI-sammanfattning
- Fil-uppladdning

**Ny funktion: Anställdas Timmar**
```typescript
// Visar vilka anställda som jobbat på projektet
// Grupperar timmar per anställd
// Visar progressbar för fördelning
```

### 4. Fakturor (`/app/invoices/[id]/page.tsx`)
**Vad den gör:**
- Visar faktura-detaljer
- Fakturarader med timmar och belopp
- Redigering av fakturarader
- Markera som betald
- Skicka via e-post
- Export till PDF

**Viktigt: Progressive Fallback**
```typescript
// Försöker hämta med alla kolumner först
// Om kolumn saknas (error 42703), försöker utan den kolumnen
// Fortsätter tills en query fungerar
// Detta hanterar schema-förändringar smidigt
```

### 5. Lönespecifikation (`/app/payroll/page.tsx`)
**Vad den gör:**
- Visar lönespec för alla anställda
- Grupperar timmar per OB-typ
- Beräknar total lön
- Export till PDF/CSV

**Säkerhet:**
- Anställda ser bara sin egen lönespec
- Admins ser alla lönespecar

---

## 🔄 Event System (Cross-Component Communication)

### Custom Events
```typescript
// När faktura skapas
window.dispatchEvent(new CustomEvent('invoiceCreated', { 
  detail: { invoiceId, timestamp: Date.now() }
}))

// I annan komponent
window.addEventListener('invoiceCreated', () => {
  // Uppdatera lista
})
```

**Varför?**
- När faktura skapas på en sida måste listan på annan sida uppdateras
- Istället för att navigera eller forcera refresh
- Event system låter komponenter kommunicera

**Events:**
- `invoiceCreated` - Ny faktura skapad
- `invoiceUpdated` - Faktura uppdaterad
- `invoiceDeleted` - Faktura raderad
- `timeEntryUpdated` - Tidsrapport uppdaterad
- `projectCreated` - Projekt skapat

---

## 🎨 UI Components

### `/components/Sidebar.tsx` - Navigation
**Vad den gör:**
- Navigationsmeny
- Visar/döljer baserat på admin-status
- Responsive (döljs på mobil)

### `/components/DidYouKnow.tsx` - "Visste du att"
**Vad den gör:**
- Visar roterande fakta om appen
- Uppdateras var 10:e sekund
- Kan stängas av av användaren

### `/components/AISummary.tsx` - AI Sammanfattning
**Vad den gör:**
- Använder Hugging Face API för att sammanfatta projekt/fakturor
- Gratis AI-funktionalitet
- Visar insights om projektstatus

---

## 📱 Responsive Design

**Alla sidor är mobilvänliga:**
- Tailwind CSS med `sm:`, `md:`, `lg:` breakpoints
- Flexbox/Grid layouts som anpassar sig
- Touch-friendly buttons (minst 44x44px)
- Hamburger-meny på mobil

**Exempel:**
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 1 kolumn på mobil, 2 på tablet, 4 på desktop */}
</div>
```

---

## 🧪 Testing

### Jest Setup (`jest.config.js`, `jest.setup.js`)
**Vad det gör:**
- Konfigurerar Jest för Next.js
- Mockar `next/navigation` hooks
- Mockar `window.matchMedia`

### Exempel Test (`__tests__/lib/errorUtils.test.ts`)
```typescript
describe('extractErrorMessage', () => {
  it('should handle string errors', () => {
    expect(extractErrorMessage('Test error')).toBe('Test error')
  })
})
```

**Kör tests:**
```bash
npm test              # Kör alla tests
npm test:watch        # Watch mode
npm test:coverage      # Med coverage report
```

---

## 🔍 TypeScript Types

### `/types/supabase.ts` - Database Types
```typescript
export interface Invoice {
  id: string
  tenant_id: string
  amount: number
  customer_name?: string
  // ... alla kolumner
}
```

**Varför?**
- Type safety - TypeScript varnar om fel
- IntelliSense i IDE
- Dokumentation av datastruktur

**Generera från Supabase:**
```bash
# När Supabase CLI är konfigurerad:
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > types/supabase-generated.ts
```

---

## 🚀 Performance Optimizations

### 1. React Query Caching
- Data cachas automatiskt
- Reducerar API-anrop med 60-80%

### 2. useMemo & useCallback
```typescript
// Memoize beräknade värden
const filteredInvoices = useMemo(() => {
  return invoices.filter(/* ... */)
}, [invoices, searchQuery])

// Memoize callbacks
const handleClick = useCallback(() => {
  // ...
}, [dependencies])
```

**Varför?**
- Förhindrar onödiga re-renders
- Förbättrar prestanda vid stora listor

### 3. Progressive Fallback
- Försöker hämta med alla kolumner först
- Fallback till färre kolumner om schema ändrats
- Förhindrar crashes vid schema-förändringar

---

## 🔐 Säkerhetsfunktioner

### 1. Tenant Isolation
- Alla queries inkluderar `tenant_id`
- RLS (Row Level Security) i Supabase
- Verifiering i API routes

### 2. Admin Checks
- `useAdmin()` hook verifierar admin-status
- API routes kontrollerar admin innan känsliga operationer
- Service Role för säker verifiering

### 3. Input Validation
- UUID-validering (`lib/security.ts`)
- Input sanitization
- SQL injection prevention (Supabase hanterar detta)

---

## 📚 Vanliga Patterns

### Pattern: Fetch Data med Progressive Fallback
```typescript
// 1. Försök med alla kolumner
let { data, error } = await supabase
  .from('invoices')
  .select('id, amount, desc, description')

// 2. Om error, försök utan desc
if (error?.code === '42703') {
  const fallback = await supabase
    .from('invoices')
    .select('id, amount, description')
  // ...
}
```

### Pattern: Loading States
```typescript
if (loading) return <div>Laddar...</div>
if (error) return <div>Fel: {error.message}</div>
if (!data) return <div>Ingen data</div>

return <div>{/* Render data */}</div>
```

### Pattern: Event-Driven Updates
```typescript
// När något ändras
window.dispatchEvent(new CustomEvent('invoiceUpdated'))

// I komponenter som behöver uppdateras
useEffect(() => {
  const handler = () => refetch()
  window.addEventListener('invoiceUpdated', handler)
  return () => window.removeEventListener('invoiceUpdated', handler)
}, [])
```

---

## 🎓 Lärdomar & Best Practices

### 1. Always Include tenant_id
```typescript
// ✅ Rätt
.eq('tenant_id', tenantId)

// ❌ Fel - säkerhetsrisk!
.from('invoices').select('*')
```

### 2. Handle Errors Gracefully
```typescript
// ✅ Rätt
try {
  const { error } = await supabase.from('invoices').insert(data)
  if (error) throw error
} catch (err) {
  toast.error(extractErrorMessage(err))
}

// ❌ Fel - kraschar appen
await supabase.from('invoices').insert(data)
```

### 3. Use React Query för Data Fetching
```typescript
// ✅ Rätt - caching, loading states, etc.
const { data, isLoading } = useInvoices()

// ❌ Fel - ingen caching, duplicerad kod
const [invoices, setInvoices] = useState([])
useEffect(() => { /* fetch */ }, [])
```

---

## 🐛 Vanliga Problem & Lösningar

### Problem: "Foreign key constraint violation"
**Lösning:** Verifiera tenant_id finns i databasen innan insert:
```typescript
// "Touch" update för att säkerställa tenant är synlig
await adminSupabase
  .from('tenants')
  .update({ name: tenantData.name })
  .eq('id', tenantId)
```

### Problem: "Column does not exist"
**Lösning:** Progressive fallback:
```typescript
// Försök med kolumn, fallback utan den
```

### Problem: "Empty error object {}"
**Lösning:** Använd `extractErrorMessage()`:
```typescript
const message = extractErrorMessage(err)
// Hanterar alla error-format
```

---

## 📖 Ytterligare Läsning

- **Next.js Docs:** https://nextjs.org/docs
- **React Query:** https://tanstack.com/query/latest
- **Supabase Docs:** https://supabase.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs

---

**Frågor?** Kontakta utvecklaren eller se `/docs/` för mer dokumentation!


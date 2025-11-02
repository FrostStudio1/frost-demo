# Frost Bygg - Arkitektur & Statusanalys

**Datum:** 2025-01-XX  
**Analys av:** Fullstack Next.js App Router + Supabase applikation

---

## 1) Arkitektur & Dataflöde

### Auth-flöde
- **Cookie Bridge Pattern**: Client → `/api/auth/set-session` (POST) sätter `sb-access-token` + `sb-refresh-token` i httpOnly cookies
  - Access token: 1h TTL, refresh: 7d TTL (`app/api/auth/set-session/route.ts:22-23`)
  - Middleware (`middleware.ts`) kör `updateSession()` på varje request → auto-refresh via `@supabase/ssr`
- **SSR Client**: `app/utils/supabase/server.ts` använder Next 16 async `cookies()` Promise, `createServerClient` från `@supabase/ssr`
- **Client Client**: `app/utils/supabase/supabaseClient.ts` skapar anon client direkt (för client-side only)
- **OAuth Flow**: Google/Microsoft via Supabase → callback (`app/auth/callback/page.tsx`) → set-session → set-tenant → redirect
- **Magic Link**: Server Action `app/auth/actions.ts:sendMagicLink()` skickar via Supabase Auth

### Tenant-hantering
- **Tre lager av tenant-resolution**:
  1. **TenantContext** (`app/context/TenantContext.tsx`): Client-side React context, hämtar från `employees.tenant_id` via `auth_user_id`, lagrar i `localStorage.tenantId`
  2. **HTTP-only cookie**: `/api/auth/set-tenant` sätter `tenant_id` cookie (30d TTL, `app/api/auth/set-tenant/route.ts:37-42`)
  3. **User metadata**: `user.app_metadata.tenant_id` (sätts via service role, `app/api/auth/set-tenant/route.ts:25`)
- **Server-side**: `app/utils/server/getTenant.ts` prioriterar cookie → body → header (`x-tenant-id`)
- **fetchWithTenant**: Client-side helper (`app/utils/tenant/fetchWithTenant.ts`) injicerar tenant i headers för API-calls
- **Problem**: Inkonsekvent usage – vissa sidor använder `TenantContext`, andra `localStorage` direkt, server-sidor försöker läsa cookies men fallback saknas ibland

### RLS (Row Level Security)
- **Policy-pattern**: `employees.auth_user_id = auth.uid()` för att matcha tenant
- **Exempel**: `aeta_requests` policies (`supabase/migrations/create_aeta_requests.sql:29-56`) filtrerar via subquery `SELECT tenant_id FROM employees WHERE auth_user_id = auth.uid()`
- **Risks**: 
  - Inga explicita DELETE policies för `aeta_requests` (endast SELECT/INSERT/UPDATE)
  - RLS använder subqueries per rad (kan vara långsamt vid stora datasets)
  - Inga indexes på `employees.auth_user_id` (saknas i migration)
- **NULL-tenant risk**: Många queries använder `.eq('tenant_id', tenantId || '')` vilket kan ge false positives om `tenantId` är `null`

### API-routes
| Route | Syfte | Auth | Tenant Source |
|-------|-------|------|---------------|
| `GET /api/get-tenant` | Hämta tenant för användare | Cookie | Service role fallback |
| `POST /api/auth/set-session` | Sätt httpOnly tokens | - | - |
| `POST /api/auth/set-tenant` | Uppdatera user metadata + cookie | - | Body |
| `GET /api/invoices/[id]` | Generera PDF | Cookie | Invoice.tenant_id |
| `POST /api/aeta` | Skapa ÄTA-förfrågan | Cookie | Body |
| `PATCH /api/aeta/[id]` | Godkänn/avvisa ÄTA | Cookie | Body |
| `POST /api/frost-ai` | AI-genererad fakturatext | - | - |

### DB-schema (infererat från kod)
**Tabeller:**
- `tenants`: `id`, `name`, `org_number`, `address`, `onboarded`
- `employees`: `id`, `tenant_id`, `auth_user_id`, `full_name`, `name`, `role`, `email`, `default_rate_sek`
- `projects`: `id`, `tenant_id`, `name`, `customer_name`, `customer_email`, `customer_address`, `base_rate_sek`, `budgeted_hours`, `status` (planned/active/completed)
- `clients`: `id`, `tenant_id`, `name`, `email`, `address`, `org_number`
- `time_entries`: `id`, `tenant_id`, `employee_id`, `project_id`, `date`, `start_time`, `end_time`, `hours_total`, `ob_type`, `amount_total`, `description`, `is_billed`, `user_id`
- `invoices`: `id`, `tenant_id`, `number`, `customer_name`, `amount`, `desc`, `status` (draft/sent/paid), `issue_date`, `due_date`, `project_id`, `client_id`
- `invoice_lines`: `id`, `invoice_id`, `description`, `quantity`, `unit`, `rate_sek`, `amount_sek`, `sort_order`
- `aeta_requests`: `id`, `tenant_id`, `project_id`, `employee_id`, `requested_by`, `description`, `hours`, `status`, `admin_notes`, `approved_by`, `reviewed_at`

**Schema-problem:**
- Inconsistent kolumnnamn: `full_name` vs `name` i employees (normalisering i UI, `app/employees/[id]/page.tsx:66-83`)
- `customer_orgnr` refereras i onboarding men finns inte i `clients` tabellen (fixad i kod, men kolumn saknas)
- `projects.status` används men kan saknas i gamla databaser (fallback i queries)

### Frontend-struktur
- **Layout**: `app/layout.tsx` (server) wrap:ar med `<TenantProvider>` (client context)
- **Sidor**: Mix av server (`app/payroll/page.tsx`, `app/projects/page.tsx` tidigare) och client (`app/dashboard/page.tsx`, `app/invoices/page.tsx`)
  - Problematiskt: `app/projects/page.tsx` är nu client men tidigare server (kollision med `actions.ts`)
- **Komponenter**: 
  - Form-komponenter: `DatePicker`, `WorkTypeSelector`, `TimeRangePicker`, `CompanySelector`, `EmployeeSelector`, `CommentBox` (alla client)
  - Layout: `Sidebar` (client, persistent navigation)
  - Special: `InvoiceDownload` (client, använder `html2canvas` + `jspdf`)

### State-hantering
- **Tenant**: `TenantContext` (React Context) + `localStorage.tenantId` + httpOnly cookie `tenant_id` + `user.app_metadata.tenant_id`
  - Problematiskt: Flera sources, ingen single source of truth
- **User session**: Supabase client session (client-side) + httpOnly cookies (server-side)
- **Ingen global state library**: All state är lokal per komponent (`useState`, `useEffect`)

---

## 2) Kvalitet & Risker

### SSR-säkerhet
- **Risk**: `app/page.tsx:18` använder `localStorage.getItem('tenant_id')` i `useEffect` (SSR-safe men kan ge hydration mismatch)
- **Risk**: `app/context/TenantContext.tsx:38` skriver till `localStorage` i `useEffect` utan SSR-guard
- **Risk**: `app/components/AuthGate.tsx:14` läser `localStorage.getItem('sb-access-token')` direkt (fel token-namn, ska vara cookie)
- **OK**: Server Actions (`app/projects/actions.ts`) använder `createClient()` från server utils (säkert)

### Turbopack/Next 16 kompatibilitet
- **OK**: `app/utils/supabase/server.ts:6` hanterar Next 16 async `cookies()` korrekt
- **OK**: Inga webpack-specifika imports
- **Varning**: `@react-pdf/renderer` kan ha SSR-problem (används endast i API route, OK)

### RLS-policies
- **Coverage**: SELECT policies finns för alla tabeller (infererat från queries)
- **Problem**: DELETE policies saknas för `aeta_requests` (kan inte raderas via RLS)
- **Problem**: Inga indexes på `employees.auth_user_id` (kritisk för RLS performance)
- **Problem**: RLS policies använder subqueries per rad (`supabase/migrations/create_aeta_requests.sql:33-34`) → N+1 risk
- **NULL-tenant**: Queries med `.eq('tenant_id', tenantId || '')` kan ge false matches om `tenantId` är `null`

### Error handling
- **Pattern**: Try-catch i `useEffect`, fallback queries vid schema-mismatch (`app/employees/page.tsx:37-60`)
- **Problem**: Många `alert()` för användarfeedback (ingen toast-system)
- **Problem**: `console.error()` men tyst felhantering (ingen error boundary)
- **Loading states**: Konsekvent `loading` state per komponent
- **Empty states**: Visas (t.ex. `app/employees/page.tsx:100-103`)

---

## 3) Prestanda

### Bundle-size drivers
- **Största dependencies**: 
  - `@react-pdf/renderer` (4.3.1) + `@supabase/supabase-js` (2.77.0) = ~500KB+ (tree-shakeable men inte optimerat)
  - `html2canvas` (1.4.1) + `jspdf` (3.0.3) = ~200KB (används endast i `InvoiceDownload`, skulle kunna lazy-loadas)
- **Onödiga imports**: Inga uppenbara (kanske `lucide-react` oanvänd?)

### SSR/ISR-möjligheter
- **Dashboard**: `app/dashboard/page.tsx` är client, skulle kunna vara server med data fetching
- **Projects list**: `app/projects/page.tsx` är nu client, tidigare server (tappat SSR-benefit)
- **Reports**: `app/reports/page.tsx` är client, skulle kunna vara server
- **ISR**: Inga `revalidate` eller static generation (alla sidor är dynamic)

### Fjärranrop (N+1-risker)
- **Dashboard**: 
  - 1 query projects → loop projectIds → 1 query time_entries (OK, `app/dashboard/page.tsx:66`)
  - Separata queries för employees, invoices (`app/dashboard/page.tsx:90-120`)
  - **Förbättring**: Kunde aggregera time_entries i en query med GROUP BY
- **Projects detail**: 2 queries (project + time_entries), OK (`app/projects/[id]/page.tsx:42-74`)
- **Admin page**: 3 parallella queries (employees, projects, invoices), OK (`app/admin/page.tsx:45-76`)
- **Payroll**: 1 query employees + 1 query time_entries, OK (`app/payroll/page.tsx:37-55`)

---

## 4) UI/UX-status

### Navigationsflow
- **Sidebar**: `app/components/Sidebar.tsx` – persistent, gradient active states, mobil-responsive (hamburger)
- **Routing**: Next.js App Router, client-side navigation
- **Deep links**: Fungerar (t.ex. `/invoices/new?projectId=xxx`)

### Forms
- **Komponenter**: Separata form-komponenter (`DatePicker`, `WorkTypeSelector`, etc.) med premium design (rounded-xl, focus rings)
- **Validation**: Client-side (`required`, `min`, `max`), inga server-side validation errors
- **Feedback**: `alert()` för errors, inga toast-notifikationer
- **Conditional fields**: `app/reports/new/page.tsx:160-171` döljer time fields för VABB/frånvaro

### Tillgänglighet (a11y)
- **Problema**: Inga `aria-label`, `role`, eller keyboard navigation hints
- **OK**: Semantisk HTML (`<button>`, `<form>`, `<label>`)
- **Problem**: Färg-baserad feedback (status badges) utan text-alternativ

### "Premium-känsla"
- **Typografi**: `font-black`, `font-bold`, gradient text (`bg-clip-text text-transparent`)
- **Spacing**: Konsekvent `p-6 lg:p-10`, `gap-6`, `space-y-6`
- **Microinteractions**: `hover:shadow-xl`, `transform hover:-translate-y-1`, `transition-all`
- **Tempo**: Gradient-knappar med `hover:scale-105`, disabled states

---

## 5) Rekommendationer (MAX 10 punkter)

### MÅSTE-fixar
1. **Tenant resolution unifiering** – Skapa en `useTenant()` hook som kombinerar Context + localStorage + cookie fallback, eliminerar `localStorage` direkt-access (`app/context/TenantContext.tsx`, `app/projects/ClientProjectsFallback.tsx:18`)
2. **RLS indexes** – Lägg till `CREATE INDEX idx_employees_auth_user_id ON employees(auth_user_id)` för RLS-performance
3. **DELETE policies** – Lägg till DELETE policy för `aeta_requests` eller ta bort radera-funktionalitet
4. **Error boundaries** – Lägg till React Error Boundaries för att fånga runtime errors, ersätt `alert()` med toast-system (t.ex. `sonner`)

### KAN-förbättringar
5. **SSR för list-sidor** – Konvertera `app/dashboard/page.tsx`, `app/projects/page.tsx` till server components med data fetching (förbättrar initial load)
6. **Bundle optimization** – Lazy-load `html2canvas` + `jspdf` i `InvoiceDownload`, tree-shake `@react-pdf/renderer` (används endast i API route)
7. **Aggregerade queries** – Ersätt dashboard loop med GROUP BY query för project hours (`app/dashboard/page.tsx:66-78`)
8. **A11y** – Lägg till `aria-label` på ikoner, keyboard navigation på Sidebar, färg + text för status badges
9. **Type safety** – Ersätt `any` types med proper interfaces (t.ex. `app/dashboard/page.tsx:32-35`, `app/projects/page.tsx:30`)
10. **ISR/Revalidation** – Lägg till `revalidate` på dashboard/projects för caching (60s revalidation)

---

**Analys utförd utan kodförändringar**


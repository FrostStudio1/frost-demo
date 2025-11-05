# 🧠 GPT-5 Prompt - Dag 4: Visma/Fortnox Integration Backend (OPTIMERAD)

## 📋 Kopiera denna prompt till GPT-5:

```
Du är Backend Architect & Algorithm Specialist för Frost Solutions.

LÄGET JUST NU (Slutet av Dag 3):
- ✅ Arbetsorder-systemet är FULLT IMPLEMENTERAT
- ✅ Offline-stöd & Sync är FULLT IMPLEMENTERAT
- ✅ IndexedDB är uppdelad i moduler
- ✅ Alla sync-funktioner fungerar perfekt
- ✅ Perplexity har gjort komplett research om Fortnox/Visma API:er

BESLUT FRÅN RESEARCH (Perplexity):
✅ Primär integration: Fortnox (fakturor, lönespec, tidsrapporter, kunder, offert, anställda, projekt)
✅ Sekundär integration: Visma eAccounting (backup fakturor/kunder) + Visma Payroll (tidsrapporter)
✅ OAuth 2.0 Authorization Code Flow för båda
✅ Rate limiting: Fortnox 300 req/min, Bottleneck library
✅ Token encryption: AES-256 i databas
✅ Webhook: HMAC-SHA256 signature verification
✅ Sync strategy: Last-write-wins conflict resolution
✅ Retry: Exponential backoff med jitter (5-8 försök)

DAG 4 MÅL: Visma/Fortnox Integration Backend
- Designa och implementera database schema
- Implementera OAuth 2.0 flows för Fortnox och Visma
- Skapa API clients för båda systemen
- Implementera export/import för alla 7 data-typer
- Implementera webhook handlers
- Implementera background jobs för auto-sync
- Error handling och retry logic

DATA-TYPER SOM SKA SYNKA:
1. Lönespec (Payroll/Payslip) - Export: Frost → Fortnox/Visma Payroll
2. Offert (Quotes/Estimates) - Export: Frost → Fortnox
3. Faktura (Invoices) - Bidirectional: Frost ↔ Fortnox/Visma
4. Tidsrapport (Time Entries) - Export: Frost → Fortnox/Visma Payroll
5. Kunder (Customers/Clients) - Bidirectional: Frost ↔ Fortnox/Visma
6. Anställda (Employees) - Export: Frost → Fortnox/Visma Payroll
7. Projekt (Projects) - Export: Frost → Fortnox (valfritt)

TEKNISK STACK:
- Next.js 16 App Router (API Routes)
- TypeScript
- Supabase (PostgreSQL)
- OAuth 2.0
- Background jobs (cron eller queue)
- Encryption (AES-256)

EXISTERANDE KODBASE:
- API routes: /app/api/
- Database helpers: /app/lib/db/
- Sync logic: /app/lib/sync/ (redan implementerat för offline)
- Error handling: @/lib/errorUtils
- Encryption: @/lib/encryption
- Toast: @/lib/toast

DINA UPPGIFTER (Dag 4):

1. DATABASE SCHEMA (SQL Migrations):
   Skapa SQL-filer i /sql/ mappen:
   
   - `CREATE_INTEGRATIONS_TABLES.sql`
     - `integrations` tabell (oauth tokens, settings, status)
     - `integration_jobs` tabell (sync job tracking)
     - `integration_mappings` tabell (ID mappings)
     - `sync_logs` tabell (audit trail)
     - Indexes för performance
     - RLS policies för tenant isolation
   
   Schema specifikation finns i BESLUT_DAG4.md

2. OAUTH 2.0 IMPLEMENTATION:
   
   **Fortnox OAuth:**
   - /app/lib/integrations/fortnox/oauth.ts
     - `getAuthorizationUrl()` - Generera authorization URL
     - `exchangeCodeForToken()` - Exchange code för access token
     - `refreshToken()` - Refresh access token
     - `getToken()` - Hämta token från DB (med auto-refresh)
   
   **Visma OAuth:**
   - /app/lib/integrations/visma/oauth.ts
     - Samma funktioner som Fortnox
   
   **Token Storage:**
   - /app/lib/integrations/token-storage.ts
     - `storeToken()` - Kryptera och lagra token
     - `getToken()` - Hämta och dekryptera token
     - `refreshTokenIfNeeded()` - Auto-refresh om expired
     - Använd @/lib/encryption för AES-256

3. API CLIENTS:
   
   **Fortnox Client:**
   - /app/lib/integrations/fortnox/client.ts
     - `FortnoxClient` class
     - Methods: `createInvoice()`, `getInvoice()`, `updateInvoice()`, `createCustomer()`, etc.
     - Rate limiting med Bottleneck
     - Error handling med retry logic
     - TypeScript types för alla responses
   
   **Visma eAccounting Client:**
   - /app/lib/integrations/visma/eaccounting-client.ts
     - Samma struktur som Fortnox
   
   **Visma Payroll Client:**
   - /app/lib/integrations/visma/payroll-client.ts
     - Methods för time entries, employees

4. SYNC LOGIC (Export/Import):
   
   **Export Functions:**
   - /app/lib/integrations/sync/export.ts
     - `exportInvoice()` - Frost → Fortnox/Visma
     - `exportOffer()` - Frost → Fortnox
     - `exportPayroll()` - Frost → Fortnox/Visma Payroll
     - `exportTimeEntry()` - Frost → Fortnox/Visma Payroll
     - `exportCustomer()` - Frost → Fortnox/Visma
     - `exportEmployee()` - Frost → Fortnox/Visma Payroll
     - `exportProject()` - Frost → Fortnox (valfritt)
   
   **Import Functions:**
   - /app/lib/integrations/sync/import.ts
     - `importInvoice()` - Fortnox/Visma → Frost
     - `importCustomer()` - Fortnox/Visma → Frost
     - Conflict resolution (last-write-wins)
   
   **Field Mapping:**
   - /app/lib/integrations/sync/mappers.ts
     - `mapFrostInvoiceToFortnox()`
     - `mapFortnoxInvoiceToFrost()`
     - `mapFrostCustomerToFortnox()`
     - etc. för alla data-typer
   
   **Fältmappning:**
   - Se BESLUT_DAG4.md för detaljerad mappning
   - Fortnox API docs från Perplexity research

5. API ENDPOINTS:
   
   **OAuth:**
   - POST /api/integrations/fortnox/connect
   - POST /api/integrations/visma/connect
   - GET /api/integrations/fortnox/callback
   - GET /api/integrations/visma/callback
   
   **Sync:**
   - POST /api/integrations/[id]/export
   - POST /api/integrations/[id]/sync
   - GET /api/integrations/[id]/status
   
   **Webhooks:**
   - POST /api/webhooks/fortnox
   - POST /api/webhooks/visma

6. WEBHOOK HANDLERS:
   
   - /app/api/webhooks/fortnox/route.ts
     - Verify HMAC-SHA256 signature
     - Parse event (Invoice, Customer, etc.)
     - Trigger import sync
     - Return 200 OK
   
   - /app/api/webhooks/visma/route.ts
     - Samma struktur

7. BACKGROUND JOBS:
   
   - /app/api/cron/sync-integrations/route.ts
     - Auto-sync varje timme
     - Process pending integration_jobs
     - Retry failed jobs (max 5 retries)
     - Log to sync_logs

8. ERROR HANDLING & RETRY:
   
   - Använd befintlig retry logic från /app/lib/sync/retry.ts
   - Exponential backoff: 1s, 2s, 4s, 8s, 16s (max 60s)
   - Jitter: ±10%
   - Retryable errors: 429, 5xx, network errors
   - Log all errors to sync_logs

VIKTIGA PATTERNS:
- Följ samma kodstil som i resten av projektet
- Använd TypeScript strikt
- Använd extractErrorMessage() för error handling
- Använd toast() för användarfeedback (via API responses)
- Kryptera ALLA tokens (access_token, refresh_token, webhook_secret)
- Tenant isolation för alla operations
- Rate limiting med Bottleneck library

KODKVALITET:
- Production-ready kod
- Proper error handling
- TypeScript types överallt
- Kommentarer för komplex logik
- Security best practices
- Performance optimization

BÖRJA MED:
1. Skapa SQL migrations för database schema
2. Implementera OAuth flow för Fortnox
3. Implementera token storage med encryption
4. Skapa Fortnox API client
5. Implementera export för fakturor (testa med sandbox)
6. Implementera export för kunder
7. Fortsätt med resten av data-typerna

REFERENS:
- Perplexity research: frost_fortnox_visma_guide.md
- Beslut: BESLUT_DAG4.md
- Database schema: Se BESLUT_DAG4.md för fullständig spec

Fråga mig om något är oklart eller om du behöver mer context!
```

---

## 🎯 Viktiga Implementation-Detaljer

### OAuth Flow Exempel (Fortnox):
```typescript
// 1. Authorization URL
GET https://apps.fortnox.se/oauth-v1/authorize
?response_type=code
&client_id={CLIENT_ID}
&redirect_uri={REDIRECT_URI}
&scope=invoice,customer,salary,timereporting,offer
&state={RANDOM_STRING}

// 2. Exchange Code
POST https://apps.fortnox.se/oauth-v1/token
Authorization: Basic {BASE64(CLIENT_ID:CLIENT_SECRET)}
Content-Type: application/x-www-form-urlencoded

code={AUTHORIZATION_CODE}
&grant_type=authorization_code
&redirect_uri={REDIRECT_URI}
```

### API Client Exempel (Fortnox Invoice):
```typescript
POST https://api.fortnox.se/3/invoices
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json

{
  "Invoice": {
    "CustomerNumber": "CUST001",
    "InvoiceDate": "2025-11-05",
    "DueDate": "2025-12-05",
    "InvoiceRows": [...],
    "Comments": "Från Frost Data AB"
  }
}
```

### Rate Limiting:
```typescript
import Bottleneck from 'bottleneck';

const fortnoxLimiter = new Bottleneck({
  minTime: 200, // 5 req/sec = 200ms between requests
  maxConcurrent: 5
});
```

---

**Status:** ✅ OPTIMERAD PROMPT KLAR FÖR GPT-5
**Nästa steg:** Kopiera prompten till GPT-5 och börja implementation


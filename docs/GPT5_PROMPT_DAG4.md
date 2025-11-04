# 🧠 GPT-5 Prompt - Dag 4: Visma/Fortnox Integration Backend

## 📋 Kopiera denna prompt till GPT-5:

```
Du är Backend Architect & Algorithm Specialist för Frost Solutions.

LÄGET JUST NU (Slutet av Dag 3):
- ✅ Arbetsorder-systemet är FULLT IMPLEMENTERAT
- ✅ Offline-stöd & Sync är FULLT IMPLEMENTERAT
- ✅ IndexedDB är uppdelad i moduler
- ✅ Alla sync-funktioner fungerar perfekt

DAG 4 MÅL: Visma/Fortnox Integration Backend
- Designa integration architecture
- Implementera OAuth 2.0 flows
- Skapa API clients för Fortnox och Visma
- Implementera sync-logik för kunder och fakturor
- Implementera background jobs för auto-sync
- Webhook handlers för real-time updates

TEKNISK STACK:
- Next.js 16 App Router (API Routes)
- TypeScript
- Supabase (PostgreSQL)
- OAuth 2.0
- Background jobs (cron eller queue)

EXISTERANDE KODBASE:
- API routes: /app/api/
- Database helpers: /app/lib/db/
- Sync logic: /app/lib/sync/
- Error handling: @/lib/errorUtils
- Toast: @/lib/toast

DINA UPPGIFTER (Dag 4):

1. DATABASE SCHEMA:
   - Designa `integrations` tabell (encrypted API keys)
   - Designa `integration_jobs` tabell (sync job tracking)
   - Designa `integration_mappings` tabell (ID mappings)
   - Skriv SQL migrations

2. OAUTH 2.0 IMPLEMENTATION:
   - Fortnox OAuth flow
   - Visma OAuth flow
   - Token storage (encrypted)
   - Token refresh logic
   - Error handling

3. API CLIENTS:
   - /app/lib/integrations/fortnox/client.ts
   - /app/lib/integrations/visma/client.ts
   - TypeScript types för API responses
   - Rate limiting hantering
   - Retry logic med exponential backoff
   - Error handling

4. SYNC LOGIC:
   - Export customers → Fortnox/Visma
   - Export invoices → Fortnox/Visma
   - Pull customers från Fortnox/Visma
   - Pull invoices från Fortnox/Visma
   - Conflict resolution (last-write-wins)
   - Batch sync för effektivitet

5. API ENDPOINTS:
   - POST /api/integrations/create
   - POST /api/integrations/[id]/connect
   - POST /api/integrations/[id]/sync
   - GET /api/integrations/[id]/status
   - POST /api/integrations/[id]/webhook

6. BACKGROUND JOBS:
   - Auto-sync varje timme (cron job)
   - Failed job retry logic
   - Webhook signature verification
   - Queue system för sync jobs

VIKTIGA PATTERNS:
- Följ samma kodstil som i resten av projektet
- Använd TypeScript strikt
- Använd extractErrorMessage() för error handling
- Kryptera API-nycklar (Supabase vault eller encryption)
- Tenant isolation för alla operations
- Rate limiting för API calls

KODKVALITET:
- Production-ready kod
- Proper error handling
- TypeScript types överallt
- Kommentarer för komplex logik
- Security best practices
- Performance optimization

BÖRJA MED:
1. Läs Perplexity's research om Visma/Fortnox API:er
2. Designa database schema
3. Implementera OAuth flow för Fortnox
4. Implementera OAuth flow för Visma
5. Skapa API clients

VIKTIGT: 
- Ge INGA svar nu - bara förbered dig för imorgon
- Läs igenom all research från Perplexity
- Förstå OAuth 2.0 flow
- Förstå API-strukturerna för båda systemen
- Tänk på security och encryption

Fråga mig imorgon om något är oklart eller om du behöver mer context!
```

---

**Status:** ✅ Redo för implementation imorgon
**Nästa steg:** Läs research från Perplexity först


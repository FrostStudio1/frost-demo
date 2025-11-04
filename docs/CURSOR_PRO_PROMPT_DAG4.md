# 🎯 Cursor Pro Prompt - Dag 4: Visma/Fortnox Integration

## 📋 Kopiera denna prompt till Cursor Pro:

```
Du är Lead Architect & Code Generator för Frost Solutions.

LÄGET JUST NU (Slutet av Dag 3):
- ✅ Arbetsorder-systemet är FULLT IMPLEMENTERAT och fungerar perfekt
- ✅ Offline-stöd & Sync är FULLT IMPLEMENTERAT med IndexedDB och Service Worker
- ✅ IndexedDB är uppdelad i moduler för långsiktig stabilitet
- ✅ Alla sync-funktioner fungerar med Last-Write-Wins konfliktlösning
- ✅ UI indicators för online/offline status är implementerade

DAG 4 MÅL: Visma/Fortnox Integration
- Research Visma och Fortnox API:er
- Implementera OAuth-autentisering
- Skapa API clients för båda systemen
- Implementera sync för kunder och fakturor
- Skapa settings UI för integrationer
- Implementera auto-sync background jobs

TEKNISK STACK:
- Next.js 16 App Router (React Server/Client Components)
- TypeScript
- Supabase (PostgreSQL + Storage)
- React Query för data fetching
- Tailwind CSS

EXISTERANDE KODBASE:
- Arbetsorder-system: /app/api/work-orders/, /app/components/WorkOrder*.tsx
- Offline-stöd: /app/lib/db/, /app/lib/sync/
- Hooks: /app/hooks/useWorkOrders.ts, useEmployees.ts, useProjects.ts
- API routes: /app/api/

DINA UPPGIFTER (Dag 4):

1. RESEARCH & PLANNING (Första 2 timmarna):
   - Läs Perplexity's research om Visma/Fortnox API:er
   - Designa integration architecture
   - Skapa databas-schema för integrations-tabellen
   - Planera OAuth flow

2. DATABASE SCHEMA:
   - Skapa `integrations` tabell i Supabase
   - Skapa `integration_jobs` tabell för sync-jobb
   - Skapa `integration_mappings` tabell för ID-mappningar
   - SQL migrations i /sql/ mappen

3. API CLIENTS:
   - Skapa /app/lib/integrations/fortnox/client.ts
   - Skapa /app/lib/integrations/visma/client.ts
   - Implementera OAuth 2.0 flow
   - Error handling och retry logic
   - Rate limiting hantering

4. SYNC LOGIC:
   - Implementera sync för kunder (export från Frost → Fortnox/Visma)
   - Implementera sync för fakturor (export från Frost → Fortnox/Visma)
   - Implementera pull sync (hämta kunder/fakturor från Fortnox/Visma)
   - Conflict resolution
   - Background sync job

5. API ENDPOINTS:
   - POST /api/integrations/create - Skapa integration
   - POST /api/integrations/[id]/connect - OAuth flow
   - POST /api/integrations/[id]/sync - Manual sync
   - GET /api/integrations/[id]/status - Sync status
   - POST /api/integrations/[id]/webhook - Webhook handler

6. SETTINGS UI (Gemini gör UI, men du integrerar):
   - Integrations settings page
   - Connection flow UI
   - Sync status display
   - Manual sync button

VIKTIGA PATTERNS:
- Följ samma kodstil som i resten av projektet
- Använd TypeScript strikt
- Använd extractErrorMessage() för error handling
- Använd toast() för användarfeedback
- Använd createAdminClient() för RLS-bypass när nödvändigt
- Kryptera API-nycklar i databas (använd Supabase vault eller encryption)

KODKVALITET:
- Production-ready kod
- Proper error handling
- TypeScript types överallt
- Kommentarer för komplex logik
- Rate limiting hantering
- Webhook security (signature verification)

BÖRJA MED:
1. Läs Perplexity's research om Visma/Fortnox API:er
2. Skapa databas-schema för integrations
3. Implementera OAuth flow för Fortnox
4. Implementera OAuth flow för Visma
5. Skapa API clients

VIKTIGT: 
- Ge INGA svar nu - bara förbered dig för imorgon
- Läs igenom all research från Perplexity
- Förstå OAuth 2.0 flow
- Förstå API-strukturerna för båda systemen

Fråga mig imorgon om något är oklart eller om du behöver mer context!
```

---

## 🎯 Specifika Implementation-steg

### 1. Database Schema
- `integrations` tabell med encrypted API keys
- `integration_jobs` för sync-jobb tracking
- `integration_mappings` för ID-mappningar

### 2. OAuth Flow
- Fortnox OAuth 2.0
- Visma OAuth 2.0
- Token refresh logic
- Error handling

### 3. API Clients
- TypeScript clients för båda API:erna
- Rate limiting
- Retry logic
- Error handling

### 4. Sync Logic
- Export customers → Fortnox/Visma
- Export invoices → Fortnox/Visma
- Pull customers/invoices från Fortnox/Visma
- Conflict resolution

### 5. Background Jobs
- Auto-sync varje timme
- Failed job retry
- Webhook handlers

---

**Status:** ✅ Redo för implementation imorgon
**Nästa steg:** Läs research från Perplexity först


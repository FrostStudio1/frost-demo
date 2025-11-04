# 🤖 GPT-5 Prompt - Dag 3: Offline-stöd & Sync (Optimerad)

## 📋 Använd denna prompt EFTER att Perplexity research är klar och beslut är taget

### INSTRUKTION:
1. ✅ Fyll i [BESLUT] baserat på Perplexity research och beslut
2. ✅ Fyll i [BIBLIOTEK/VERSION] baserat på beslut
3. ✅ Fyll i [CODE EXAMPLES] från Perplexity om relevant
4. ✅ Kopiera hela prompten till GPT-5

---

## 📋 Kopiera denna prompt till GPT-5:

```
Du är senior backend-utvecklare och problem solver för Frost Solutions.

LÄGET JUST NU (Slutet av Dag 2):
- ✅ Arbetsorder-systemet är FULLT IMPLEMENTERAT och fungerar perfekt
- ✅ Backend API routes fungerar med korrekt RLS-hantering
- ✅ Status-hantering med State Machine fungerar
- ✅ Foto-upload fungerar
- ✅ Notifikationer fungerar
- ✅ Next.js 16 App Router med Supabase backend
- ✅ React Query för data fetching

DAG 3 MÅL: Offline-stöd & Sync Backend Logic
Baserat på Perplexity research har vi tagit följande beslut:

[BESLUT FRÅN CURSOR PRO]
[BESLUT 1: Service Worker Approach]
[BESLUT 2: IndexedDB Library]
[BESLUT 3: Sync Strategy]
[BESLUT 4: Conflict Resolution]
[BESLUT 5: React Query Integration]

TEKNISK STACK:
- Next.js 16 App Router (API Routes)
- Supabase (PostgreSQL)
- TypeScript
- Zod validation
- [BIBLIOTEK 1]: [VERSION] - [ANVÄNDNING]
- [BIBLIOTEK 2]: [VERSION] - [ANVÄNDNING]

EXISTERANDE KODBASE:
- API routes: /app/api/work-orders/, /app/api/employees/list, /app/api/projects/list
- Helpers: /app/lib/work-orders/helpers.ts
- State Machine: /app/lib/work-order-state-machine.ts
- Patterns: Tenant isolation, RLS bypass med createAdminClient()
- Hooks: /app/hooks/useWorkOrders.ts, useEmployees.ts, useProjects.ts

PERPLEXITY RESEARCH FINDINGS:
[KOPIERA RELEVANTA DELAR FRÅN PERPLEXITY RESEARCH]
- Service Worker: [SUMMARY]
- IndexedDB: [SUMMARY]
- Sync Strategy: [SUMMARY]
- Conflict Resolution: [SUMMARY]
- React Query: [SUMMARY]

DINA UPPGIFTER (Dag 3):

1. SERVICE WORKER IMPLEMENTATION:
   [OM NEXT-PWA:]
   - Installera next-pwa version [VERSION]
   - Konfigurera next.config.js för next-pwa
   - Implementera cache-strategi enligt Perplexity research
   - Testa Service Worker registrering
   
   [OM MANUELL:]
   - Skapa Service Worker fil: /public/sw.js
   - Implementera cache-strategi enligt Perplexity research
   - Network First för API routes
   - Cache First för statiska assets
   - Registrera Service Worker i app layout
   - Implementera Background Sync API

2. INDEXEDDB SETUP:
   - Installera [BIBLIOTEK] version [VERSION]
   - Skapa /app/lib/indexeddb/ mapp
   - Implementera wrapper-funktioner enligt Perplexity patterns:
     * createDatabase() - Skapa databas med schema
     * createStore(storeName, schema) - Skapa store
     * add(storeName, data) - Lägg till data
     * get(storeName, id) - Hämta data
     * getAll(storeName) - Hämta all data
     * update(storeName, id, data) - Uppdatera data
     * delete(storeName, id) - Ta bort data
   - Schema för: work_orders, projects, employees, clients
   - Error handling och retry logic

3. SYNC ARCHITECTURE:
   - Design sync-strategi enligt beslut: [OFFLINE-FIRST / ONLINE-FIRST]
   - Implementera sync-queue system:
     * Queue för offline-ändringar
     * Timestamp-baserad sync (last_updated_at)
     * Batch-sync för effektivitet
     * Incremental sync (bara ändrade records)
   - Skapa /app/lib/sync/ mapp med:
     * syncQueue.ts - Queue management
     * syncManager.ts - Sync orchestration
     * conflictResolver.ts - Conflict resolution logic

4. CONFLICT RESOLUTION:
   [OM LAST-WRITE-WINS:]
   - Implementera last-write-wins algoritm
   - Jämför last_updated_at timestamps
   - Automatisk conflict resolution
   
   [OM MANUAL MERGE:]
   - Implementera conflict detection
   - Skapa conflict data structure
   - UI-ready conflict information
   - Manual merge logic (för frontend)

5. RETRY LOGIC:
   - Exponential backoff för failed syncs
   - Max retry attempts (3-5 försök)
   - Error categorization (temporary vs permanent)
   - Queue management för failed syncs
   - Retry scheduler

6. DATABASE OPTIMIZATION:
   - Optimera queries för sync (bara ändrade records)
   - Lägg till last_updated_at index om saknas
   - Batch updates för effektivitet
   - Pagination för stora datasets
   - Query optimization för sync endpoints

7. REACT QUERY INTEGRATION:
   [OM REACT-QUERY-PERSIST:]
   - Installera react-query-persist version [VERSION]
   - Konfigurera React Query med persist
   - Integrera med IndexedDB
   
   [OM CUSTOM:]
   - Skapa custom persist hook
   - Integrera med IndexedDB
   - Sync React Query cache med IndexedDB
   - Offline-first config för React Query

VIKTIGA PATTERNS:
- Följ samma kodstil som i arbetsorder-systemet
- Använd createAdminClient() för RLS-bypass
- Använd Zod för validation
- Proper error handling med extractErrorMessage()
- TypeScript types överallt
- Följ Perplexity research best practices

CODE EXAMPLES FRÅN PERPLEXITY:
[KOPIERA RELEVANTA CODE EXAMPLES FRÅN PERPLEXITY]

KODKVALITET:
- Production-ready algoritmer
- Proper error handling
- Performance optimization
- Clear comments för komplex logik
- Testa edge cases
- Följ Perplexity research recommendations

IMPLEMENTATION ORDER:
1. Service Worker setup
2. IndexedDB wrapper
3. Sync queue system
4. Conflict resolution
5. Retry logic
6. Database optimization
7. React Query integration

BÖRJA MED:
1. Installera valda bibliotek
2. Skapa Service Worker (om manuell) eller konfigurera next-pwa
3. Implementera IndexedDB wrapper
4. Skapa sync-queue system

Fråga mig om något är oklart eller om du behöver mer context!
```

---

## 📝 Fyll i Template

### 1. Beslut från Cursor Pro
```markdown
[BESLUT FRÅN CURSOR PRO]

Service Worker: [next-pwa version X.X.X / Manuell Service Worker]
Motivering: [Varför detta val]

IndexedDB: [idb / Dexie.js / localForage] version X.X.X
Motivering: [Varför detta val]

Sync Strategy: [Offline-first / Online-first]
Motivering: [Varför detta val]

Conflict Resolution: [Last-write-wins / Manual merge / CRDT]
Motivering: [Varför detta val]

React Query: [react-query-persist / Custom / Config only]
Motivering: [Varför detta val]
```

### 2. Bibliotek och Versioner
```markdown
[BIBLIOTEK 1]: [VERSION] - [ANVÄNDNING]
[BIBLIOTEK 2]: [VERSION] - [ANVÄNDNING]
```

### 3. Perplexity Research Findings
```markdown
PERPLEXITY RESEARCH FINDINGS:

Service Worker:
- [Summary från Perplexity]
- [Code example om relevant]

IndexedDB:
- [Summary från Perplexity]
- [Code example om relevant]

Sync Strategy:
- [Summary från Perplexity]
- [Code example om relevant]

Conflict Resolution:
- [Summary från Perplexity]
- [Code example om relevant]

React Query:
- [Summary från Perplexity]
- [Code example om relevant]
```

### 4. Code Examples
```markdown
CODE EXAMPLES FRÅN PERPLEXITY:

[Kopiera relevanta code examples från Perplexity research]
```

---

## ✅ Checklista innan du skickar till GPT-5

- [ ] Alla [BESLUT] är ifyllda
- [ ] Alla [BIBLIOTEK/VERSION] är ifyllda
- [ ] Perplexity research findings är kopierade
- [ ] Code examples är inkluderade
- [ ] Implementation order är tydlig
- [ ] Teknisk stack är komplett
- [ ] Existerande kodbase är dokumenterad

---

**Status:** ⏳ Väntar på Perplexity research och beslut
**Nästa steg:** Fyll i template → Skicka till GPT-5


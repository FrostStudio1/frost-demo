# 🤖 GPT-5 Prompt - Dag 3: Offline-stöd & Sync Backend Logic (FINAL)

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
- ✅ React Query v5 för data fetching
- ✅ TypeScript och Tailwind CSS

DAG 3 MÅL: Offline-stöd & Sync Backend Logic
Baserat på Perplexity research har vi tagit följande beslut:

[BESLUT FRÅN CURSOR PRO]
✅ Service Worker: MANUELL setup (INTE next-pwa)
✅ IndexedDB: Dexie.js v4.0.8 + dexie-react-hooks v1.1.8
✅ Sync Strategy: OFFLINE-FIRST + Last-Write-Wins
✅ Conflict Resolution: Last-Write-Wins (timestamps)
✅ React Query: Persist med IndexedDB via idb-keyval v6.2.1
✅ Retry Strategy: Exponential backoff + jitter (5-8 retries)

TEKNISK STACK:
- Next.js 16 App Router (API Routes)
- Supabase (PostgreSQL)
- TypeScript
- Zod validation
- Dexie.js v4.0.8 - IndexedDB wrapper
- dexie-react-hooks v1.1.8 - React hooks för Dexie
- idb-keyval v6.2.1 - React Query persist
- @tanstack/react-query-persist-client v5.28.0 - React Query offline

EXISTERANDE KODBASE:
- API routes: /app/api/work-orders/, /app/api/employees/list, /app/api/projects/list
- Helpers: /app/lib/work-orders/helpers.ts
- State Machine: /app/lib/work-order-state-machine.ts
- Patterns: Tenant isolation, RLS bypass med createAdminClient()
- Hooks: /app/hooks/useWorkOrders.ts, useEmployees.ts, useProjects.ts
- Error handling: extractErrorMessage() från @/lib/errorUtils
- Toast: toast() från @/lib/toast

PERPLEXITY RESEARCH FINDINGS (VIKTIGA DELAR):

1. SERVICE WORKER:
   - next-pwa är INTE maintained för Next.js 16
   - Manuell setup är rekommenderat
   - Cache-strategier: Network First för API, Cache First för assets
   - Background Sync API fungerar bra

2. INDEXEDDB:
   - Dexie.js är bäst för React + TypeScript
   - useLiveQuery hook för real-time updates
   - ORM-like API med indexes
   - Performance: använd indexes för queries

3. SYNC STRATEGY:
   - Offline-first: allt lagras lokalt först
   - Timestamp-baserad sync (last_updated_at)
   - Last-write-wins: enkel, deterministic
   - Batch sync för effektivitet

4. CONFLICT RESOLUTION:
   - Last-write-wins med timestamps
   - Jämför updatedAt från local vs server
   - Nyare version vinner
   - Logga conflicts för audit trail

5. REACT QUERY:
   - Offline-first config: staleTime: Infinity, networkMode: 'offline-first'
   - Persist cache med idb-keyval
   - Optimistic updates med rollback

DINA UPPGIFTER (Dag 3):

1. SYNC ENGINE IMPLEMENTATION:
   Skapa /app/lib/sync/sync-engine.ts med:
   
   - syncToServer(tenantId: string): Promise<SyncResult>
     * Hämta pending changes från syncQueue
     * Batch-sync till Supabase via API
     * Markera som synced vid success
     * Hantera conflicts med last-write-wins
     * Returnera resultat: { success, syncedCount, failedCount, conflictCount }
   
   - syncFromServer(tenantId: string, lastSyncTime: number): Promise<number>
     * Hämta updates från server (updated_at > lastSyncTime)
     * Merge till local IndexedDB
     * Använd last-write-wins för conflicts
     * Returnera ny lastSyncTime
   
   - Conflict detection och resolution
     * Jämför updatedAt timestamps
     * Nyare version vinner
     * Logga conflicts för audit trail

2. RETRY LOGIC:
   Skapa /app/lib/sync/retry.ts med:
   
   - RetryStrategy class
   - Exponential backoff: initialDelay 1000ms, factor 2, maxDelay 60000ms
   - Jitter: ±10% random variation
   - Max retries: 5-8
   - Error categorization: retryable (5xx, network errors) vs non-retryable (4xx except 429)
   - execute<T>(operation: () => Promise<T>): Promise<T>

3. SYNC QUEUE MANAGEMENT:
   Uppdatera IndexedDB schema för syncQueue:
   
   - SyncQueue interface: { id, workOrderId, action, payload, createdAt, attempts, lastAttempt, isSynced }
   - Lägg till i Dexie schema
   - Functions för queue management:
     * addToSyncQueue(workOrderId, action, payload)
     * getPendingSyncItems(tenantId)
     * markAsSynced(syncId)
     * incrementAttempts(syncId)

4. DATABASE OPTIMIZATION:
   
   - Lägg till last_updated_at index på work_orders tabell (om saknas)
   - Optimera queries för sync: bara ändrade records (updated_at > lastSyncTime)
   - Batch updates för effektivitet
   - Pagination för stora datasets (limit 100 per request)

5. API ENDPOINTS FÖR SYNC:
   
   Skapa /app/api/sync/work-orders/route.ts:
   
   - POST /api/sync/work-orders
     * Ta emot batch av changes från client
     * Validera med Zod
     * Processa varje change (create/update/delete)
     * Returnera resultat: { synced: [...], conflicts: [...] }
     * Conflicts: returnera både local och server data
   
   - GET /api/sync/work-orders?tenantId=...&since=...
     * Returnera ändrade records sedan lastSyncTime
     * Limit 100 per request
     * Sortera på updated_at

6. CONFLICT RESOLUTION LOGIC:
   Skapa /app/lib/sync/conflict-resolution.ts:
   
   - resolveConflict(local: WorkOrder, server: WorkOrder): WorkOrder
     * Jämför updatedAt timestamps
     * Returnera nyare version
     * Om tie: använd server version
   
   - logConflict(conflict: Conflict, resolution: WorkOrder)
     * Logga för audit trail
     * Kan skickas till server för analys

7. SYNC MANAGER:
   Skapa /app/lib/sync/sync-manager.ts:
   
   - SyncManager class (singleton)
   - startBackgroundSync(tenantId, intervalMs = 30000)
     * Sync när kommer online (event listener)
     * Periodic sync varje 30 sekunder
     * Sync när dokument blir synligt (visibilitychange)
   
   - sync(tenantId): Promise<void>
     * Använd retry strategy
     * Anropa syncToServer och syncFromServer
     * Hantera errors gracefully
   
   - manualSync(tenantId): Promise<void>
     * Trigger sync manuellt

VIKTIGA PATTERNS:
- Följ samma kodstil som i arbetsorder-systemet
- Använd createAdminClient() för RLS-bypass när nödvändigt
- Använd Zod för validation
- Proper error handling med extractErrorMessage()
- TypeScript types överallt
- Använd Dexie för IndexedDB operations
- Använd last-write-wins för conflicts (timestamps)

CODE EXAMPLES FRÅN PERPLEXITY:

1. Sync Engine (från research):
```typescript
export async function syncToServer(tenantId: string): Promise<SyncResult> {
  const pending = await db.syncQueue.where('isSynced').equals(false).toArray();
  // Batch sync to server
  // Mark as synced
  // Handle conflicts
}
```

2. Retry Strategy (från research):
```typescript
export class RetryStrategy {
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Exponential backoff + jitter
    // Max retries
    // Error categorization
  }
}
```

3. Conflict Resolution (från research):
```typescript
export function resolveConflict(conflict: Conflict): WorkOrder {
  // Compare timestamps
  // Return newer version
}
```

KODKVALITET:
- Production-ready algoritmer
- Proper error handling
- Performance optimization
- Clear comments för komplex logik
- Testa edge cases
- Följ Perplexity research recommendations

IMPLEMENTATION ORDER:
1. Retry Strategy (grund för allt)
2. Conflict Resolution Logic
3. Sync Queue Management
4. Sync Engine (syncToServer, syncFromServer)
5. Database Optimization (indexes, queries)
6. API Endpoints för sync
7. Sync Manager (orchestration)

BÖRJA MED:
1. Skapa RetryStrategy class i /app/lib/sync/retry.ts
2. Skapa conflict resolution i /app/lib/sync/conflict-resolution.ts
3. Skapa sync engine i /app/lib/sync/sync-engine.ts
4. Skapa API endpoint för sync i /app/api/sync/work-orders/route.ts
5. Skapa sync manager i /app/lib/sync/sync-manager.ts

VIKTIGT:
- Alla ändringar måste vara tenant-isolerade (tenantId)
- Använd createAdminClient() för RLS-bypass när nödvändigt
- Validera all input med Zod
- Logga errors för debugging
- Returnera tydliga error messages

Fråga mig om något är oklart eller om du behöver mer context!
```

---

## ✅ Checklista innan implementation

- [x] Beslut tagna baserat på Perplexity research
- [x] Bibliotek och versioner specificerade
- [x] Code examples från Perplexity inkluderade
- [x] Implementation order tydlig
- [x] Teknisk stack komplett
- [x] Existerande kodbase dokumenterad
- [x] Patterns och best practices specificerade

---

**Status:** ✅ Redo för GPT-5 implementation  
**Nästa steg:** Kopiera prompten till GPT-5 och börja implementation


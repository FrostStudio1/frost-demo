# 🤖 GPT-5 Prompt - Dag 3: Offline-stöd & Sync Backend Logic

## 📋 Kopiera denna prompt till GPT-5:

```
Du är senior backend-utvecklare och problem solver för Frost Solutions.

LÄGET JUST NU (Slutet av Dag 2):
- ✅ Arbetsorder-systemet är FULLT IMPLEMENTERAT och fungerar perfekt
- ✅ Backend API routes fungerar med korrekt RLS-hantering
- ✅ Status-hantering med State Machine fungerar
- ✅ Foto-upload fungerar
- ✅ Notifikationer fungerar

DAG 3 MÅL: Offline-stöd & Sync Backend Logic
- Design sync architecture
- Skriv komplexa algoritmer för sync och konfliktlösning
- Implementera retry-logik och error handling
- Optimera database queries för sync
- Skriv Service Worker cache-strategi

TEKNISK STACK:
- Next.js 16 App Router (API Routes)
- Supabase (PostgreSQL)
- TypeScript
- Zod validation

EXISTERANDE KODBASE:
- API routes: /app/api/work-orders/, /app/api/employees/list, /app/api/projects/list
- Helpers: /app/lib/work-orders/helpers.ts
- State Machine: /app/lib/work-order-state-machine.ts
- Patterns: Tenant isolation, RLS bypass med createAdminClient()

DINA UPPGIFTER (Dag 3):

1. SYNC ARCHITECTURE DESIGN:
   - Design sync-strategi för offline-first
   - Konfliktlösning algoritmer (last-write-wins, manual merge)
   - Timestamp-baserad sync (last_updated_at)
   - Optimistic updates med rollback vid fel

2. SERVICE WORKER CACHE STRATEGY:
   - Skriv cache-strategi för API routes
   - Network First med Cache Fallback
   - Cache invalidation logic
   - Background sync API integration

3. SYNC ALGORITHMS:
   - Skriv algoritm för att synka offline-ändringar
   - Batch-sync för effektivitet
   - Conflict detection logic
   - Merge-strategier för konflikter

4. RETRY LOGIC:
   - Exponential backoff för failed syncs
   - Max retry attempts
   - Error categorization (temporary vs permanent)
   - Queue management för failed syncs

5. DATABASE OPTIMIZATION:
   - Optimera queries för sync (bara ändrade records)
   - Index för last_updated_at kolumner
   - Batch updates för effektivitet
   - Pagination för stora datasets

VIKTIGA PATTERNS:
- Följ samma kodstil som i arbetsorder-systemet
- Använd createAdminClient() för RLS-bypass
- Använd Zod för validation
- Proper error handling med extractErrorMessage()
- TypeScript types överallt

KODKVALITET:
- Production-ready algoritmer
- Proper error handling
- Performance optimization
- Clear comments för komplex logik
- Testa edge cases

BÖRJA MED:
1. Design sync architecture document
2. Skriv Service Worker cache-strategi
3. Implementera sync algorithms
4. Skriv retry logic
5. Optimera database queries

Fråga mig om något är oklart eller om du behöver mer context!
```

---

## 🎯 Specifika Backend-uppgifter

### 1. Sync Architecture
- Design dokument för sync-strategi
- Konfliktlösning algoritmer
- Timestamp-baserad sync
- Optimistic updates

### 2. Service Worker Cache Strategy
- Network First med Cache Fallback
- Cache invalidation
- Background sync

### 3. Sync Algorithms
- Batch-sync algoritm
- Conflict detection
- Merge-strategier

### 4. Retry Logic
- Exponential backoff
- Error categorization
- Queue management

### 5. Database Optimization
- Optimera queries för sync
- Index för performance
- Batch updates

---

**Status:** ✅ Redo för implementation
**Fokus:** Komplex backend-logik och algoritmer


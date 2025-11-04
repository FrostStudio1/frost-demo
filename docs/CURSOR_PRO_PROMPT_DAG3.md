# 🎯 Cursor Pro Prompt - Dag 3: Offline-stöd & Sync

## 📋 Kopiera denna prompt till Cursor Pro:

```
Du är Lead Architect & Code Generator för Frost Solutions.

LÄGET JUST NU (Slutet av Dag 2):
- ✅ Arbetsorder-systemet är FULLT IMPLEMENTERAT och fungerar perfekt
- ✅ Backend API routes fungerar med korrekt RLS-hantering
- ✅ Frontend komponenter är klara med sidebar och tillbaka-knapp
- ✅ Status-hantering är förenklad med tydlig "Nästa steg"-knapp
- ✅ Alla hooks fungerar med toast-notifikationer

DAG 3 MÅL: Offline-stöd & Sync
- Implementera Service Worker för offline-stöd
- IndexedDB för lokal lagring
- Sync-queue för offline-ändringar
- Automatisk synk när online igen
- Konfliktlösning (last-write-wins eller manual merge)

TEKNISK STACK:
- Next.js 16 App Router (React Server/Client Components)
- TypeScript
- Supabase (PostgreSQL + Storage)
- React Query för data fetching
- Tailwind CSS

EXISTERANDE KODBASE:
- Arbetsorder-system: /app/api/work-orders/, /app/components/WorkOrder*.tsx
- Hooks: /app/hooks/useWorkOrders.ts, useEmployees.ts, useProjects.ts
- React Query är redan konfigurerad
- Service Worker finns INTE ännu

DINA UPPGIFTER (Dag 3):

1. SERVICE WORKER SETUP:
   - Installera next-pwa eller konfigurera manuell Service Worker
   - Registrera Service Worker i app layout eller _app.tsx
   - Cache-strategi för API routes (Network First, Cache Fallback)
   - Cache av statiska assets (JS, CSS, bilder)

2. INDEXEDDB SETUP:
   - Skapa databasschema för offline-storage
   - Wrapper-funktioner för IndexedDB operations
   - React hooks för att läsa/skriva till IndexedDB
   - Lagra arbetsordrar, projects, employees, clients lokalt

3. SYNC QUEUE:
   - Queue för ändringar gjorda offline
   - Automatisk synk när online igen
   - Error handling och retry-logik
   - Visual feedback: "Synkar..." / "Offline" / "Synkad"

4. UI INDICATORS:
   - Online/offline status i header
   - Sync-indikator
   - Toast-notifikationer vid sync-fel

5. INTEGRATION:
   - Integrera offline-stöd med befintliga React Query hooks
   - Uppdatera useWorkOrders, useEmployees, useProjects för offline-first
   - Testa offline-scenarier

VIKTIGA PATTERNS:
- Följ samma kodstil som i arbetsorder-systemet
- Använd TypeScript strikt
- Använd extractErrorMessage() för error handling
- Använd toast() för användarfeedback
- Använd createAdminClient() för RLS-bypass när nödvändigt

KODKVALITET:
- Production-ready kod
- Proper error handling
- TypeScript types överallt
- Kommentarer för komplex logik
- Testa offline-scenarier innan commit

BÖRJA MED:
1. Research next-pwa eller manuell Service Worker setup
2. Skapa Service Worker med cache-strategi
3. Implementera IndexedDB wrapper
4. Skapa sync-queue system
5. Integrera med befintliga hooks

Fråga mig om något är oklart eller om du behöver mer context!
```

---

## 🎯 Specifika Implementation-steg

### 1. Service Worker Setup
- Börja med `next-pwa` eller manuell setup
- Cache-strategi: Network First för API, Cache First för assets
- Registrera i `app/layout.tsx` eller `app/_app.tsx`

### 2. IndexedDB Integration
- Skapa `/app/lib/indexeddb/` mapp
- Wrapper-funktioner för CRUD operations
- Schema för work_orders, projects, employees, clients

### 3. Sync Queue
- Skapa `/app/lib/sync/` mapp
- Queue för offline-ändringar
- Auto-sync när online igen
- Retry-logik med exponential backoff

### 4. UI Components
- Online/offline indicator i header
- Sync progress indicator
- Toast notifications för sync status

### 5. React Query Integration
- Uppdatera hooks för offline-first
- Konfigurera React Query med IndexedDB fallback
- Sync när online igen

---

**Status:** ✅ Redo för implementation
**Nästa steg:** Börja med Service Worker setup


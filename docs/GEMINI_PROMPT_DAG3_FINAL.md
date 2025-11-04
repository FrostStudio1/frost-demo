# 🎨 Gemini 2.5 Prompt - Dag 3: Offline-stöd & Sync Frontend (FINAL)

## 📋 Kopiera denna prompt till Gemini 2.5:

```
Du är UI/UX specialist och frontend-utvecklare för Frost Solutions.

LÄGET JUST NU (Slutet av Dag 2 + Backend klar):
- ✅ Arbetsorder-systemet är FULLT IMPLEMENTERAT och fungerar perfekt
- ✅ Backend sync-logik är KLAR (GPT-5 har implementerat allt)
- ✅ Frontend komponenter är klara med sidebar och tillbaka-knapp
- ✅ Status-hantering är förenklad med tydlig "Nästa steg"-knapp
- ✅ SQL indexes är skapade i Supabase

DAG 3 MÅL: Offline-stöd & Sync Frontend
- Implementera Service Worker (manuell setup)
- React Query offline-first config
- UI components för online/offline status
- Integration med Dexie för offline data
- Sync progress indicators
- Toast notifications

BESLUT FRÅN PERPLEXITY RESEARCH:
✅ Service Worker: MANUELL setup (INTE next-pwa)
✅ IndexedDB: Dexie.js v4.0.8 + dexie-react-hooks v1.1.8
✅ Sync Strategy: OFFLINE-FIRST + Last-Write-Wins
✅ React Query: Persist med idb-keyval v6.2.1
✅ Conflict Resolution: Last-Write-Wins (timestamps)

TEKNISK STACK:
- Next.js 16 App Router (React Server/Client Components)
- TypeScript
- Tailwind CSS
- React Query v5 (för data fetching)
- Dexie.js v4.0.8 + dexie-react-hooks v1.1.8
- idb-keyval v6.2.1
- lucide-react (för ikoner)
- sonner (för toast notifications)

EXISTERANDE KODBASE:
- Komponenter: /app/components/WorkOrder*.tsx, Sidebar.tsx
- Hooks: /app/hooks/useWorkOrders.ts, useEmployees.ts, useProjects.ts
- Backend sync: /app/lib/sync/*.ts (redan implementerat av GPT-5)
- IndexedDB: /app/lib/db/indexeddb.ts (redan implementerat)
- Design system: Tailwind CSS med dark mode
- Toast: @/lib/toast (sonner)
- Ikoner: lucide-react
- QueryProvider: /app/providers/QueryProvider.tsx
- Layout: /app/layout.tsx (har redan ServiceWorkerRegister komponent)

BACKEND SOM REDAN FINNS (använd dessa):
- db: import { db } from '@/lib/db/indexeddb'
- syncManager: import { syncManager } from '@/lib/sync/sync-manager'
- syncToServer, syncFromServer: import from '@/lib/sync/sync-engine'
- useLiveQuery: import { useLiveQuery } from 'dexie-react-hooks'

DESIGN SYSTEM:
- Färger: Blue (#2563EB), Green (#10B981), Red (#EF4444), Gray (#6B7280)
- Ikoner: lucide-react (Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Loader2)
- Mobile-first design med touch-friendly elementer (min-h-[44px])
- Dark mode support (dark: prefix i Tailwind)
- Typography: 16px body, 24px headings
- Spacing: 8px base unit

DINA UPPGIFTER (Dag 3):

1. SERVICE WORKER (MANUELL SETUP):
   Skapa public/sw.ts (TypeScript source):
   - Install event: Pre-cache critical assets
   - Activate event: Clean up old caches
   - Fetch event: Cache strategies
     * Cache First för statiska assets (/_next/static/, fonts, images)
     * Network First för API routes (/api/*)
     * Stale While Revalidate för images
   - Background Sync API för offline-ändringar
   - Kompilera till public/sw.js vid build (lägg till i package.json scripts)
   
   Uppdatera app/components/ServiceWorkerRegister.tsx:
   - Registrera /sw.js (inte /service-worker.js)
   - Check för updates
   - Show toast när ny version finns

2. REACT QUERY OFFLINE-FIRST CONFIG:
   Uppdatera app/lib/queryClient.ts:
   - Installera @tanstack/react-query-persist-client@^5.28.0
   - Installera idb-keyval@^6.2.1
   - Konfigurera offline-first:
     * staleTime: Infinity
     * networkMode: 'offline-first'
     * retry strategy för offline
   
   Skapa app/lib/idb-persister.ts:
   - createIDBPersister() function
   - Använd idb-keyval för persist
   - Key: 'frost-react-query-cache'
   
   Uppdatera app/providers/QueryProvider.tsx:
   - Wrap med PersistQueryClientProvider
   - Använd idb-persister

3. ONLINE/OFFLINE STATUS INDICATOR:
   Skapa app/components/OnlineStatusIndicator.tsx:
   - Liten status-indikator i header (höger övre hörnet)
   - Visar: "Online" / "Offline" / "Synkar..."
   - Ikoner: Wifi (online), WifiOff (offline), RefreshCw (synkar med spinner)
   - Färger: Green (online), Red (offline), Blue (synkar)
   - Använd useOnlineStatus hook (skapa den)

4. SYNC PROGRESS COMPONENT:
   Skapa app/components/SyncProgress.tsx:
   - Progress bar för sync-progress
   - Visar antal items som synkas
   - "Synkar 3 av 10 arbetsordrar..."
   - Döljs automatiskt när sync klar
   - Använd usePendingSyncCount från Dexie

5. OFFLINE BANNER:
   Skapa app/components/OfflineBanner.tsx:
   - Banner längst upp när offline
   - "Du arbetar offline. Ändringar sparas lokalt och synkas när du är online igen."
   - Döljbar/ignorerad (kan stängas)
   - Visas endast när offline

6. HOOKS:
   Skapa app/hooks/useOnlineStatus.ts:
   - useState för isOnline
   - useEffect för online/offline events
   - Returnera { isOnline, wasOffline }
   
   Skapa app/hooks/useSyncStatus.ts:
   - Använd syncManager för sync status
   - Använd usePendingSyncCount från Dexie
   - Returnera { isSyncing, pendingCount, lastSyncTime }

7. INTEGRATION MED useWorkOrders:
   Uppdatera app/hooks/useWorkOrders.ts:
   - Lägg till Dexie useLiveQuery som fallback när offline
   - Använd db.work_orders från IndexedDB
   - Kombinera med React Query för online-mode
   - Auto-trigger sync när online igen

8. TOAST NOTIFICATIONS:
   Integrera toast notifications:
   - När går offline: toast.info("Du är offline. Ändringar sparas lokalt.")
   - När går online: toast.info("Du är online igen. Synkar ändringar...")
   - När sync klar: toast.success("Alla ändringar synkade!")
   - Vid sync-fel: toast.error("Kunde inte synka. Försöker igen...")
   - Använd @/lib/toast (sonner)

9. LAYOUT INTEGRATION:
   Uppdatera app/layout.tsx eller relevant layout:
   - Lägg till OnlineStatusIndicator i header
   - Lägg till SyncProgress (om syncing)
   - Lägg till OfflineBanner (om offline)
   - Initiera syncManager.startBackgroundSync() när tenant är klar

VIKTIGA PATTERNS:
- Följ samma kodstil som WorkOrder-komponenter
- Använd Tailwind CSS classes
- Mobile-first design
- Dark mode support (dark: prefix)
- Accessibility (WCAG AA)
- Touch-friendly elementer (min-h-[44px])
- Använd TypeScript strikt
- Använd extractErrorMessage() för errors
- Använd toast() för användarfeedback

KODKVALITET:
- Clean & simple UI
- Responsive design
- Proper TypeScript types
- Reusable components
- Accessibility considerations
- Error boundaries där nödvändigt

IMPLEMENTATION ORDER:
1. Service Worker (sw.ts + ServiceWorkerRegister)
2. React Query offline-first config (queryClient + persister + provider)
3. useOnlineStatus hook
4. OnlineStatusIndicator komponent
5. SyncProgress komponent
6. OfflineBanner komponent
7. useSyncStatus hook
8. Integration med useWorkOrders
9. Toast notifications
10. Layout integration

PACKAGE.JSON SCRIPTS (lägg till):
```json
{
  "scripts": {
    "build": "tsc public/sw.ts --target es2020 --module es2020 --outDir public --outFile sw.js && next build",
    "dev": "tsc public/sw.ts --target es2020 --module es2020 --outDir public --outFile sw.js --watch & next dev"
  }
}
```

BÖRJA MED:
1. Installera dependencies (dexie, dexie-react-hooks, react-query-persist-client, idb-keyval)
2. Skapa Service Worker (public/sw.ts)
3. Uppdatera React Query config för offline-first
4. Skapa UI components (OnlineStatusIndicator, SyncProgress, OfflineBanner)
5. Integrera med hooks och layout

VIKTIGT:
- Service Worker måste vara i /public/sw.js (kompilerad från sw.ts)
- Använd befintliga backend-funktioner (syncManager, db, etc.)
- Matcha projektets kodstil exakt
- Testa offline-scenarier

Fråga mig om något är oklart eller om du behöver mer context!
```

---

## 🎯 Specifika Implementation-steg

### 1. Service Worker
- Skapa `public/sw.ts` med cache-strategier
- Kompilera till `public/sw.js`
- Uppdatera `ServiceWorkerRegister.tsx`

### 2. React Query Offline-First
- Uppdatera `queryClient.ts`
- Skapa `idb-persister.ts`
- Uppdatera `QueryProvider.tsx`

### 3. UI Components
- `OnlineStatusIndicator` - Header status
- `SyncProgress` - Progress bar
- `OfflineBanner` - Offline banner

### 4. Hooks
- `useOnlineStatus` - Online/offline detection
- `useSyncStatus` - Sync status
- Uppdatera `useWorkOrders` - Dexie integration

### 5. Integration
- Layout integration
- Toast notifications
- Sync manager initialization

---

**Status:** ✅ Redo för implementation
**Fokus:** Clean UI, Service Worker, och offline-first UX


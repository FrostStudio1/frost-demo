# 🔍 Perplexity Pro Prompt - Dag 3: Offline-stöd & Sync Research

## 📋 Kopiera denna prompt till Perplexity Pro:

```
Du är research-assistent för Frost Solutions, ett byggföretags mjukvaruprojekt.

LÄGET JUST NU (Slutet av Dag 2):
- ✅ Arbetsorder-systemet är FULLT IMPLEMENTERAT och fungerar perfekt
- ✅ Next.js 16 App Router med Supabase backend
- ✅ React Query för data fetching
- ✅ TypeScript och Tailwind CSS

DAG 3 MÅL: Offline-stöd & Sync Research
- Research Service Worker best practices
- Research IndexedDB patterns för React
- Research sync strategies för offline-first apps
- Research konfliktlösning patterns
- Research PWA offline patterns

RESEARCH-UPPGIFTER FÖR DAG 3:

1. SERVICE WORKER BEST PRACTICES:
   - Hur sätter man upp Service Worker i Next.js 16 App Router?
   - next-pwa vs manuell Service Worker setup (fördelar/nackdelar)
   - Cache strategies (Network First, Cache First, Stale While Revalidate)
   - Background Sync API för offline-ändringar
   - Service Worker lifecycle och updates
   - Error handling i Service Workers
   - Debugging Service Workers

2. INDEXEDDB PATTERNS FÖR REACT:
   - Best practices för IndexedDB i React-appar
   - Bibliotek: idb, Dexie.js, localForage (jämför)
   - Schema design för offline storage
   - CRUD operations patterns
   - React hooks för IndexedDB
   - Error handling och retry logic
   - Performance optimization

3. SYNC STRATEGIES:
   - Offline-first vs online-first approaches
   - Timestamp-baserad sync (last_updated_at)
   - Conflict resolution strategies (last-write-wins, manual merge, CRDT)
   - Optimistic updates med rollback
   - Batch sync för effektivitet
   - Incremental sync (bara ändrade records)
   - Background sync API integration

4. PWA OFFLINE PATTERNS:
   - Best practices för PWA offline-stöd
   - Offline detection och notification
   - Sync queue management
   - Visual feedback patterns (online/offline/synkar)
   - Error handling för sync failures
   - Retry strategies (exponential backoff)

5. REACT QUERY + OFFLINE:
   - Hur konfigurerar man React Query för offline-first?
   - cacheTime och staleTime för offline
   - Persist cache med IndexedDB
   - Optimistic updates i React Query
   - Error handling och retry
   - Background sync integration

6. KONFLIKTLÖSNING:
   - Conflict detection algorithms
   - Last-write-wins strategy
   - Manual merge patterns
   - CRDT (Conflict-free Replicated Data Types)
   - User notification för konflikter
   - UI patterns för conflict resolution

LEVERABLER:
För varje research-uppgift, ge:
1. Summary av findings
2. Recommended approach för vårt projekt
3. Code examples (om relevant)
4. Links till documentation
5. Common pitfalls att undvika
6. Performance considerations

FOKUS:
- Praktiska lösningar som fungerar med Next.js 16
- Patterns som matchar vår existing kodbase
- Best practices från production apps
- Performance och user experience

Fråga mig om något är oklart eller om du behöver mer context!
```

---

## 🎯 Research-fokus

### 1. Service Worker
- Next.js 16 integration
- Cache strategies
- Background Sync API

### 2. IndexedDB
- React patterns
- Bibliotek-jämförelse
- Performance

### 3. Sync Strategies
- Offline-first approaches
- Conflict resolution
- Optimization

### 4. PWA Patterns
- Best practices
- User experience
- Error handling

### 5. React Query Integration
- Offline-first config
- Cache persistence
- Optimistic updates

### 6. Conflict Resolution
- Algorithms
- Strategies
- UI patterns

---

**Status:** ✅ Redo för research
**Fokus:** Praktiska lösningar och best practices


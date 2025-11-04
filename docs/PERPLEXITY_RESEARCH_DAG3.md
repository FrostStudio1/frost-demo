# 🔍 Perplexity Pro - Dag 3 Research: Offline-stöd & Sync

## 📋 Kopiera denna prompt till Perplexity Pro:

```
Du är research-assistent för Frost Solutions, ett byggföretags mjukvaruprojekt.

LÄGET JUST NU (Slutet av Dag 2):
- ✅ Arbetsorder-systemet är FULLT IMPLEMENTERAT och fungerar perfekt
- ✅ Next.js 16 App Router med Supabase backend
- ✅ React Query för data fetching
- ✅ TypeScript och Tailwind CSS
- ✅ Service Worker finns INTE ännu

DAG 3 MÅL: Offline-stöd & Sync Research
Vi behöver research för att implementera offline-stöd och sync-mekanism.

VIKTIGA KRAV:
- Måste fungera med Next.js 16 App Router
- Måste fungera med Supabase (PostgreSQL)
- Måste fungera med React Query
- Måste vara production-ready
- Måste vara performant

RESEARCH-UPPGIFTER (VAR NOGA MED DETTA):

1. SERVICE WORKER I NEXT.JS 16:
   - Hur sätter man upp Service Worker i Next.js 16 App Router SPECIFIKT?
   - next-pwa bibliotek - fungerar det med Next.js 16? Är det maintained?
   - Manuell Service Worker setup - hur gör man det i Next.js 16?
   - Var placerar man Service Worker filen i Next.js 16 App Router?
   - Hur registrerar man Service Worker i Next.js 16?
   - Cache strategies för Next.js API routes (Network First, Cache First, Stale While Revalidate)
   - Background Sync API - fungerar det med Next.js 16?
   - Service Worker lifecycle och update-strategi
   - Error handling i Service Workers
   - Debugging Service Workers i Next.js 16

2. INDEXEDDB FÖR REACT/NEXT.JS:
   - Best practices för IndexedDB i React/Next.js applikationer
   - Bibliotek-jämförelse: idb vs Dexie.js vs localForage
     * Vilket är bäst för Next.js 16?
     * Vilket är bäst för TypeScript?
     * Vilket är bäst för performance?
     * Vilket är bäst för React hooks integration?
   - Schema design patterns för offline storage
   - CRUD operations patterns med valt bibliotek
   - React hooks för IndexedDB (custom hooks)
   - Error handling och retry logic
   - Performance optimization tips
   - Storage limits och cleanup strategies

3. SYNC STRATEGIES FÖR OFFLINE-FIRST:
   - Offline-first vs online-first approaches - vilket är bäst för vår use case?
   - Timestamp-baserad sync (last_updated_at) - hur implementerar man detta?
   - Conflict resolution strategies:
     * Last-write-wins - när är det bra/dåligt?
     * Manual merge - hur implementerar man UI för detta?
     * CRDT (Conflict-free Replicated Data Types) - är det värt komplexiteten?
   - Optimistic updates med rollback - best practices
   - Batch sync för effektivitet - hur implementerar man?
   - Incremental sync (bara ändrade records) - hur implementerar man?
   - Background sync API - fungerar det bra med Supabase?
   - Sync performance - hur hanterar man stora datasets?

4. REACT QUERY + OFFLINE-FIRST:
   - Hur konfigurerar man React Query för offline-first?
   - Persist cache med IndexedDB - finns det bibliotek för detta?
   - cacheTime och staleTime för offline-scenarier
   - Optimistic updates i React Query - best practices
   - Error handling och retry i React Query offline
   - Background sync integration med React Query
   - React Query + Service Worker - hur fungerar de tillsammans?
   - React Query offline-first patterns från production apps

5. PWA OFFLINE PATTERNS:
   - Best practices för PWA offline-stöd 2024
   - Offline detection - hur gör man det på rätt sätt?
   - Sync queue management - design patterns
   - Visual feedback patterns (online/offline/synkar) - UI/UX best practices
   - Error handling för sync failures - användarfeedback
   - Retry strategies (exponential backoff) - implementation
   - Offline-first PWA från production apps - vad fungerar bra?

6. KONFLIKTLÖSNING SPECIFIKT:
   - Conflict detection algorithms - vilka är bäst?
   - Last-write-wins implementation - när fungerar det bra?
   - Manual merge patterns - UI/UX för användaren
   - CRDT - är det värt komplexiteten för vår use case?
   - User notification för konflikter - best practices
   - UI patterns för conflict resolution - exempel från production apps

LEVERABLER (VAR SPECIFIK):

För varje research-uppgift, ge:

1. SUMMARY:
   - Kort sammanfattning (2-3 meningar)
   - Rekommenderad approach för vårt projekt
   - Varför denna approach?

2. CODE EXAMPLES:
   - Konkreta code examples (TypeScript)
   - Integration med Next.js 16
   - Integration med React Query
   - Integration med Supabase

3. LIBRARIES & TOOLS:
   - Rekommenderade bibliotek (med version numbers)
   - Installation instructions
   - Pros/cons för varje bibliotek

4. DOCUMENTATION LINKS:
   - Direkta länkar till officiell dokumentation
   - Tutorial-länkar
   - Best practices artiklar

5. COMMON PITFALLS:
   - Vad ska vi undvika?
   - Vanliga misstag
   - Debugging tips

6. PERFORMANCE:
   - Performance considerations
   - Optimization tips
   - Storage limits
   - Memory management

VIKTIGT:
- Fokusera på NEXT.JS 16 SPECIFIKT (inte Next.js 13 eller äldre)
- Fokusera på PRODUCTION-READY lösningar
- Fokusera på SUPABASE integration
- Ge KONKRETA code examples
- Ge SPECIFIKA bibliotek-rekommendationer

Fråga mig om något är oklart!
```

---

## 📊 Research-resultat Format

När Perplexity är klar, strukturera resultaten så här:

### 1. Service Worker
- [ ] Rekommenderad approach: next-pwa eller manuell?
- [ ] Code example för Next.js 16
- [ ] Bibliotek och version
- [ ] Cache-strategi rekommendation

### 2. IndexedDB
- [ ] Rekommenderat bibliotek: idb/Dexie/localForage?
- [ ] Code example för React hooks
- [ ] Schema design pattern
- [ ] Performance tips

### 3. Sync Strategy
- [ ] Rekommenderad approach: offline-first eller online-first?
- [ ] Conflict resolution: last-write-wins eller manual merge?
- [ ] Code example för sync algoritm
- [ ] Performance considerations

### 4. React Query Integration
- [ ] Offline-first config
- [ ] Persist cache library
- [ ] Code example för integration
- [ ] Best practices

### 5. PWA Patterns
- [ ] Offline detection approach
- [ ] Sync queue design
- [ ] UI/UX patterns
- [ ] Error handling

### 6. Conflict Resolution
- [ ] Rekommenderad strategi
- [ ] Implementation approach
- [ ] UI patterns
- [ ] User experience

---

**Nästa steg:** När research är klar → Cursor Pro tar beslut → GPT-5 får optimerad prompt


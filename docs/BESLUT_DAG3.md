# 🎯 Beslut: Dag 3 - Offline-stöd & Sync

**Datum:** 2024-11-04  
**Baserat på:** Perplexity Pro Research Report

---

## ✅ BESLUT

### 1. Service Worker Approach
**Beslut:** ✅ **Manuell Service Worker setup**  
**Motivering:** 
- ❌ next-pwa är INTE maintained (senaste uppdatering 2023)
- ❌ next-pwa stödjer inte Next.js 16 App Router korrekt
- ✅ Manuell setup ger full kontroll
- ✅ Fungerar perfekt med App Router
- ✅ Lättare att debugga

**Implementation:**
- Skapa `public/sw.ts` (TypeScript source)
- Kompilera till `public/sw.js` vid build
- Registrera i `app/layout.tsx`
- Cache-strategier: Network First för API, Cache First för assets

---

### 2. IndexedDB Library
**Beslut:** ✅ **Dexie.js v4.0.8 + dexie-react-hooks v1.1.8**  
**Motivering:**
- ✅ Bäst TypeScript support
- ✅ React hooks integration (useLiveQuery)
- ✅ ORM-like API (bekant för utvecklare)
- ✅ Kan query med filters/indexes
- ✅ Mycket aktiv community
- ✅ Bundle size: ~50KB (acceptabelt)

**Installation:**
```bash
npm install dexie@^4.0.8 dexie-react-hooks@^1.1.8
```

---

### 3. Sync Strategy
**Beslut:** ✅ **Offline-first + Last-Write-Wins**  
**Motivering:**
- ✅ Field workers behöver arbeta offline obegränsat
- ✅ Enkel implementation (90% av use cases)
- ✅ Bra audit trail med timestamps
- ✅ Fungerar bra för construction apps
- ✅ Deterministic (ingen ambiguity)

**Implementation:**
- Allt lagras lokalt först i IndexedDB
- Ändringar läggs i sync queue
- Vid online: synka till server
- Timestamp-baserad: `updatedAt` jämförs
- Nyare version vinner

---

### 4. Conflict Resolution
**Beslut:** ✅ **Last-Write-Wins (timestamps)**  
**Motivering:**
- ✅ 90% av use cases täcks
- ✅ Enkel att implementera
- ✅ Bra audit trail
- ✅ Deterministic resultat
- ⚠️ Potentiell tyst dataförlust (accepterbart för vår use case)

**Implementation:**
- Jämför `updatedAt` timestamps
- Nyare version vinner
- Logga conflicts för audit trail
- UI kan visa conflict-notifikation (valfritt)

---

### 5. React Query Integration
**Beslut:** ✅ **Persist med IndexedDB via idb-keyval v6.2.1**  
**Motivering:**
- ✅ TanStack officiell pattern
- ✅ Minimal overhead (<300B)
- ✅ Fungerar med React Query v5
- ✅ Enkel implementation
- ✅ Officiellt stöd

**Installation:**
```bash
npm install @tanstack/react-query-persist-client@^5.28.0 idb-keyval@^6.2.1
```

**Configuration:**
- `staleTime: Infinity` (offline-first)
- `networkMode: 'offline-first'`
- Persist cache till IndexedDB
- Optimistic updates med rollback

---

### 6. Retry Strategy
**Beslut:** ✅ **Exponential backoff + jitter (5-8 retries max)**  
**Motivering:**
- ✅ Standard production pattern
- ✅ Förhindrar thundering herd
- ✅ Jitter förbättrar distribution
- ✅ Max 5-8 retries (balans mellan persistence och UX)

**Implementation:**
- Initial delay: 1s
- Max delay: 60s
- Factor: 2 (exponential)
- Jitter: ±10% random variation
- Max retries: 5-8

---

## 📦 REKOMMENDERADE BIBLIOTEK & VERSIONER

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.28.0",
    "@tanstack/react-query-persist-client": "^5.28.0",
    "dexie": "^4.0.8",
    "dexie-react-hooks": "^1.1.8",
    "idb-keyval": "^6.2.1",
    "uuid": "^9.0.1"
  }
}
```

---

## 🎯 IMPLEMENTATION ORDER

1. **Service Worker** (1 dag)
   - Manuell setup med cache-strategier
   - Registrera i layout
   - Testa offline mode

2. **IndexedDB & Dexie** (1 dag)
   - Installera Dexie
   - Skapa database schema
   - React hooks för CRUD

3. **Sync Engine** (1 dag)
   - Sync queue system
   - Last-write-wins algoritm
   - Retry logic

4. **React Query Integration** (1 dag)
   - Offline-first config
   - Persist cache
   - Optimistic updates

5. **PWA Patterns** (1 dag)
   - Online/offline detection
   - Sync manager
   - UI indicators

6. **Testing & Polish** (1-2 dagar)
   - Testa alla scenarier
   - Performance optimization
   - Documentation

---

**Status:** ✅ Beslut tagna - Redo för implementation  
**Nästa steg:** Skapa optimerad GPT-5 prompt


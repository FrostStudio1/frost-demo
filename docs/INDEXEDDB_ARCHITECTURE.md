# 🏗️ IndexedDB Architecture - Modulstruktur

## Översikt

IndexedDB-koden är uppdelad i mindre, hanterbara moduler för bättre underhåll och långsiktig stabilitet.

## Modulstruktur

### `/app/lib/db/types.ts`
**Ansvar:** Type definitions
- `LocalWorkOrder` - Lokal arbetsorder-typ
- `SyncQueueItem` - Sync-kö-typ

**Exporterar:** Endast types (ingen runtime-kod)

### `/app/lib/db/database.ts`
**Ansvar:** Core database instance (singleton)
- `FrostDB` class - Dexie database definition
- `getDB()` - Intern funktion för att få database instance
- `getDatabase()` - Exporterad funktion för extern användning
- `db` - Proxy export för direkt access

**Exporterar:** 
- `getDatabase(): FrostDB`
- `db: Proxy<FrostDB>`

### `/app/lib/db/sync-queue.ts`
**Ansvar:** Sync queue operations
- `addToSyncQueue()` - Lägg till i sync-kö
- `getPendingSyncItems()` - Hämta väntande items
- `markAsSynced()` - Markera som synkad
- `incrementAttempts()` - Öka retry-försök
- `getSyncItemByClientId()` - Hämta item via client_change_id

**Exporterar:** Alla sync-queue funktioner

### `/app/lib/db/indexeddb.ts`
**Ansvar:** Main entry point - re-exports allt
- Re-exporterar alla types från `types.ts`
- Re-exporterar database från `database.ts`
- Re-exporterar sync-queue funktioner från `sync-queue.ts`

**Användning:** Alla externa filer importerar från denna fil för bakåtkompatibilitet.

## Fördelar med denna struktur

1. **Separation of Concerns:** Varje fil har ett tydligt ansvar
2. **Enklare underhåll:** Mindre filer är lättare att förstå och ändra
3. **Bättre testbarhet:** Varje modul kan testas isolerat
4. **Turbopack-kompatibilitet:** Mindre moduler = färre hoisting-problem
5. **Bakåtkompatibilitet:** Alla befintliga imports fungerar fortfarande

## Migrationsguide

Om du behöver uppdatera imports:

### Före:
```typescript
import { getDatabase, addToSyncQueue } from '@/lib/db/indexeddb';
```

### Efter (fungerar fortfarande):
```typescript
import { getDatabase, addToSyncQueue } from '@/lib/db/indexeddb';
```

### Direkt import (för bättre tree-shaking):
```typescript
import { getDatabase } from '@/lib/db/database';
import { addToSyncQueue } from '@/lib/db/sync-queue';
```

## Best Practices

1. **Använd alltid `getDB()` internt** - Använd inte `getDatabase()` i samma modul
2. **Exportera via `indexeddb.ts`** - Så länge som möjligt för bakåtkompatibilitet
3. **Types i separat fil** - Lättare att dela mellan moduler
4. **Const arrow functions** - Bättre för Turbopack bundling

## Framtida utbyggnad

Om du behöver lägga till fler features:
- Lägg till nya types i `types.ts`
- Skapa nya moduler för nya features (t.ex. `work-orders.ts` för work order operations)
- Re-exportera från `indexeddb.ts` för bakåtkompatibilitet


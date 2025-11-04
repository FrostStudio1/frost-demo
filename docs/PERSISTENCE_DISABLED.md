# ⚠️ React Query Persistence Temporarily Disabled

## Status

React Query persistence to IndexedDB is **temporarily disabled** due to IndexedDB key format issues.

## Current Behavior

- ✅ React Query cache works **in-memory** (functionality intact)
- ✅ Offline sync via **Dexie** works independently (separate from React Query cache)
- ✅ All other offline features work normally
- ⚠️ Cache is **not persisted** across page reloads (only during session)

## Impact

### What Still Works:
- ✅ Offline work order creation/editing
- ✅ Sync queue (Dexie)
- ✅ Service Worker caching
- ✅ All offline-first features
- ✅ React Query in-memory cache during session

### What Doesn't Work:
- ❌ React Query cache persistence across page reloads
- ❌ Automatic cache restoration on app startup

## Why Disabled?

IndexedDB error: `Failed to execute 'bound' on 'IDBKeyRange': The parameter is not a valid key`

This suggests `idb-keyval` is trying to use an invalid key format. The issue is likely:
- Key format incompatibility
- Corrupted IndexedDB data
- Browser-specific IndexedDB implementation differences

## Re-enable When Ready

To re-enable persistence:

1. **Option 1: Fix idb-keyval usage**
   - Check key format requirements
   - Ensure keys are valid IndexedDB keys (string, number, Date, or ArrayBuffer)

2. **Option 2: Use alternative persistence**
   - Consider `localStorage` for smaller data
   - Or implement custom IndexedDB wrapper

3. **Option 3: Use official persister**
   - Check if `@tanstack/query-persist-client-idb` has better IndexedDB handling

## Files Modified

- `app/providers/QueryProvider.tsx` - Disabled PersistQueryClientProvider
- `app/lib/idb-persister.ts` - Still available but not used

## No Impact on Core Features

**Important:** This does NOT affect:
- Work order offline functionality
- Sync queue
- Dexie storage
- Service Worker
- Any other offline features

Only React Query cache persistence is affected.


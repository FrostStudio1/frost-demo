'use client'

import { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'

/**
 * QueryProvider - React Query provider
 * 
 * NOTE: Persistence is temporarily disabled due to IndexedDB issues.
 * React Query cache will work in-memory only.
 * Offline sync still works via Dexie (separate from React Query cache).
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  // Temporarily disable persistence due to IndexedDB issues
  // The app will work fine with in-memory cache
  // Offline sync via Dexie still works independently
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// TODO: Re-enable persistence once IndexedDB issues are resolved
// To re-enable:
// 1. Fix idb-keyval key format issues
// 2. Or use a different persistence library
// 3. Or implement custom IndexedDB wrapper


// app/lib/queryClient.ts
'use client'

import { QueryClient } from '@tanstack/react-query'

/**
 * React Query client configuration - Offline-First
 * 
 * Settings:
 * - staleTime: Infinity - Data never becomes stale (offline-first)
 * - networkMode: 'offline-first' - Read from cache first, then network
 * - gcTime: 24 hours - Data stays in cache for 24 hours
 * - refetchOnWindowFocus: false - Don't refetch when switching tabs
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Offline-first: data never becomes stale
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnWindowFocus: false,
      networkMode: 'offline-first', // Read from cache first
      retry: (failureCount, error: any) => {
        // Don't retry if offline
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          return false;
        }
        // Max 3 retries
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      }
    },
    mutations: {
      networkMode: 'offline-first',
      retry: 1,
      retryDelay: (attemptIndex) => {
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      }
    },
  },
})


'use client'

import { QueryClient } from '@tanstack/react-query'

/**
 * React Query client configuration
 * Provides caching, background refetching, and optimistic updates
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes - keep in cache for 30 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus (reduce unnecessary requests)
      refetchOnReconnect: true, // Refetch when reconnecting
      retry: 1, // Retry failed requests once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: 1,
    },
  },
})


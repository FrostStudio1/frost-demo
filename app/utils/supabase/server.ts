// app/utils/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export function createClient() {
  const cookieStorePromise = cookies() // <- Promise i Next 16

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const store = await cookieStorePromise
          return store.get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          const store = await cookieStorePromise
          store.set({ name, value, ...options })
        },
        async remove(name: string, options: CookieOptions) {
          const store = await cookieStorePromise
          store.set({ name, value: '', ...options })
        },
      },
    }
  )
}

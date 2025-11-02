// /app/utils/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase-generated'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Use createBrowserClient from @supabase/ssr to properly handle OAuth redirects
// Typed with generated Database type for better type safety
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

export default supabase

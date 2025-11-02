import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase admin client using the service role key
 * This bypasses Row Level Security (RLS) policies
 * 
 * @returns Supabase client configured with service role
 * @throws Error if service role key or URL is missing
 */
export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL. ' +
      'Please check your .env.local file.'
    )
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}


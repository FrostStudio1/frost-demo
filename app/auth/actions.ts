'use server'

import { redirect, } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '../utils/supabase/server'

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get('email') || '').trim()
  if (!email) return { ok: false, error: 'Ange e-post' }

  const supabase = createClient()

  const hdrs = headers()
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host') ?? 'localhost:3000'
  const proto = (hdrs.get('x-forwarded-proto') ?? 'http')
  const origin = `${proto}://${host}`

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/`
    }
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut({ scope: 'global' })
  redirect('/login')
}

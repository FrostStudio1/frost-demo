import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') ?? '/'

  const supabase = createClient()

  // Magic Link / Email OTP
  const token_hash = searchParams.get('token_hash') ?? searchParams.get('token')
  const type = searchParams.get('type') as EmailOtpType | null

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) redirect(next)
  }

  // PKCE / OAuth (om ?code=... kommer)
  const code = searchParams.get('code')
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) redirect(next)
  }

  redirect('/error')
}

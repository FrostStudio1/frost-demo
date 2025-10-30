'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Use getSession to check if the client has a session after redirect
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data?.session
      if (!session) {
        console.error('No session found in client after redirect')
        setStatus('error')
        return
      }

      try {
        // Post session tokens to server route to set httpOnly cookies
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
          }),
        })

        // Redirect after server cookies are set
        router.replace('/dashboard')
      } catch (err) {
        console.error('failed to set session on server', err)
        setStatus('error')
      }
    })
  }, [router])

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <h1 className="font-bold text-lg mb-2 text-red-600">Något gick fel vid inloggningen</h1>
        <a href="/login" className="text-blue-600 underline">Försök igen</a>
      </div>
    )
  }

  // Loader/spinner
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-800 mr-6"></div>
      <span className="text-sm text-blue-700">Loggar in...</span>
    </div>
  )
}

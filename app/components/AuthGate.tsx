'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FrostLogo from './FrostLogo'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Läs Supabase-token från browser (snabb-hack, byt till supabase-js om du vill)
    const token = window.localStorage.getItem('sb-access-token')
    if (token) setAuthed(true)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <FrostLogo size={44} />
        <span className="text-blue-700 font-bold text-xl mt-2 animate-pulse">Verifierar användare...</span>
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <FrostLogo size={44} />
        <h1 className="font-bold text-xl text-blue-700 mb-2">Du är inte inloggad</h1>
        <a href="/login" className="text-blue-600 underline font-medium mb-3">Logga in &rarr;</a>
      </div>
    )
  }

  return <>{children}</>
}

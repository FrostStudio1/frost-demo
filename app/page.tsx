'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FrostLogo from './components/FrostLogo'
import { supabase } from '@/utils/supabase/supabaseClient'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/dashboard')
      } else {
        setLoading(false)
      }
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-800 mr-6" />
        <span className="text-blue-700 text-xl">Laddar...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center rounded-3xl shadow-xl bg-white bg-opacity-75 p-10 max-w-lg w-full border border-blue-100 backdrop-blur">
        <FrostLogo size={60} />
        <h1 className="text-3xl font-black text-blue-700 mt-4 mb-2">Frost Bygg</h1>
        <p className="mb-6 text-lg text-blue-600 text-center">Logga in för att komma åt din dashboard och börja rapportera tid!</p>
        <button
          className="bg-blue-600 w-full text-white rounded-lg py-2 font-bold text-lg shadow hover:bg-blue-700 transition"
          onClick={() => router.push('/login')}
        >
          Logga in
        </button>
        <div className="mt-8 text-xs text-blue-400 font-mono tracking-wide select-none opacity-70">
          &copy; 2025 Frost Apps
        </div>
      </div>
    </div>
  )
}

'use client'

import { sendMagicLink } from '../auth/actions'
import { useState } from 'react'
import FrostLogo from '../components/FrostLogo'

export default function LoginPage() {
  const [status, setStatus] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await sendMagicLink(formData)
      setStatus('Magic Link skickad! Kolla din mail.')
    } catch (err: any) {
      setStatus(err?.message || 'Fel vid inloggning')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="w-full max-w-md bg-white bg-opacity-75 rounded-3xl shadow-2xl backdrop-blur border border-blue-100 p-9 flex flex-col items-center">
        <FrostLogo size={56} />
        <h1 className="font-black text-3xl mb-7 text-blue-700 text-center">Frost Bygg</h1>
        <form onSubmit={handleSubmit} className="w-full">
          <label className="block text-sm text-blue-600 mb-2">E-post</label>
          <input name="email" type="email" required className="w-full p-3 rounded-lg border border-blue-100 mb-4" />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg py-2 w-full font-bold text-lg shadow hover:bg-blue-700 transition"
          >
            Skicka Magic Link
          </button>
        </form>

        {status && <div className="mt-4 text-sm text-blue-700">{status}</div>}

        <div className="mt-7 text-xs text-blue-400 select-none opacity-70 font-mono tracking-wide">
          Frost Studio • By Vilmer
        </div>
      </div>
    </div>
  )
}

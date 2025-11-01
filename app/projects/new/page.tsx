'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FrostLogo from '@/components/FrostLogo'
import { useTenant } from '@/context/TenantContext'

export default function NewProjectPage() {
  const router = useRouter()
  const { tenantId } = useTenant()
  const [name, setName] = useState('')
  const [budget, setBudget] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tenantId) {
      console.log('Tenant ID i formulär:', tenantId)
      // Hämta projekt/anställda baserat på tenantId
    }
  }, [tenantId])
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    // Use client helper that injects tenant into headers and JSON body
    const res = await fetch('/api/create-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        tenant_id: tenantId,
        base_rate_sek: undefined,
        budgeted_hours: budget,
      }),
    })

    const json = await res.json()
    const error = json?.error

    setLoading(false)

    if (error) {
      console.error('Supabase insert error (project)', error)
      alert('Kunde inte skapa projekt: ' + (error.message ?? JSON.stringify(error)))
      return
    }

    // Redirect to projects list so server-side list refreshes
    router.replace('/projects')
  }
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="rounded-3xl shadow-xl bg-white bg-opacity-90 border border-blue-100 p-10 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <FrostLogo size={30}/>
          <div className="font-bold text-blue-700 text-xl">Nytt projekt</div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-blue-600 font-medium mb-2">Projektnamn</label>
            <input 
              className="w-full border border-blue-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={name} onChange={e=>setName(e.target.value)} required placeholder="T.ex. Villa Ekbacken"/>
          </div>
          <div>
            <label className="block text-blue-600 font-medium mb-2">Budget (timmar) <span className="text-xs text-gray-500">(valfritt)</span></label>
            <input 
              className="w-full border border-blue-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              type="number" value={budget} onChange={e=>setBudget(Number(e.target.value))} min={1} placeholder="T.ex. 60"/>
            <p className="text-xs text-gray-500 mt-1">I vissa miljöer stöds inte fältet <code>budget</code> ännu — värdet sparas inte här.</p>
          </div>
          <button disabled={loading}
            className="mt-2 bg-blue-600 text-white rounded-xl font-bold text-lg shadow px-6 py-3 hover:bg-blue-700 transition">{loading ? "Sparar..." : "Skapa projekt"}</button>
        </form>
      </div>
    </div>
  )
}



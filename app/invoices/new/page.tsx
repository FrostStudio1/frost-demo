'use client'
import { useState } from 'react'
import { supabase } from '@/utils/supabase/supabaseClient'
import { useRouter } from 'next/navigation'
import FrostLogo from '../../components/FrostLogo'

export default function NewInvoicePage() {
  const router = useRouter()
  const [amount, setAmount] = useState(0)
  const [customer_id, setCustomerId] = useState('')
  const [loading, setLoading] = useState(false)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const tenant_id = localStorage.getItem('tenant_id')
    await supabase.from('invoices').insert({
      amount,
      customer_id,
      tenant_id
    })
    setLoading(false)
    router.push('/invoices')
  }
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="rounded-3xl shadow-xl bg-white bg-opacity-95 border border-blue-100 p-10 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <FrostLogo size={30}/>
          <div className="font-bold text-blue-700 text-xl">Ny faktura</div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-blue-600 font-medium mb-2">Belopp (SEK)</label>
            <input 
              className="w-full border border-blue-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} required min={1} placeholder="T.ex. 12900"/>
          </div>
          <div>
            <label className="block text-blue-600 font-medium mb-2">Kund-ID</label>
            <input 
              className="w-full border border-blue-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={customer_id} onChange={e=>setCustomerId(e.target.value)} required placeholder="Kundens ID"/>
          </div>
          <button disabled={loading}
            className="mt-2 bg-blue-600 text-white rounded-xl font-bold text-lg shadow px-6 py-3 hover:bg-blue-700 transition">{loading ? "Sparar..." : "Skapa faktura"}</button>
        </form>
      </div>
    </div>
  )
}

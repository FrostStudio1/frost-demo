'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/supabaseClient'
import { useRouter } from 'next/navigation'

type Invoice = {
  id: string,
  amount: number,
  customer_id: string,
  project_id?: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const router = useRouter()

  useEffect(() => {
    const tenant_id = localStorage.getItem('tenant_id')
    async function fetchInvoices() {
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .eq('tenant_id', tenant_id)
      setInvoices(data || [])
    }
    fetchInvoices()
  }, [])

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Dina fakturor</h1>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="p-3 font-semibold">Faktura-ID</th>
            <th className="p-3 font-semibold">Belopp (SEK)</th>
            <th className="p-3 font-semibold">KundID</th>
            <th className="p-3 font-semibold">Projekt</th>
            <th className="p-3 font-semibold">Visa faktura</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id} className="border-b border-gray-100">
              <td className="p-3">{inv.id}</td>
              <td className="p-3">{inv.amount}</td>
              <td className="p-3">{inv.customer_id}</td>
              <td className="p-3">{inv.project_id ?? '–'}</td>
              <td className="p-3">
                <button
                  className="bg-blue-600 text-white rounded px-3 py-1 font-semibold hover:bg-blue-700 transition"
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                >
                  Visa faktura
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {invoices.length === 0 &&
        <div className="mt-6 text-blue-500">Inga fakturor funna än!</div>}
    </div>
  )
}

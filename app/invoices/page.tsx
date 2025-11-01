'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/supabaseClient'
import { useRouter } from 'next/navigation'
import { useTenant } from '@/context/TenantContext'
import Sidebar from '@/components/Sidebar'

type Invoice = {
  id: string,
  amount: number,
  customer_name?: string,
  customer_id?: string,
  project_id?: string,
  number?: string,
  status?: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { tenantId } = useTenant()

  useEffect(() => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    async function fetchInvoices() {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, amount, customer_name, customer_id, project_id, number, status')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching invoices:', error)
        // Försök med minimal select om fullständig query misslyckas
        try {
          const fallback = await supabase
            .from('invoices')
            .select('id, amount, customer_name')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
          
          if (!fallback.error && fallback.data) {
            setInvoices(fallback.data.map((inv: any) => ({
              ...inv,
              number: inv.number || inv.id.slice(0, 8),
              status: inv.status || 'draft',
            })))
          } else {
            setInvoices([])
          }
        } catch (fallbackErr) {
          console.error('Fallback error:', fallbackErr)
          setInvoices([])
        }
      } else {
        setInvoices(data || [])
      }
      setLoading(false)
    }
    fetchInvoices()
  }, [tenantId])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex">
        <Sidebar />
        <main className="flex-1 p-10 flex items-center justify-center">
          <div className="text-gray-500">Laddar...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-2">Invoices</h1>
            <p className="text-gray-500">Hantera dina fakturor</p>
          </div>

          {!tenantId ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-red-500">
              Ingen tenant vald — välj tenant eller logga in.
            </div>
          ) : invoices.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
              Inga fakturor funna än!
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-700">Nummer</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Kund</th>
                      <th className="p-4 text-right font-semibold text-gray-700">Belopp (SEK)</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                      <th className="p-4 text-right font-semibold text-gray-700">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{inv.number || inv.id.slice(0, 8)}</td>
                        <td className="p-4 text-gray-600">{inv.customer_name || inv.customer_id || '–'}</td>
                        <td className="p-4 text-right font-semibold text-gray-900">
                          {Number(inv.amount || 0).toLocaleString('sv-SE')} kr
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            inv.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            inv.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inv.status || 'draft'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                            onClick={() => router.push(`/invoices/${inv.id}`)}
                          >
                            Visa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

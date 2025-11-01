'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import supabase from '@/utils/supabase/supabaseClient'
import { useTenant } from '@/context/TenantContext'
import Sidebar from '@/components/Sidebar'
import { sendInvoiceEmail } from './actions'
import { toast } from '@/lib/toast'

interface Invoice {
  id: string
  number?: string
  amount: number
  customer_name?: string
  desc?: string
  status?: string
  issue_date?: string
  due_date?: string
  project_id?: string
}

interface InvoiceLine {
  description: string
  quantity: number
  unit: string
  rate_sek: number
  amount_sek: number
}

export default function InvoicePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { tenantId } = useTenant()
  const invoiceId = params?.id as string
  
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [lines, setLines] = useState<InvoiceLine[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!invoiceId || !tenantId) {
      setLoading(false)
      return
    }

    async function fetchInvoice() {
      try {
        const { data: invData, error: invError } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .eq('tenant_id', tenantId)
          .single()

        if (invError || !invData) {
          console.error('Error fetching invoice:', invError)
          setLoading(false)
          return
        }

        setInvoice(invData as Invoice)

        // Hämta fakturarader om de finns
        const { data: linesData } = await supabase
          .from('invoice_lines')
          .select('description, quantity, unit, rate_sek, amount_sek')
          .eq('invoice_id', invoiceId)
          .order('sort_order', { ascending: true })

        if (linesData) {
          setLines(linesData as InvoiceLine[])
        } else {
          // Om inga rader finns, skapa en från faktura-data
          if (invData.desc && invData.amount) {
            setLines([{
              description: invData.desc,
              quantity: 1,
              unit: 'st',
              rate_sek: Number(invData.amount) || 0,
              amount_sek: Number(invData.amount) || 0,
            }])
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [invoiceId, tenantId])

  async function handleDownloadPDF() {
    setDownloading(true)
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      
      if (!response.ok) {
        throw new Error('Kunde inte generera PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `faktura-${invoice?.number || invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading PDF:', err)
      toast.error('Kunde inte ladda ner PDF: ' + (err instanceof Error ? err.message : 'Okänt fel'))
    } finally {
      setDownloading(false)
    }
  }

  async function handleSendEmail() {
    if (!confirm('Vill du skicka fakturan via e-post?')) return
    
    setSending(true)
    try {
      await sendInvoiceEmail(invoiceId)
      toast.success('Fakturan har skickats!')
      window.location.reload()
    } catch (err: any) {
      toast.error('Fel: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  async function handleMarkPaid() {
    if (!confirm('Markera fakturan som betald?')) return
    
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId)
      
      if (error) throw error
      toast.success('Fakturan markerad som betald!')
      window.location.reload()
    } catch (err: any) {
      toast.error('Fel: ' + err.message)
    }
  }

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

  if (!invoice) {
    return (
      <div className="min-h-screen bg-white flex">
        <Sidebar />
        <main className="flex-1 p-10 flex items-center justify-center">
          <div className="text-red-500">Faktura hittades inte</div>
        </main>
      </div>
    )
  }

  const total = lines.reduce((sum, line) => sum + Number(line.amount_sek || 0), 0) || Number(invoice.amount || 0)
  const rot = total * 0.3
  const toPay = total - rot

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-6 lg:p-10 max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              Invoice {invoice.number || invoiceId.slice(0, 8)}
            </h1>
            <p className="text-gray-500">Fakturainformation</p>
          </div>

          {searchParams?.get('sent') === '1' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
              ✓ Fakturan har skickats via e-post!
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">FAKTURA</h2>
                  <div className="text-sm text-gray-600">
                    <div>Fakturanr: <span className="font-semibold">{invoice.number || invoiceId.slice(0, 8)}</span></div>
                    {invoice.issue_date && (
                      <div>Datum: <span className="font-semibold">{new Date(invoice.issue_date).toLocaleDateString('sv-SE')}</span></div>
                    )}
                    {invoice.due_date && (
                      <div>Förfallodatum: <span className="font-semibold">{new Date(invoice.due_date).toLocaleDateString('sv-SE')}</span></div>
                    )}
                  </div>
                </div>
                <div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    invoice.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status || 'draft'}
                  </span>
                </div>
              </div>
            </div>

            {/* Kund */}
            <div className="p-8 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Faktura till</h3>
              <div className="text-lg font-semibold text-gray-900">{invoice.customer_name || 'Okänd kund'}</div>
            </div>

            {/* Rader */}
            <div className="p-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 font-semibold text-gray-700">Beskrivning</th>
                    <th className="text-right py-4 font-semibold text-gray-700">Antal</th>
                    <th className="text-right py-4 font-semibold text-gray-700">Enhet</th>
                    <th className="text-right py-4 font-semibold text-gray-700">Á-pris</th>
                    <th className="text-right py-4 font-semibold text-gray-700">Summa</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.length > 0 ? (
                    lines.map((line, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-4 text-gray-900">{line.description}</td>
                        <td className="py-4 text-right text-gray-600">{Number(line.quantity).toFixed(2)}</td>
                        <td className="py-4 text-right text-gray-600">{line.unit}</td>
                        <td className="py-4 text-right text-gray-600">{Number(line.rate_sek).toLocaleString('sv-SE')} kr</td>
                        <td className="py-4 text-right font-semibold text-gray-900">{Number(line.amount_sek).toLocaleString('sv-SE')} kr</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500 italic">
                        {invoice.desc || 'Inga rader'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals */}
              <div className="mt-8 flex justify-end">
                <div className="w-full max-w-md space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Summa</span>
                    <span className="font-semibold">{total.toLocaleString('sv-SE')} kr</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Preliminärt ROT-avdrag (30%)</span>
                    <span className="font-semibold">−{rot.toLocaleString('sv-SE')} kr</span>
                  </div>
                  <div className="pt-4 border-t-2 border-gray-300 flex justify-between text-xl font-black text-gray-900">
                    <span>ATT BETALA</span>
                    <span>{toPay.toLocaleString('sv-SE')} kr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-8 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-4">
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {downloading ? 'Laddar...' : '📄 Ladda ner PDF'}
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sending || invoice.status === 'paid'}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {sending ? 'Skickar...' : '✉️ Skicka via e-post'}
              </button>
              {invoice.status !== 'paid' && (
                <button
                  onClick={handleMarkPaid}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  ✓ Markera som betald
                </button>
              )}
              <button
                onClick={() => router.back()}
                className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                Tillbaka
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

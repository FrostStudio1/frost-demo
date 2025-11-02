'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import supabase from '@/utils/supabase/supabaseClient'
import { useTenant } from '@/context/TenantContext'
import Sidebar from '@/components/Sidebar'
import { sendInvoiceEmail } from './actions'
import { toast } from '@/lib/toast'
import FileUpload from '@/components/FileUpload'
import FileList from '@/components/FileList'

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
  id?: string
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
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null)
  const [editingLine, setEditingLine] = useState<InvoiceLine | null>(null)

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
          .select('id, description, quantity, unit, rate_sek, amount_sek, sort_order')
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
      if (!tenantId) {
        toast.error('Ingen tenant vald')
        return
      }

      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId)
        .eq('tenant_id', tenantId) // Security: Ensure tenant match
      
      if (error) throw error
      toast.success('Fakturan markerad som betald!')
      window.location.reload()
    } catch (err: any) {
      toast.error('Fel: ' + err.message)
    }
  }

  function startEditLine(index: number) {
    setEditingLineIndex(index)
    setEditingLine({ ...lines[index] })
  }

  function cancelEdit() {
    setEditingLineIndex(null)
    setEditingLine(null)
  }

  async function saveLine(index: number) {
    if (!editingLine) return
    
    // Recalculate amount if quantity or rate changed
    const newAmount = Number(editingLine.quantity || 0) * Number(editingLine.rate_sek || 0)
    const updatedLine = { ...editingLine, amount_sek: newAmount }
    
    try {
      const line = lines[index]
      
      // If line has an id, update it in the database
      if (line.id) {
        if (!tenantId) {
          toast.error('Ingen tenant vald')
          return
        }

        const { error } = await supabase
          .from('invoice_lines')
          .update({
            description: updatedLine.description,
            quantity: updatedLine.quantity,
            unit: updatedLine.unit,
            rate_sek: updatedLine.rate_sek,
            amount_sek: updatedLine.amount_sek,
          })
          .eq('id', line.id)
          .eq('tenant_id', tenantId) // Security: Ensure tenant match
        
        if (error) throw error
      }
      
      // Update local state
      const updatedLines = [...lines]
      updatedLines[index] = updatedLine
      setLines(updatedLines)
      
      setEditingLineIndex(null)
      setEditingLine(null)
      toast.success('Rad uppdaterad!')
    } catch (err: any) {
      toast.error('Fel: ' + err.message)
    }
  }

  async function deleteLine(index: number) {
    if (!confirm('Vill du ta bort denna rad?')) return
    
    const line = lines[index]
    
    try {
      // If line has an id, delete it from the database
      if (line?.id) {
        if (!tenantId) {
          toast.error('Ingen tenant vald')
          return
        }

        const { error } = await supabase
          .from('invoice_lines')
          .delete()
          .eq('id', line.id)
          .eq('tenant_id', tenantId) // Security: Ensure tenant match
        
        if (error) throw error
      }
      
      // Update local state
      const updatedLines = lines.filter((_, i) => i !== index)
      setLines(updatedLines)
      
      toast.success('Rad borttagen!')
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
                        {editingLineIndex === i ? (
                          <>
                            <td className="py-4">
                              <input
                                type="text"
                                value={editingLine?.description || ''}
                                onChange={(e) => setEditingLine({ ...editingLine!, description: e.target.value })}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="py-4">
                              <input
                                type="number"
                                step="0.01"
                                value={editingLine?.quantity || 0}
                                onChange={(e) => {
                                  const qty = Number(e.target.value)
                                  const rate = Number(editingLine?.rate_sek || 0)
                                  setEditingLine({ ...editingLine!, quantity: qty, amount_sek: qty * rate })
                                }}
                                className="w-full px-2 py-1 border rounded text-right"
                              />
                            </td>
                            <td className="py-4">
                              <input
                                type="text"
                                value={editingLine?.unit || ''}
                                onChange={(e) => setEditingLine({ ...editingLine!, unit: e.target.value })}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="py-4">
                              <input
                                type="number"
                                step="0.01"
                                value={editingLine?.rate_sek || 0}
                                onChange={(e) => {
                                  const rate = Number(e.target.value)
                                  const qty = Number(editingLine?.quantity || 0)
                                  setEditingLine({ ...editingLine!, rate_sek: rate, amount_sek: qty * rate })
                                }}
                                className="w-full px-2 py-1 border rounded text-right"
                              />
                            </td>
                            <td className="py-4">
                              <div className="flex gap-2 justify-end">
                                <span className="font-semibold">{Number(editingLine?.amount_sek || 0).toLocaleString('sv-SE')} kr</span>
                                <button
                                  onClick={() => saveLine(i)}
                                  className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="px-2 py-1 bg-gray-500 text-white rounded text-sm"
                                >
                                  ✕
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-4 text-gray-900">{line.description}</td>
                            <td className="py-4 text-right text-gray-600">{Number(line.quantity).toFixed(2)}</td>
                            <td className="py-4 text-right text-gray-600">{line.unit}</td>
                            <td className="py-4 text-right text-gray-600">{Number(line.rate_sek).toLocaleString('sv-SE')} kr</td>
                            <td className="py-4 text-right">
                              <div className="flex gap-2 justify-end items-center">
                                <span className="font-semibold text-gray-900">{Number(line.amount_sek).toLocaleString('sv-SE')} kr</span>
                                <button
                                  onClick={() => startEditLine(i)}
                                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => deleteLine(i)}
                                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </>
                        )}
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

          {/* Files Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mt-6 sm:mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Bilagor</h2>
            <FileUpload 
              entityType="invoice" 
              entityId={invoiceId}
              onUploadComplete={() => {
                // Trigger refresh
                window.location.reload()
              }}
            />
            <div className="mt-4">
              <FileList entityType="invoice" entityId={invoiceId} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

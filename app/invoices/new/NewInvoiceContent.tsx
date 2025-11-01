'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTenant } from '@/context/TenantContext'
import Sidebar from '@/components/Sidebar'
import { toast } from '@/lib/toast'

export default function NewInvoiceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams?.get('projectId')
  const { tenantId } = useTenant()
  
  const [amount, setAmount] = useState(0)
  const [desc, setDesc] = useState('')
  const [customer_name, setCustomerName] = useState('')
  const [customer_orgnr, setCustomerOrgnr] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProject, setLoadingProject] = useState(!!projectId)

  useEffect(() => {
    async function loadProjectData() {
      if (!projectId || !tenantId) return

      setLoadingProject(true)
      try {
        // Fetch project details
        const { data: projectData } = await supabase
          .from('projects')
          .select('customer_name, base_rate_sek')
          .eq('id', projectId)
          .eq('tenant_id', tenantId)
          .single()

        if (projectData) {
          setCustomerName(projectData.customer_name || '')
          // Fetch unbilled time entries for this project
          const { data: entriesData } = await supabase
            .from('time_entries')
            .select('hours_total')
            .eq('project_id', projectId)
            .eq('is_billed', false)

          const totalHours = (entriesData ?? []).reduce((sum: number, row: any) => {
            return sum + Number(row?.hours_total ?? 0)
          }, 0)

          const rate = Number(projectData.base_rate_sek) || 360
          setAmount(totalHours * rate)
          setDesc(`${totalHours.toFixed(1)} timmar @ ${rate} kr/tim = ${(totalHours * rate).toLocaleString('sv-SE')} kr`)
        }
      } catch (err) {
        console.error('Error loading project:', err)
      } finally {
        setLoadingProject(false)
      }
    }

    loadProjectData()
  }, [projectId, tenantId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    if (!tenantId) {
      setLoading(false)
      toast.error('Ingen tenant satt. Logga in eller välj tenant först.')
      return
    }

    const { error } = await supabase
      .from('invoices')
      .insert({
        amount,
        customer_name: customer_name || 'Okänd kund',
        desc,
        tenant_id: tenantId,
        project_id: projectId || null,
      })

    setLoading(false)

    if (error) {
      console.error('Supabase insert error', error)
      toast.error('Kunde inte skapa faktura: ' + (error.message ?? JSON.stringify(error)))
      return
    }

    router.replace('/invoices')
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-6 lg:p-10 max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              {projectId ? 'New Invoice from Project' : 'New Invoice'}
            </h1>
            <p className="text-gray-500">Skapa en ny faktura</p>
          </div>

          {loadingProject && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-6">
              <p className="text-gray-500">Laddar projektdata...</p>
            </div>
          )}

          <form
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            onSubmit={handleSubmit}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kundnamn
                </label>
                <input
                  type="text"
                  value={customer_name}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Kundens namn"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organisationsnummer
                </label>
                <input
                  type="text"
                  value={customer_orgnr}
                  onChange={(e) => setCustomerOrgnr(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="556677-8899"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Belopp (SEK)
                </label>
                <input
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Beskrivning
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px]"
                  placeholder="Beskrivning av fakturerad tjänst"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || loadingProject}
                className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
              >
                {loading ? 'Sparar...' : 'Skapa faktura'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}


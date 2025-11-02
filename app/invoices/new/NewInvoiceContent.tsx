'use client'

import { useState, useEffect } from 'react'
import supabase from '@/utils/supabase/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTenant } from '@/context/TenantContext'
import Sidebar from '@/components/Sidebar'
import { toast } from '@/lib/toast'

export default function NewInvoiceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams?.get('projectId')
  const rotApplicationId = searchParams?.get('rotApplicationId')
  const preFilledAmount = searchParams?.get('amount')
  const preFilledClientId = searchParams?.get('clientId')
  const { tenantId } = useTenant()
  
  const [amount, setAmount] = useState(preFilledAmount ? parseFloat(preFilledAmount) : 0)
  const [desc, setDesc] = useState('')
  const [customer_id, setCustomerId] = useState<string>(preFilledClientId || '')
  const [customer_name, setCustomerName] = useState('')
  const [customer_orgnr, setCustomerOrgnr] = useState('')
  const [clients, setClients] = useState<Array<{ id: string; name: string; org_number?: string }>>([])
  const [loading, setLoading] = useState(false)
  const [loadingProject, setLoadingProject] = useState(!!projectId || !!rotApplicationId)
  const [rotApplication, setRotApplication] = useState<any>(null)

  // Fetch clients on mount
  useEffect(() => {
    async function fetchClients() {
      if (!tenantId) {
        console.log('No tenantId, skipping client fetch')
        return
      }

      console.log('Fetching clients for tenant:', tenantId)
      try {
        // Try with org_number first
        let { data: clientsData, error } = await supabase
          .from('clients')
          .select('id, name, org_number')
          .eq('tenant_id', tenantId)
          .order('name', { ascending: true })

        // If org_number column doesn't exist, retry without it
        if (error && (error.code === '42703' || error.message?.includes('does not exist'))) {
          const fallback = await supabase
            .from('clients')
            .select('id, name')
            .eq('tenant_id', tenantId)
            .order('name', { ascending: true })
          
          if (!fallback.error && fallback.data) {
            clientsData = fallback.data.map((c: any) => ({ ...c, org_number: null }))
            error = null
          }
        }

        if (error) {
          console.error('Error fetching clients:', error)
          setClients([])
        } else {
          console.log('Clients fetched:', clientsData?.length || 0)
          setClients(clientsData || [])
        }
      } catch (err) {
        console.error('Unexpected error fetching clients:', err)
        setClients([])
      }
    }

    fetchClients()
  }, [tenantId])

  useEffect(() => {
    async function loadProjectData() {
      if (!projectId || !tenantId) return

      setLoadingProject(true)
      try {
        // Fetch project details with client relation
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('customer_name, base_rate_sek, client_id, clients(id, name, org_number)')
          .eq('id', projectId)
          .eq('tenant_id', tenantId)
          .single()

        if (projectError) {
          console.error('Error fetching project:', projectError)
          toast.error('Kunde inte ladda projektdata')
          return
        }

        if (projectData) {
          // Prefer client from relation if available
          const projectClient = (projectData as any)?.clients
          if (projectClient?.id) {
            setCustomerId(projectClient.id)
            setCustomerName(projectClient.name)
            setCustomerOrgnr(projectClient.org_number || '')
          } else if (projectData.client_id) {
            // Fallback to client_id and find in clients list
            setCustomerId(projectData.client_id)
            const client = clients.find(c => c.id === projectData.client_id)
            if (client) {
              setCustomerName(client.name)
              setCustomerOrgnr(client.org_number || '')
            } else {
              // Will be updated when clients list loads
              setCustomerId(projectData.client_id)
            }
          } else {
            // Fallback to customer_name from project
            setCustomerName(projectData.customer_name || '')
          }

          // Fetch unbilled time entries for this project
          const { data: entriesData, error: entriesError } = await supabase
            .from('time_entries')
            .select('hours_total')
            .eq('project_id', projectId)
            .eq('is_billed', false)
            .eq('tenant_id', tenantId)

          if (entriesError) {
            console.warn('Error fetching time entries:', entriesError)
            // Continue with 0 hours
          }

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

  // Update customer info when clients list changes and we have a client_id
  useEffect(() => {
            if (customer_id && clients.length > 0) {
              const client = clients.find(c => c.id === customer_id)
              if (client && !customer_name) {
                setCustomerName(client.name)
                setCustomerOrgnr(client.org_number || '')
              }
            }
          }, [clients, customer_id, customer_name])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    if (!tenantId) {
      setLoading(false)
      toast.error('Ingen tenant satt. Logga in eller välj tenant först.')
      return
    }

    try {
      // Build minimal base payload - start with only guaranteed columns
      const basePayload: any = {
        tenant_id: tenantId,
      }
      
      // Add description (try both 'desc' and 'description' columns)
      if (desc) {
        basePayload.desc = desc
        basePayload.description = desc
      }

      // Add client_id if a client was selected (preferred over customer_name)
      if (customer_id) {
        basePayload.client_id = customer_id
      }

      // Add project_id if available
      if (projectId || rotApplication?.project_id) {
        basePayload.project_id = projectId || rotApplication?.project_id
      }

      // Add ROT application reference if available
      if (rotApplicationId) {
        basePayload.rot_application_id = rotApplicationId
      }

      // Try progressively: start with minimal payload, then add optional columns
      let data: any = null
      let error: any = null
      let result: any = null

      // Attempt 1: Try with all optional columns (customer_name, status, issue_date, amount)
      const payload1 = { ...basePayload }
      if (customer_name) {
        payload1.customer_name = customer_name
      }
      if (amount) {
        payload1.amount = Number(amount) || 0
      }
      payload1.status = 'draft'
      payload1.issue_date = new Date().toISOString().split('T')[0]

      result = await supabase
        .from('invoices')
        .insert(payload1)
        .select()
        .single()

      // Attempt 2: If customer_name fails, try without it
      if (result.error && (result.error.code === '42703' || result.error.message?.includes('customer_name'))) {
        const payload2 = { ...basePayload }
        if (amount) {
          payload2.amount = Number(amount) || 0
        }
        payload2.status = 'draft'
        payload2.issue_date = new Date().toISOString().split('T')[0]

        result = await supabase
          .from('invoices')
          .insert(payload2)
          .select()
          .single()
      }

      // Attempt 3: If status/issue_date fails, try without them
      if (result.error && (result.error.code === '42703' || result.error.message?.includes('does not exist') || result.error.message?.includes('Could not find'))) {
        const payload3 = { ...basePayload }
        if (amount) {
          payload3.amount = Number(amount) || 0
        }

        result = await supabase
          .from('invoices')
          .insert(payload3)
          .select()
          .single()
      }

      // Attempt 4: If amount fails, try without it
      if (result.error && (result.error.code === '42703' || result.error.message?.includes('amount'))) {
        result = await supabase
          .from('invoices')
          .insert(basePayload)
          .select()
          .single()
      }

      // Attempt 5: If 'desc' column doesn't exist, try with 'description' only
      if (result.error && (result.error.code === 'PGRST204' || result.error.message?.includes("Could not find the 'desc' column"))) {
        const payloadNoDesc = { ...basePayload }
        delete payloadNoDesc.desc
        if (desc) {
          payloadNoDesc.description = desc
        }
        
        result = await supabase
          .from('invoices')
          .insert(payloadNoDesc)
          .select()
          .single()
      }

      // Attempt 6: If 'description' also doesn't exist, try minimal payload (just tenant_id)
      if (result.error && (result.error.code === 'PGRST204' || result.error.message?.includes("Could not find the 'description' column"))) {
        const minimalPayload: any = {
          tenant_id: tenantId,
        }
        
        // Only add fields that definitely exist
        if (customer_id) {
          minimalPayload.client_id = customer_id
        }
        if (projectId || rotApplication?.project_id) {
          minimalPayload.project_id = projectId || rotApplication?.project_id
        }
        if (rotApplicationId) {
          minimalPayload.rot_application_id = rotApplicationId
        }
        
        result = await supabase
          .from('invoices')
          .insert(minimalPayload)
          .select()
          .single()
      }

      data = result?.data
      error = result?.error

      if (error) {
        console.error('Supabase insert error:', error.message || error.code || error)
        console.error('Full error object:', JSON.stringify(error, null, 2))
        console.error('Attempted insert data:', basePayload)
        toast.error('Kunde inte skapa faktura: ' + (error.message || error.hint || error.details || JSON.stringify(error)))
        setLoading(false)
        return
      }

      if (data) {
        // Link ROT application to invoice if applicable
        if (rotApplicationId && data.id) {
          await supabase
            .from('rot_applications')
            .update({ invoice_id: data.id })
            .eq('id', rotApplicationId)
        }

        // Create invoice lines from unbilled time entries if projectId exists
        if (projectId) {
          try {
            // Fetch unbilled time entries for this project
            const { data: entriesData, error: entriesError } = await supabase
              .from('time_entries')
              .select('id, date, hours_total, ob_type, description, employee_id')
              .eq('project_id', projectId)
              .eq('is_billed', false)
              .eq('tenant_id', tenantId)

            if (!entriesError && entriesData && entriesData.length > 0) {
              // Get project rate
              const { data: projectData } = await supabase
                .from('projects')
                .select('base_rate_sek')
                .eq('id', projectId)
                .single()

              const rate = Number(projectData?.base_rate_sek) || 360

              // Create invoice lines from time entries
              const invoiceLines = entriesData.map((entry: any, index: number) => ({
                invoice_id: data.id,
                tenant_id: tenantId,
                sort_order: index,
                description: entry.description || `Timmar ${new Date(entry.date).toLocaleDateString('sv-SE')}`,
                quantity: Number(entry.hours_total) || 0,
                unit: 'tim',
                rate_sek: rate,
                amount_sek: (Number(entry.hours_total) || 0) * rate,
              }))

              // Insert invoice lines
              const { error: linesError } = await supabase
                .from('invoice_lines')
                .insert(invoiceLines)

              if (linesError) {
                console.error('Error creating invoice lines:', linesError)
                // Continue anyway - we can still mark entries as billed
              }

              // Mark time entries as billed
              await supabase
                .from('time_entries')
                .update({ is_billed: true })
                .eq('project_id', projectId)
                .eq('is_billed', false)
                .eq('tenant_id', tenantId)
            }
          } catch (err) {
            console.error('Error creating invoice lines:', err)
            // Continue - invoice is created even if lines fail
          }
        }

        toast.success('Faktura skapad!')
        
        // Add notification
        if (typeof window !== 'undefined') {
          const { addNotification } = await import('@/lib/notifications')
          addNotification({
            type: 'success',
            title: 'Faktura skapad',
            message: `Faktura ${data.number || '#' + data.id.slice(0, 8)} har skapats för ${customerName}`,
            link: `/invoices/${data.id}`
          })
        }
        
        router.replace(`/invoices/${data.id}`)
      }
    } catch (err: any) {
      console.error('Unexpected error creating invoice:', err)
      toast.error('Ett oväntat fel uppstod: ' + (err.message || 'Okänt fel'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 w-full lg:ml-0 overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-10 max-w-3xl mx-auto w-full">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-1 sm:mb-2">
              {rotApplication ? 'Ny faktura med ROT-avdrag' : projectId ? 'Ny faktura från projekt' : 'Ny faktura'}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Skapa en ny faktura</p>
            
            {rotApplication && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
                  ✓ ROT-ansökan kopplad
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  Fakturabeloppet är justerat med ROT-avdrag ({Math.min(rotApplication.work_cost_sek * 0.3, 75000).toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}).
                </p>
              </div>
            )}
          </div>

          {loadingProject && (
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700 mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 dark:border-purple-400 border-t-transparent"></div>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Laddar projektdata...</p>
              </div>
            </div>
          )}

          <form
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100 dark:border-gray-700"
            onSubmit={handleSubmit}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Kund *
                </label>
                <select
                  value={customer_id}
                  onChange={(e) => {
                    const selectedClientId = e.target.value
                    setCustomerId(selectedClientId)
                    const selectedClient = clients.find(c => c.id === selectedClientId)
                    if (selectedClient) {
                      setCustomerName(selectedClient.name)
                      setCustomerOrgnr(selectedClient.org_number || '')
                    } else {
                      setCustomerName('')
                      setCustomerOrgnr('')
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300 dark:hover:border-gray-600"
                  required
                >
                  <option value="">Välj kund...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.org_number ? `(${client.org_number})` : ''}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Inga kunder hittades. <a href="/clients/new" className="text-purple-600 dark:text-purple-400 hover:underline">Lägg till kund</a>
                  </p>
                )}
              </div>

              {customer_id && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Vald kund:</strong> {customer_name}
                    {customer_orgnr && ` (Org.nr: ${customer_orgnr})`}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Belopp (SEK)
                </label>
                <input
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-300 dark:hover:border-gray-600"
                  placeholder="0"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Beskrivning
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px] resize-none transition-all hover:border-gray-300 dark:hover:border-gray-600"
                  placeholder="Beskrivning av fakturerad tjänst"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={loading || loadingProject}
                className="w-full sm:flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl py-3 sm:py-4 font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Sparar...
                  </span>
                ) : (
                  'Skapa faktura'
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto px-6 py-3 sm:py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all text-sm sm:text-base"
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


'use client'
import { useEffect, useState } from 'react'
import supabase from '@/utils/supabase/supabaseClient'
import { useRouter } from 'next/navigation'
import { useTenant } from '@/context/TenantContext'
import Sidebar from '@/components/Sidebar'
import SearchBar from '@/components/SearchBar'
import FilterSortBar from '@/components/FilterSortBar'

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
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<'number' | 'created_at' | 'amount' | 'status'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const router = useRouter()
  const { tenantId } = useTenant()

  useEffect(() => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    async function fetchInvoices() {
      try {
        // Try with all columns first
        let { data, error } = await supabase
          .from('invoices')
          .select('id, amount, customer_name, customer_id, project_id, number, status, created_at')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })

        // If amount or other columns don't exist, retry progressively
        if (error && (error.code === '42703' || error.message?.includes('does not exist'))) {
          // First retry: without amount and status
          let fallback1 = await supabase
            .from('invoices')
            .select('id, customer_name, customer_id, project_id, number')
            .eq('tenant_id', tenantId)
          
          // Try with created_at for ordering, if that fails, order by id
          if (!fallback1.error) {
            // Try to add ordering
            const withOrder = await supabase
              .from('invoices')
              .select('id, customer_name, customer_id, project_id, number')
              .eq('tenant_id', tenantId)
              .order('created_at', { ascending: false })
            
            if (!withOrder.error) {
              fallback1 = withOrder
            } else {
              // Fallback: order by id
              fallback1 = await supabase
                .from('invoices')
                .select('id, customer_name, customer_id, project_id, number')
                .eq('tenant_id', tenantId)
                .order('id', { ascending: false })
            }
          }

          if (fallback1.error && (fallback1.error.code === '42703' || fallback1.error.message?.includes('does not exist'))) {
            // Second retry: minimal query - try just id first
            let fallback2 = await supabase
              .from('invoices')
              .select('id, customer_name')
              .eq('tenant_id', tenantId)
            
            // Try ordering, if that fails, order by id
            const withOrder2 = await supabase
              .from('invoices')
              .select('id, customer_name')
              .eq('tenant_id', tenantId)
              .order('created_at', { ascending: false })
            
            if (!withOrder2.error) {
              fallback2 = withOrder2
            } else {
              fallback2 = await supabase
                .from('invoices')
                .select('id, customer_name')
                .eq('tenant_id', tenantId)
                .order('id', { ascending: false })
            }

            // If customer_name also doesn't exist, try just id
            if (fallback2.error && (fallback2.error.code === '42703' || fallback2.error.message?.includes('customer_name'))) {
              let minimalOnly = await supabase
                .from('invoices')
                .select('id')
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false })
              
              // If created_at doesn't exist, order by id
              if (minimalOnly.error && minimalOnly.error.message?.includes('created_at')) {
                minimalOnly = await supabase
                  .from('invoices')
                  .select('id')
                  .eq('tenant_id', tenantId)
                  .order('id', { ascending: false })
              }
              
              if (!minimalOnly.error && minimalOnly.data) {
                fallback2 = { data: minimalOnly.data, error: null }
              }
            }

            if (fallback2.error) {
              console.error('Error fetching invoices (minimal fallback):', fallback2.error)
              // Don't show error to user if it's just a column issue - set empty array
              if (fallback2.error.code === '42703' || fallback2.error.message?.includes('does not exist')) {
                setInvoices([])
              } else {
                setInvoices([])
              }
            } else {
              const invoicesData2 = (fallback2.data || []).map((inv: any) => ({
                id: inv.id,
                customer_name: inv.customer_name || null,
                amount: 0,
                number: inv.number || inv.id?.slice(0, 8) || 'N/A',
                status: 'draft',
              }))
              setInvoices(invoicesData2)
              setFilteredInvoices(invoicesData2)
            }
          } else if (fallback1.error) {
            console.error('Error fetching invoices (fallback 1):', fallback1.error)
            setInvoices([])
          } else {
            const invoicesData1 = (fallback1.data || []).map((inv: any) => ({
              ...inv,
              amount: inv.amount || 0,
              status: inv.status || 'draft',
            }))
            setInvoices(invoicesData1)
            setFilteredInvoices(invoicesData1)
          }
        } else if (error) {
          console.error('Error fetching invoices:', error)
          setInvoices([])
        } else {
          const invoicesData = (data || []).map((inv: any) => ({
            ...inv,
            amount: inv.amount || 0,
            status: inv.status || 'draft',
            number: inv.number || inv.id?.slice(0, 8) || 'N/A',
          }))
          setInvoices(invoicesData)
          setFilteredInvoices(invoicesData)
        }
      } catch (err: any) {
        console.error('Unexpected error fetching invoices:', err)
        setInvoices([])
        setFilteredInvoices([])
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [tenantId])

  // Filter and sort invoices
  useEffect(() => {
    let filtered = [...invoices]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(inv => 
        inv.number?.toLowerCase().includes(query) ||
        inv.customer_name?.toLowerCase().includes(query) ||
        inv.id?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(inv => inv.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any
      
      if (sortBy === 'number') {
        aVal = a.number || ''
        bVal = b.number || ''
      } else if (sortBy === 'created_at') {
        aVal = new Date((a as any).created_at || 0).getTime()
        bVal = new Date((b as any).created_at || 0).getTime()
      } else if (sortBy === 'amount') {
        aVal = Number(a.amount || 0)
        bVal = Number(b.amount || 0)
      } else {
        aVal = a.status || ''
        bVal = b.status || ''
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredInvoices(filtered)
  }, [invoices, searchQuery, statusFilter, sortBy, sortDirection])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex">
        <Sidebar />
        <main className="flex-1 p-10 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Laddar...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 w-full lg:ml-0 overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-1 sm:mb-2">Fakturor</h1>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Hantera dina fakturor</p>
            </div>
            <button
              onClick={() => router.push('/invoices/new')}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-sm sm:text-base"
            >
              + Ny faktura
            </button>
          </div>

          {!tenantId ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 text-center text-red-500">
              Ingen tenant vald — välj tenant eller logga in.
            </div>
          ) : invoices.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-center text-gray-500 dark:text-gray-400">
              <p className="mb-4">Inga fakturor funna än!</p>
              <button
                onClick={() => router.push('/invoices/new')}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                + Skapa första fakturan
              </button>
            </div>
          ) : (
            <>
              {/* Search and Filter */}
              <div className="mb-6 space-y-4">
                <SearchBar
                  placeholder="Sök faktura, kund..."
                  onSearch={setSearchQuery}
                  className="max-w-md"
                />
                <FilterSortBar
                  sortOptions={[
                    { value: 'created_at', label: 'Datum' },
                    { value: 'number', label: 'Nummer' },
                    { value: 'amount', label: 'Belopp' },
                    { value: 'status', label: 'Status' },
                  ]}
                  filterOptions={[
                    {
                      label: 'Status',
                      key: 'status',
                      options: [
                        { value: 'draft', label: 'Utkast' },
                        { value: 'sent', label: 'Skickad' },
                        { value: 'paid', label: 'Betalad' },
                        { value: 'cancelled', label: 'Avbruten' },
                      ],
                    },
                  ]}
                  onSort={(value, direction) => {
                    setSortBy(value as 'number' | 'created_at' | 'amount' | 'status')
                    setSortDirection(direction)
                  }}
                  onFilter={(key, value) => {
                    if (key === 'status') setStatusFilter(value)
                  }}
                  defaultSort="created_at"
                  className="flex-wrap"
                />
              </div>

              {filteredInvoices.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-center text-gray-500 dark:text-gray-400">
                  <p className="mb-4">Inga fakturor matchar dina filter</p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('')
                    }}
                    className="text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Rensa filter
                  </button>
                </div>
              ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-xs sm:text-sm min-w-[640px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Nummer</th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Kund</th>
                      <th className="p-3 sm:p-4 text-right font-semibold text-gray-700 dark:text-gray-300">Belopp</th>
                      <th className="p-3 sm:p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="p-3 sm:p-4 text-right font-semibold text-gray-700 dark:text-gray-300">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="p-3 sm:p-4 font-medium text-gray-900 dark:text-white">{inv.number || inv.id.slice(0, 8)}</td>
                        <td className="p-3 sm:p-4 text-gray-600 dark:text-gray-400 truncate max-w-[120px] sm:max-w-none">{inv.customer_name || inv.customer_id || '–'}</td>
                        <td className="p-3 sm:p-4 text-right font-semibold text-gray-900 dark:text-white">
                          {Number(inv.amount || 0).toLocaleString('sv-SE')} kr
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                            inv.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            inv.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inv.status || 'draft'}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <button
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold hover:shadow-lg transition-all"
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
            </>
          )}
        </div>
      </main>
    </div>
  )
}

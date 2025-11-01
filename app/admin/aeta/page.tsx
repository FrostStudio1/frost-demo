'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/utils/supabase/supabaseClient'
import { useTenant } from '@/context/TenantContext'
import Sidebar from '@/components/Sidebar'

interface AetaRequest {
  id: string
  project_id: string
  description: string
  hours: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  requested_by: string
  admin_notes?: string | null
  projects?: { name: string }
  employees?: { full_name: string } | null
}

export default function AdminAetaPage() {
  const router = useRouter()
  const { tenantId } = useTenant()
  const [requests, setRequests] = useState<AetaRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    if (tenantId) {
      loadRequests()
    }
  }, [tenantId, filter])

  async function loadRequests() {
    if (!tenantId) return

    setLoading(true)
    try {
      const statusParam = filter === 'all' ? null : filter
      
      let query = supabase
        .from('aeta_requests')
        .select(`
          *,
          projects(name),
          employees(full_name, id)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (statusParam) {
        query = query.eq('status', statusParam)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading AETA requests:', error)
        // Om tabellen inte finns än, visa tom lista istället för error
        if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.code === '42P01') {
          setRequests([])
        } else {
          setRequests([])
        }
      } else {
        setRequests((data as any) || [])
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleReview(id: string, status: 'approved' | 'rejected') {
    setReviewingId(id)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id

      const { error } = await supabase
        .from('aeta_requests')
        .update({
          status,
          admin_notes: adminNotes || null,
          approved_by: status === 'approved' ? userId : null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        alert('Kunde inte uppdatera förfrågan: ' + error.message)
      } else {
        // Om godkänd, skapa time_entry
        if (status === 'approved') {
          const request = requests.find(r => r.id === id)
          if (request) {
            const requestData = request as any
            const { error: timeError } = await supabase
              .from('time_entries')
              .insert([{
                project_id: request.project_id,
                employee_id: requestData.employee_id || null,
                tenant_id: tenantId,
                date: new Date().toISOString().split('T')[0],
                hours_total: request.hours,
                ob_type: 'work',
                description: `ÄTA: ${request.description}`,
                is_billed: false,
                amount_total: 0,
              }])

            if (timeError) {
              console.error('Error creating time entry:', timeError)
              alert('Förfrågan godkänd, men kunde inte skapa time_entry: ' + timeError.message)
            }
          }
        }

        setAdminNotes('')
        await loadRequests()
      }
    } catch (err: any) {
      alert('Ett oväntat fel uppstod: ' + err.message)
    } finally {
      setReviewingId(null)
    }
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Admin - ÄTA-förfrågningar</h1>
              <p className="text-gray-500">Godkänn eller avvisa ÄTA-förfrågningar</p>
            </div>
            {pendingCount > 0 && (
              <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold">
                {pendingCount} väntar på godkännande
              </span>
            )}
          </div>

          {/* Filter */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl font-semibold transition ${
                  filter === f
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f === 'all' ? 'Alla' : f === 'pending' ? 'Väntar' : f === 'approved' ? 'Godkända' : 'Avvisade'}
              </button>
            ))}
          </div>

          {/* Lista */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-500">
              Laddar...
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
              Inga ÄTA-förfrågningar {filter !== 'all' ? `med status "${filter}"` : ''}
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${
                    request.status === 'pending'
                      ? 'border-yellow-400'
                      : request.status === 'approved'
                      ? 'border-green-500'
                      : 'border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          {request.projects?.name || 'Okänt projekt'}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {request.status === 'pending' ? 'Väntar' : request.status === 'approved' ? 'Godkänd' : 'Avvisad'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{request.description}</p>
                      <div className="text-sm text-gray-500">
                        <span className="font-semibold">{request.hours} timmar</span>
                        {request.employees && (
                          <> • Anställd: {request.employees.full_name}</>
                        )}
                        {' • '}
                        {new Date(request.created_at).toLocaleDateString('sv-SE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {request.admin_notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                          <span className="font-semibold">Admin-notering:</span> {request.admin_notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <textarea
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3 resize-none"
                        rows={3}
                        placeholder="Admin-notering (valfritt)..."
                        value={reviewingId === request.id ? adminNotes : ''}
                        onChange={(e) => setAdminNotes(e.target.value)}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReview(request.id, 'approved')}
                          disabled={reviewingId === request.id}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ✓ Godkänn
                        </button>
                        <button
                          onClick={() => handleReview(request.id, 'rejected')}
                          disabled={reviewingId === request.id}
                          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ✗ Avvisa
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

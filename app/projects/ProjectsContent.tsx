'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import supabase from '@/utils/supabase/supabaseClient'
import { useTenant } from '@/context/TenantContext'
import Sidebar from '@/components/Sidebar'
import { createProject } from './actions'
import { toast } from '@/lib/toast'

function Notice({
  type = 'info',
  children,
}: {
  type?: 'info' | 'success' | 'error'
  children: React.ReactNode
}) {
  const styles =
    type === 'success'
      ? 'border-green-300 bg-green-50 text-green-700'
      : type === 'error'
      ? 'border-red-300 bg-red-50 text-red-700'
      : 'border-blue-300 bg-blue-50 text-blue-700'
  return <div className={`rounded-xl border p-4 ${styles}`}>{children}</div>
}

export default function ProjectsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { tenantId } = useTenant()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    customer_name: '',
    customer_email: '',
    customer_address: '',
    customer_orgnr: '',
    base_rate_sek: '360',
    budgeted_hours: '',
    status: 'planned',
  })
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, customer_name, created_at, base_rate_sek, budgeted_hours, status')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching projects:', error)
          // Fallback till minimal query
          const fallback = await supabase
            .from('projects')
            .select('id, name, created_at')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
          
          setProjects(fallback.data || [])
        } else {
          setProjects(data || [])
        }
      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [tenantId])

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    try {
      const form = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value)
      })
      
      await createProject(form)
      setShowNewForm(false)
      setFormData({
        name: '',
        customer_name: '',
        customer_email: '',
        customer_address: '',
        customer_orgnr: '',
        base_rate_sek: '360',
        budgeted_hours: '',
        status: 'planned',
      })
      // Reload projects
      if (tenantId) {
        const { data } = await supabase
          .from('projects')
          .select('id, name, customer_name, created_at, base_rate_sek, budgeted_hours, status')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
        setProjects(data || [])
      }
    } catch (err) {
      console.error('Error creating project:', err)
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

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Projekt</h1>
              <p className="text-gray-500">Hantera dina projekt</p>
            </div>
            <button
              onClick={() => router.push('/projects/new')}
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              + Nytt projekt
            </button>
          </div>

          {searchParams?.get('created') === 'true' && (
            <div className="mb-6">
              <Notice type="success">
                Projektet har skapats!
              </Notice>
            </div>
          )}

          {showNewForm && (
            <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Skapa nytt projekt</h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Projektnamn *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kundnamn</label>
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Budgeterade timmar</label>
                    <input
                      type="number"
                      value={formData.budgeted_hours}
                      onChange={(e) => setFormData({ ...formData, budgeted_hours: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold"
                  >
                    Skapa projekt
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewForm(false)}
                    className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold"
                  >
                    Avbryt
                  </button>
                </div>
              </form>
            </div>
          )}

          {projects.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
              <p className="text-gray-500 mb-4">Inga projekt hittades</p>
              <button
                onClick={() => router.push('/projects/new')}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold"
              >
                Skapa första projektet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/projects/${p.id}`)}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      p.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                      p.status === 'active' ? 'bg-green-100 text-green-800' :
                      p.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {p.status === 'planned' ? 'Planerad' : p.status === 'active' ? 'Pågående' : 'Slutförd'}
                    </span>
                  </div>
                  {p.customer_name && (
                    <p className="text-sm text-gray-600 mb-2">Kund: {p.customer_name}</p>
                  )}
                  <p className="text-xs text-gray-400 mb-4">
                    Skapad: {p.created_at ? new Date(p.created_at).toLocaleDateString('sv-SE') : '—'}
                  </p>
                  <div className="flex gap-2">
                    <a
                      className="text-sm underline text-green-600 hover:text-green-800 font-semibold"
                      href={`/invoices/new?projectId=${p.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      📝 Skapa faktura
                    </a>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (!confirm(`Är du säker på att du vill radera projektet "${p.name}"?`)) return
                        setDeletingId(p.id)
                        try {
                          const { error } = await supabase
                            .from('projects')
                            .delete()
                            .eq('id', p.id)
                            .eq('tenant_id', tenantId)
                          
                          if (error) throw error
                          setProjects(projects.filter(proj => proj.id !== p.id))
                        } catch (err: any) {
                          toast.error('Kunde inte radera projekt: ' + err.message)
                        } finally {
                          setDeletingId(null)
                        }
                      }}
                      disabled={deletingId === p.id}
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                      aria-label={`Radera projekt ${p.name}`}
                    >
                      {deletingId === p.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


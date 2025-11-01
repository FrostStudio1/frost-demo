'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/utils/supabase/supabaseClient'
import { useTenant } from '@/context/TenantContext'
import Sidebar from '@/components/Sidebar'
import { toast } from '@/lib/toast'

interface Project {
  id: string
  name: string
}

export default function AetaPage() {
  const router = useRouter()
  const { tenantId } = useTenant()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [description, setDescription] = useState('')
  const [hours, setHours] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      if (!tenantId) {
        setLoadingProjects(false)
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('tenant_id', tenantId)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching projects:', error)
        setProjects([])
      } else {
        setProjects(data || [])
      }
      setLoadingProjects(false)
    }

    fetchProjects()
  }, [tenantId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!tenantId) {
      toast.error('Ingen tenant vald. Logga in först.')
      return
    }

    if (!selectedProject || !description || !hours) {
      toast.error('Fyll i alla obligatoriska fält.')
      return
    }

    setLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id

      if (!userId) {
        toast.error('Du är inte inloggad.')
        setLoading(false)
        return
      }

      // Hämta employee_id för användaren
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('auth_user_id', userId)
        .eq('tenant_id', tenantId)
        .single()

      const { error } = await supabase
        .from('aeta_requests')
        .insert([{
          project_id: selectedProject,
          description,
          hours: Number(hours),
          tenant_id: tenantId,
          employee_id: employeeData?.id || null,
          status: 'pending',
          requested_by: userId,
        }])

      if (error) {
        console.error('Error saving AETA request:', error)
        toast.error('Kunde inte spara ÄTA-arbete: ' + error.message)
      } else {
        toast.success('ÄTA-förfrågan skickad! Den väntar nu på godkännande från admin.')
        // Rensa formulär
        setSelectedProject('')
        setDescription('')
        setHours('')
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Unexpected error:', err)
      toast.error('Ett oväntat fel uppstod.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-6 lg:p-10 max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-2">ÄTA-arbete</h1>
            <p className="text-gray-500">Anmäl extraarbete utanför ordinarie offer/budget</p>
          </div>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
            <p className="font-semibold mb-1">OBS:</p>
            <p>Din förfrågan måste godkännas av admin innan den kan faktureras.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Projekt *</label>
              {loadingProjects ? (
                <div className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-400">
                  Laddar projekt...
                </div>
              ) : (
                <select
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  required
                >
                  <option value="">Välj projekt</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Beskrivning *</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Beskriv ÄTA-arbetet, varför det behövs och vad som ska göras"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Antal timmar *</label>
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                type="number"
                min={0.5}
                max={24}
                step={0.5}
                placeholder="Exempel: 4"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || loadingProjects}
                className="flex-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white rounded-xl py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
              >
                {loading ? 'Sparar...' : 'Skicka ÄTA-förfrågan'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Tillbaka
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

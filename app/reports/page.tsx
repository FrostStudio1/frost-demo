'use client'

import { useEffect, useState } from 'react'
import supabase from '@/utils/supabase/supabaseClient'
import { useTenant } from '@/context/TenantContext'
import Sidebar from '@/components/Sidebar'
import { useRouter } from 'next/navigation'

interface TimeEntry {
  id: string
  date: string
  hours_total: number
  ob_type: string
  description?: string
  project_id: string
  employee_id: string
  projects?: { name: string }
  employees?: { full_name: string }
}

export default function ReportsPage() {
  const { tenantId } = useTenant()
  const router = useRouter()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    async function fetchEntries() {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          date,
          hours_total,
          ob_type,
          description,
          project_id,
          employee_id,
          projects(name),
          employees(full_name)
        `)
        .eq('tenant_id', tenantId)
        .order('date', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error fetching time entries:', error)
        // Försök med minimal select om fullständig query misslyckas
        try {
          const fallback = await supabase
            .from('time_entries')
            .select('id, date, hours_total, ob_type, project_id, employee_id')
            .eq('tenant_id', tenantId)
            .order('date', { ascending: false })
            .limit(100)
          
          if (!fallback.error && fallback.data) {
            setEntries((fallback.data as any) || [])
          } else {
            setEntries([])
          }
        } catch (fallbackErr) {
          console.error('Fallback error:', fallbackErr)
          setEntries([])
        }
      } else {
        setEntries((data as any) || [])
      }
      setLoading(false)
    }

    fetchEntries()
  }, [tenantId])

  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours_total || 0), 0)
  const obHours = entries.filter(e => e.ob_type && e.ob_type !== 'work').reduce((sum, e) => sum + Number(e.hours_total || 0), 0)

  function obLabel(type: string) {
    switch (type) {
      case 'evening': return 'OB Kväll'
      case 'night': return 'OB Natt'
      case 'weekend': return 'OB Helg'
      case 'vacation': return 'Semester'
      case 'sick': return 'Sjukdom'
      case 'vabb': return 'VAB'
      case 'absence': return 'Frånvaro'
      default: return 'Vanlig tid'
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
              <h1 className="text-4xl font-black text-gray-900 mb-2">Time Reports</h1>
              <p className="text-gray-500">Alla rapporterade timmar</p>
            </div>
            <button
              onClick={() => router.push('/reports/new')}
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              + Ny rapport
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-3xl font-black text-blue-600 mb-1">{totalHours.toFixed(1)}h</div>
              <div className="text-sm text-gray-500">Totalsumma</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-3xl font-black text-purple-600 mb-1">{obHours.toFixed(1)}h</div>
              <div className="text-sm text-gray-500">Varav OB-timmar</div>
            </div>
          </div>

          {/* Entries */}
          {!tenantId ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-red-500">
              Ingen tenant vald.
            </div>
          ) : entries.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
              Inga rapporter än.
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-700">Datum</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Anställd</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Projekt</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Typ</th>
                      <th className="p-4 text-right font-semibold text-gray-700">Timmar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {entries.map(entry => (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-900">
                          {new Date(entry.date).toLocaleDateString('sv-SE')}
                        </td>
                        <td className="p-4 text-gray-600">
                          {(entry.employees as any)?.full_name || 'Okänd'}
                        </td>
                        <td className="p-4 text-gray-600">
                          {(entry.projects as any)?.name || entry.project_id?.slice(0, 8) || '–'}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            entry.ob_type === 'work' ? 'bg-blue-100 text-blue-800' :
                            entry.ob_type === 'evening' ? 'bg-purple-100 text-purple-800' :
                            entry.ob_type === 'night' ? 'bg-indigo-100 text-indigo-800' :
                            entry.ob_type === 'weekend' ? 'bg-pink-100 text-pink-800' :
                            entry.ob_type === 'vacation' || entry.ob_type === 'sick' || entry.ob_type === 'vabb' || entry.ob_type === 'absence' ?
                            'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {obLabel(entry.ob_type || 'work')}
                          </span>
                        </td>
                        <td className="p-4 text-right font-semibold text-gray-900">
                          {Number(entry.hours_total || 0).toFixed(1)}h
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

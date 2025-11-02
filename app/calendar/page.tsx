'use client'

import { useEffect, useState } from 'react'
import { useTenant } from '@/context/TenantContext'
import Sidebar from '@/components/Sidebar'
import supabase from '@/utils/supabase/supabaseClient'
import { useRouter } from 'next/navigation'

interface CalendarEntry {
  id: string
  date: string
  hours: number
  project: string
  employee: string
  ob_type: string
  description?: string
}

export default function CalendarPage() {
  const { tenantId } = useTenant()
  const router = useRouter()
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    async function fetchEntries() {
      try {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const startDate = new Date(year, month, 1).toISOString().split('T')[0]
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

        // Try with relations first
        let { data, error } = await supabase
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
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true })

        // If relations don't work, try without them
        if (error) {
          console.warn('Error fetching with relations, trying fallback:', error)
          const fallback = await supabase
            .from('time_entries')
            .select('id, date, hours_total, ob_type, project_id, employee_id, description')
            .eq('tenant_id', tenantId)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true })

          if (fallback.error) {
            // Try without description if column doesn't exist
            if (fallback.error.code === '42703' || fallback.error.message?.includes('description')) {
              console.warn('Description column not found, trying minimal query')
              const minimal = await supabase
                .from('time_entries')
                .select('id, date, hours_total, ob_type, project_id, employee_id')
                .eq('tenant_id', tenantId)
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: true })

              if (minimal.error) {
                console.error('Error fetching calendar entries (all fallbacks failed):', minimal.error)
                setEntries([])
                setLoading(false)
                return
              }

              // Fetch projects and employees separately
              const entries = minimal.data || []
              const projectIds = [...new Set(entries.map((e: any) => e.project_id).filter(Boolean))]
              const employeeIds = [...new Set(entries.map((e: any) => e.employee_id).filter(Boolean))]

              const [projectsData, employeesData] = await Promise.all([
                projectIds.length > 0 && tenantId
                  ? supabase.from('projects').select('id, name').in('id', projectIds).eq('tenant_id', tenantId)
                  : Promise.resolve({ data: [], error: null }),
                employeeIds.length > 0 && tenantId
                  ? supabase.from('employees').select('id, full_name').in('id', employeeIds).eq('tenant_id', tenantId)
                  : Promise.resolve({ data: [], error: null }),
              ])

              const projectsMap = new Map((projectsData.data || []).map((p: any) => [p.id, p]))
              const employeesMap = new Map((employeesData.data || []).map((e: any) => [e.id, e]))

              const mapped = entries.map((entry: any) => ({
                id: entry.id,
                date: entry.date,
                hours: Number(entry.hours_total || 0),
                project: projectsMap.get(entry.project_id)?.name || 'Okänt projekt',
                employee: employeesMap.get(entry.employee_id)?.full_name || 'Okänd',
                ob_type: entry.ob_type || 'work',
                description: undefined,
              }))

              setEntries(mapped)
            } else {
              console.error('Error fetching calendar entries:', fallback.error)
              setEntries([])
            }
          } else {
            // Fetch projects and employees separately
            const entries = fallback.data || []
            const projectIds = [...new Set(entries.map((e: any) => e.project_id).filter(Boolean))]
            const employeeIds = [...new Set(entries.map((e: any) => e.employee_id).filter(Boolean))]

            const [projectsData, employeesData] = await Promise.all([
              projectIds.length > 0 && tenantId
                ? supabase.from('projects').select('id, name').in('id', projectIds).eq('tenant_id', tenantId)
                : Promise.resolve({ data: [], error: null }),
              employeeIds.length > 0 && tenantId
                ? supabase.from('employees').select('id, full_name').in('id', employeeIds).eq('tenant_id', tenantId)
                : Promise.resolve({ data: [], error: null }),
            ])

            const projectsMap = new Map((projectsData.data || []).map((p: any) => [p.id, p]))
            const employeesMap = new Map((employeesData.data || []).map((e: any) => [e.id, e]))

            const mapped = entries.map((entry: any) => ({
              id: entry.id,
              date: entry.date,
              hours: Number(entry.hours_total || 0),
              project: projectsMap.get(entry.project_id)?.name || 'Okänt projekt',
              employee: employeesMap.get(entry.employee_id)?.full_name || 'Okänd',
              ob_type: entry.ob_type || 'work',
              description: entry.description,
            }))

            setEntries(mapped)
          }
        } else {
          // Success with relations
          const mapped = (data || []).map((entry: any) => ({
            id: entry.id,
            date: entry.date,
            hours: Number(entry.hours_total || 0),
            project: (entry.projects as any)?.name || 'Okänt projekt',
            employee: (entry.employees as any)?.full_name || 'Okänd',
            ob_type: entry.ob_type || 'work',
            description: entry.description,
          }))
          setEntries(mapped)
        }
      } catch (err: any) {
        console.error('Unexpected error fetching calendar entries:', err)
        setEntries([])
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [tenantId, currentMonth])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()
  const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 // Monday = 0

  const days: (Date | null)[] = []
  for (let i = 0; i < adjustedStartingDay; i++) {
    days.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }

  function getEntriesForDate(date: Date | null): CalendarEntry[] {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return entries.filter(e => e.date === dateStr)
  }

  function getTotalHoursForDate(date: Date | null): number {
    return getEntriesForDate(date).reduce((sum, e) => sum + e.hours, 0)
  }

  function obTypeColor(obType: string): string {
    switch (obType) {
      case 'evening': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
      case 'night': return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
      case 'weekend': return 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200'
      case 'vacation': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      case 'sick': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      default: return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    }
  }

  function previousMonth() {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  function goToToday() {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex">
        <Sidebar />
        <main className="flex-1 p-10 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Laddar kalender...</div>
        </main>
      </div>
    )
  }

  const selectedDateEntries = selectedDate ? getEntriesForDate(selectedDate) : []

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 w-full lg:ml-0 overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-1 sm:mb-2">Kalender</h1>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Tidsrapporter i kalendervy</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Idag
              </button>
              <button
                onClick={previousMonth}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                ←
              </button>
              <button
                onClick={nextMonth}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center">
                {currentMonth.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}
              </h2>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
              {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map((day) => (
                <div
                  key={day}
                  className="bg-gray-50 dark:bg-gray-800 p-2 text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
              {days.map((date, index) => {
                const isToday = date && 
                  date.toDateString() === new Date().toDateString()
                const isSelected = date && selectedDate && 
                  date.toDateString() === selectedDate.toDateString()
                const dayEntries = getEntriesForDate(date)
                const totalHours = getTotalHoursForDate(date)
                const hasEntries = dayEntries.length > 0

                return (
                  <button
                    key={index}
                    onClick={() => date && setSelectedDate(date)}
                    className={`
                      min-h-[80px] sm:min-h-[100px] p-2 bg-white dark:bg-gray-900
                      hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                      text-left relative
                      ${isToday ? 'ring-2 ring-blue-500' : ''}
                      ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      ${!date ? 'cursor-default' : 'cursor-pointer'}
                    `}
                    disabled={!date}
                  >
                    {date && (
                      <>
                        <div className={`
                          text-xs sm:text-sm font-semibold mb-1
                          ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}
                        `}>
                          {date.getDate()}
                        </div>
                        {hasEntries && (
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-gray-900 dark:text-white">
                              {totalHours.toFixed(1)}h
                            </div>
                            <div className="flex flex-wrap gap-0.5">
                              {dayEntries.slice(0, 2).map((entry) => (
                                <div
                                  key={entry.id}
                                  className={`text-[10px] px-1 py-0.5 rounded ${obTypeColor(entry.ob_type)}`}
                                  title={`${entry.project}: ${entry.hours.toFixed(1)}h`}
                                >
                                  {entry.project.substring(0, 3)}
                                </div>
                              ))}
                              {dayEntries.length > 2 && (
                                <div className="text-[10px] px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                  +{dayEntries.length - 2}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedDate.toLocaleDateString('sv-SE', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              {selectedDateEntries.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">Inga tidsrapporter denna dag</p>
              ) : (
                <div className="space-y-3">
                  {selectedDateEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{entry.project}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{entry.employee}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 dark:text-white">{entry.hours.toFixed(1)}h</div>
                          <span className={`text-xs px-2 py-1 rounded ${obTypeColor(entry.ob_type)}`}>
                            {entry.ob_type === 'evening' ? 'OB Kväll' :
                             entry.ob_type === 'night' ? 'OB Natt' :
                             entry.ob_type === 'weekend' ? 'OB Helg' :
                             entry.ob_type === 'vacation' ? 'Semester' :
                             entry.ob_type === 'sick' ? 'Sjukdom' :
                             'Vanlig tid'}
                          </span>
                        </div>
                      </div>
                      {entry.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {entry.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


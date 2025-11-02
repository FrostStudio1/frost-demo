'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/utils/supabase/supabaseClient'
import { useTenant } from '@/context/TenantContext'
import Sidebar from '@/components/Sidebar'
import { toast } from '@/lib/toast'
import DatePicker from '@/components/DatePicker'
import WorkTypeSelector from '@/components/WorkTypeSelector'
import TimeRangePicker from '@/components/TimeRangePicker'
import CompanySelector from '@/components/CompanySelector'
import EmployeeSelector from '@/components/EmployeeSelector'
import CommentBox from '@/components/CommentBox'
import TimeClock from '@/components/TimeClock'
import { checkTimeOverlap, formatDuplicateMessage } from '@/lib/duplicateCheck'
import { useAdmin } from '@/hooks/useAdmin'

export default function NewReportPage() {
  const router = useRouter()
  const { tenantId } = useTenant()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [start, setStart] = useState('07:00')
  const [end, setEnd] = useState('16:00')
  const [project, setProject] = useState('')
  const [type, setType] = useState('work')
  const [notes, setNotes] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [hours, setHours] = useState(0)
  const [saving, setSaving] = useState(false)
  const [projects, setProjects] = useState<{ id: string, name: string }[]>([])
  const [employees, setEmployees] = useState<{ id: string, name: string }[]>([])
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null)
  const [multiProjectMode, setMultiProjectMode] = useState(false)
  const [projectEntries, setProjectEntries] = useState<Array<{ projectId: string, hours: number }>>([{ projectId: '', hours: 0 }])
  const [breakMinutes, setBreakMinutes] = useState(0)
  const { isAdmin } = useAdmin()
  
  // Kontrollera om typen kräver tidsfält
  const requiresTimeFields = !['vabb', 'sick', 'vacation', 'absence'].includes(type)
  
  // Hämta current employee ID för TimeClock
  useEffect(() => {
    async function fetchCurrentEmployee() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        const res = await fetch('/api/employee/get-current')
        if (res.ok) {
          const data = await res.json()
          if (data.employeeId) {
            setCurrentEmployeeId(data.employeeId)
            // Auto-fyll employeeId om den är tom
            if (!employeeId) {
              setEmployeeId(data.employeeId)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching current employee:', err)
      }
    }
    fetchCurrentEmployee()
  }, [])
  
  async function fetchData() {
    if (!tenantId) return
    
    // Fetch projects via API route (same as TimeClock) for consistency
    try {
      const projectsRes = await fetch('/api/projects/for-timeclock', { cache: 'no-store' })
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        if (projectsData.projects) {
          setProjects(projectsData.projects)
        } else {
          setProjects([])
        }
      } else {
        // Fallback: direct query with status filter
        const { data: pData } = await supabase
          .from('projects')
          .select('id, name, status')
          .eq('tenant_id', tenantId)
        
        // Filter out completed/archived projects
        const activeProjects = (pData ?? []).filter((p: any) => {
          const status = p.status || null
          return status !== 'completed' && status !== 'archived'
        }).map((p: any) => ({ id: p.id, name: p.name }))
        
        setProjects(activeProjects)
      }
    } catch (err) {
      console.error('Error fetching projects:', err)
      setProjects([])
    }
    
    const { data: eData } = await supabase
      .from('employees')
      .select('id, name, full_name')
      .eq('tenant_id', tenantId)
    setEmployees((eData ?? []).map(e => ({
      id: e.id,
      name: (e as any).full_name || e.name || 'Okänd'
    })))
  }
  
  useEffect(() => { 
    fetchData() 
  }, [tenantId])

  // Auto-fyll tider när typ ändras
  useEffect(() => {
    if (type === 'night') {
      setStart('22:00')
      setEnd('06:00')
    } else if (!requiresTimeFields) {
      // För VABB/frånvaro/sjuk - sätt 8 timmar automatiskt
      setHours(8)
    }
  }, [type])

  // Beräkna timmar från start/end när tidsfält används (minus rast)
  useEffect(() => {
    if (requiresTimeFields && start && end && !multiProjectMode) {
      const [h1, m1] = start.split(':').map(Number)
      const [h2, m2] = end.split(':').map(Number)
      let hrs = (h2 + m2 / 60) - (h1 + m1 / 60)
      if (hrs <= 0) hrs += 24 // Hantera över midnatt (för nattarbete)
      const totalHours = Math.max(0, hrs - (breakMinutes / 60))
      setHours(totalHours)
    }
  }, [start, end, requiresTimeFields, breakMinutes, multiProjectMode])
  
  // När multi-projekt aktiveras, sätt timmar baserat på summan av projekt entries
  useEffect(() => {
    if (multiProjectMode) {
      const total = projectEntries.reduce((sum, entry) => sum + entry.hours, 0)
      setHours(total)
    }
  }, [projectEntries, multiProjectMode])
  
  // Beräkna totala timmar för multi-projekt läge
  const totalMultiProjectHours = projectEntries.reduce((sum, entry) => sum + entry.hours, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: userData, error: authError } = await supabase.auth.getUser()
    const userId = (userData as any)?.user?.id

    if (authError || !userId) {
      toast.error('Du är inte inloggad.')
      setSaving(false)
      return
    }

    // Validera projekt beroende på läge
    if (requiresTimeFields) {
      if (multiProjectMode) {
        // Filtrera bort tomma entries
        const validEntries = projectEntries.filter(e => e.projectId && e.hours > 0)
        if (validEntries.length === 0) {
          toast.error('Du måste lägga till minst ett projekt med timmar!')
          setSaving(false)
          return
        }
        // Validera att alla valda entries har projekt och timmar
        const invalidEntries = projectEntries.filter(e => e.projectId && e.hours <= 0)
        if (invalidEntries.length > 0) {
          toast.error('Alla projekt måste ha timmar fördelade!')
          setSaving(false)
          return
        }
        if (totalMultiProjectHours <= 0) {
          toast.error('Totalt antal timmar måste vara större än 0!')
          setSaving(false)
          return
        }
      } else {
        if (!project) {
          toast.error('Projekt måste väljas för arbetstidrapporter!')
          setSaving(false)
          return
        }
        if (hours <= 0) {
          toast.error('Totalt antal timmar måste vara större än 0!')
          setSaving(false)
          return
        }
      }
    }
    
    if (!employeeId) { 
      toast.error('Anställd måste väljas!')
      setSaving(false)
      return
    }

    // Mappning av gamla typer till nya
    const obTypeMap: Record<string, string> = {
      'natt': 'night',
      'kväll': 'evening',
      'helg': 'weekend',
      'sjuk': 'sick',
      'vabb': 'vabb',
      'frånvaro': 'absence',
    }
    
    const ob_type = obTypeMap[type] || type

    // Beräkna amount_total baserat på employee's base_rate och OB-tillägg (byggkollektivavtalet)
    let amount_total = 0
    if (requiresTimeFields && employeeId && tenantId) {
      // Hämta employee's base_rate - try with both columns first
      let { data: empData, error: empError } = await supabase
        .from('employees')
        .select('base_rate_sek, default_rate_sek')
        .eq('id', employeeId)
        .eq('tenant_id', tenantId)
        .maybeSingle()

      // If error due to missing default_rate_sek, try with only base_rate_sek
      if (empError && (empError.code === '42703' || empError.message?.includes('default_rate_sek'))) {
        const fallback = await supabase
          .from('employees')
          .select('base_rate_sek')
          .eq('id', employeeId)
          .eq('tenant_id', tenantId)
          .maybeSingle()
        
        if (!fallback.error && fallback.data) {
          empData = fallback.data
          empError = null
        }
      }

      // If still error, try minimal select (just id)
      if (empError && empError.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is a real error
        console.error('Error fetching employee rate:', empError)
        toast.error('Kunde inte hämta anställds lön: ' + empError.message)
        setSaving(false)
        return
      }

      const baseRate = Number(empData?.base_rate_sek || empData?.default_rate_sek || 360)
      
      // Byggkollektivavtalet:
      // - Vanlig tid (work): 100% = 1.0x
      // - OB Kväll/Natt (evening/night): 150% = 1.5x
      // - OB Helg (weekend): 200% = 2.0x
      let multiplier = 1.0
      if (ob_type === 'evening' || ob_type === 'night') {
        multiplier = 1.5 // 150%
      } else if (ob_type === 'weekend') {
        multiplier = 2.0 // 200%
      }
      
      amount_total = hours * baseRate * multiplier
    }

    // Build insert payload - try with description first, fallback without it
    const basePayload: any = {
      user_id: userId,
      tenant_id: tenantId,
      employee_id: employeeId,
      project_id: requiresTimeFields ? project : null, // Ingen projekt för VABB/frånvaro
      date,
      start_time: requiresTimeFields ? start : null,
      end_time: requiresTimeFields ? end : null,
      break_minutes: breakMinutes,
      ob_type,
      hours_total: hours,
      amount_total: Math.round(amount_total * 100) / 100, // Avrunda till 2 decimaler
      is_billed: false,
    }

    // Add description if provided
    if (notes && notes.trim()) {
      basePayload.description = notes.trim()
    }

    if (!tenantId) {
      toast.error('Ingen tenant vald')
      setSaving(false)
      return
    }

    // 🔍 DUBBLETT-KONTROLL: Kontrollera om det redan finns en liknande tidsrapport
    try {
      const { data: existingEntries, error: checkError } = await supabase
        .from('time_entries')
        .select('id, employee_id, project_id, date, start_time, end_time')
        .eq('tenant_id', tenantId)
        .eq('employee_id', employeeId)
        .eq('date', date)
      
      if (checkError) {
        console.warn('Could not check for duplicates:', checkError)
        // Fortsätt ändå - bättre att försöka spara än att blockera
      } else if (existingEntries && existingEntries.length > 0) {
        // Kontrollera överlappning
        const isDuplicate = checkTimeOverlap(
          {
            employee_id: employeeId,
            project_id: basePayload.project_id,
            date,
            start_time: basePayload.start_time,
            end_time: basePayload.end_time,
            tenant_id: tenantId,
          },
          existingEntries
        )

        if (isDuplicate) {
          const duplicateMsg = formatDuplicateMessage(existingEntries[0])
          const confirmed = window.confirm(
            `⚠️ ${duplicateMsg}\n\nVill du ändå spara denna tidsrapport?`
          )
          
          if (!confirmed) {
            setSaving(false)
            return
          }
        }
      }
    } catch (dupCheckErr) {
      console.error('Error in duplicate check:', dupCheckErr)
      // Fortsätt ändå - låt användaren spara
    }

    // Om multi-projekt läge, skapa flera time entries
    if (multiProjectMode && requiresTimeFields) {
      let successCount = 0
      let errorCount = 0
      
      for (const entry of projectEntries) {
        if (!entry.projectId || entry.hours <= 0) continue
        
        const entryPayload = {
          ...basePayload,
          project_id: entry.projectId,
          hours_total: entry.hours,
          start_time: null, // Multi-projekt har inga tider
          end_time: null,
          break_minutes: 0, // Rast räknas inte per projekt
          // Beräkna amount för detta projekt baserat på dess timmar
          amount_total: Math.round((entry.hours / (hours || 1)) * amount_total * 100) / 100,
        }
        
        const response = await fetch('/api/time-entries/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryPayload),
        })
        
        const result = await response.json()
        
        if (!response.ok || result.error) {
          console.error('Error saving time entry for project:', entry.projectId, result.error)
          errorCount++
        } else {
          successCount++
        }
      }
      
      if (errorCount > 0) {
        toast.error(`${successCount} av ${projectEntries.length} tidsrapporter sparades. ${errorCount} misslyckades.`)
      } else {
        toast.success(`${successCount} tidsrapporter sparade!`)
      }
      
      setSaving(false)
      router.push('/reports')
      return
    }
    
    // Single project mode - original logic
    const response = await fetch('/api/time-entries/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(basePayload),
    })

    const result = await response.json()

    if (!response.ok || result.error) {
      console.error('Error saving time entry:', result.error)
      toast.error('Kunde inte spara: ' + (result.error || result.message || 'Okänt fel'))
      setSaving(false)
      return
    }
    
    toast.success('Tidsrapport sparad!')
    router.push('/reports')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 w-full lg:ml-0 overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-10 max-w-3xl mx-auto w-full">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-1 sm:mb-2">Ny tidsrapport</h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Rapportera arbetstid eller frånvaro</p>
          </div>

          {/* Time Clock - Snabb stämpling */}
          {currentEmployeeId && (
            <div className="mb-6 sm:mb-8">
              <TimeClock employeeId={currentEmployeeId} projects={projects} />
            </div>
          )}

          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="h-px w-8 bg-gray-300 dark:bg-gray-600"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">eller</span>
              <div className="h-px w-8 bg-gray-300 dark:bg-gray-600"></div>
            </div>
          </div>

          <form
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100 dark:border-gray-700"
            onSubmit={handleSubmit}
          >
            <div className="space-y-6">
              <DatePicker value={date} onChange={setDate} />
              
              <WorkTypeSelector value={type} onChange={setType} />
              
              {requiresTimeFields && !multiProjectMode ? (
                <>
                  <TimeRangePicker start={start} end={end} setStart={setStart} setEnd={setEnd} />
                  
                  {/* Rast-knappar */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Rast
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setBreakMinutes(breakMinutes === 30 ? 0 : 30)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          breakMinutes === 30
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                        }`}
                      >
                        30 min
                      </button>
                      <button
                        type="button"
                        onClick={() => setBreakMinutes(breakMinutes === 60 ? 0 : 60)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          breakMinutes === 60
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                        }`}
                      >
                        60 min
                      </button>
                      {breakMinutes > 0 && (
                        <button
                          type="button"
                          onClick={() => setBreakMinutes(0)}
                          className="px-4 py-2 rounded-lg font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50"
                        >
                          Ta bort rast
                        </button>
                      )}
                    </div>
                    {breakMinutes > 0 && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        Rast: {breakMinutes} minuter kommer dras av från totala tiden
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                    {type === 'vabb' && 'VAB registreras automatiskt som 8 timmar per dag.'}
                    {type === 'sick' && 'Sjukdom registreras automatiskt som 8 timmar per dag.'}
                    {type === 'vacation' && 'Semester registreras automatiskt som 8 timmar per dag.'}
                    {type === 'absence' && 'Frånvaro registreras automatiskt som 8 timmar per dag.'}
                  </p>
                </div>
              )}
              
              {requiresTimeFields && (
                <>
                  {/* Multi-project toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={multiProjectMode}
                          onChange={(e) => {
                            setMultiProjectMode(e.target.checked)
                            if (!e.target.checked) {
                              // Återställ till single project mode
                              setProjectEntries([{ projectId: '', hours: 0 }])
                              setProject('')
                            } else {
                              // Initiera första entry med nuvarande projekt och timmar, eller tomt om inget projekt valt
                              if (project && hours > 0) {
                                setProjectEntries([{ projectId: project, hours: hours }])
                              } else {
                                setProjectEntries([{ projectId: '', hours: 0 }])
                              }
                              setProject('')
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm font-semibold">Jobbade du på flera projekt?</span>
                      </label>
                    </div>
                  </div>
                  
                  {multiProjectMode ? (
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ange timmar för varje projekt:
                      </div>
                      {projectEntries.map((entry, index) => (
                        <div key={index} className="flex gap-3 items-start p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="flex-1">
                            <CompanySelector
                              value={entry.projectId}
                              onChange={(value) => {
                                const updated = [...projectEntries]
                                updated[index].projectId = value
                                setProjectEntries(updated)
                              }}
                              dynamicProjects={projects}
                            />
                          </div>
                          <div className="w-32">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Timmar
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={entry.hours}
                              onChange={(e) => {
                                const updated = [...projectEntries]
                                const newHours = Math.max(0, parseFloat(e.target.value) || 0)
                                updated[index].hours = newHours
                                setProjectEntries(updated)
                                // Uppdatera totala timmar baserat på summan
                                const total = updated.reduce((sum, e) => sum + e.hours, 0)
                                setHours(total)
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          {projectEntries.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = projectEntries.filter((_, i) => i !== index)
                                setProjectEntries(updated)
                                // Uppdatera totala timmar efter borttagning
                                const total = updated.reduce((sum, e) => sum + e.hours, 0)
                                setHours(total)
                              }}
                              className="mt-6 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Ta bort projekt"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setProjectEntries([...projectEntries, { projectId: '', hours: 0 }])
                        }}
                        className="w-full py-2 px-4 text-sm font-medium text-blue-600 dark:text-blue-400 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        + Lägg till projekt
                      </button>
                      {totalMultiProjectHours > 0 && (
                        <div className="text-sm p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                          Totalt: {totalMultiProjectHours.toFixed(1)}h fördelat på {projectEntries.filter(e => e.projectId && e.hours > 0).length} projekt
                        </div>
                      )}
                    </div>
                  ) : (
                    <CompanySelector
                      value={project}
                      onChange={setProject}
                      dynamicProjects={projects}
                    />
                  )}
                </>
              )}
              
              <EmployeeSelector
                value={employeeId}
                onChange={setEmployeeId}
                dynamicEmployees={employees}
                disabled={!isAdmin}
                lockedEmployeeId={!isAdmin ? currentEmployeeId : undefined}
              />
              
              <CommentBox value={notes} onChange={setNotes} />
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {multiProjectMode ? 'Totalt timmar (fördelat på projekt)' : 'Totalt rapporterade timmar'}
                </div>
                <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {hours.toFixed(1)}h
                </div>
                {multiProjectMode && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Fördelat: {totalMultiProjectHours.toFixed(1)}h
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl py-3 sm:py-4 px-6 text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Sparar...
                  </span>
                ) : (
                  'Spara tidrapport'
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

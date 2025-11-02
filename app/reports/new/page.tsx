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

  // Beräkna timmar från start/end när tidsfält används
  useEffect(() => {
    if (requiresTimeFields && start && end) {
      const [h1, m1] = start.split(':').map(Number)
      const [h2, m2] = end.split(':').map(Number)
      let hrs = (h2 + m2 / 60) - (h1 + m1 / 60)
      if (hrs <= 0) hrs += 24 // Hantera över midnatt (för nattarbete)
      setHours(Math.max(0, hrs))
    }
  }, [start, end, requiresTimeFields])

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

    if (!project && requiresTimeFields) { 
      toast.error('Projekt måste väljas för arbetstidrapporter!')
      setSaving(false)
      return
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
      break_minutes: 0,
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

    // Create time entry via API route to ensure tenant_id is valid and bypass RLS
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
              
              {requiresTimeFields ? (
                <TimeRangePicker start={start} end={end} setStart={setStart} setEnd={setEnd} />
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
                <CompanySelector
                  value={project}
                  onChange={setProject}
                  dynamicProjects={projects}
                />
              )}
              
              <EmployeeSelector
                value={employeeId}
                onChange={setEmployeeId}
                dynamicEmployees={employees}
              />
              
              <CommentBox value={notes} onChange={setNotes} />
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Totalt rapporterade timmar</div>
                <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {hours.toFixed(1)}h
                </div>
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

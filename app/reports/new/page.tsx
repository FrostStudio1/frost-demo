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
  
  // Kontrollera om typen kräver tidsfält
  const requiresTimeFields = !['vabb', 'sick', 'vacation', 'absence'].includes(type)
  
  async function fetchData() {
    if (!tenantId) return
    
    const { data: pData } = await supabase
      .from('projects')
      .select('id, name')
      .eq('tenant_id', tenantId)
    setProjects(pData ?? [])
    
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

    const toInsert = {
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
      amount_total: 0,
      is_billed: false,
      description: notes || null,
    }

    const { error } = await supabase.from('time_entries').insert([toInsert])
    setSaving(false)

    if (error) {
      toast.error('Kunde inte spara: ' + error.message)
      return
    }
    
    router.push('/reports')
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-6 lg:p-10 max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-2">New Time Report</h1>
            <p className="text-gray-500">Rapportera arbetstid eller frånvaro</p>
          </div>

          <form
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            onSubmit={handleSubmit}
          >
            <div className="space-y-6">
              <DatePicker value={date} onChange={setDate} />
              
              <WorkTypeSelector value={type} onChange={setType} />
              
              {requiresTimeFields ? (
                <TimeRangePicker start={start} end={end} setStart={setStart} setEnd={setEnd} />
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800 font-medium">
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
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="text-sm text-gray-600 mb-1">Totalt rapporterade timmar</div>
                <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {hours.toFixed(1)}h
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl py-4 px-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? 'Sparar...' : 'Spara tidrapport'}
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

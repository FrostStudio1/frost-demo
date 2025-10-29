'use server'

import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createTimeEntry(formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) {
    redirect('/login')
  }

  const project_id = String(formData.get('project_id') || '')
  const date = String(formData.get('date') || '')
  const start_time = String(formData.get('start_time') || '')
  const end_time = String(formData.get('end_time') || '')
  const break_minutes = Number(formData.get('break_minutes') || 0)
  const work_type = String(formData.get('work_type') || 'Arbete')

  if (!project_id || !date || !start_time || !end_time) {
    redirect('/tid/ny?err=' + encodeURIComponent('Fyll i alla obligatoriska fält'))
  }

  // ISO timestamps, lokal dag + tider
  const start_at = new Date(`${date}T${start_time}:00`).toISOString()
  const end_at = new Date(`${date}T${end_time}:00`).toISOString()

  // INSERT – RLS-trigger sätter tenant_id automatiskt
  const { error: insertErr } = await supabase.from('time_entries').insert([
    {
      project_id,
      start_at,
      end_at,
      break_minutes,
      work_type,
      user_id: user.id,
      // Lägg gärna till fler fält om din tabell har dem (t ex employee_id, notes osv)
    },
  ])

  if (insertErr) {
    redirect('/tid/ny?err=' + encodeURIComponent(insertErr.message))
  }

  // Tillbaka till projektlistan efter lyckad sparning
  redirect('/projects?created=1')
}

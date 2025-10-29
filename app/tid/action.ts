'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../utils/supabase/server'

/**
 * Tar emot fält från formuläret på /tid/ny, räknar ut minuter = (slut - start) - rast
 * och skapar en time_entry. Kräver inloggad user (middleware/SSR-cookies fixade).
 */
export async function createTimeEntry(formData: FormData): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/tid/ny')
  }

  const redirectWithError = (message: string) => {
    redirect(`/tid/ny?error=${encodeURIComponent(message)}`)
  }

  const project_id = String(formData.get('project_id') || '')
  const work_type = String(formData.get('work_type') || '').trim() // använd om du har kolumnen
  const date = String(formData.get('date') || '')
  const start_time = String(formData.get('start_time') || '')
  const end_time = String(formData.get('end_time') || '')
  const break_minutes_raw = Number(formData.get('break_minutes') ?? 0)
  const break_minutes = Number.isFinite(break_minutes_raw) ? break_minutes_raw : 0

  if (!project_id) redirectWithError('Välj projekt')
  if (!date || !start_time || !end_time) redirectWithError('Datum och tider krävs')

  // Bygg ISO-tider av datum + klockslag
  const startISO = `${date}T${start_time}`
  const endISO = `${date}T${end_time}`
  const start = new Date(startISO)
  const end = new Date(endISO)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    redirectWithError('Ogiltig tid')
  }
  if (end <= start) {
    redirectWithError('Sluttiden måste vara efter starttiden')
  }

  const totalMinutes = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 60000) - break_minutes
  )
  if (totalMinutes <= 0) redirectWithError('Minuter måste bli > 0')

  // Sätt ihop insert. Om du INTE har kolumnen work_type — ta bort den raden.
  const payload: Record<string, any> = {
    project_id,
    user_id: user!.id,
    minutes: totalMinutes,
  }
  if (work_type) payload.work_type = work_type

  const { error } = await supabase.from('time_entries').insert(payload)
  if (error) redirectWithError(error.message)

  revalidatePath('/tid/ny')
  redirect('/tid/ny?status=created')
}

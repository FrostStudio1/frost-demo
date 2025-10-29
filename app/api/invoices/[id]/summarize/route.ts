// app/api/projects/[id]/summarize/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  // Hämta projekt + entries
  const [{ data: project }, { data: entries }] = await Promise.all([
    supabase.from('projects').select('id, name, tenant_id').eq('id', params.id).single(),
    supabase.from('time_entries').select('start_at, total_hours, amount_sek, work_type, employee_id').eq('project_id', params.id),
  ])
  if (!project) return NextResponse.json({ error: 'Projekt saknas' }, { status: 404 })

  // Skapa en kompakt prompt
  const list = (entries || [])
    .slice(0, 50)
    .map((e) => `• ${new Date(e.start_at).toLocaleDateString('sv-SE')}: ${e.total_hours}h ${e.work_type} (${e.amount_sek} kr)`)
    .join('\n')

  const userPrompt = `Sammanfatta kort projektet "${project.name}" utifrån arbetsposter:\n${list}\n\n3–4 meningar, svensk ton, sakligt.`

  // Anropa din modell – Exempel (pseudo)
  // Byt till din provider: Google (Gemini) / OpenAI / etc. och lägg nyckel i server-env
  const summary = `Demo-sammanfattning (ersätt med riktig AI-respons).\nPoster: ${entries?.length || 0}`

  return NextResponse.json({ summary })
}

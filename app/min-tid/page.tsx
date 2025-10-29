// app/min-tid/page.tsx
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
function fmtTime(dt: string) {
  return new Date(dt).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}
function hrs(min: number | null) {
  const m = typeof min === 'number' ? min : 0
  return (m / 60).toFixed(2)
}

export default async function MyTimePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <main className="p-6">
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm">Du är inte inloggad.</p>
          <Link href="/login" className="text-blue-600 hover:underline">Gå till login</Link>
        </div>
      </main>
    )
  }

  // Hämta alla dina tidrapporter med projektnamn
  const { data: entries, error } = await supabase
    .from('time_entries')
    .select(`
      id, start_at, end_at, break_minutes, minutes, work_type, invoice_id, created_at,
      projects:project_id ( id, name )
    `)
    .eq('user_id', user.id)
    .order('start_at', { ascending: false })

  if (error) {
    return (
      <main className="p-6">
        <div className="rounded-lg border bg-white p-6 text-red-700">
          Kunde inte hämta tider: {error.message}
        </div>
      </main>
    )
  }

  const list = entries ?? []
  const totalMinutes = list.reduce((sum, e: any) => sum + (e.minutes ?? 0), 0)
  const totalHours = (totalMinutes / 60).toFixed(2)
  const now = new Date()
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
const weekStart = new Date(now)
weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)) // måndag
const weekStartISO = weekStart.toISOString()

const monthMin = list.filter((e: any) => e.start_at >= monthStart).reduce((s: number, e: any) => s + (e.minutes ?? 0), 0)
const weekMin  = list.filter((e: any) => e.start_at >= weekStartISO).reduce((s: number, e: any) => s + (e.minutes ?? 0), 0)

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mina tider</h1>
        <Link href="/" className="text-sm text-gray-600 hover:underline">Hem</Link>
      </div>

      <div className="rounded-lg border bg-white p-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Totalt rapporterat</div>
          <div className="text-2xl font-bold">{totalHours} h</div>
        </div>
        <Link
          href="/tid/ny"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
        >
          Logga ny tid
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-center text-gray-500">
          Du har inte rapporterat några tider ännu.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((e: any) => {
            const projectName = e.projects?.name ?? 'Okänt projekt'
            const minutes = e.minutes ?? 0
            const breakMin = e.break_minutes ?? 0
            const billedBadge = e.invoice_id
              ? <span className="ml-2 inline-block text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Fakturerad</span>
              : <span className="ml-2 inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Ej fakturerad</span>

            return (
              <div key={e.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{projectName} {billedBadge}</div>
                    <div className="text-sm text-gray-600">{e.work_type ?? 'Arbete'}</div>
                    <div className="text-sm text-gray-600">
                      {fmtDate(e.start_at)} • {fmtTime(e.start_at)}–{fmtTime(e.end_at)} • Rast {breakMin} min
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Timmar</div>
                    <div className="text-lg font-semibold">{hrs(minutes)} h</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

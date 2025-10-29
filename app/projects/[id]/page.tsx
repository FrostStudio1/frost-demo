// app/projects/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { createLockedInvoice } from './actions'
import Link from 'next/link'

function sek(n: number) {
  try {
    return Number(n ?? 0).toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })
  } catch {
    return `${Math.round(Number(n ?? 0))} kr`
  }
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Auth guard
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="mx-auto max-w-xl p-8">
        Du är inte inloggad. <a className="underline" href="/login">Logga in</a>
      </div>
    )
  }

  // Hämta projekt
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (projErr || !project) {
    return <div className="mx-auto max-w-xl p-8">Kunde inte hämta projekt.</div>
  }

  // (Valfritt) hämta kund
  const clientId = project.client_id
  const { data: client } = clientId
    ? await supabase.from('clients').select('*').eq('id', clientId).single()
    : { data: null as any }

  // Hämta senaste låsta fakturan (om du har created_at eller issue_date)
  const { data: lastInv } = await supabase
    .from('invoices')
    .select('id, number, status, issue_date')
    .eq('project_id', project.id)
    .order('issue_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{project.name}</h1>
          {client && (
            <div className="text-sm text-gray-600">
              {client.name}{client.email ? ` • ${client.email}` : ''}
            </div>
          )}
          {project.base_rate_sek ? (
            <div className="text-sm text-gray-700 mt-1">Grundpris: {sek(project.base_rate_sek)} / tim</div>
          ) : null}
        </div>

        <Link
          href="/projects"
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800"
        >
          Projekt
        </Link>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {/* Skapa & lås (snapshot) → redirect till /invoices/:id */}
        <form action={async () => { 'use server'; await createLockedInvoice(params.id) }}>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Skapa & lås faktura
          </button>
        </form>

        {/* Visa live-faktura (läser från vy/v_invoice_lines) */}
        <Link
          href={`/projects/${params.id}/invoice`}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
        >
          Visa "live" faktura
        </Link>

        {/* Visa senaste låsta faktura (om finns) */}
        {lastInv ? (
          <Link
            href={`/invoices/${lastInv.id}`}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
          >
            Visa senast låsta faktura{lastInv.number ? ` (${lastInv.number})` : ''}
          </Link>
        ) : null}
      </div>

      {/* (Valfritt) lite status/info */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Projektinfo</h2>
        <div className="text-sm leading-6 text-gray-700">
          <div>Namn: <span className="font-medium text-gray-900">{project.name}</span></div>
          {project.status && <div>Status: <span className="font-medium">{project.status}</span></div>}
          {project.budgeted_hours != null && (
            <div>Budget timmar: <span className="font-medium">{project.budgeted_hours}</span></div>
          )}
          {project.budgeted_cost_sek != null && (
            <div>Budget kostnad: <span className="font-medium">{sek(project.budgeted_cost_sek)}</span></div>
          )}
        </div>
      </div>
    </div>
  )
}

// app/projects/page.tsx
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

function sek(n: number) {
  try { return Number(n ?? 0).toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' }) }
  catch { return `${Math.round(Number(n ?? 0))} kr` }
}

export default async function ProjectsPage() {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user
  if (!user) {
    return (
      <div className="mx-auto max-w-xl p-8">
        Du är inte inloggad. <a className="underline" href="/login">Logga in</a>
      </div>
    )
  }

  const claims: any = user.app_metadata ?? user.user_metadata ?? {}
  const tenantId: string | undefined = claims.tenant_id
  if (!tenantId) {
    return <div className="mx-auto max-w-xl p-8">Saknar tenant_id på användaren.</div>
  }

  // Hämta projekt
  const { data: projectsData, error: projectsErr } = await supabase
    .from('projects')
    .select('id, name, base_rate_sek')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
  if (projectsErr) {
    return <div className="mx-auto max-w-xl p-8">Kunde inte hämta projekt.</div>
  }
  const projects = projectsData ?? []

  // Hämta ofakturerat per projekt (group by project_id)
  const { data: unbilledData } = await supabase
    .from('time_entries')
    .select('project_id, amount_sek')
    .eq('tenant_id', tenantId)
    .is('invoice_id', null)

  // gruppera
  const unbilledByProject = new Map<string, number>()
  for (const row of (unbilledData ?? [])) {
    const pid = row.project_id as string
    const amt = Number(row.amount_sek ?? 0)
    unbilledByProject.set(pid, (unbilledByProject.get(pid) ?? 0) + amt)
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Projekt</h1>
        <div className="flex gap-2">
          <Link href="/admin" className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50">Admin</Link>
          <Link href="/tid/ny" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Logga tid</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {projects.length === 0 && (
          <div className="rounded-xl border bg-white p-5 text-gray-500 italic">Inga projekt.</div>
        )}

        {projects.map((p: any) => {
          const unbilled = unbilledByProject.get(p.id) ?? 0
          const statusBadge = p.status === 'Pågående'
            ? <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Pågående</span>
            : p.status === 'Fakturerat'
            ? <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Fakturerat</span>
            : <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{p.status ?? 'Okänd'}</span>

          return (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="rounded-xl border bg-white p-5 hover:bg-gray-50 transition flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  {statusBadge}
                </div>
                <div className="text-sm text-gray-600">
                  Timpris (baseline): {p.base_rate_sek ? sek(p.base_rate_sek) : '–'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Ofakturerat</div>
                <div className="text-base font-semibold">{sek(unbilled)}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

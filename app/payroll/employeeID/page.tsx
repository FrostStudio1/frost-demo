// app/payroll/[employeeId]/page.tsx
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const InvoiceDownload = dynamic(() => import ('@/components/InvoiceDownload'), { ssr: false })

function sek(n: number) {
  try { return Number(n ?? 0).toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' }) }
  catch { return `${Math.round(Number(n ?? 0))} kr` }
}
function monthRange(isoMonth?: string) {
  const now = new Date()
  const [y, m] = (isoMonth ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}`)
    .split('-')
    .map(Number)
  const start = new Date(y, m - 1, 1)
  const end = new Date(y, m, 1)
  const label = `${y}-${String(m).padStart(2,'0')}`
  return { start: start.toISOString(), end: end.toISOString(), label }
}

export default async function PayslipPage({
  params,
  searchParams,
}: {
  params: { employeeId: string }
  searchParams?: Record<string, string>
}) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user
  if (!user) {
    return <div className="mx-auto max-w-xl p-8">Du är inte inloggad. <a className="underline" href="/login">Logga in</a></div>
  }

  const claims: any = user.app_metadata ?? user.user_metadata ?? {}
  const tenantId: string | undefined = claims.tenant_id
  if (!tenantId) {
    return <div className="mx-auto max-w-xl p-8">Saknar tenant_id på användaren.</div>
  }

  const employeeId = params.employeeId
  const { start, end, label } = monthRange(searchParams?.month)

  // Hämta anställd
  const { data: empData } = await supabase
    .from('employees')
    .select('id, full_name, email, default_rate_sek')
    .eq('tenant_id', tenantId)
    .eq('id', employeeId)
    .maybeSingle()
  if (!empData) {
    return <div className="mx-auto max-w-xl p-8">Kunde inte hitta anställd.</div>
  }

  // Hämta tidrader för perioden
  const { data: entriesData } = await supabase
    .from('time_entries')
    .select('regular_hours, ob_evening_hours, ob_night_hours, weekend_hours, total_hours, amount_sek')
    .eq('tenant_id', tenantId)
    .eq('employee_id', employeeId)
    .gte('start_at', start)
    .lt('start_at', end)

  const rows = entriesData ?? []
  const regular = rows.reduce((s, r) => s + Number(r.regular_hours ?? 0), 0)
  const eve = rows.reduce((s, r) => s + Number(r.ob_evening_hours ?? 0), 0)
  const night = rows.reduce((s, r) => s + Number(r.ob_night_hours ?? 0), 0)
  const weekend = rows.reduce((s, r) => s + Number(r.weekend_hours ?? 0), 0)
  const totalHours = rows.reduce((s, r) => s + Number(r.total_hours ?? 0), 0)
  const amount = rows.reduce((s, r) => s + Number(r.amount_sek ?? 0), 0)

  // Enkel “bruttolön” = amount (dina OB-beräkningar är redan med i time_entries.amount_sek)
  const gross = amount
  // (valfritt) schablonavdrag skatt 30% för demo
  const tax = Math.round(gross * 0.30)
  const net = gross - tax

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Lönespec – {label}</h1>
        <div className="flex gap-2">
          <Link href={`/payroll?month=${label}`} className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50">Tillbaka</Link>
          <InvoiceDownload targetId="pdf-payslip" fileName={`lonespec-${label}-${empData.full_name}.pdf`} />
        </div>
      </div>

      <div id="pdf-payslip" className="rounded-xl border bg-white p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-xl font-bold">Frost Bygg</div>
            <div className="text-sm text-gray-600">Org.nr 556677-8899</div>
            <div className="text-sm text-gray-600">info@frostbygg.se</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">LÖNESPECIFIKATION</div>
            <div className="text-sm text-gray-600">Period: {label}</div>
            <div className="text-sm text-gray-600">Utskriftsdatum: {new Date().toLocaleDateString('sv-SE')}</div>
          </div>
        </div>

        {/* Employee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Anställd</div>
            <div className="font-medium">{empData.full_name}</div>
            <div className="text-sm text-gray-600">{empData.email}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Timpris (baseline)</div>
            <div className="font-medium">{empData.default_rate_sek ? sek(empData.default_rate_sek) : '–'}</div>
            <div className="text-sm text-gray-600">Tenant-ID: <span className="font-mono">{tenantId}</span></div>
          </div>
        </div>

        {/* Hours Table */}
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="p-3">Kategori</th>
                <th className="p-3 text-right">Timmar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr><td className="p-3">Ordinarie</td><td className="p-3 text-right">{regular.toFixed(2)}</td></tr>
              <tr><td className="p-3">OB Kväll</td><td className="p-3 text-right">{eve.toFixed(2)}</td></tr>
              <tr><td className="p-3">OB Natt</td><td className="p-3 text-right">{night.toFixed(2)}</td></tr>
              <tr><td className="p-3">OB Helg</td><td className="p-3 text-right">{weekend.toFixed(2)}</td></tr>
              <tr className="font-medium"><td className="p-3">Totalt</td><td className="p-3 text-right">{totalHours.toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Brutto</div>
            <div className="text-xl font-bold">{sek(gross)}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Prel. Skatt (30%)</div>
            <div className="text-xl font-bold">-{sek(tax)}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Att utbetala</div>
            <div className="text-xl font-bold">{sek(net)}</div>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Belopp är beräknade utifrån registrerade tidrader och dina OB-regler. Skatten är endast ett demo-exempel.
        </div>
      </div>
    </div>
  )
}

// app/payroll/page.tsx
import { createClient } from '@/utils/supabase/server'
import { getTenantId } from '@/lib/serverTenant'
import ExportCSV from './ExportCSV'
import Link from 'next/link'

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
  return { start: start.toISOString(), end: end.toISOString(), label: `${y}-${String(m).padStart(2,'0')}` }
}

export default async function PayrollPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const supabase = createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user
  if (!user) {
    return <div className="mx-auto max-w-xl p-8">Du är inte inloggad. <a className="underline" href="/login">Logga in</a></div>
  }

  // Use unified tenant resolution
  const tenantId = await getTenantId()
  if (!tenantId) {
    return <div className="mx-auto max-w-xl p-8">Saknar tenant_id. Kontakta admin.</div>
  }

  const { start, end, label } = monthRange(searchParams?.month)

  // Employees
  const { data: employeesData } = await supabase
    .from('employees')
    .select('id, full_name, email, default_rate_sek')
    .eq('tenant_id', tenantId)
    .order('full_name', { ascending: true })
  const employees = employeesData ?? []

  const nameById = new Map<string, { name: string; email: string }>(
    employees.map((e: any) => [e.id as string, { name: (e.full_name as string) ?? 'Okänd', email: (e.email as string) ?? '' }])
  )

  // Entries - använd hours_total och ob_type (data sparas så från reports/new)
  const { data: entriesData } = await supabase
    .from('time_entries')
    .select('employee_id, hours_total, ob_type, amount_total, date')
    .eq('tenant_id', tenantId)
    .gte('date', start.split('T')[0])
    .lt('date', end.split('T')[0])
  const entries = entriesData ?? []

  type Agg = {
    employee_id: string
    name: string
    email: string
    regular: number
    eve: number
    night: number
    weekend: number
    total_hours: number
    amount: number
  }
  const byEmp = new Map<string, Agg>()
  for (const r of entries as any[]) {
    const id = r?.employee_id as string
    if (!id) continue
    if (!byEmp.has(id)) {
      const meta = nameById.get(id) ?? { name: 'Okänd', email: '' }
      byEmp.set(id, {
        employee_id: id,
        name: meta.name,
        email: meta.email,
        regular: 0, eve: 0, night: 0, weekend: 0,
        total_hours: 0, amount: 0,
      })
    }
    const a = byEmp.get(id)!
    const hours = Number(r?.hours_total ?? 0)
    const obType = r?.ob_type || 'work'
    // Kategorisera timmar baserat på ob_type
    if (obType === 'work') {
      a.regular += hours
    } else if (obType === 'evening') {
      a.eve += hours
    } else if (obType === 'night') {
      a.night += hours
    } else if (obType === 'weekend') {
      a.weekend += hours
    }
    a.total_hours += hours
    a.amount += Number(r?.amount_total ?? 0)
  }
  const rows = Array.from(byEmp.values()).sort((a, b) => a.name.localeCompare(b.name))

  const grandHours = rows.reduce((s, r) => s + (r?.total_hours ?? 0), 0)
  const grandAmount = rows.reduce((s, r) => s + (r?.amount ?? 0), 0)

  const csv = rows.map(r => ({
    Månad: label,
    Namn: r.name,
    Epost: r.email,
    'Ordinarie (tim)': r.regular.toFixed(2),
    'OB Kväll (tim)': r.eve.toFixed(2),
    'OB Natt (tim)': r.night.toFixed(2),
    'OB Helg (tim)': r.weekend.toFixed(2),
    'Totalt (tim)': r.total_hours.toFixed(2),
    'Belopp (SEK)': Number(r.amount ?? 0).toFixed(2),
  }))

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Lönespec – {label}</h1>
        <div className="flex gap-2">
          <Link href="/admin" className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50">Admin</Link>
          <ExportCSV rows={csv} fileName={`payroll-${label}.csv`} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 flex flex-wrap gap-6 justify-between items-center">
        <div className="text-sm text-gray-700">
          Visar registreringar från <span className="font-medium">{new Date(start).toLocaleDateString('sv-SE')}</span> till{' '}
          <span className="font-medium">{new Date(end).toLocaleDateString('sv-SE')}</span>.
          &nbsp;Ändra månad via <code className="bg-gray-100 px-1 rounded">?month=YYYY-MM</code>
          , t.ex. <code className="bg-gray-100 px-1 rounded">?month=2025-10</code>.
        </div>
        <div className="text-sm">
          <span className="mr-6">Totalt: <span className="font-semibold">{grandHours.toFixed(2)} tim</span></span>
          <span>Belopp: <span className="font-semibold">{sek(grandAmount)}</span></span>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50">
              <th className="p-3">Namn</th>
              <th className="p-3">E-post</th>
              <th className="p-3 text-right">Ordinarie</th>
              <th className="p-3 text-right">OB Kväll</th>
              <th className="p-3 text-right">OB Natt</th>
              <th className="p-3 text-right">OB Helg</th>
              <th className="p-3 text-right">Totalt (tim)</th>
              <th className="p-3 text-right">Belopp</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 && (
              <tr><td className="p-3 text-gray-500 italic" colSpan={8}>Inga registreringar denna period.</td></tr>
            )}
         {rows.map((r) => (
  <tr key={r.employee_id} className="hover:bg-gray-50">
    <td className="p-3">
      <Link href={`/payroll/employeeID/${r.employee_id}?month=${label}`} className="underline decoration-dotted hover:decoration-solid">
        {r.name}
      </Link>
    </td>
    <td className="p-3">{r.email}</td>
    <td className="p-3 text-right">{r.regular.toFixed(2)}</td>
    <td className="p-3 text-right">{r.eve.toFixed(2)}</td>
    <td className="p-3 text-right">{r.night.toFixed(2)}</td>
    <td className="p-3 text-right">{r.weekend.toFixed(2)}</td>
    <td className="p-3 text-right font-medium">{r.total_hours.toFixed(2)}</td>
    <td className="p-3 text-right font-semibold">{sek(r.amount)}</td>
  </tr>
))}

          </tbody>
        </table>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold mb-3">Snabb sammanställning</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="px-3 py-1 rounded-full bg-gray-100">Anställda: <b>{employees.length}</b></span>
          <span className="px-3 py-1 rounded-full bg-gray-100">Poster: <b>{entries.length}</b></span>
          <span className="px-3 py-1 rounded-full bg-gray-100">Totalt timmar: <b>{grandHours.toFixed(2)}</b></span>
          <span className="px-3 py-1 rounded-full bg-gray-100">Belopp: <b>{sek(grandAmount)}</b></span>
        </div>
      </div>
    </div>
  )
}


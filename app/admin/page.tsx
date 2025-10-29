// app/admin/page.tsx
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

type Emp = {
  id: string
  full_name: string
  email: string | null
  default_rate_sek: number | null
}

type Entry = {
  employee_id: string
  total_hours: number | null
  amount_sek: number | null
}

function sek(n: number) {
  try {
    return Number(n ?? 0).toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })
  } catch {
    return `${Math.round(Number(n ?? 0))} kr`
  }
}

function currentMonthLabel(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}` // YYYY-MM
}

function monthRange(isoMonth?: string) {
  const now = new Date()
  const [y, m] = (isoMonth ?? currentMonthLabel(now)).split('-').map(Number)
  const start = new Date(y, m - 1, 1)
  const end = new Date(y, m, 1)
  const label = `${y}-${String(m).padStart(2, '0')}`
  return { start: start.toISOString(), end: end.toISOString(), label }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Record<string, string>
}) {
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

  const { start, end, label } = monthRange(searchParams?.month)

  // Hämta anställda
  const { data: employeesData, error: empErr } = await supabase
    .from('employees')
    .select('id, full_name, email, default_rate_sek')
    .eq('tenant_id', tenantId)
    .order('full_name', { ascending: true })

  if (empErr) {
    return <div className="mx-auto max-w-xl p-8">Kunde inte hämta anställda.</div>
  }

  const employees: Emp[] = employeesData ?? []

  // Hämta tidrader för innevarande månad
  const { data: monthEntriesData } = await supabase
    .from('time_entries')
    .select('employee_id, total_hours, amount_sek')
    .eq('tenant_id', tenantId)
    .gte('start_at', start)
    .lt('start_at', end)

  const monthEntries: Entry[] = monthEntriesData ?? []

  // Aggregera per anställd
  const perEmp = new Map<
    string,
    { hours: number; amount: number }
  >()

  for (const e of monthEntries) {
    const key = e.employee_id
    const prev = perEmp.get(key) ?? { hours: 0, amount: 0 }
    prev.hours += Number(e.total_hours ?? 0)
    prev.amount += Number(e.amount_sek ?? 0)
    perEmp.set(key, prev)
  }

  const totalHours = Array.from(perEmp.values()).reduce((s, v) => s + v.hours, 0)
  const totalAmount = Array.from(perEmp.values()).reduce((s, v) => s + v.amount, 0)

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin – Översikt</h1>
        <div className="flex gap-2">
          <Link
            href="/projects"
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
          >
            Projekt
          </Link>
          <Link
            href={`/payroll?month=${label}`}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Lönelista ({label})
          </Link>
        </div>
      </div>

      {/* Summering för månaden */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-5">
          <div className="text-sm text-gray-500">Period</div>
          <div className="text-xl font-semibold">{label}</div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="text-sm text-gray-500">Totala timmar (månad)</div>
          <div className="text-xl font-semibold">{totalHours.toFixed(2)} h</div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="text-sm text-gray-500">Total lönekostnad (månad)</div>
          <div className="text-xl font-semibold">{sek(totalAmount)}</div>
        </div>
      </div>

      {/* Tabell med anställda – namn länkar till /payroll/[employeeId]?month=YYYY-MM */}
      <div className="rounded-xl border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50">
              <th className="p-3">Anställd</th>
              <th className="p-3">E-post</th>
              <th className="p-3 text-right">Timmar (månad)</th>
              <th className="p-3 text-right">Belopp (månad)</th>
              <th className="p-3 text-right">Baseline timpris</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500 italic" colSpan={5}>
                  Inga anställda hittades.
                </td>
              </tr>
            )}

            {employees.map((emp) => {
              const agg = perEmp.get(emp.id) ?? { hours: 0, amount: 0 }
              return (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <Link
                      href={`/payroll/${emp.id}?month=${label}`}
                      className="underline decoration-dotted hover:decoration-solid"
                      title="Visa lönespec"
                    >
                      {emp.full_name}
                    </Link>
                  </td>
                  <td className="p-3">{emp.email ?? '—'}</td>
                  <td className="p-3 text-right">{agg.hours.toFixed(2)}</td>
                  <td className="p-3 text-right font-medium">{sek(agg.amount)}</td>
                  <td className="p-3 text-right">
                    {emp.default_rate_sek != null ? sek(emp.default_rate_sek) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Tips: klicka på ett namn för att öppna lönespecen för perioden {label}.
      </p>
    </div>
  )
}

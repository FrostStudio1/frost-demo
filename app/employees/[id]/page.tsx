'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FrostLogo from '@/components/FrostLogo'
import supabase from '@/utils/supabase/supabaseClient'
import { useTenant } from '@/context/TenantContext'

type EmployeeRecord = {
  id: string
  full_name?: string | null
  role?: string | null
  default_rate_sek?: number | null
}

type EntryRecord = {
  id: string
  date?: string | null
  start_time?: string | null
  hours_total?: number | null
  ob_type?: string | null
  amount_total?: number | null
  description?: string | null
}

export default function EmployeePage() {
  const router = useRouter()
  const params = useParams()
  const { tenantId } = useTenant()

  const employeeId = params?.id as string | undefined
  const [employee, setEmployee] = useState<EmployeeRecord | null>(null)
  const [entries, setEntries] = useState<EntryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [entriesError, setEntriesError] = useState<string | null>(null)

  useEffect(() => {
    if (!employeeId || !tenantId) return

    let cancelled = false
    setLoading(true)
    setError(null)
    setEntriesError(null)
    setEntries([])

    async function load() {
      try {
        const { data: employeeRow, error: employeeErr } = await supabase
          .from('employees')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('id', employeeId)
          .single()

        if (cancelled) return

        if (employeeErr) {
          console.error('Failed to fetch employee', employeeErr)
          setEmployee(null)
          setError(employeeErr.message ?? 'Kunde inte hämta anställd.')
          setLoading(false)
          return
        }

        const normalizedEmployee: EmployeeRecord = {
          id: employeeRow.id,
          full_name:
            (employeeRow as any).full_name ??
            (employeeRow as any).name ??
            (employeeRow as any).first_name ??
            null,
          role:
            (employeeRow as any).role ??
            (employeeRow as any).title ??
            (employeeRow as any).position ??
            null,
          default_rate_sek:
            (employeeRow as any).default_rate_sek ??
            (employeeRow as any).hourly_rate ??
            (employeeRow as any).rate ??
            null,
        }

        setEmployee(normalizedEmployee)

        let { data: entryRows, error: timeErr } = await supabase
          .from('time_entries')
          .select(
            'id, date, start_time, hours_total, ob_type, amount_total, description'
          )
          .eq('tenant_id', tenantId)
          .eq('employee_id', employeeId)
          .order('date', { ascending: false })
          .limit(50)

        if (
          timeErr &&
          typeof timeErr.message === 'string' &&
          timeErr.message.toLowerCase().includes('column')
        ) {
          const fallback = await supabase
            .from('time_entries')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('employee_id', employeeId)
            .order('date', { ascending: false })
            .limit(50)
          entryRows = fallback.data
          timeErr = fallback.error
        }

        if (cancelled) return

        if (timeErr) {
          console.error('Failed to fetch time entries', timeErr)
          setEntries([])
          setEntriesError(timeErr.message ?? 'Kunde inte hämta tidposter.')
        } else {
          setEntries((entryRows ?? []) as EntryRecord[])
        }
      } catch (err) {
        if (cancelled) return
        console.error('Unexpected error loading employee page', err)
        setEmployee(null)
        setError('Ett fel uppstod när data skulle hämtas.')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [employeeId, tenantId])

  const totals = useMemo(() => {
    const totalHours = entries.reduce((sum, entry) => {
      const hrs = entry.hours_total ?? 0
      return sum + Number(hrs ?? 0)
    }, 0)

    // Räkna OB-timmar baserat på ob_type
    const obHours = entries.reduce((sum, entry) => {
      const obType = entry.ob_type || 'work'
      const hrs = Number(entry.hours_total ?? 0)
      // Om det inte är vanligt arbete, räkna som OB
      if (obType !== 'work') {
        return sum + hrs
      }
      return sum
    }, 0)

    const amount = entries.reduce((sum, entry) => {
      return sum + Number(entry.amount_total ?? 0)
    }, 0)

    return {
      totalHours,
      obHours,
      amount,
    }
  }, [entries])

  if (!employeeId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <FrostLogo size={36} />
        <div className="ml-4 text-red-600 text-lg">Anställd-ID saknas.</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <FrostLogo size={36} />
        <div className="ml-4 text-blue-600 text-lg">Laddar anställd...</div>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 px-6 text-center">
        <FrostLogo size={36} />
        <div className="ml-4 text-red-600 text-lg">
          {error ?? 'Anställd hittas inte.'}
        </div>
        <button
          className="ml-6 rounded-lg border border-blue-300 px-4 py-2 font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
          onClick={() => router.back()}
        >
          Tillbaka
        </button>
      </div>
    )
  }

  const safeName = employee.full_name ?? 'Okänd anställd'
  const safeRole = employee.role ?? '—'

  const hourlyRate = Number(employee.default_rate_sek ?? 0)
  const computedSalary =
    totals.amount > 0
      ? totals.amount
      : hourlyRate > 0
      ? hourlyRate * totals.totalHours
      : 0

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10">
      <div className="bg-white shadow-xl rounded-3xl p-8 border border-blue-100 w-full max-w-xl">
        <div className="flex items-center gap-2 mb-5">
          <FrostLogo size={28} />
          <span className="font-black text-lg text-blue-700">{safeName}</span>
        </div>
        <div className="text-blue-700 mb-6 space-y-1 text-sm">
          <div>
            <strong>Roll:</strong> {safeRole}
          </div>
          <div>
            <strong>Lön (senaste 50 registreringar):</strong>{' '}
            <span className="font-bold text-blue-900">
              {computedSalary.toLocaleString('sv-SE')} kr
            </span>
          </div>
          <div>
            <strong>Arbetade timmar:</strong>{' '}
            {totals.totalHours.toLocaleString('sv-SE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            h
          </div>
          <div>
            <strong>OB-timmar:</strong>{' '}
            <span className="font-bold text-yellow-700">
              {totals.obHours.toLocaleString('sv-SE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              h
            </span>
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-xl mb-5">
          <div className="font-semibold text-blue-700 text-center">Senaste tidrapporter</div>
          {entriesError && (
            <div className="mt-2 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">
              {entriesError}
            </div>
          )}
          <div className="mt-2 max-h-60 overflow-y-auto text-xs text-blue-900 space-y-1">
            {entries.length === 0 ? (
              <div className="text-center text-blue-500 italic">
                Inga tidrapporter hittades.
              </div>
            ) : (
              entries.map((entry) => {
                const total = entry.hours_total ?? 0
                const entryDate = entry.date
                  ? new Date(entry.date).toLocaleDateString('sv-SE')
                  : '—'
                // OB timmar hanteras via ob_type i den nya strukturen
                const obType = entry.ob_type || 'work'
                const obLabel = obType === 'work' ? 'Ordinarie' : 
                               obType === 'evening' ? 'OB Kväll' :
                               obType === 'night' ? 'OB Natt' :
                               obType === 'weekend' ? 'OB Helg' : obType
                const label = entry.description || obLabel

                return (
                  <div key={entry.id} className="flex justify-between gap-2">
                    <span>{entryDate}</span>
                    <span>
                      {Number(total).toLocaleString('sv-SE', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      h ({label})
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
        <button
          className="w-full mt-3 py-2 px-2 font-semibold rounded-lg text-blue-600 border border-blue-300 hover:text-white hover:bg-blue-600 hover:border-blue-700"
          onClick={() => router.back()}
        >
          Tillbaka
        </button>
      </div>
    </div>
  )
}

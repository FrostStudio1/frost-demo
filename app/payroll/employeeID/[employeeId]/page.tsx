'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import supabase from '@/utils/supabase/supabaseClient'
import { useTenant } from '@/context/TenantContext'
import Sidebar from '@/components/Sidebar'

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

export default function PayslipPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { tenantId } = useTenant()
  const employeeId = params?.employeeId as string
  const month = searchParams?.get('month')
  
  const [employee, setEmployee] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(month || '')

  useEffect(() => {
    if (!tenantId || !employeeId) {
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        const { data: empData } = await supabase
          .from('employees')
          .select('id, full_name, email, default_rate_sek')
          .eq('tenant_id', tenantId)
          .eq('id', employeeId)
          .single()

        if (!empData) {
          setLoading(false)
          return
        }

        setEmployee(empData)

        const { start, end } = monthRange(selectedMonth || undefined)
        const { data: entriesData } = await supabase
          .from('time_entries')
          .select('hours_total, ob_type, amount_total')
          .eq('tenant_id', tenantId)
          .eq('employee_id', employeeId)
          .gte('date', start.split('T')[0])
          .lt('date', end.split('T')[0])

        setEntries(entriesData || [])
      } catch (err) {
        console.error('Error fetching payslip data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tenantId, employeeId, selectedMonth])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex">
        <Sidebar />
        <main className="flex-1 p-10 flex items-center justify-center">
          <div className="text-gray-500">Laddar...</div>
        </main>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-white flex">
        <Sidebar />
        <main className="flex-1 p-10 flex items-center justify-center">
          <div className="text-red-500">Anställd hittades inte</div>
        </main>
      </div>
    )
  }

  const { label } = monthRange(selectedMonth || undefined)
  const rows = entries || []
  const regular = rows.reduce((s, r: any) => {
    return s + (r.ob_type === 'work' || !r.ob_type ? Number(r.hours_total ?? 0) : 0)
  }, 0)
  const eve = rows.reduce((s, r: any) => {
    return s + (r.ob_type === 'evening' ? Number(r.hours_total ?? 0) : 0)
  }, 0)
  const night = rows.reduce((s, r: any) => {
    return s + (r.ob_type === 'night' ? Number(r.hours_total ?? 0) : 0)
  }, 0)
  const weekend = rows.reduce((s, r: any) => {
    return s + (r.ob_type === 'weekend' ? Number(r.hours_total ?? 0) : 0)
  }, 0)
  const totalHours = rows.reduce((s, r: any) => s + Number(r.hours_total ?? 0), 0)
  const amount = rows.reduce((s, r: any) => s + Number(r.amount_total ?? 0), 0)
  const gross = amount
  const tax = Math.round(gross * 0.30)
  const net = gross - tax

  // Generate month options
  const now = new Date()
  const monthOptions = []
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' })
    monthOptions.push({ value, label })
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-6 lg:p-10 max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Lönespec</h1>
              <p className="text-gray-500">{employee.full_name || employee.name || 'Okänd anställd'}</p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Tillbaka
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Välj månad</label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value)
                router.push(`/payroll/employeeID/${employeeId}?month=${e.target.value}`)
              }}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lönespec – {label}</h2>
              <p className="text-gray-600">{employee.full_name || employee.name}</p>
              {employee.email && <p className="text-sm text-gray-500">{employee.email}</p>}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Vanliga timmar</span>
                <span className="font-semibold">{regular.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">OB Kväll</span>
                <span className="font-semibold">{eve.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">OB Natt</span>
                <span className="font-semibold">{night.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">OB Helg</span>
                <span className="font-semibold">{weekend.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-200 pt-2">
                <span className="font-semibold text-gray-900">Totalt timmar</span>
                <span className="font-bold text-lg text-gray-900">{totalHours.toFixed(1)}h</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 space-y-3">
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-gray-700">Bruttolön</span>
                <span className="font-bold text-gray-900">{sek(gross)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Skatt (30%)</span>
                <span>-{sek(tax)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-gray-300 text-xl">
                <span className="font-bold text-gray-900">Netto</span>
                <span className="font-black text-purple-600">{sek(net)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


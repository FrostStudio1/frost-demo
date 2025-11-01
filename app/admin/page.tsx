'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/utils/supabase/supabaseClient'
import { useTenant } from '@/context/TenantContext'
import Sidebar from '@/components/Sidebar'

interface Employee {
  id: string
  name: string
  full_name?: string
  role?: string
  email?: string
}

interface Project {
  id: string
  name: string
  status?: string
}

interface Invoice {
  id: string
  number?: string
  amount: number
  status?: string
  customer_name?: string
}

export default function AdminPage() {
  const router = useRouter()
  const { tenantId } = useTenant()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        // Employees
        const { data: empData } = await supabase
          .from('employees')
          .select('id, name, full_name, role, email')
          .eq('tenant_id', tenantId)
        
        setEmployees((empData || []).map((e: any) => ({
          id: e.id,
          name: e.full_name || e.name || 'Okänd',
          role: e.role,
          email: e.email,
        })))

        // Projects
        const { data: projData } = await supabase
          .from('projects')
          .select('id, name, status')
          .eq('tenant_id', tenantId)
        
        setProjects(projData || [])

        // Invoices
        const { data: invData } = await supabase
          .from('invoices')
          .select('id, number, amount, status, customer_name')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(10)
        
        setInvoices(invData || [])
      } catch (err) {
        console.error('Error fetching admin data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tenantId])

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

  const activeProjects = projects.filter(p => p.status === 'active').length
  const unpaidInvoices = invoices.filter(i => i.status !== 'paid').length
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + Number(inv.amount || 0), 0)

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-500">Översikt över företaget</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-3xl font-black text-blue-600 mb-1">{employees.length}</div>
              <div className="text-sm text-gray-500">Anställda</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-3xl font-black text-purple-600 mb-1">{activeProjects}</div>
              <div className="text-sm text-gray-500">Aktiva projekt</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-3xl font-black text-pink-600 mb-1">{unpaidInvoices}</div>
              <div className="text-sm text-gray-500">Obetalda fakturor</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-3xl font-black text-green-600 mb-1">{totalRevenue.toLocaleString('sv-SE')} kr</div>
              <div className="text-sm text-gray-500">Total omsättning</div>
            </div>
          </div>

          {/* Employees */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Anställda</h2>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-700">Namn</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Roll</th>
                      <th className="p-4 text-left font-semibold text-gray-700">E-post</th>
                      <th className="p-4 text-right font-semibold text-gray-700">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{emp.name}</td>
                        <td className="p-4 text-gray-600">{emp.role || '–'}</td>
                        <td className="p-4 text-gray-600">{emp.email || '–'}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => router.push(`/payroll/employeeID?employee=${emp.id}`)}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                          >
                            Lönespec →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Senaste fakturor</h2>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-700">Nummer</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Kund</th>
                      <th className="p-4 text-right font-semibold text-gray-700">Belopp</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                      <th className="p-4 text-right font-semibold text-gray-700">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{inv.number || inv.id.slice(0, 8)}</td>
                        <td className="p-4 text-gray-600">{inv.customer_name || '–'}</td>
                        <td className="p-4 text-right font-semibold text-gray-900">
                          {Number(inv.amount || 0).toLocaleString('sv-SE')} kr
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            inv.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            inv.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inv.status || 'draft'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => router.push(`/invoices/${inv.id}`)}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                          >
                            Visa →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


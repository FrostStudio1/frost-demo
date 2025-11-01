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

export default function EmployeesPage() {
  const router = useRouter()
  const { tenantId } = useTenant()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    async function fetchEmployees() {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('id, name, full_name, role, email')
          .eq('tenant_id', tenantId)
          .order('full_name', { ascending: true })

        if (error) {
          // Tyst loggning - försök med minimal select
          try {
            const fallback = await supabase
              .from('employees')
              .select('id, name, full_name')
              .eq('tenant_id', tenantId)
              .order('name', { ascending: true })
            
            if (!fallback.error && fallback.data) {
              setEmployees((fallback.data || []).map((e: any) => ({
                id: e.id,
                name: e.full_name || e.name || 'Okänd',
                role: undefined,
                email: undefined,
              })))
            } else {
              setEmployees([])
            }
          } catch {
            setEmployees([])
          }
        } else {
          setEmployees((data || []).map((e: any) => ({
            id: e.id,
            name: e.full_name || e.name || 'Okänd',
            role: e.role,
            email: e.email,
          })))
        }
      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
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

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-2">Employees</h1>
            <p className="text-gray-500">Hantera dina anställda</p>
          </div>

          {employees.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
              Inga anställda hittades.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => router.push(`/employees/${emp.id}`)}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{emp.name}</h3>
                  {emp.role && (
                    <p className="text-sm text-gray-500 mb-1">{emp.role}</p>
                  )}
                  {emp.email && (
                    <p className="text-xs text-gray-400">{emp.email}</p>
                  )}
                  <div className="mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/payroll/employeeID/${emp.id}`)
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                    >
                      💰 Lönespec
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


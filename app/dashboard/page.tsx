'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/supabaseClient'
import { useRouter } from 'next/navigation'
import FrostLogo from '../components/FrostLogo'
import ServiceWorkerRegister from '../components/ServiceWorkerRegister'

type Project = {
  id: string
  name: string
  hours: number
  budget: number
}
type Employee = {
  id: string
  name: string
  role: string
}

const employees: Employee[] = [
  { id: 'erik', name: "Erik Byggare", role: "Arbetare" },
  { id: 'vilmer', name: "Vilmer Frost", role: "Admin" }
]

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    async function checkOnboarded() {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      if (!supaUser) return router.push("/login")
      setUser(supaUser)
      const { data: tenant } = await supabase
        .from("tenants")
        .select("onboarded")
        .eq("user_id", supaUser.id)
        .single()
      if (tenant && tenant.onboarded === false) {
        router.push("/onboarding")
        return
      }
      setLoading(false)
    }
    checkOnboarded()
  }, [router])

  useEffect(() => {
    const tenant_id = localStorage.getItem('tenant_id')
    async function fetchProjects() {
      const { data } = await supabase.from('projects').select('*').eq('tenant_id', tenant_id)
      // DEBUG: logga projektarrayen
      console.log("Projects from DB:", data)
      setProjects(data || [])
    }
    fetchProjects()
  }, [])

  function projectPercent(proj: Project) {
    const hours = Number(proj.hours)
    const budget = Number(proj.budget)
    if (!budget || budget === 0) return '0'
    return ((hours / budget) * 100).toFixed(0)
  }
  const isAdmin = user?.email === 'vilmer.frost@gmail.com' || employees.some(emp => emp.id === 'vilmer')

  if (loading) {
    return (
      <>
        <ServiceWorkerRegister />
        <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
          <FrostLogo size={44} />
          <span className="ml-3 text-blue-700 font-bold">Laddar Frost Dashboard...</span>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center py-10">
      <ServiceWorkerRegister />
      <div className="w-full max-w-3xl p-6 bg-white bg-opacity-80 rounded-3xl shadow-lg border border-blue-100 backdrop-blur">

        <div className="flex items-center gap-4 mb-6">
          <FrostLogo size={44} />
          <span className="font-black text-2xl text-blue-700">Frost Bygg – Dashboard</span>
        </div>
        <div className="mb-8 text-lg text-blue-700">
          Välkommen, <span className="font-bold">{user?.user_metadata?.name || user?.email || "Användare"}</span>!
        </div>
        
        {/* Skapa nytt som snygga länkar */}
        <div className="mb-6 flex gap-6 text-lg font-semibold">
          <span
            className="text-blue-700 hover:text-white hover:bg-blue-600 transition px-3 py-2 rounded-lg cursor-pointer"
            onClick={() => router.push('/projects/new')}
          >
            + Skapa nytt projekt
          </span>
          <span
            className="text-blue-700 hover:text-white hover:bg-blue-600 transition px-3 py-2 rounded-lg cursor-pointer"
            onClick={() => router.push('/customers/new')}
          >
            + Skapa ny kund
          </span>
          <span
            className="text-blue-700 hover:text-white hover:bg-blue-600 transition px-3 py-2 rounded-lg cursor-pointer"
            onClick={() => router.push('/invoices/new')}
          >
            + Skapa faktura
          </span>
        </div>

        {/* Projektöversikt – sticky progressbar */}
        <div className="mb-7">
          <div className="font-bold text-blue-600 mb-3 text-lg">Projektöversikt</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => router.push(`/projects/${proj.id}`)}
                className="min-h-[150px] p-5 rounded-xl bg-blue-50 shadow border border-blue-100 flex flex-col justify-between transition-all duration-150 ease-in-out hover:bg-white hover:shadow-2xl hover:-translate-y-1 hover:border-blue-300 hover:ring-2 hover:ring-blue-100 active:scale-98 group"
              >
                <div className="font-semibold text-blue-700 mb-1 group-hover:underline transition-all text-base">{proj.name}</div>
                <div className="flex items-center mb-2">
                  <span className="text-xs text-blue-400 mr-2">{proj.hours ?? 0}/{proj.budget ?? 0}h</span>
                  <span className="ml-auto text-xs font-bold text-blue-600">{projectPercent(proj)}%</span>
                </div>
                <div className="w-full max-w-full overflow-visible bg-blue-200/30 rounded h-6 mt-3 flex items-center">
                  <div style={{ width: `${projectPercent(proj)}%` }}
                    className="h-6 rounded bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 shadow-inner transition-all"></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Status & Actions */}
        <div className="mb-8">
          <div className="font-bold text-blue-600 mb-2 text-lg">Status & Actions</div>
          <div className="flex gap-4 flex-col md:flex-row">
            <button
              className="flex-1 bg-white rounded-xl shadow p-5 border border-blue-100 flex flex-col items-start
                transition-all duration-150 ease-in-out hover:bg-blue-50 hover:shadow-2xl hover:-translate-y-1 hover:border-blue-300 active:scale-98"
              onClick={() => router.push('/reports/new')}
            >
              <div className="font-medium text-blue-700 mb-2">Rapportera tid</div>
              <span className="bg-blue-600 text-white rounded px-4 py-2 font-bold hover:bg-blue-700 transition shadow hover:shadow-md">
                Ny tidrapport
              </span>
            </button>
            <button
              className="flex-1 bg-white rounded-xl shadow p-5 border border-blue-100 flex flex-col items-start
                transition-all duration-150 ease-in-out hover:bg-blue-50 hover:shadow-2xl hover:-translate-y-1 hover:border-blue-300 active:scale-98"
              onClick={() => router.push('/projects/status')}
            >
              <div className="font-medium text-blue-700 mb-2">Projektstatus</div>
              <span className="bg-blue-500 text-white rounded px-4 py-2 font-bold hover:bg-blue-600 transition shadow hover:shadow-md">
                Visa detaljer
              </span>
            </button>
            {isAdmin && (
              <button
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-xl shadow p-5 border border-blue-100 flex flex-col items-start transition hover:-translate-y-1"
                onClick={() => router.push('/admin/aeta')}
              >
                <div className="font-medium mb-2">Admin: ÄTA</div>
                <span className="bg-white text-blue-700 font-bold px-4 py-2 rounded shadow">
                  ÄTA adminvy
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border border-blue-100 mb-8">
          <div className="font-semibold text-blue-600 mb-3">Anställda</div>
          <div className="flex flex-col gap-2">
            {employees.map(emp => (
              <button
                key={emp.id}
                onClick={() => router.push(`/admin/employees/${emp.id}`)}
                className="flex justify-between items-center px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 hover:underline hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 ease-in-out active:scale-98"
                title={`Visa ${emp.name}s profil/lönespec`}
              >
                <span className="font-medium text-blue-700">{emp.name}</span>
                <span className="text-xs text-blue-400">{emp.role}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="text-center text-xs text-blue-400 font-mono opacity-70">
          &copy; 2025 Frost Apps • Dashboard
        </div>
      </div>
      <button
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl p-4 font-bold text-xl transition active:scale-95 md:hidden"
        onClick={() => router.push('/reports/new')}
        title="Rapportera tid"
      >
        +
      </button>
    </div>
  )
}

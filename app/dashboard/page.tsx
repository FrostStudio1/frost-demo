import { createClient } from '@/utils/supabase/server'
import { getTenantId } from '@/lib/serverTenant'
import DashboardClient from './DashboardClient'
import { redirect } from 'next/navigation'

interface ProjectType {
  id: string
  name: string
  budget: number
  hours: number
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // If no user, redirect to login
  if (!user || authError) {
    redirect('/login?redirect=/dashboard')
  }
  
  // Get tenant from JWT claim, cookie, or employees table
  const tenantId = await getTenantId()
  
  if (!tenantId) {
    // If no tenant, redirect to onboarding so user can create one
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <p className="text-gray-600 mb-4">Ingen tenant hittad. Du behöver slutföra onboarding först.</p>
          <a 
            href="/onboarding" 
            className="inline-block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Starta onboarding
          </a>
          <div className="mt-4">
            <a href="/login" className="text-sm text-gray-500 hover:text-gray-700 underline">
              Logga in igen
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Fetch projects
  const { data: projectRows } = await supabase
    .from('projects')
    .select('id, name, budgeted_hours')
    .eq('tenant_id', tenantId)

  // Get project IDs for hours aggregation
  const projectIds = (projectRows ?? []).map((p) => p.id)
  let projectHoursMap = new Map<string, number>()
  
  if (projectIds.length > 0) {
    const { data: hoursData } = await supabase
      .from('time_entries')
      .select('project_id, hours_total')
      .in('project_id', projectIds)
      .eq('tenant_id', tenantId)
      .eq('is_billed', false)
    
    // Aggregate hours per project
    ;(hoursData ?? []).forEach((entry) => {
      const projId = entry.project_id
      const hours = Number(entry.hours_total ?? 0)
      const current = projectHoursMap.get(projId) ?? 0
      projectHoursMap.set(projId, current + hours)
    })
  }
  
  const projects: ProjectType[] = (projectRows ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    budget: p.budgeted_hours ?? 0,
    hours: projectHoursMap.get(p.id) ?? 0
  }))

  // Calculate stats
  const oneWeekAgo = new Date(Date.now() - 6*24*60*60*1000).toISOString().slice(0,10)
  const { data: weekRows } = await supabase
    .from('time_entries')
    .select('hours_total')
    .gte('date', oneWeekAgo)
    .eq('tenant_id', tenantId)

  const totalHours = (weekRows ?? []).reduce((sum, row) => sum + Number(row.hours_total ?? 0), 0)

  const { data: invoiceRows } = await supabase
    .from('invoices')
    .select('id')
    .eq('status', 'draft')
    .eq('tenant_id', tenantId)

  const stats = {
    totalHours,
    activeProjects: projects.length,
    invoicesToSend: invoiceRows?.length ?? 0
  }

  return (
    <DashboardClient
      userEmail={user?.email ?? null}
      stats={stats}
      projects={projects}
    />
  )
}

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Hämta alla ÄTA-förfrågningar
export async function GET(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenant_id')
  const status = searchParams.get('status') // 'pending', 'approved', 'rejected'

  let query = supabase
    .from('aeta_requests')
    .select('*, projects(name), employees(full_name)')
    .order('created_at', { ascending: false })

  if (tenantId) {
    query = query.eq('tenant_id', tenantId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data || [] })
}

// Skapa ny ÄTA-förfrågan
export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { project_id, description, hours, tenant_id, employee_id } = body

  if (!project_id || !description || !hours || !tenant_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('aeta_requests')
    .insert([{
      project_id,
      description,
      hours: Number(hours),
      tenant_id,
      employee_id: employee_id || null,
      status: 'pending',
      requested_by: user.id,
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}


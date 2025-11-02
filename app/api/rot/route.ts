import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getTenantId } from '@/lib/serverTenant'

/**
 * GET /api/rot
 * Hämtar ROT-applikationer (ÄTAs) för en tenant eller projekt
 */
export async function GET(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = await getTenantId()
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('project_id')

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let query = adminSupabase
      .from('rot_applications')
      .select('*')
      .eq('tenant_id', tenantId)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data: rotApplications, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching rot applications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch ÄTAs', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(rotApplications || [])
  } catch (error: any) {
    console.error('Error in GET /api/rot:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


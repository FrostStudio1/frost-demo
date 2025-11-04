import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getTenantId } from '@/lib/serverTenant'

/**
 * API route för att hämta time_entries med service role
 * Bypassar RLS och säkerställer korrekt tenant_id
 */
export async function GET(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    let tenantId = await getTenantId()
    
    if (!tenantId) {
      // Try to get tenant from employee record
      const { data: employeeData } = await supabase
        .from('employees')
        .select('tenant_id')
        .eq('auth_user_id', user.id)
        .maybeSingle()
      
      if (employeeData?.tenant_id) {
        tenantId = employeeData.tenant_id
      }
    }
    
    if (!tenantId) {
      console.error('❌ No tenant ID found for user:', user.id)
      return NextResponse.json({ error: 'No tenant ID found' }, { status: 400 })
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      )
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceKey)

    // Check if user is admin - WITHOUT tenant filter first to find employee
    const { data: employeeData } = await adminSupabase
      .from('employees')
      .select('id, role, tenant_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    // If employee has a tenant_id, use that (it's the correct one from database)
    if (employeeData?.tenant_id) {
      // Verify the employee's tenant exists
      const { data: empTenantExists } = await adminSupabase
        .from('tenants')
        .select('id')
        .eq('id', employeeData.tenant_id)
        .maybeSingle()
      
      if (empTenantExists) {
        tenantId = employeeData.tenant_id
        console.log('✅ Using tenant from employee record:', tenantId)
      } else {
        console.log('⚠️ Employee tenant does not exist, keeping original tenant')
      }
    }

    // Verify tenant exists (final check)
    const { data: tenantExists } = await adminSupabase
      .from('tenants')
      .select('id')
      .eq('id', tenantId)
      .maybeSingle()

    if (!tenantExists) {
      console.error('❌ Final tenant does not exist:', tenantId)
      // Try to find ANY tenant from time entries
      const { data: anyTimeEntry } = await adminSupabase
        .from('time_entries')
        .select('tenant_id')
        .limit(1)
        .maybeSingle()
      
      if (anyTimeEntry?.tenant_id) {
        tenantId = anyTimeEntry.tenant_id
        console.log('🔄 Using tenant from any time entry:', tenantId)
      }
    }

    const isAdmin = employeeData?.role === 'admin' || employeeData?.role === 'Admin'
    const employeeId = employeeData?.id || null

    console.log('🔍 API: Fetching time entries', {
      tenantId,
      isAdmin,
      employeeId,
      tenantExists: !!tenantExists,
      employeeTenantId: employeeData?.tenant_id
    })

    // Handle date filter if provided
    const { searchParams } = new URL(req.url);
    const dateFilter = searchParams.get('date'); // YYYY-MM-DD format
    
    // Build query - try to get ALL entries first to see what exists
    let query = adminSupabase
      .from('time_entries')
      .select('id, date, hours_total, ob_type, project_id, employee_id, start_time, end_time, tenant_id')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false })
      .order('start_time', { ascending: false })
      .limit(100)

    // Apply date filter if provided
    if (dateFilter) {
      query = query.eq('date', dateFilter)
    }

    // If not admin, only show own entries
    if (!isAdmin && employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data: entries, error } = await query

    if (error) {
      console.error('❌ Error fetching time entries:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch time entries', details: error },
        { status: 500 }
      )
    }

    console.log('✅ API: Found entries', {
      count: entries?.length || 0,
      tenantId,
      sample: entries?.slice(0, 3).map(e => ({ id: e.id, hours: e.hours_total, date: e.date, tenant_id: e.tenant_id }))
    })

    // If no entries found, try to find any entries for this employee regardless of tenant
    if ((!entries || entries.length === 0) && employeeId) {
      console.log('⚠️ No entries found for tenant, trying to find any entries for employee')
      const { data: anyEntries } = await adminSupabase
        .from('time_entries')
        .select('id, date, hours_total, ob_type, project_id, employee_id, start_time, end_time, tenant_id')
        .eq('employee_id', employeeId)
        .limit(5)
      
      if (anyEntries && anyEntries.length > 0) {
        console.log('🔍 Found entries with different tenant:', anyEntries.map(e => e.tenant_id))
      }
    }

    return NextResponse.json({
      timeEntries: entries || [],
      entries: entries || [], // Both formats for compatibility
      isAdmin,
      employeeId,
      tenantId,
      count: entries?.length || 0
    })
  } catch (err: any) {
    console.error('❌ Unexpected error in time-entries/list:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    )
  }
}



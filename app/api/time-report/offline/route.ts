import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getTenantId } from '@/lib/serverTenant'

export async function POST(req: NextRequest) {
  const data = await req.json()

  // Get tenant from JWT claim (authoritative) or fallback to payload/cookie
  const claimTenant = await getTenantId()
  const finalTenantId = claimTenant || data.tenant_id

  if (!finalTenantId) {
    return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 })
  }

  data.tenant_id = finalTenantId

  const supabase = createClient()
  await supabase.from('time_reports').insert(data)
  return NextResponse.json({ success: true })
}

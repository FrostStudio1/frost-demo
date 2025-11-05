// app/api/integrations/[id]/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getTenantId } from '@/lib/work-orders/helpers';
import { extractErrorMessage } from '@/lib/errorUtils';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tenantId = await getTenantId();
    const admin = createAdminClient();
    const { job_type, payload } = await req.json();
    const { error } = await admin.from('integration_jobs').insert({
      tenant_id: tenantId,
      integration_id: params.id,
      job_type,
      payload: payload ?? {},
      status: 'queued',
      scheduled_at: new Date().toISOString()
    });
    if (error) return NextResponse.json({ error: extractErrorMessage(error) }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Okänt fel' }, { status: 500 });
  }
}


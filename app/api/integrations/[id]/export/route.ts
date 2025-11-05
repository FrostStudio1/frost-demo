// app/api/integrations/[id]/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getTenantId } from '@/lib/work-orders/helpers';
import { extractErrorMessage } from '@/lib/errorUtils';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tenantId = await getTenantId();
    const admin = createAdminClient();
    const body = await req.json();
    const { type, id } = body; // type: 'invoice'|'customer'|...
    const job_type = type === 'invoice' ? 'export_invoice' : type === 'customer' ? 'export_customer' : null;
    if (!job_type) return NextResponse.json({ error: 'Ogiltig exporttyp.' }, { status: 400 });

    const { error } = await admin.from('integration_jobs').insert({
      tenant_id: tenantId,
      integration_id: params.id,
      job_type,
      payload: type === 'invoice' ? { invoiceId: id } : { customerId: id },
      status: 'queued'
    });
    if (error) return NextResponse.json({ error: extractErrorMessage(error) }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Okänt fel' }, { status: 500 });
  }
}


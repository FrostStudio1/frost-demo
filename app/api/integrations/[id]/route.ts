// app/api/integrations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getTenantId } from '@/lib/work-orders/helpers';
import { extractErrorMessage } from '@/lib/errorUtils';

/**
 * DELETE /api/integrations/[id]
 * Koppla bort en integration (sätt status till 'disconnected' och ta bort tokens)
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID saknas' }, { status: 401 });
    }

    const admin = createAdminClient();
    
    // Verifiera att integrationen tillhör rätt tenant
    const { data: integration, error: checkError } = await admin
      .from('integrations')
      .select('id, tenant_id')
      .eq('id', params.id)
      .eq('tenant_id', tenantId)
      .single();

    if (checkError || !integration) {
      return NextResponse.json({ error: 'Integration hittades inte' }, { status: 404 });
    }

    // Sätt status till disconnected och ta bort tokens
    const { error } = await admin
      .from('integrations')
      .update({
        status: 'disconnected',
        access_token_encrypted: null,
        refresh_token_encrypted: null,
        expires_at: null,
        last_error: null,
      })
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: extractErrorMessage(error) }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: extractErrorMessage(e) }, { status: 500 });
  }
}


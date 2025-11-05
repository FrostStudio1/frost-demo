// app/api/integrations/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getTenantId } from '@/lib/work-orders/helpers';
import { extractErrorMessage } from '@/lib/errorUtils';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID saknas' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('integrations')
      .select('id, provider, status, last_synced_at, last_error, updated_at')
      .eq('id', params.id)
      .eq('tenant_id', tenantId)
      .single();
    
    if (error) return NextResponse.json({ error: extractErrorMessage(error) }, { status: 500 });
    
    // Hämta statistik (antal synkade poster)
    const { count: customersCount } = await admin
      .from('integration_mappings')
      .select('*', { count: 'exact', head: true })
      .eq('integration_id', params.id)
      .eq('entity_type', 'customer')
      .eq('tenant_id', tenantId);
    
    const { count: invoicesCount } = await admin
      .from('integration_mappings')
      .select('*', { count: 'exact', head: true })
      .eq('integration_id', params.id)
      .eq('entity_type', 'invoice')
      .eq('tenant_id', tenantId);
    
    return NextResponse.json({
      ...data,
      statistics: {
        customers: customersCount || 0,
        invoices: invoicesCount || 0,
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: extractErrorMessage(e) }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const c = await cookies();
  const access = c.get('sb-access-token')?.value;

  const ssr = createClient(
    process.env.SUPABASE_URL!, // funkar också med NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      global: { headers: access ? { Authorization: `Bearer ${access}` } : {} },
    }
  );

  const { data, error } = await ssr.auth.getUser();

  const tenantId = data?.user?.app_metadata?.tenant_id ?? null

  return NextResponse.json({
    hasCookie: Boolean(access),
    userId: data?.user?.id ?? null,
    tenant_id: tenantId, // Exposed directly for useTenant() hook
    app_metadata: data?.user?.app_metadata ?? null,
    error: error?.message ?? null,
  });
}

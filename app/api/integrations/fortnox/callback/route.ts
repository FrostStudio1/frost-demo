// app/api/integrations/fortnox/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/integrations/fortnox/oauth';
import { createAdminClient } from '@/utils/supabase/admin';
import { extractErrorMessage } from '@/lib/errorUtils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (!code || !state) return NextResponse.json({ error: 'Saknar code/state.' }, { status: 400 });

    const [integrationId] = state.split(':');
    await exchangeCodeForToken(integrationId, code);

    const admin = createAdminClient();
    await admin.from('integrations').update({ status: 'connected', last_error: null }).eq('id', integrationId);

    // redirect till UI
    const baseUrl = req.nextUrl.origin;
    return NextResponse.redirect(new URL(`/settings/integrations?connected=fortnox`, baseUrl));
  } catch (e: any) {
    const baseUrl = req.nextUrl.origin;
    return NextResponse.redirect(new URL(`/settings/integrations?error=${encodeURIComponent(e.message || 'Okänt fel')}`, baseUrl));
  }
}


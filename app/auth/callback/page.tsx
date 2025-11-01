'use client';
import { useEffect, Suspense } from 'react';
import { supabase } from '@/utils/supabase/supabaseClient';
import { useSearchParams } from 'next/navigation';

function CallbackContent() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirect') || '/dashboard'

  useEffect(() => {
    const bridgeAndRedirect = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const s = sessionData.session;

      if (!s) {
        window.location.replace('/login')
        return
      }

      // send tokens to server to set httpOnly cookies
      await fetch('/api/auth/set-session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          access_token: s.access_token,
          refresh_token: s.refresh_token,
        }),
      });

      // Get tenant via /api/get-tenant (resolves from employees table if needed)
      // Also update user's app_metadata with tenant_id for future requests
      try {
        // Get user ID first
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData?.user?.id

        if (!userId) {
          console.warn('callback: No user ID found')
          window.location.replace(redirectTo)
          return
        }

        const res = await fetch('/api/get-tenant');
        if (res.ok) {
          const json = await res.json();
          if (json?.tenantId) {
            // Set tenant in user metadata AND cookie (for immediate use)
            try {
              await fetch('/api/auth/set-tenant', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ 
                  tenantId: json.tenantId,
                  userId: userId // CRITICAL: Must send userId to update app_metadata
                }),
              })
            } catch (err) {
              console.warn('callback: set-tenant failed', err)
            }
            window.location.replace(redirectTo);
            return;
          }
        }
      } catch (err) {
        console.warn('callback: get-tenant failed', err);
      }

      // Final fallback: redirect to requested page or dashboard
      window.location.replace(redirectTo);
    };

    bridgeAndRedirect();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED' && session) {
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        });
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [redirectTo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loggar in...</p>
      </div>
    </div>
  );
}

export default function Callback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}

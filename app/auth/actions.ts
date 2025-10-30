'use server'

import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// Typ för att hantera både FormData och JS-objekt (TypeScript-friendly)
type EmailInput = FormData | { email: string }

export async function sendMagicLink(formData: EmailInput) {
  // Debug-logg! Kolla vad som faktiskt kommer in hit
  console.log('formData:', formData);

  // Hantera både FormData och plain objekt
  let email = '';
  if (typeof (formData as FormData).get === 'function') {
    email = String((formData as FormData).get('email') ?? '').trim();
  } else {
    email = String((formData as any).email ?? '').trim();
  }
  if (!email) throw new Error('Saknar e-post');

  const h = await headers();
  const forwardedHost = h.get('x-forwarded-host') ?? undefined;
  const host =
    forwardedHost ??
    h.get('host') ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') ??
    'localhost:3000';

  const proto =
    h.get('x-forwarded-proto') ??
    (process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https') ? 'https' : 'http');

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,

    },
  });
  if (error) throw error;

  return { ok: true };
}

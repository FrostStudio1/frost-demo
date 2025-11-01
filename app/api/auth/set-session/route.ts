import { NextResponse } from 'next/server';

const isProd = process.env.NODE_ENV === 'production';
const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL; // sätt i .env

export async function POST(req: Request) {
  // Enkel Origin/Referer-kontroll (grundläggande CSRF-skydd)
  const origin = req.headers.get('origin') || req.headers.get('referer') || '';
  if (ORIGIN && !origin.startsWith(ORIGIN)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  const { access_token, refresh_token } = await req.json();
  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  const base = { httpOnly: true, sameSite: 'lax' as const, secure: isProd, path: '/' };

  // Kort livslängd för access, längre för refresh
  res.cookies.set('sb-access-token', access_token, { ...base, maxAge: 60 * 60 });            // 1h
  res.cookies.set('sb-refresh-token', refresh_token, { ...base, maxAge: 60 * 60 * 24 * 7 }); // 7d
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  const base = { httpOnly: true, sameSite: 'lax' as const, secure: true, path: '/' };
  res.cookies.set('sb-access-token', '', { ...base, maxAge: 0 });
  res.cookies.set('sb-refresh-token', '', { ...base, maxAge: 0 });
  return res;
}

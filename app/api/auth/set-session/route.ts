import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { access_token, refresh_token, expires_at } = body ?? {}

    const res = NextResponse.json({ ok: true })

    // NOTE: per request: do not enable secure cookie flag for dev (no HTTPS)
    const cookieOpts = {
      httpOnly: true,
      path: '/',
      sameSite: 'lax' as const,
      secure: false,
    }

    if (access_token) {
      // Set access token; include maxAge if expires_at provided
      const opts: any = { ...cookieOpts }
      if (typeof expires_at === 'number') {
        const maxAge = Math.max(0, Number(expires_at) - Math.floor(Date.now() / 1000))
        opts.maxAge = maxAge
      }
      res.cookies.set({ name: 'sb-access-token', value: String(access_token), ...opts })
    }

    if (refresh_token) {
      res.cookies.set({ name: 'sb-refresh-token', value: String(refresh_token), ...cookieOpts })
    }

    return res
  } catch (err) {
    console.error('set-session error', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

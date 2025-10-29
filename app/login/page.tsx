'use client'

import { useState, FormEvent } from 'react'
import { sendMagicLink } from '../auth/actions'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'pending'|'sent'|'error'>('idle')
  const [msg, setMsg] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('pending'); setMsg('')
    const fd = new FormData(e.currentTarget)
    const res = await sendMagicLink(fd)
    if (res?.ok) { setStatus('sent'); setMsg('Magic link skickad! Kolla din e-post.') }
    else { setStatus('error'); setMsg(res?.error ?? 'Något gick fel') }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-8">
        <h1 className="text-2xl font-semibold">Logga in</h1>
        <p className="mt-1 text-sm text-gray-600">Ange din e-post så skickar vi en magic link.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="label">E-post</label>
          <input
            name="email" type="email" required value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
            placeholder="namn@företag.se"
          />
          <button type="submit" disabled={status==='pending'} className="btn-primary w-full py-2">
            {status==='pending' ? 'Skickar…' : 'Skicka magic link'}
          </button>
        </form>

        {msg && (
          <p className={`mt-4 text-sm ${status==='error' ? 'text-red-600' : 'text-green-600'}`}>
            {msg}
          </p>
        )}
      </div>
    </div>
  )
}

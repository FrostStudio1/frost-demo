import { Resend } from 'resend'

export function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('Missing RESEND_API_KEY')
  return new Resend(key)
}

export function fromAddress() {
  return process.env.MAIL_FROM || 'noreply@example.com'
}

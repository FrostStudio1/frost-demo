'use server'

import { createClient } from '../utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createProject(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) {
    redirect('/login')
  }

  const name = String(formData.get('name') || '').trim()
  const customer_name = String(formData.get('customer_name') || '').trim()
  const customer_email = String(formData.get('customer_email') || '').trim()
  const customer_address = String(formData.get('customer_address') || '').trim()
  const customer_orgnr = String(formData.get('customer_orgnr') || '').trim()

  const base_rate_sek = Number(formData.get('base_rate_sek') || 0)
  const budgeted_hours = Number(formData.get('budgeted_hours') || 0)

  if (!name || !customer_name) {
    redirect('/projects?err=' + encodeURIComponent('Fyll i projektnamn och kundnamn'))
  }

  const { error } = await supabase.from('projects').insert([
    {
      name,
      base_rate_sek,
      budgeted_hours,
      customer_name,
      customer_email,
      customer_address,
      customer_orgnr,
    },
  ])

  if (error) {
    redirect('/projects?err=' + encodeURIComponent(error.message))
  }

  redirect('/projects?created=1')
}


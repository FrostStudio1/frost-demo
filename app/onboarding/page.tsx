'use client'
import { useState } from 'react'
import { supabase } from '@/utils/supabase/supabaseClient'
import { useRouter } from 'next/navigation'

export default function OnboardingWizard() {
  const router = useRouter()
  const [company, setCompany] = useState('')
  async function handleCompanySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Skapa tenant och spara i localStorage!
    const { data, error } = await supabase
      .from('tenants')
      .insert({ name: company, onboarded: false })
      .select()
      .single()
    if (!error && data) localStorage.setItem('tenant_id', data.id)
    router.push('/dashboard')
  }
  return (
    <form onSubmit={handleCompanySubmit}>
      <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Företagsnamn" required />
      <button type="submit">Starta företag</button>
    </form>
  )
}

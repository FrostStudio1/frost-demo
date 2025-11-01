'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/utils/supabase/supabaseClient'
import FrostLogo from '@/components/FrostLogo'
import { useTenant } from '@/context/TenantContext'
import { toast } from '@/lib/toast'

export default function OnboardingPage() {
  const router = useRouter()
  const { tenantId, setTenantId } = useTenant()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Step 1: Company info
  const [companyName, setCompanyName] = useState('')
  const [orgNumber, setOrgNumber] = useState('')
  
  // Step 2: First customer
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerOrgNumber, setCustomerOrgNumber] = useState('')
  
  // Step 3: First project
  const [projectName, setProjectName] = useState('')
  const [projectBudget, setProjectBudget] = useState('')
  const [projectRate, setProjectRate] = useState('360')

  async function handleStep1() {
    if (!companyName.trim()) {
      toast.error('Företagsnamn krävs')
      return
    }
    
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id

      if (!userId) {
        toast.error('Du är inte inloggad')
        setLoading(false)
        return
      }

      // Update or create tenant
      let finalTenantId = tenantId
      
      if (!tenantId) {
        // Create new tenant
        const { data: newTenant, error: tenantError } = await supabase
          .from('tenants')
          .insert([{
            name: companyName,
            org_number: orgNumber || null,
          }])
          .select()
          .single()

        if (tenantError) throw tenantError
        finalTenantId = newTenant.id

        // Create employee record for user
        const { error: empError } = await supabase
          .from('employees')
          .insert([{
            auth_user_id: userId,
            tenant_id: finalTenantId,
            full_name: userData?.user?.email?.split('@')[0] || 'Admin',
            role: 'admin',
          }])

        if (empError) console.error('Error creating employee:', empError)

        // CRITICAL: Set tenant in user metadata and cookie immediately
        try {
          const setTenantRes = await fetch('/api/auth/set-tenant', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ 
              tenantId: finalTenantId,
              userId: userId
            }),
          })
          
          if (!setTenantRes.ok) {
            const errorData = await setTenantRes.json().catch(() => ({}))
            console.error('Failed to set tenant:', errorData)
            throw new Error('Kunde inte sätta tenant: ' + (errorData.error || 'Okänt fel'))
          }
          
          // Update TenantContext immediately
          setTenantId(finalTenantId)
        } catch (err: any) {
          console.error('Failed to set tenant in metadata:', err)
          toast.error('Varning: Kunde inte sätta tenant korrekt. Försök logga in igen.')
          throw err
        }
      } else {
        // Update existing tenant
        await supabase
          .from('tenants')
          .update({ name: companyName, org_number: orgNumber || null })
          .eq('id', tenantId)
      }

        // Tenant will be synced via TenantContext
      setStep(2)
    } catch (err: any) {
      toast.error('Fel: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleStep2() {
    if (!customerName.trim()) {
      toast.error('Kundnamn krävs')
      return
    }
    
    setLoading(true)
    try {
      if (!tenantId) {
        toast.error('Ingen tenant hittad. Logga in eller välj tenant först.')
        setLoading(false)
        return
      }

      // Create customer (org_number tas bort eftersom det inte finns i clients-tabellen)
      // Privata kunder har inget org.nr, bara företag
      const { error } = await supabase
        .from('clients')
        .insert([{
          tenant_id: tenantId,
          name: customerName,
          email: customerEmail || null,
          address: customerAddress || null,
          // org_number finns inte i clients-tabellen - privata kunder har inget org.nr
        }])

      if (error) throw error

      setStep(3)
    } catch (err: any) {
      toast.error('Fel: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleStep3() {
    if (!projectName.trim()) {
      toast.error('Projektnamn krävs')
      return
    }
    
    setLoading(true)
    try {
      if (!tenantId) {
        toast.error('Ingen tenant hittad. Logga in eller välj tenant först.')
        setLoading(false)
        return
      }

      // Create project
      // customer_orgnr finns inte i projects-tabellen, så vi sparar bara grunddata
      const { error } = await supabase
        .from('projects')
        .insert([{
          tenant_id: tenantId,
          name: projectName,
          customer_name: customerName,
          budgeted_hours: projectBudget ? Number(projectBudget) : null,
          base_rate_sek: Number(projectRate) || 360,
          // Org.nr sparas inte i projektet - det används bara för referens vid fakturering
        }])

      if (error) throw error

      // CRITICAL: Ensure tenant is set before redirect
      // Wait a bit to ensure cookie is set, then do full page reload
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Onboarding klar! Redirectar...')
      // Force full page reload to ensure cookies/metadata are available
      window.location.href = '/dashboard'
    } catch (err: any) {
      toast.error('Fel: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 p-10">
        <div className="flex flex-col items-center mb-8">
          <FrostLogo size={64} />
          <h1 className="font-black text-4xl mt-4 mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Välkommen till Frost Bygg!
          </h1>
          <p className="text-gray-500">Låt oss sätta upp ditt konto</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-1/3 h-2 rounded-full mx-1 ${
                  s <= step ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Företag</span>
            <span>Kund</span>
            <span>Projekt</span>
          </div>
        </div>

        {/* Step 1: Company */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Företagsnamn *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Frost Bygg AB"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Organisationsnummer
              </label>
              <input
                type="text"
                value={orgNumber}
                onChange={(e) => setOrgNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="556677-8899"
              />
            </div>
            <button
              onClick={handleStep1}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Sparar...' : 'Fortsätt →'}
            </button>
          </div>
        )}

        {/* Step 2: Customer */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kundnamn *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Kundens företag"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                E-post
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="kund@exempel.se"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adress
              </label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Gatuadress 1, 123 45 Stad"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Organisationsnummer <span className="text-xs text-gray-400">(valfritt - endast för företag)</span>
              </label>
              <input
                type="text"
                value={customerOrgNumber}
                onChange={(e) => setCustomerOrgNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="556677-8899 (lämna tomt för privatkund)"
              />
              <p className="mt-1 text-xs text-gray-400">
                Privata kunder behöver inget org.nr. Org.nr sparas i projektet om det anges.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                ← Tillbaka
              </button>
              <button
                onClick={handleStep2}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Sparar...' : 'Fortsätt →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Project */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Projektnamn *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Altanbygge, Köksrenovering..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget (timmar)
                </label>
                <input
                  type="number"
                  value={projectBudget}
                  onChange={(e) => setProjectBudget(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Timpris (SEK)
                </label>
                <input
                  type="number"
                  value={projectRate}
                  onChange={(e) => setProjectRate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="360"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                ← Tillbaka
              </button>
              <button
                onClick={handleStep3}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Sparar...' : 'Slutför 🎉'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

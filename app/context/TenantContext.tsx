'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import supabase from '@/utils/supabase/supabaseClient'

type TenantContextType = {
  tenantId: string | null
  setTenantId: (id: string | null) => void
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const [tenantId, setTenantId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTenantId() {
      try {
        // Priority 1: JWT claim via /api/debug/me (authoritative)
        const res = await fetch('/api/debug/me', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          const claimTenant = data?.tenant_id || data?.app_metadata?.tenant_id
          if (claimTenant) {
            setTenantId(claimTenant)
            // Sync localStorage for migration period (TODO: remove in cleanup PR)
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('tenantId', claimTenant)
              } catch {}
            }
            return
          }
        }
      } catch (err) {
        // Silent fail, fall through to legacy method
      }

      // Priority 2: Fallback to employees table (legacy, for migration period)
      try {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData?.user?.id
        if (!userId) return

        const { data: employeeData, error: empError } = await supabase
          .from('employees')
          .select('tenant_id')
          .eq('auth_user_id', userId)
          .maybeSingle()

        if (employeeData?.tenant_id) {
          setTenantId(employeeData.tenant_id)
          // Sync localStorage for migration period
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('tenantId', employeeData.tenant_id)
            } catch {}
          }
          
          // Try to sync to metadata if not already there
          try {
            await fetch('/api/auth/set-tenant', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ 
                tenantId: employeeData.tenant_id,
                userId: userId 
              }),
            })
          } catch {
            // Non-critical - silent fail
          }
        }
      } catch (err) {
        // Silent fail
      }
    }

    fetchTenantId()
    
    // Also listen for auth state changes to refetch tenant
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchTenantId()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId }}>
      {children}
    </TenantContext.Provider>
  )
}

export const useTenant = () => {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant måste användas inom TenantProvider')
  }
  return context
}
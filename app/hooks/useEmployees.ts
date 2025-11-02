'use client'

import { useQuery } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import supabase from '@/utils/supabase/supabaseClient'
import { extractErrorMessage } from '@/lib/errorUtils'
import type { Employee } from '@/types/supabase'

/**
 * React Query hook för att hämta anställda
 */
export function useEmployees() {
  const { tenantId } = useTenant()

  return useQuery({
    queryKey: ['employees', tenantId],
    queryFn: async () => {
      if (!tenantId) return []

      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, email, role, default_rate_sek')
        .eq('tenant_id', tenantId)
        .order('full_name', { ascending: true })

      if (error) {
        throw new Error(extractErrorMessage(error))
      }

      return (data || []) as Employee[]
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 10, // 10 minuter stale time (anställda ändras sällan)
  })
}


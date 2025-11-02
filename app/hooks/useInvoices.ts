'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import supabase from '@/utils/supabase/supabaseClient'
import { extractErrorMessage } from '@/lib/errorUtils'
import type { Invoice } from '@/types/supabase'

/**
 * React Query hook för att hämta fakturor
 * Använder caching och automatisk refetching
 */
export function useInvoices() {
  const { tenantId } = useTenant()

  return useQuery({
    queryKey: ['invoices', tenantId],
    queryFn: async () => {
      if (!tenantId) return []

      // Progressive fallback för saknade kolumner
      let { data, error } = await supabase
        .from('invoices')
        .select('id, amount, customer_name, customer_id, project_id, number, status, issue_date')
        .eq('tenant_id', tenantId)
        .order('issue_date', { ascending: false })

      if (error && (error.code === '42703' || error.code === '400')) {
        // Fallback utan issue_date
        const fallback = await supabase
          .from('invoices')
          .select('id, amount, customer_name, customer_id, project_id, number, status')
          .eq('tenant_id', tenantId)
          .order('id', { ascending: false })
        
        if (!fallback.error) {
          data = fallback.data
          error = null
        } else {
          error = fallback.error
        }
      }

      if (error) {
        throw new Error(extractErrorMessage(error))
      }

      return (data || []).map((inv: any) => ({
        ...inv,
        amount: inv.amount || 0,
        status: inv.status || 'draft',
        number: inv.number || inv.id?.slice(0, 8) || 'N/A',
        created_at: inv.issue_date || null,
      })) as Invoice[]
    },
    enabled: !!tenantId, // Bara köra query om tenantId finns
    staleTime: 1000 * 60 * 2, // 2 minuter stale time för fakturor
  })
}

/**
 * React Query hook för att hämta en specifik faktura
 */
export function useInvoice(invoiceId: string | undefined) {
  const { tenantId } = useTenant()

  return useQuery({
    queryKey: ['invoice', invoiceId, tenantId],
    queryFn: async () => {
      if (!invoiceId || !tenantId) return null

      // Progressive fallback (samma som i edit page)
      let { data, error } = await supabase
        .from('invoices')
        .select('id, amount, customer_name, desc, description, status, issue_date, due_date, project_id, customer_id, client_id')
        .eq('id', invoiceId)
        .eq('tenant_id', tenantId)
        .single()

      if (error && (error.code === '42703' || error.message?.includes('does not exist'))) {
        const fallback = await supabase
          .from('invoices')
          .select('id, amount, customer_name, description, status, issue_date, due_date, project_id, customer_id, client_id')
          .eq('id', invoiceId)
          .eq('tenant_id', tenantId)
          .single()
        
        if (!fallback.error) {
          data = { ...fallback.data, desc: fallback.data.description || null }
          error = null
        } else {
          error = fallback.error
        }
      }

      if (error) {
        throw new Error(extractErrorMessage(error))
      }

      return data as Invoice | null
    },
    enabled: !!invoiceId && !!tenantId,
  })
}

/**
 * React Query mutation för att uppdatera en faktura
 */
export function useUpdateInvoice() {
  const queryClient = useQueryClient()
  const { tenantId } = useTenant()

  return useMutation({
    mutationFn: async ({ invoiceId, data }: { invoiceId: string; data: Partial<Invoice> }) => {
      if (!tenantId) throw new Error('Ingen tenant ID')

      const { error } = await supabase
        .from('invoices')
        .update(data)
        .eq('id', invoiceId)
        .eq('tenant_id', tenantId)

      if (error) {
        throw new Error(extractErrorMessage(error))
      }

      return { invoiceId, data }
    },
    onSuccess: (result) => {
      // Invalidera cache för att trigga refetch
      queryClient.invalidateQueries({ queryKey: ['invoice', result.invoiceId] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      
      // Dispatch event för andra komponenter
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('invoiceUpdated', { 
          detail: { invoiceId: result.invoiceId, timestamp: Date.now() }
        }))
      }
    },
  })
}


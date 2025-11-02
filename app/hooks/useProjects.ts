'use client'

import { useQuery } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import supabase from '@/utils/supabase/supabaseClient'
import { extractErrorMessage } from '@/lib/errorUtils'
import type { Project } from '@/types/supabase'

/**
 * React Query hook för att hämta projekt
 * Använder caching och automatisk refetching
 */
export function useProjects() {
  const { tenantId } = useTenant()

  return useQuery({
    queryKey: ['projects', tenantId],
    queryFn: async () => {
      if (!tenantId) return []

      // Fetch via API route för bättre hantering
      const response = await fetch(`/api/projects/list?tenantId=${tenantId}`, { 
        cache: 'no-store' 
      })
      
      if (!response.ok) {
        throw new Error('Kunde inte hämta projekt')
      }

      const result = await response.json()
      return (result.projects || []) as Project[]
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 3, // 3 minuter stale time för projekt
  })
}

/**
 * React Query hook för att hämta ett specifikt projekt
 */
export function useProject(projectId: string | undefined) {
  const { tenantId } = useTenant()

  return useQuery({
    queryKey: ['project', projectId, tenantId],
    queryFn: async () => {
      if (!projectId || !tenantId) return null

      let { data, error } = await supabase
        .from('projects')
        .select('*, clients(id, name, org_number), client_id')
        .eq('id', projectId)
        .eq('tenant_id', tenantId)
        .maybeSingle()

      if (error && error.message?.includes('org_number')) {
        const retry = await supabase
          .from('projects')
          .select('*, clients(id, name), client_id')
          .eq('id', projectId)
          .eq('tenant_id', tenantId)
          .maybeSingle()
        
        if (!retry.error) {
          data = retry.data
          error = null
        } else {
          error = retry.error
        }
      }

      if (error) {
        throw new Error(extractErrorMessage(error))
      }

      return data as Project | null
    },
    enabled: !!projectId && !!tenantId,
  })
}

/**
 * React Query hook för att hämta projekt-timmar
 */
export function useProjectHours(projectId: string | undefined) {
  const { tenantId } = useTenant()

  return useQuery({
    queryKey: ['project-hours', projectId, tenantId],
    queryFn: async () => {
      if (!projectId || !tenantId) return { hours: 0, entries: [] }

      const response = await fetch(`/api/projects/${projectId}/hours?projectId=${projectId}&_t=${Date.now()}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Kunde inte hämta projekt-timmar')
      }

      return await response.json()
    },
    enabled: !!projectId && !!tenantId,
    staleTime: 1000 * 60, // 1 minut stale time för timmar
  })
}


import { createClient } from '@/utils/supabase/server'

/**
 * Feature flag utility functions
 */

export interface TenantFeatureFlags {
  enable_bankid: boolean
  enable_peppol: boolean
  enable_customer_portal: boolean
  enable_budget_alerts: boolean
  enable_ata_2_0: boolean
  enable_audit_log: boolean
}

/**
 * Hämtar feature flag för en tenant
 */
export async function getFeatureFlag(
  tenantId: string,
  flagName: keyof TenantFeatureFlags
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tenant_feature_flags')
      .select(flagName)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) {
      // Returnera default baserat på flag_name
      return getDefaultFeatureFlag(flagName)
    }

    return data[flagName] ?? getDefaultFeatureFlag(flagName)
  } catch (error) {
    console.error('Error fetching feature flag:', error)
    return getDefaultFeatureFlag(flagName)
  }
}

/**
 * Hämtar alla feature flags för en tenant
 */
export async function getAllFeatureFlags(
  tenantId: string
): Promise<TenantFeatureFlags> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('tenant_feature_flags')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    if (error || !data) {
      return getDefaultFeatureFlags()
    }

    return {
      enable_bankid: data.enable_bankid ?? false,
      enable_peppol: data.enable_peppol ?? false,
      enable_customer_portal: data.enable_customer_portal ?? true,
      enable_budget_alerts: data.enable_budget_alerts ?? true,
      enable_ata_2_0: data.enable_ata_2_0 ?? true,
      enable_audit_log: data.enable_audit_log ?? true,
    }
  } catch (error) {
    console.error('Error fetching feature flags:', error)
    return getDefaultFeatureFlags()
  }
}

/**
 * Default feature flags
 */
function getDefaultFeatureFlags(): TenantFeatureFlags {
  return {
    enable_bankid: false,
    enable_peppol: false,
    enable_customer_portal: true,
    enable_budget_alerts: true,
    enable_ata_2_0: true,
    enable_audit_log: true,
  }
}

function getDefaultFeatureFlag(flagName: keyof TenantFeatureFlags): boolean {
  const defaults = getDefaultFeatureFlags()
  return defaults[flagName]
}

/**
 * Hook för att använda feature flags i React components
 */
export function useFeatureFlag(flagName: keyof TenantFeatureFlags) {
  // Denna hook kräver tenant context
  // Implementeras i frontend-komponenter med useTenant hook
  throw new Error('useFeatureFlag must be used with tenant context')
}


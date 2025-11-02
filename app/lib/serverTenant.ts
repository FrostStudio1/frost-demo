import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

/**
 * Unified tenant resolution for server-side code.
 * Priority: JWT claim (app_metadata.tenant_id) > httpOnly cookie
 * 
 * Security: Always validates via JWT. Cookie is convenience only.
 * Returns null if no tenant found or user not authenticated.
 * 
 * @returns Promise<string | null> - Tenant ID from JWT claim or cookie
 */
export async function getTenantId(): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Priority 1: JWT claim (authoritative)
    const claimTenant = (user.app_metadata as Record<string, unknown>)?.tenant_id
    if (claimTenant && typeof claimTenant === 'string') {
      return claimTenant
    }

    // Priority 2: httpOnly cookie (convenience, set by /api/auth/set-tenant)
    try {
      const c = await cookies()
      const cookieTenant = c.get('tenant_id')?.value
      if (cookieTenant) {
        return cookieTenant
      }
    } catch {
      // cookies() may throw in some contexts - ignore
    }

    // Priority 3: Fallback to employees table with service role (for migration/new users)
    // CRITICAL: Always use service role to bypass RLS and get correct tenant from employee record
    // This is more reliable than JWT metadata which can be stale or incorrect
    try {
      // Try regular query first (may be blocked by RLS)
      const { data: employeeData, error: empError } = await supabase
        .from('employees')
        .select('tenant_id')
        .eq('auth_user_id', user.id)
        .limit(1)
        .maybeSingle()

      if (employeeData?.tenant_id) {
        // Verify tenant exists before returning
        const { data: tenantCheck } = await supabase
          .from('tenants')
          .select('id')
          .eq('id', employeeData.tenant_id)
          .single()
        
        if (tenantCheck) {
          // If we found tenant in employees table but not in JWT, 
          // it means the metadata hasn't been synced yet - that's ok
          // Employee record is more authoritative than JWT metadata
          return employeeData.tenant_id
        }
      }

      // If RLS blocked or no result, try with service role
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (supabaseUrl && serviceKey) {
        const { createClient: createAdminClient } = await import('@supabase/supabase-js')
        const adminSupabase = createAdminClient(supabaseUrl, serviceKey)
        
        // Get all employees for this user
        const { data: allEmployees } = await adminSupabase
          .from('employees')
          .select('id, tenant_id')
          .eq('auth_user_id', user.id)
          .limit(10)
        
        if (allEmployees && allEmployees.length > 0) {
          // Get existing tenants
          const { data: existingTenants } = await adminSupabase
            .from('tenants')
            .select('id')
            .limit(100)
          
          const existingTenantIds = new Set((existingTenants || []).map((t: any) => t.id))
          
          // Find employee with existing tenant (prioritize first valid one)
          const validEmployee = allEmployees.find((e: any) => existingTenantIds.has(e.tenant_id))
          
          if (validEmployee?.tenant_id) {
            // Employee record is authoritative - return it
            return validEmployee.tenant_id
          }
        }
      }

      // If no employee record exists, user needs to complete onboarding
      if (empError && empError.code === 'PGRST116') {
        // No rows found - user hasn't completed onboarding
        return null
      }
    } catch {
      // RLS might block, or table might not exist - ignore and return null
    }

    return null
  } catch (err) {
    // Any other errors - return null
    return null
  }
}

/**
 * Get tenant from request (for API routes that need fallback to body/headers).
 * Still prioritizes JWT claim, but allows body/header as convenience.
 * 
 * WARNING: When validating writes, always use JWT claim from getTenantId(), not body/headers.
 * This function is for reading convenience only.
 * 
 * @param req - Optional Request object (for reading headers)
 * @param body - Optional request body (for reading tenant_id/tenantId)
 * @returns Promise<string | null> - Tenant ID with fallback to body/headers
 */
export async function getTenantFromRequest(
  req?: Request,
  body?: Record<string, unknown>
): Promise<string | null> {
  // Priority 1: JWT claim (always authoritative)
  const claimTenant = await getTenantId()
  if (claimTenant) {
    return claimTenant
  }

  // Priority 2: httpOnly cookie
  try {
    const c = await cookies()
    const cookieTenant = c.get('tenant_id')?.value
    if (cookieTenant) return cookieTenant
  } catch {}

  // Priority 3: Body (convenience only, not for security)
  if (body) {
    const b = body.tenant_id ?? body.tenantId
    if (b && typeof b === 'string') return b
  }

  // Priority 4: Header (convenience only)
  if (req?.headers) {
    const headerTenant = req.headers.get('x-tenant-id') ?? req.headers.get('x-tenant')
    if (headerTenant) return headerTenant
  }

  return null
}


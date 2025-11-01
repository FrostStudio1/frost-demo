/**
 * @deprecated Use lib/serverTenant.ts instead
 * This file is kept for backwards compatibility during migration.
 * 
 * New code should use:
 * - `getTenantId()` for authoritative tenant from JWT
 * - `getTenantFromRequest()` for convenience fallback to body/headers
 */
export { getTenantId, getTenantFromRequest } from '@/lib/serverTenant'

// Re-export for backwards compatibility
export { getTenantFromRequest as default } from '@/lib/serverTenant'

/**
 * Säkerhetsfunktioner för Frost Bygg
 */

/**
 * Rate limiting - enkel implementation
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitResult {
  allowed: boolean
  retryAfter?: number
}

/**
 * Check rate limit för en identifier (IP, user ID, etc.)
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minut default
): RateLimitResult {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)
  
  // Cleanup old records periodically (every 10 minutes)
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true }
  }
  
  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }
  
  record.count++
  return { allowed: true }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(req: Request): string {
  // Check various headers for IP (handles proxies/load balancers)
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = req.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback (won't work in serverless, but useful for logging)
  return 'unknown'
}

/**
 * Sanitize string input - remove potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Remove null bytes, control characters
  return input
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, 10000) // Max length
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate Swedish organization number format (YYYYMMDD-XXXX)
 */
export function isValidOrgNumber(orgNumber: string): boolean {
  // Swedish org number: 6 digits, dash, 4 digits
  const orgNumberRegex = /^\d{6}-\d{4}$/
  return orgNumberRegex.test(orgNumber)
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Basic input validation
 */
export function validateInput(input: any, type: 'string' | 'email' | 'uuid' | 'orgNumber'): {
  valid: boolean
  error?: string
  sanitized?: string
} {
  if (input === null || input === undefined) {
    return { valid: false, error: 'Input saknas' }
  }
  
  const str = String(input).trim()
  
  if (type === 'string') {
    if (str.length === 0) {
      return { valid: false, error: 'Tom sträng' }
    }
    const sanitized = sanitizeString(str)
    return { valid: sanitized.length > 0, sanitized, error: sanitized.length === 0 ? 'Ogiltig sträng' : undefined }
  }
  
  if (type === 'email') {
    return { valid: isValidEmail(str), error: isValidEmail(str) ? undefined : 'Ogiltig email' }
  }
  
  if (type === 'uuid') {
    return { valid: isValidUUID(str), error: isValidUUID(str) ? undefined : 'Ogiltig UUID' }
  }
  
  if (type === 'orgNumber') {
    return { valid: isValidOrgNumber(str), error: isValidOrgNumber(str) ? undefined : 'Ogiltigt org.nummer' }
  }
  
  return { valid: false, error: 'Okänd valideringstyp' }
}


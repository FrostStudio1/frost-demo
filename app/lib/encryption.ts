/**
 * Kryptering av känslig data (personnummer, etc.)
 * 
 * Använd Web Crypto API för client-side encryption
 * I produktion: Använd Supabase Vault eller server-side encryption
 */

// Enkel XOR-kryptering för demo (INTE säkert för produktion!)
// I produktion: Använd Web Crypto API eller server-side encryption
export function encryptPersonNumber(pnr: string): string {
  // För demo: Base64 encoding (INTE säkert!)
  // I produktion: Använd riktig encryption med Web Crypto API
  if (typeof window === 'undefined') {
    // Server-side: Returnera som är (skicka till server för encryption)
    return pnr
  }
  
  // Client-side: Base64 encoding (för demo)
  // I produktion: Använd SubtleCrypto API
  try {
    return btoa(pnr)
  } catch {
    return pnr
  }
}

export function decryptPersonNumber(encrypted: string): string {
  if (typeof window === 'undefined') {
    return encrypted
  }
  
  try {
    return atob(encrypted)
  } catch {
    return encrypted
  }
}

/**
 * I produktion: Använd riktig encryption med Web Crypto API
 * 
 * Exempel:
 * ```
 * const key = await crypto.subtle.importKey(
 *   'raw',
 *   new TextEncoder().encode(ENCRYPTION_KEY),
 *   { name: 'AES-GCM' },
 *   false,
 *   ['encrypt', 'decrypt']
 * )
 * 
 * const encrypted = await crypto.subtle.encrypt(
 *   { name: 'AES-GCM', iv: iv },
 *   key,
 *   new TextEncoder().encode(data)
 * )
 * ```
 */


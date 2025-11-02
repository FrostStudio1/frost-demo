'use client'

/**
 * Utility functions for better error handling
 */

export interface ErrorInfo {
  message: string
  code?: string
  details?: string
  hint?: string
}

/**
 * Extracts a user-friendly error message from various error formats
 */
export function extractErrorMessage(error: any): string {
  if (!error) return 'Okänt fel'
  
  // String errors
  if (typeof error === 'string') {
    return error
  }
  
  // Error objects with message
  if (error.message) {
    return error.message
  }
  
  // Supabase-style errors
  if (error.details) {
    return error.details
  }
  
  if (error.hint) {
    return error.hint
  }
  
  // Error codes
  if (error.code) {
    // Map common error codes to user-friendly messages
    const codeMessages: Record<string, string> = {
      '42703': 'Kolumn saknas i databasen',
      '23503': 'Foreign key constraint violation',
      '23505': 'Dublettvärde',
      'PGRST116': 'Ingen rad hittades',
      '400': 'Ogiltig begäran',
      '401': 'Inte autentiserad',
      '403': 'Åtkomst nekad',
      '404': 'Hittades inte',
      '500': 'Serverfel',
    }
    
    return codeMessages[error.code] || `Fel ${error.code}`
  }
  
  // Empty objects or objects with no useful info
  if (typeof error === 'object') {
    const keys = Object.keys(error)
    if (keys.length === 0) {
      return 'Okänt fel'
    }
    
    // Try to stringify if it's a simple object
    try {
      const str = JSON.stringify(error)
      if (str !== '{}') {
        return str
      }
    } catch {
      // Ignore JSON errors
    }
  }
  
  return 'Okänt fel'
}

/**
 * Logs error with context for debugging
 */
export function logError(context: string, error: any, additionalInfo?: Record<string, any>) {
  const errorMessage = extractErrorMessage(error)
  const errorInfo: ErrorInfo = {
    message: errorMessage,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
  }
  
  console.error(`[${context}]`, {
    error: errorInfo,
    ...additionalInfo,
    timestamp: new Date().toISOString(),
  })
  
  return errorInfo
}

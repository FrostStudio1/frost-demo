/**
 * Toast utility - wrapper around sonner for consistent toast usage
 * Enhanced with bug report button for errors
 */
import { toast as sonnerToast } from 'sonner'

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string, errorDetails?: any) => {
    // Build error URL with details
    const errorMessage = typeof message === 'string' ? message : JSON.stringify(message)
    const errorData = errorDetails ? JSON.stringify(errorDetails) : ''
    
    const feedbackUrl = `/feedback?type=bug&subject=${encodeURIComponent(`Bug: ${errorMessage.substring(0, 50)}`)}&message=${encodeURIComponent(
      `Felmeddelande: ${errorMessage}\n\n` +
      (errorData ? `Detaljer: ${errorData}\n\n` : '') +
      `Sida: ${typeof window !== 'undefined' ? window.location.href : 'Okänd'}\n` +
      `Tidpunkt: ${new Date().toISOString()}`
    )}`
    
    return sonnerToast.error(message, {
      duration: 8000,
      action: {
        label: '🐛 Rapportera bugg',
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.location.href = feedbackUrl
          }
        },
      },
    })
  },
  info: (message: string) => sonnerToast.info(message),
  warning: (message: string) => sonnerToast.warning(message),
}


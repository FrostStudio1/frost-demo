/**
 * Push-notifikationer för ROT-ansökningar
 * 
 * För nu loggar vi bara till console. I produktion:
 * - Implementera FCM för Android
 * - Implementera APNs för iOS
 * - Implementera Web Push för webbläsare
 */

export async function sendRotNotification(
  userId: string,
  tenantId: string,
  type: 'approved' | 'rejected' | 'status_update',
  applicationId: string,
  message: string
) {
  // TODO: Implementera riktig push-notifikation
  // För nu: Spara i notifications-tabell eller skicka email
  
  console.log('ROT Notification:', {
    userId,
    tenantId,
    type,
    applicationId,
    message,
    timestamp: new Date().toISOString(),
  })

  // I produktion: Skicka push-notifikation via FCM/APNs
  // I produktion: Skicka email via SendGrid, Resend, etc.
  
  return { success: true }
}


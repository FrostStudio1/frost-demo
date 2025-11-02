/**
 * Notification utilities
 */

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

/**
 * Add a notification to localStorage and dispatch event
 */
export function addNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
  const newNotification: Notification = {
    ...notification,
    id: crypto.randomUUID(),
    read: false,
    createdAt: new Date().toISOString(),
  }

  try {
    const stored = localStorage.getItem('notifications')
    const existing: Notification[] = stored ? JSON.parse(stored) : []
    const updated = [newNotification, ...existing].slice(0, 50) // Keep last 50
    localStorage.setItem('notifications', JSON.stringify(updated))
    
    // Dispatch custom event to notify NotificationCenter
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification-added', { detail: newNotification }))
    }
  } catch (err) {
    console.error('Error adding notification:', err)
  }
}

/**
 * Get all notifications from localStorage
 */
export function getNotifications(): Notification[] {
  try {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('notifications')
    return stored ? JSON.parse(stored) : []
  } catch (err) {
    console.error('Error getting notifications:', err)
    return []
  }
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(id: string) {
  try {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('notifications')
    const notifications: Notification[] = stored ? JSON.parse(stored) : []
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
    localStorage.setItem('notifications', JSON.stringify(updated))
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications-updated'))
    }
  } catch (err) {
    console.error('Error marking notification as read:', err)
  }
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsAsRead() {
  try {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('notifications')
    const notifications: Notification[] = stored ? JSON.parse(stored) : []
    const updated = notifications.map(n => ({ ...n, read: true }))
    localStorage.setItem('notifications', JSON.stringify(updated))
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications-updated'))
    }
  } catch (err) {
    console.error('Error marking all notifications as read:', err)
  }
}

/**
 * Send ROT notification (legacy function for ROT-specific notifications)
 * This is a placeholder - in production, this would send push notifications
 */
export async function sendRotNotification(
  userId: string,
  tenantId: string,
  type: 'approved' | 'rejected' | 'status_update',
  applicationId: string,
  message: string
) {
  // For now, just log - in production, implement actual push notification here
  console.log('ROT Notification:', { userId, tenantId, type, applicationId, message })
  
  // You can implement:
  // - FCM for Android
  // - APNs for iOS
  // - Web Push for browsers
  // - Email notifications
  
  return { success: true }
}

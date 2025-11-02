'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notifications'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

interface NotificationCenterProps {
  className?: string
}

/**
 * Notification Center Component
 * Displays a bell icon with unread count and dropdown with notifications
 */
export default function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    // Load notifications from localStorage or API
    loadNotifications()
    
    // Listen for notification events
    const handleNotificationAdded = () => loadNotifications()
    const handleNotificationsUpdated = () => loadNotifications()
    
    window.addEventListener('notification-added', handleNotificationAdded)
    window.addEventListener('notifications-updated', handleNotificationsUpdated)
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      loadNotifications()
    }, 30000)

    return () => {
      clearInterval(interval)
      window.removeEventListener('notification-added', handleNotificationAdded)
      window.removeEventListener('notifications-updated', handleNotificationsUpdated)
    }
  }, [])

  async function loadNotifications() {
    try {
      const loaded = getNotifications()
      setNotifications(loaded)
    } catch (err) {
      console.error('Error loading notifications:', err)
    }
  }

  function markAsRead(id: string) {
    markNotificationAsRead(id)
    loadNotifications()
  }

  function markAllAsRead() {
    markAllNotificationsAsRead()
    loadNotifications()
  }

  function handleNotificationClick(notification: Notification) {
    markAsRead(notification.id)
    if (notification.link) {
      router.push(notification.link)
      setIsOpen(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6 text-gray-600 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-20 max-h-[500px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Notifikationer {unreadCount > 0 && `(${unreadCount})`}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Markera alla som lästa
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p>Inga notifikationer</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'error' ? 'bg-red-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          notification.type === 'success' ? 'bg-green-500' :
                          'bg-blue-500'
                        } ${notification.read ? 'opacity-50' : ''}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${
                            notification.read
                              ? 'text-gray-600 dark:text-gray-400'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString('sv-SE', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Hook to add notifications
 */
export function useNotifications() {
  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date().toISOString(),
    }

    try {
      const stored = localStorage.getItem('notifications')
      const existing = stored ? JSON.parse(stored) : []
      const updated = [newNotification, ...existing].slice(0, 50) // Keep last 50
      localStorage.setItem('notifications', JSON.stringify(updated))
      
      // Dispatch custom event to notify NotificationCenter
      window.dispatchEvent(new CustomEvent('notification-added', { detail: newNotification }))
    } catch (err) {
      console.error('Error adding notification:', err)
    }
  }

  return { addNotification }
}


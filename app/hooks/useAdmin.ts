import { useState, useEffect } from 'react'
import { useTenant } from '@/context/TenantContext'

/**
 * Hook för att kontrollera om användare är admin
 * Använder API route för att kringgå RLS-problem
 */
export function useAdmin() {
  const { tenantId } = useTenant()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [employeeId, setEmployeeId] = useState<string | null>(null)

  useEffect(() => {
    async function checkAdmin() {
      if (!tenantId) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const res = await fetch('/api/admin/check')
        if (res.ok) {
          const data = await res.json()
          setIsAdmin(data.isAdmin || false)
          setEmployeeId(data.employeeId || null)
        } else {
          setIsAdmin(false)
          console.error('Admin check failed:', await res.text())
        }
      } catch (err) {
        console.error('Error checking admin:', err)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [tenantId])

  return { isAdmin, loading, employeeId }
}


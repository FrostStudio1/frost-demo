'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/utils/supabase/supabaseClient'
import { useTenant } from '@/context/TenantContext'
import Sidebar from '@/components/Sidebar'

interface Client {
  id: string
  name: string
  email?: string
  address?: string
  org_number?: string
  created_at?: string
}

export default function ClientsPage() {
  const router = useRouter()
  const { tenantId } = useTenant()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    async function fetchClients() {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, name, email, address, org_number, created_at')
          .eq('tenant_id', tenantId)
          .order('name', { ascending: true })

        if (error) {
          console.error('Error fetching clients:', error)
          setClients([])
        } else {
          setClients(data || [])
        }
      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [tenantId])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex">
        <Sidebar />
        <main className="flex-1 p-10 flex items-center justify-center">
          <div className="text-gray-500">Laddar...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-2">Kunder</h1>
            <p className="text-gray-500">Hantera dina kunder</p>
          </div>

          {!tenantId ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-red-500">
              Ingen tenant vald.
            </div>
          ) : clients.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
              Inga kunder ännu.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{client.name}</h3>
                  {client.org_number && (
                    <p className="text-sm text-gray-600 mb-1">Org.nr: {client.org_number}</p>
                  )}
                  {client.email && (
                    <p className="text-sm text-gray-600 mb-1">📧 {client.email}</p>
                  )}
                  {client.address && (
                    <p className="text-sm text-gray-600 mb-3">📍 {client.address}</p>
                  )}
                  {client.created_at && (
                    <p className="text-xs text-gray-400 mt-3">
                      Tillagd: {new Date(client.created_at).toLocaleDateString('sv-SE')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


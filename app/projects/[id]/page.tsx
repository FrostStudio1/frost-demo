'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FrostLogo from '../../components/FrostLogo'
import { supabase } from '@/utils/supabase/supabaseClient'
import Link from 'next/link'

type DemoClientKey = 'kund1' | 'kund2'

const demoProjects = [
  { id: 'stora-bygget-ab', name: 'Stora Bygget AB', status: 'Pågående', base_rate_sek: 820, client_id: 'kund1' as DemoClientKey },
  { id: 'sma-entreprenor-ab', name: 'Små Entreprenör AB', status: 'Färdig', base_rate_sek: 660, client_id: 'kund2' as DemoClientKey },
  { id: 'villa-ekbacken', name: 'Villa Ekbacken', status: 'Planeras', base_rate_sek: 500 }
]
const demoClients: Record<DemoClientKey, { name: string; email: string }> = {
  kund1: { name: 'Byggbolaget AB', email: 'info@byggbolaget.se' },
  kund2: { name: 'Målande AB', email: 'kontakt@malande.se' }
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [client, setClient] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    async function loadData() {
      let proj = null
      let cli: { name: string; email: string } | null = null
      try {
        const { data } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.id)
          .single()
        proj = data
      } catch {
        proj = null
      }
      if (!proj) {
        proj = demoProjects.find(p => p.id === params.id)
        if (proj?.client_id && demoClients[proj.client_id as DemoClientKey]) {
          cli = demoClients[proj.client_id as DemoClientKey]
        }
      }
      setProject(proj)
      setClient(cli)
      setLoading(false)
    }
    loadData()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <FrostLogo size={44} />
        <span className="ml-3 text-blue-700 font-bold">Laddar projekt...</span>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Kunde inte hämta projekt</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="mx-auto max-w-3xl p-6 space-y-6 bg-white rounded-3xl shadow-xl border border-blue-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">{project.name}</h1>
            {client && (
              <div className="text-sm text-blue-400">
                {client.name}{client.email ? ` • ${client.email}` : ''}
              </div>
            )}
            {project.base_rate_sek ? (
              <div className="text-sm text-blue-500 mt-1">
                Grundpris: {Number(project.base_rate_sek).toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })} / tim
              </div>
            ) : null}
          </div>
          <Link href="/dashboard" className="px-4 py-2 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 transition">
            Dashboard
          </Link>
        </div>
        <div className="flex gap-3">
          <Link href={`/invoices/new`} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition">
            Skapa faktura
          </Link>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold text-blue-700 mb-3">Projektinfo</h2>
          <div className="text-sm leading-6 text-blue-500">
            <div>Namn: <span className="font-medium text-blue-700">{project.name}</span></div>
            {project.status && <div>Status: <span className="font-medium">{project.status}</span></div>}
          </div>
        </div>
      </div>
    </div>
  )
}

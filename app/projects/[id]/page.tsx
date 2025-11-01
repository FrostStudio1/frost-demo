'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FrostLogo from '@/components/FrostLogo'
import supabase from '@/utils/supabase/supabaseClient'
import { useTenant } from '@/context/TenantContext'

type ProjectRecord = {
  id: string
  name: string
  customer_name?: string | null
  customer_orgnr?: string | null
  base_rate_sek?: number | null
}

export default function ProjectInvoicePage() {
  const router = useRouter()
  const params = useParams()
  const { tenantId } = useTenant()

  const [project, setProject] = useState<ProjectRecord | null>(null)
  const [hours, setHours] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [entriesError, setEntriesError] = useState<string | null>(null)

  const projectId = params?.id as string | undefined

  useEffect(() => {
    if (!projectId) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setEntriesError(null)
      setHours(0)

      try {
        let projectQuery = supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)

        if (tenantId) {
          projectQuery = projectQuery.eq('tenant_id', tenantId)
        }

        const { data: projectData, error: projectError } = await projectQuery.single()
        if (cancelled) return

        if (projectError) {
          console.error('Failed to fetch project', projectError)
          setProject(null)
          setError(projectError.message ?? 'Kunde inte hamta projektet.')
          setLoading(false)
          return
        }

        setProject(projectData as ProjectRecord)

        let entriesQuery = supabase
          .from('time_entries')
          .select('hours_total')
          .eq('project_id', projectId)
          .eq('is_billed', false)

        if (tenantId) {
          entriesQuery = entriesQuery.eq('tenant_id', tenantId)
        }

        const { data: entryRows, error: entriesErr } = await entriesQuery
        if (cancelled) return

        if (entriesErr) {
          console.error('Failed to fetch time entries', entriesErr)
          setEntriesError(entriesErr.message ?? 'Kunde inte hamta tidposter.')
          setHours(0)
        } else {
          const totalHours = (entryRows ?? []).reduce((sum: number, row: any) => {
            return sum + Number(row?.hours_total ?? 0)
          }, 0)
          setHours(totalHours)
        }

        setLoading(false)
      } catch (err) {
        if (cancelled) return
        console.error('Unexpected error when loading project invoice data', err)
        setProject(null)
        setError('Ett fel uppstod nar projektet skulle hamtas.')
        setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [projectId, tenantId])

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <FrostLogo size={38} />
        <div className="ml-4 text-red-600 text-lg">Projekt-ID saknas.</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <FrostLogo size={38} />
        <div className="ml-4 text-blue-600 text-lg">Laddar projekt...</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 px-6 text-center">
        <FrostLogo size={38} />
        <div className="ml-4 text-red-600 text-lg">
          {error ?? 'Projektet hittas inte!'}
        </div>
        <button
          className="ml-6 rounded-lg border border-blue-300 px-4 py-2 font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
          onClick={() => router.back()}
        >
          Tillbaka
        </button>
      </div>
    )
  }

  const effectiveHours = Number.isFinite(hours) ? hours : 0
  const rate = Number(project.base_rate_sek ?? 0)
  const displayRate = rate > 0 ? rate : 600
  const sum = effectiveHours * displayRate

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10">
      <div className="bg-white shadow-xl rounded-3xl p-8 border border-blue-100 w-full max-w-md">
        <div className="flex items-center gap-2 mb-5">
          <FrostLogo size={28} />
          <span className="font-black text-lg text-blue-700">Faktura Preview</span>
        </div>
        <div className="mb-5 text-blue-700 font-semibold">
          <span className="text-xl font-bold">{project.customer_name ?? 'Kund saknas'}</span>
          <br />
          <span className="text-sm text-blue-500">Org.nr: {project.customer_orgnr ?? '--'}</span>
        </div>
        <hr className="mb-4" />
        <div className="mb-2">
          <span className="font-bold">Projekt:</span> {project.name}
        </div>
        <div>
          <span className="font-bold">Rapporterade timmar:</span>{' '}
          {effectiveHours.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className="ml-3 font-bold text-blue-700">
            per {displayRate.toLocaleString('sv-SE')} kr/h
          </span>
        </div>
        <div className="mt-4 mb-2 font-bold text-xl text-blue-700">
          Total summa:{' '}
          <span className="bg-blue-700 text-white rounded px-3 py-1">
            {sum.toLocaleString('sv-SE')} kr
          </span>
        </div>
        {entriesError && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {entriesError}
          </div>
        )}
        <hr className="my-4" />
        <div className="flex gap-3 mb-3">
          <button
            className="bg-green-600 text-white font-bold py-2 px-4 rounded-xl shadow hover:bg-green-700 transition"
            onClick={() => router.push(`/invoices/new?projectId=${projectId}`)}
          >
            📝 Skapa faktura från projektet
          </button>
          <button
            className="bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow hover:bg-blue-800 transition"
            onClick={() => alert('Fakturan har skickats till kund (demo)')}
          >
            Skicka faktura
          </button>
          <button
            className="bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded-xl border border-blue-300 hover:bg-white hover:text-blue-600 transition"
            onClick={() => alert('PDF faktura laddad (demo)')}
          >
            Ladda ner PDF
          </button>
        </div>
        <button
          className="w-full mt-2 py-2 px-2 font-semibold rounded-lg text-blue-600 border border-blue-300 hover:text-white hover:bg-blue-600 hover:border-blue-700"
          onClick={() => router.back()}
        >
          Tillbaka
        </button>
        <div className="mt-6 text-xs text-blue-400 text-center">Frost Bygg faktura</div>
      </div>
    </div>
  )
}

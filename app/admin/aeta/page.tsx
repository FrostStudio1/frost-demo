'use client'

import { useEffect, useState } from 'react'
import FrostLogo from '../../components/FrostLogo'
import { supabase } from '@/utils/supabase/supabaseClient'

type AetaRow = {
  id: string
  project_id: string
  employee_id: string
  hours: number
  comment: string
  image_url?: string
  status: string
  created_at: string
}

const demoAeta: AetaRow[] = [
  {
    id: '1',
    project_id: 'stora-bygget-ab',
    employee_id: 'erik',
    hours: 5,
    comment: 'Extra takarbete pga oväder',
    image_url: '',
    status: 'pending',
    created_at: '2025-10-29T13:07:00'
  },
  {
    id: '2',
    project_id: 'villa-ekbacken',
    employee_id: 'vilmer',
    hours: 3,
    comment: 'Fick dra el och fixa vattenskada',
    image_url: '',
    status: 'approved',
    created_at: '2025-10-28T10:12:00'
  }
]

export default function AdminAetaPage() {
  const [rows, setRows] = useState<AetaRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      let dbrows: AetaRow[] = []
      try {
        const { data } = await supabase.from('aeta_requests').select('*')
        dbrows = data || []
      } catch { dbrows = [] }
      if (!dbrows.length) dbrows = demoAeta
      setRows(dbrows)
      setLoading(false)
    }
    loadData()
  }, [])

  async function setStatus(id: string, newStatus: string) {
    setRows(prev =>
      prev.map(row => row.id !== id ? row : { ...row, status: newStatus })
    )
    // Uppdatera i DB om du vill!
    await supabase.from('aeta_requests').update({ status: newStatus }).eq('id', id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <FrostLogo size={44} />
        <span className="ml-3 text-blue-700 font-bold">Laddar ÄTA-arbeten...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12">
      <FrostLogo size={38} />
      <h1 className="font-bold text-2xl text-blue-700 mb-6 mt-3">Admin – ÄTA-arbeten</h1>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow border border-blue-100 p-8">
        {rows.length === 0 ? (
          <div className="text-blue-400">Inga ÄTA-poster än!</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="font-semibold py-2 px-2">Projekt</th>
                <th className="font-semibold py-2 px-2">Byggare</th>
                <th className="font-semibold py-2">Timmar</th>
                <th className="font-semibold py-2">Kommentar</th>
                <th className="font-semibold py-2">Status</th>
                <th className="font-semibold py-2">Åtgärd</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b border-blue-100">
                  <td className="p-2">{row.project_id}</td>
                  <td className="p-2">{row.employee_id}</td>
                  <td className="p-2">{row.hours}</td>
                  <td className="p-2">{row.comment}</td>
                  <td className="p-2">{row.status}</td>
                  <td className="p-2">
                    {row.status === 'pending' && (
                      <>
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded mr-2"
                          onClick={() => setStatus(row.id, 'approved')}
                        >
                          Godkänn
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                          onClick={() => setStatus(row.id, 'rejected')}
                        >
                          Avvisa
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

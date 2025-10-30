'use client'

import { useState } from 'react'
import FrostLogo from '../../components/FrostLogo'
import { useRouter } from 'next/navigation'

const projects = [
  { id: 'stora-bygget-ab', name: 'Stora Bygget AB', status: 'Pågående', budget: 60, hours: 45 },
  { id: 'sma-entreprenor-ab', name: 'Små Entreprenör AB', status: 'Slutfört', budget: 80, hours: 80 },
  { id: 'villa-ekbacken', name: 'Villa Ekbacken', status: 'Startad', budget: 30, hours: 15 }
]

export default function ProjectStatusPage() {
  const [selected, setSelected] = useState(projects[0].id)
  const router = useRouter()

  const project = projects.find(p => p.id === selected)

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="rounded-3xl shadow-lg bg-white bg-opacity-80 border border-blue-100 p-8 max-w-2xl w-full">
        <div className="flex items-center gap-3 mb-4">
          <FrostLogo size={32} />
          <h1 className="font-bold text-xl text-blue-700">Projektstatus</h1>
        </div>
        <select
          className="mb-6 rounded px-4 py-2 border border-blue-200 text-lg bg-blue-50"
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          {projects.map(p =>
            <option key={p.id} value={p.id}>{p.name}</option>
          )}
        </select>
        {project && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-4">
            <h2 className="font-semibold text-lg text-blue-700 mb-2">{project.name}</h2>
            <div className="mb-1">Status: <span className="text-blue-600 font-medium">{project.status}</span></div>
            <div className="mb-1">Budget: <span className="font-medium">{project.budget} timmar</span> ({(project.hours/project.budget*100).toFixed(0)}% använt)</div>
            <div className="mb-2">Totalt rapporterat: <span className="font-medium">{project.hours}h</span></div>
            <div className="flex gap-3 mt-3">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-base hover:bg-blue-700 transition"
                onClick={() => router.push(`/invoices/new`)}
              >
                Skapa faktura för detta projekt
              </button>
              <button
                className="bg-blue-100 text-blue-600 px-4 py-2 rounded font-bold text-base hover:bg-blue-200 border border-blue-200 transition"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                Visa projektdetaljer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

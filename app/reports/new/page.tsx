'use client'

import React, { useState, useEffect } from 'react'
import FrostLogo from '../../components/FrostLogo'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/supabaseClient'
import { openDB } from 'idb'
import ServiceWorkerRegister from '../../components/ServiceWorkerRegister'

const projects = [
  { id: 'stora-bygget-ab', name: 'Stora Bygget AB', budget: 60 },
  { id: 'sma-entreprenor-ab', name: 'Små Entreprenör AB', budget: 80 },
  { id: 'villa-ekbacken', name: 'Villa Ekbacken', budget: 30 }
]

export default function NewReportPage() {
  const router = useRouter()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [start, setStart] = useState('07:00')
  const [end, setEnd] = useState('16:00')
  const [project, setProject] = useState(projects[0].id)
  const [type, setType] = useState('work')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [overBudget, setOverBudget] = useState(false)
  const [aetaComment, setAetaComment] = useState('')
  const [aetaImage, setAetaImage] = useState<File | null>(null)

  const typeOptions = [
    { id: 'work', label: 'Arbete' },
    { id: 'natt', label: 'Natt' },
    { id: 'vabb', label: 'VAB' },
    { id: 'sjuk', label: 'Sjuk' },
    { id: 'frånvaro', label: 'Frånvaro' }
  ]

  useEffect(() => {
    if (type === 'natt') {
      setStart('22:00')
      setEnd('06:00')
    } else if (type === 'work') {
      setStart('07:00')
      setEnd('16:00')
    }
  }, [type])

  const calcHours = () => {
    if (type === 'work' || type === 'natt') {
      const [h1, m1] = start.split(':').map(Number)
      const [h2, m2] = end.split(':').map(Number)
      let hours = (h2 + m2 / 60) - (h1 + m1 / 60)
      if (type === 'natt' && hours <= 0) hours += 24
      return Math.max(0, hours).toFixed(2)
    }
    return "0.00"
  }

  async function saveReportLocally(report: any) {
    const db = await openDB('frost-db', 1, { upgrade(db) { db.createObjectStore('offline_reports', { keyPath: 'id', autoIncrement: true }) } })
    await db.add('offline_reports', report)
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      // TS fix – cast explicit
      (navigator.serviceWorker.ready as Promise<ServiceWorkerRegistration>).then(
        registration => (registration as any).sync && (registration as any).sync.register('syncTimeReports')
      )
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const hours = parseFloat(calcHours())
    const budget = projects.find(p => p.id === project)?.budget ?? 0
    const report = { date, start, end, hours, project, type, notes }
    // OFFLINE SAVE
    if (!navigator.onLine) {
      await saveReportLocally(report)
      alert('Du är offline – rapport sparad, synkas när nät finns!')
      setSaved(true)
      setTimeout(() => router.push('/dashboard'), 1500)
      return
    }
    // Hämta total hours
    const { data: { user } } = await supabase.auth.getUser()
    const { data: allReports } = await supabase
      .from('time_reports').select('hours').eq('project_id', project)
    const totalReported = (allReports?.map((r:any)=>r.hours).reduce((a:number,b:number)=>a+b,0)??0) + hours
    if (type === 'work' && totalReported > budget && !overBudget) {
      setOverBudget(true)
      return
    }
    // Ordinarie rapport
    let savedError = null
    if (type === 'work' || type === 'natt') {
      const { error } = await supabase
        .from('time_reports')
        .insert({
          date, start_time: start, end_time: end, hours, project_id: project,
          type, notes, user_id: user?.id
        })
      savedError = error
    } else {
      const { error } = await supabase
        .from('time_reports')
        .insert({ date, hours: 0, type, notes, user_id: user?.id })
      savedError = error
    }
    // ÄTA SAVE
    if (overBudget) {
      let imageUrl = ''
      await supabase.from('aeta_requests').insert({
        project_id: project, employee_id: user?.id, hours,
        comment: aetaComment, image_url: imageUrl, status: 'pending'
      })
    }
    if (savedError) {
      alert('Kunde inte spara: ' + savedError.message)
      return
    }
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      router.push('/dashboard')
    }, 1700)
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <ServiceWorkerRegister /> {/* Viktigt! */}
      <div className="rounded-3xl shadow-lg bg-white bg-opacity-80 border border-blue-100 p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-3">
          <FrostLogo size={32} />
          <h1 className="font-bold text-xl text-blue-700">Ny Tidrapport</h1>
        </div>
        {overBudget && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <form
              className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col gap-5"
              onSubmit={async e => {
                e.preventDefault()
                setOverBudget(false)
                await handleSubmit(e as any)
              }}
            >
              <h2 className="text-lg text-blue-700 font-bold mb-2">ÄTA-arbete? Du är över projektbudget!</h2>
              <textarea
                className="rounded px-4 py-2 border border-blue-200"
                rows={3}
                placeholder="Beskriv extraarbete och varför"
                value={aetaComment}
                onChange={e => setAetaComment(e.target.value)}
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={e => setAetaImage(e.target.files?.[0] ?? null)}
              />
              <button className="bg-blue-600 text-white py-2 rounded font-bold" type="submit">
                Skicka ÄTA och rapportera
              </button>
            </form>
          </div>
        )}
        <form className="flex flex-col gap-5 mt-5" onSubmit={handleSubmit}>
          <input
            className="rounded px-4 py-2 border border-blue-200 text-lg focus:ring-2 focus:ring-blue-300"
            type="date"
            name="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
          <div className="flex gap-2 flex-wrap">
            {typeOptions.map(opt => (
              <label
                key={opt.id}
                className={`px-3 py-1 rounded-full border ${type === opt.id ? 'bg-blue-600 text-white border-blue-700 font-bold' : 'bg-blue-50 border-blue-200 text-blue-600'} transition cursor-pointer`}
              >
                <input
                  type="radio"
                  name="type"
                  value={opt.id}
                  checked={type === opt.id}
                  onChange={() => setType(opt.id)}
                  className="hidden"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {(type === 'work' || type === 'natt') && (
            <div className="flex gap-2 items-center flex-wrap">
              <div>
                <label htmlFor="start" className="text-sm text-blue-500">Började:</label>
                <input
                  className="ml-2 rounded px-3 py-2 border border-blue-200 text-lg w-[110px]"
                  type="time"
                  id="start"
                  name="start"
                  value={start}
                  onChange={e => setStart(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="end" className="text-sm text-blue-500">Slutade:</label>
                <input
                  className="ml-2 rounded px-3 py-2 border border-blue-200 text-lg w-[110px]"
                  type="time"
                  id="end"
                  name="end"
                  value={end}
                  onChange={e => setEnd(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
          {(type === 'work' || type === 'natt') && (
            <select
              className="rounded px-4 py-2 border border-blue-200 text-lg bg-blue-50"
              value={project}
              onChange={e => setProject(e.target.value)}
              required
            >
              {projects.map(p =>
                <option key={p.id} value={p.id}>{p.name}</option>
              )}
            </select>
          )}
          <textarea
            className="rounded px-4 py-2 border border-blue-200 text-lg"
            name="notes"
            placeholder="Kommentar"
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          {(type === 'work' || type === 'natt') ? (
            <div className="text-blue-700 font-semibold text-center">
              Totalt rapporterade timmar: <span className="font-bold">{calcHours()}h</span>
            </div>
          ) : null}
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-bold text-lg mt-2" type="submit">
            Spara tidrapport
          </button>
          {saved &&
            <div className="bg-green-100 text-green-800 font-bold rounded py-2 mt-3 text-center animate-pulse">
              Rapport sparad! Du skickas till dashboard...
            </div>
          }
        </form>
      </div>
    </div>
  )
}

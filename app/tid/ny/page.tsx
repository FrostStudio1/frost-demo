import { createClient } from '../../utils/supabase/server'
import { createTimeEntry } from './actions'

export default async function NewTimeEntryPage({
  searchParams,
}: {
  searchParams?: { project?: string; err?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="mx-auto max-w-xl card p-8">
        <h1 className="text-xl font-semibold">Rapportera tid</h1>
        <p className="mt-2">Du är inte inloggad. <a className="underline" href="/login">Logga in</a></p>
      </div>
    )
  }

  // Hämta projekt att välja på
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .order('created_at', { ascending: false })

  const today = new Date()
    .toISOString()
    .slice(0, 10) // YYYY-MM-DD

  const preselectedProject = searchParams?.project || ''

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {searchParams?.err && (
        <div className="rounded-xl border border-red-300 bg-red-50 text-red-700 p-4">
          <p className="font-medium">Fel</p>
          <p className="text-sm mt-1 break-words">{decodeURIComponent(searchParams.err)}</p>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Rapportera tid</h1>
          <a href="/projects" className="text-sm underline">Tillbaka till projekt</a>
        </div>

        <form action={createTimeEntry} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Projekt */}
          <div className="sm:col-span-2">
            <label className="label">Projekt</label>
            <select
              name="project_id"
              className="input"
              defaultValue={preselectedProject || ''}
              required
              {...(preselectedProject ? { disabled: false } : {})}
            >
              <option value="" disabled>
                Välj projekt…
              </option>
              {(projects ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {/* Om du vill låsa projektvalet när query-param finns, byt disabled: true i selecten ovan */}
          </div>

          {/* Datum */}
          <div>
            <label className="label">Datum</label>
            <input name="date" type="date" className="input" defaultValue={today} required />
          </div>

          {/* Typ av arbete */}
          <div>
            <label className="label">Typ av arbete (valfritt)</label>
            <input name="work_type" type="text" className="input" placeholder="Snickeri, Rivning..." />
          </div>

          {/* Start / Slut */}
          <div>
            <label className="label">Start</label>
            <input name="start_time" type="time" className="input" defaultValue="07:00" required />
          </div>
          <div>
            <label className="label">Slut</label>
            <input name="end_time" type="time" className="input" defaultValue="16:00" required />
          </div>

          {/* Rast */}
          <div className="sm:col-span-2">
            <label className="label">Rast (minuter)</label>
            <input name="break_minutes" type="number" min={0} step={5} className="input" defaultValue={30} />
          </div>

          <div className="sm:col-span-2 flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary px-5 py-2">Spara tid</button>
            <a href="/projects" className="btn-secondary px-5 py-2">Avbryt</a>
          </div>
        </form>
      </div>
    </div>
  )
}




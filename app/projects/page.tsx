import { createClient } from '../utils/supabase/server'
import { createProject } from './actions'

function Notice({
  type = 'info',
  children,
}: {
  type?: 'info' | 'success' | 'error'
  children: React.ReactNode
}) {
  const styles =
    type === 'success'
      ? 'border-green-300 bg-green-50 text-green-700'
      : type === 'error'
      ? 'border-red-300 bg-red-50 text-red-700'
      : 'border-blue-300 bg-blue-50 text-blue-700'
  return <div className={`rounded-xl border p-3 ${styles}`}>{children}</div>
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: { created?: string; err?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <h1 className="text-xl font-semibold">Projekt</h1>
        <p className="mt-2">
          Du är inte inloggad. <a className="underline" href="/login">Logga in</a>
        </p>
      </div>
    )
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, customer_name, created_at, base_rate_sek, budgeted_hours')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Projekt</h1>
        <a href="/" className="text-sm underline">Hem</a>
      </div>

      {searchParams?.created === '1' && (
        <Notice type="success">Projekt skapat! ✅</Notice>
      )}
      {searchParams?.err && (
        <Notice type="error">{decodeURIComponent(searchParams.err)}</Notice>
      )}

      {/* Lista projekt */}
      <div className="space-y-3">
        {(projects ?? []).length === 0 ? (
          <Notice>Inga projekt ännu – skapa ditt första här nedanför.</Notice>
        ) : (
          (projects ?? []).map((p) => (
            <div key={p.id} className="rounded-xl border bg-white p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{p.name}</div>
                  <div className="text-sm text-gray-600">
                    {p.customer_name || 'Kund saknas'}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Baspris: {Number(p.base_rate_sek ?? 0).toLocaleString('sv-SE')} kr/h
                    {Number(p.budgeted_hours ?? 0) > 0 && (
                      <> • Budget: {p.budgeted_hours} tim</>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <a
                    className="text-sm underline"
                    href={`/tid/ny?project=${p.id}`}
                  >
                    Rapportera tid
                  </a>
                  <a
                className="text-sm underline text-blue-600 hover:text-blue-800"
                href={`/projects/${p.id}/invoice`}
                >
               Visa faktura
                </a>


                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Skapa nytt projekt */}
      <div className="rounded-xl border bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Skapa nytt projekt</h2>
        <form action={createProject} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Projektnamn */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Projektnamn</label>
            <input
              name="name"
              type="text"
              className="input w-full"
              placeholder="Altanbygge, Köksrenovering…"
              required
            />
          </div>

          {/* Kundinformation */}
          <div className="sm:col-span-2 mt-2">
            <h3 className="text-lg font-semibold text-gray-800">Kundinformation</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kundnamn</label>
            <input
              name="customer_name"
              type="text"
              className="input w-full"
              placeholder="Kundens företag eller namn"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kundens e-post</label>
            <input
              name="customer_email"
              type="email"
              className="input w-full"
              placeholder="kund@exempel.se"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Kundens adress</label>
            <input
              name="customer_address"
              type="text"
              className="input w-full"
              placeholder="Exempelgatan 12, 123 45 Stockholm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Kundens org.nr (valfritt)</label>
            <input
              name="customer_orgnr"
              type="text"
              className="input w-full"
              placeholder="556677-8899"
            />
          </div>

          {/* Ekonomi */}
          <div className="sm:col-span-2 mt-2">
            <h3 className="text-lg font-semibold text-gray-800">Ekonomi</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Baspris / tim (SEK)</label>
            <input
              name="base_rate_sek"
              type="number"
              min={0}
              step="1"
              className="input w-full"
              defaultValue={360}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (timmar)</label>
            <input
              name="budgeted_hours"
              type="number"
              min={0}
              step="1"
              className="input w-full"
              placeholder="100"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary px-5 py-2">Skapa projekt</button>
            <a href="/" className="btn-secondary px-5 py-2">Avbryt</a>
          </div>
        </form>
      </div>
    </div>
  )
}

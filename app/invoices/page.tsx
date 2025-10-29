import { createClient } from '../utils/supabase/server'
import InvoiceDownload from '../projects/[id]/invoice/InvoiceDownload'

function sek(n: number) {
  try {
    return Number(n ?? 0).toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })
  } catch {
    return `${Math.round(Number(n ?? 0))} kr`
  }
}

function fmtDate(d: string | Date) {
  const dt = typeof d === 'string' ? new Date(d) : d
  return dt.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

type InvoicePageProps = {
  params: { id: string }
}

export default async function InvoicePage(props: InvoicePageProps) {
  const { id } = props.params
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <h1 className="text-xl font-semibold">Faktura</h1>
        <p className="mt-2">Du är inte inloggad. <a className="underline" href="/login">Logga in</a></p>
      </div>
    )
  }

  // Projekt + kundinfo
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .select('id, name, base_rate_sek, budgeted_hours, created_at, customer_name, customer_email, customer_address, customer_orgnr')
    .eq('id', id)
    .single()

  if (projErr || !project) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <h1 className="text-xl font-semibold">Faktura</h1>
        <div className="mt-4 rounded-xl border border-red-300 bg-red-50 text-red-700 p-4">
          Kunde inte hämta projekt.
        </div>
      </div>
    )
  }

  // FÄRDIGA fakturarader (grupper enligt OB)
  const { data: lines, error: linesErr } = await supabase
    .from('v_invoice_lines')
    .select('description, quantity_hours, unit, rate_sek, amount_sek')
    .eq('project_id', project.id)
    .order('description', { ascending: true })

  if (linesErr) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <h1 className="text-xl font-semibold">Faktura</h1>
        <div className="mt-4 rounded-xl border border-red-300 bg-red-50 text-red-700 p-4">
          Kunde inte hämta fakturarader: {linesErr.message}
        </div>
      </div>
    )
  }

  const rows = lines ?? []
  const totalHours = rows.reduce((s, r) => s + Number(r.quantity_hours ?? 0), 0)
  const totalAmount = rows.reduce((s, r) => s + Number(r.amount_sek ?? 0), 0)

  const rotAvdrag = Math.round(totalAmount * 0.3 * 100) / 100
  const attBetala = Math.max(0, Math.round((totalAmount - rotAvdrag) * 100) / 100)

  const invoiceNo = `INV-${String(project.id).slice(0, 8).toUpperCase()}`
  const today = new Date()
  const due = new Date()
  due.setDate(today.getDate() + 30)

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Faktura</h1>
        <div className="flex gap-2">
          <a href={`/projects`} className="btn-secondary px-4 py-2">Tillbaka</a>
          <InvoiceDownload targetId="pdf-invoice" fileName={`faktura-${invoiceNo}.pdf`} />
        </div>
      </div>

      <div id="pdf-invoice" className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-3xl font-extrabold text-blue-700">Frost Bygg</div>
              <div className="text-gray-500 mt-1 text-sm">
                Org.nr: 556677-8899<br />
                Gatuadress 1, 123 45 Stad<br />
                info@frostbygg.se
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">FAKTURA</div>
              <div className="text-sm text-gray-600 mt-1">
                Fakturanr: <span className="font-medium text-gray-900">{invoiceNo}</span><br />
                Datum: <span className="font-medium text-gray-900">{fmtDate(today)}</span><br />
                Förfallodatum: <span className="font-medium text-gray-900">{fmtDate(due)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kund + meta */}
        <div className="p-6 sm:p-8 border-b grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kundinformation</div>
            <div className="text-lg font-medium mt-1">{project.customer_name || 'Ej angiven kund'}</div>
            {project.customer_orgnr && (
              <div className="text-sm text-gray-600">Org.nr: {project.customer_orgnr}</div>
            )}
            {project.customer_email && (
              <div className="text-sm text-gray-600">{project.customer_email}</div>
            )}
            {project.customer_address && (
              <div className="text-sm text-gray-600">{project.customer_address}</div>
            )}
          </div>

          <div className="sm:text-right">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fakturainfo</div>
            <div className="text-sm text-gray-700 mt-1">Betalningsvillkor: 30 dagar netto</div>
            <div className="text-sm text-gray-700">Bankgiro: 123-4567</div>
            <div className="text-sm text-gray-700">
              Baspris: <span className="font-medium">{sek(project.base_rate_sek ?? 0)} / tim</span>
            </div>
            <div className="text-sm text-gray-700">
              Projekt skapat: <span className="font-medium">{fmtDate(project.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Fakturarader (grupperade enligt OB) */}
        <div className="p-6 sm:p-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="text-left font-semibold p-3 rounded-l-lg">Beskrivning</th>
                <th className="text-right font-semibold p-3">Antal</th>
                <th className="text-right font-semibold p-3">Enhet</th>
                <th className="text-right font-semibold p-3">Á-pris</th>
                <th className="text-right font-semibold p-3 rounded-r-lg">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-500 italic" colSpan={5}>Inga loggade timmar ännu.</td>
                </tr>
              )}
              {rows.map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-3">{r.description}</td>
                  <td className="p-3 text-right">{Number(r.quantity_hours ?? 0).toFixed(2)}</td>
                  <td className="p-3 text-right">{r.unit || 'tim'}</td>
                  <td className="p-3 text-right">{sek(Number(r.rate_sek ?? 0))}</td>
                  <td className="p-3 text-right font-medium">{sek(Number(r.amount_sek ?? 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summering */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div></div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Totalt antal timmar</span>
                <span className="font-medium">{totalHours.toFixed(2)} tim</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Summa arbetskostnad</span>
                <span className="font-semibold">{sek(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Preliminärt ROT-avdrag (30%)</span>
                <span className="font-semibold text-green-700">−{sek(rotAvdrag)}</span>
              </div>
              <div className="pt-3 border-t flex justify-between text-base">
                <span className="font-bold">ATT BETALA</span>
                <span className="font-extrabold">{sek(attBetala)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-6 border-t text-center text-xs text-gray-500">
          Frost Bygg | Godkänd för F-skatt | Momsreg.nr: SE556677889901
        </div>
      </div>
    </div>
  )
}

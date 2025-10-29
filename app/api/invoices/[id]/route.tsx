export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import React from 'react'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { pdf } from '@react-pdf/renderer'
import InvoiceDoc from '../../../../lib/pdf/InvoiceDoc'
import { v4 as uuidv4 } from 'uuid'

function formatSE(dateStr?: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('sv-SE')
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id
    if (!invoiceId) {
      return NextResponse.json({ error: 'Saknar invoice id' }, { status: 400 })
    }

    const supabase = createClient()

    // 1) Hämta fakturan
    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .select('id, number, issue_date, due_date, tenant_id, project_id, client_id')
      .eq('id', invoiceId)
      .single()

    if (invErr || !invoice) {
      return NextResponse.json({ error: invErr?.message || 'Faktura saknas' }, { status: 404 })
    }

    // 2) Hämta tenant, kund, rader
    const [{ data: tenant, error: tErr }, { data: client, error: cErr }, { data: lines, error: lErr }] =
      await Promise.all([
        supabase.from('tenants').select('id, name').eq('id', invoice.tenant_id).maybeSingle(),
        supabase.from('clients').select('id, name, address, email').eq('id', invoice.client_id).maybeSingle(),
        supabase
          .from('invoice_lines')
          .select('description, quantity, unit, rate_sek, amount_sek')
          .eq('invoice_id', invoice.id),
      ])

    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 })
    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 })
    if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 })

    // 3) Rendera PDF → Buffer (server)
    const buffer = await pdf(
      <InvoiceDoc
        invoice={{
          number: invoice.number,
          issue_date: formatSE(invoice.issue_date),
          due_date: formatSE(invoice.due_date),
        }}
        tenant={{ name: tenant?.name || 'Företag' }}
        client={{
          name: client?.name || 'Kund',
          address: client?.address || '',
          email: client?.email || '',
        }}
        lines={lines || []}
      />
    ).toBuffer()

    // 4) Ladda upp i Storage (bucket: invoices)
    const filePath = `invoices/${invoice.id}-${uuidv4()}.pdf`
    const { error: upErr } = await supabase.storage
      .from('invoices')
      .upload(filePath, buffer, { contentType: 'application/pdf', upsert: true })
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

    // 5) Public URL (om bucket är public)
    const { data: pub } = supabase.storage.from('invoices').getPublicUrl(filePath)
    return NextResponse.json({ url: pub.publicUrl }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}

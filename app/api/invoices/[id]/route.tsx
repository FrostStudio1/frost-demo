import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { pdf } from '@react-pdf/renderer'
import InvoiceDoc from '../../../../lib/pdf/InvoiceDoc'
import { v4 as uuidv4 } from 'uuid'

function formatSE(dateStr?: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('sv-SE')
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: invoiceId } = await context.params
  try {
    if (!invoiceId) {
      return NextResponse.json({ error: 'Saknar invoice id' }, { status: 400 })
    }

    const supabase = createClient()

    // 1) Hämta fakturan - try with amount first, then without if column doesn't exist
    let { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .select('id, number, issue_date, due_date, tenant_id, project_id, client_id, customer_name, desc, amount')
      .eq('id', invoiceId)
      .single()

    // If amount column doesn't exist, retry without it
    if (invErr && (invErr.code === '42703' || invErr.message?.includes('does not exist') || invErr.message?.includes('amount'))) {
      const fallback = await supabase
        .from('invoices')
        .select('id, number, issue_date, due_date, tenant_id, project_id, client_id, customer_name, desc')
        .eq('id', invoiceId)
        .single()

      if (fallback.error || !fallback.data) {
        return NextResponse.json({ error: fallback.error?.message || invErr?.message || 'Faktura saknas' }, { status: 404 })
      }

      invoice = { ...fallback.data, amount: 0 } // Set default amount if column doesn't exist
      invErr = null
    }

    if (invErr || !invoice) {
      return NextResponse.json({ error: invErr?.message || 'Faktura saknas' }, { status: 404 })
    }

    // 2) Hämta tenant, kund, rader
    const [tenantResult, clientResult, linesResult] = await Promise.all([
      supabase.from('tenants').select('id, name, org_number, address').eq('id', invoice.tenant_id).maybeSingle(),
      invoice.client_id 
        ? supabase.from('clients').select('id, name, address, email, org_number').eq('id', invoice.client_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from('invoice_lines')
        .select('description, quantity, unit, rate_sek, amount_sek')
        .eq('invoice_id', invoice.id),
    ])

    const tenant = tenantResult.data
    const client = clientResult.data || {
      name: invoice.customer_name || 'Okänd kund',
      address: null,
      email: null,
      org_number: null,
    }
    const lines = linesResult.data || []

    // Om inga rader finns, skapa en från faktura-data
    let finalLines = lines
    const invoiceAmount = (invoice.amount !== undefined && invoice.amount !== null) ? Number(invoice.amount) : 0
    if (lines.length === 0 && invoice.desc && invoiceAmount > 0) {
      finalLines = [{
        description: invoice.desc,
        quantity: 1,
        unit: 'st',
        rate_sek: invoiceAmount,
        amount_sek: invoiceAmount,
      }]
    } else if (lines.length === 0 && invoice.desc) {
      // If no amount but has description, create a line item with 0 amount
      finalLines = [{
        description: invoice.desc,
        quantity: 1,
        unit: 'st',
        rate_sek: 0,
        amount_sek: 0,
      }]
    }

    // 3) Rendera PDF → Stream
    const pdfStream = await pdf(
      <InvoiceDoc
        invoice={{
          number: invoice.number || invoice.id.slice(0, 8),
          issue_date: formatSE(invoice.issue_date),
          due_date: formatSE(invoice.due_date),
        }}
        tenant={{ 
          name: tenant?.name || 'Frost Bygg',
          org_number: tenant?.org_number,
          address: tenant?.address,
        }}
        client={{
          name: client.name || 'Okänd kund',
          address: client.address || '',
          email: client.email || '',
          org_number: client.org_number || null,
        }}
        lines={finalLines}
      />
    ).toBlob()

    // 4) Returnera PDF direkt som blob (för snabbare nedladdning)
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', `attachment; filename="faktura-${invoice.number || invoice.id.slice(0, 8)}.pdf"`)
    
    return new Response(pdfStream, {
      status: 200,
      headers,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}

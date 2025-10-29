// lib/pdf/InvoiceDoc.tsx
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11 },
  h1: { fontSize: 22, marginBottom: 8 },
  h2: { fontSize: 14, marginTop: 12, marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  small: { color: '#555' },
  tableHead: { flexDirection: 'row', borderBottom: '1 solid #000', paddingBottom: 4, marginTop: 10 },
  th: { flex: 1, fontWeight: 700 },
  tr: { flexDirection: 'row', paddingVertical: 4, borderBottom: '1 solid #eee' },
  td: { flex: 1 },
  totalRow: { marginTop: 10, borderTop: '2 solid #000', paddingTop: 8 },
})

type Line = {
  description: string
  quantity: number
  unit: string
  rate_sek: number
  amount_sek: number
}

export default function InvoiceDoc({
  invoice,
  tenant,
  client,
  lines,
}: {
  invoice: { number: string | number; issue_date?: string; due_date?: string }
  tenant: { name: string }
  client: { name: string; address?: string; email?: string }
  lines: Line[]
}) {
  const total = (lines || []).reduce((s, l) => s + (l.amount_sek || 0), 0)
  const rot = total * 0.3
  const toPay = total - rot

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>FAKTURA</Text>

        <View style={styles.row}>
          <View>
            <Text>{tenant.name}</Text>
            <Text style={styles.small}>Org.nr: —</Text>
            <Text style={styles.small}>Adress</Text>
          </View>
          <View>
            <Text style={styles.small}>Fakturanr: {String(invoice.number ?? '')}</Text>
            <Text style={styles.small}>Datum: {invoice.issue_date ?? ''}</Text>
            <Text style={styles.small}>Förfallo: {invoice.due_date ?? ''}</Text>
          </View>
        </View>

        <Text style={styles.h2}>Faktura till</Text>
        <View>
          <Text>{client.name}</Text>
          {client.address ? <Text style={styles.small}>{client.address}</Text> : null}
          {client.email ? <Text style={styles.small}>{client.email}</Text> : null}
        </View>

        <View style={styles.tableHead}>
          <Text style={styles.th}>Beskrivning</Text>
          <Text style={styles.th}>Antal</Text>
          <Text style={styles.th}>Enhet</Text>
          <Text style={styles.th}>Á-pris</Text>
          <Text style={styles.th}>Summa</Text>
        </View>

        {(lines || []).map((l, i) => (
          <View key={i} style={styles.tr}>
            <Text style={styles.td}>{l.description}</Text>
            <Text style={styles.td}>{l.quantity}</Text>
            <Text style={styles.td}>{l.unit}</Text>
            <Text style={styles.td}>{l.rate_sek.toFixed(2)} kr</Text>
            <Text style={styles.td}>{l.amount_sek.toFixed(2)} kr</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <View style={styles.row}>
            <Text>Summa</Text>
            <Text>{total.toFixed(2)} kr</Text>
          </View>
          <View style={styles.row}>
            <Text>ROT (30%)</Text>
            <Text>-{rot.toFixed(2)} kr</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ fontWeight: 700 }}>ATT BETALA</Text>
            <Text style={{ fontWeight: 700 }}>{toPay.toFixed(2)} kr</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

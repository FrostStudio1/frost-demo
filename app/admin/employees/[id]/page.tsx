'use client'

import FrostLogo from '../../../components/FrostLogo'
import { useParams } from 'next/navigation'
import jsPDF from 'jspdf'
import { useState } from 'react'

type LonespecRow = { datum: string; projekt: string; timmar: number }

const employeeData = {
  erik: {
    name: "Erik Byggare",
    period: "Okt 2025",
    lön: 29200,
    ob: 2400,
    rows: [
      { datum: "2025-10-28", projekt: "Projekt A", timmar: 8 },
      { datum: "2025-10-27", projekt: "Projekt B", timmar: 6 }
    ]
  },
  vilmer: {
    name: "Vilmer Frost",
    period: "Okt 2025",
    lön: 29500,
    ob: 2600,
    rows: [
      { datum: "2025-10-29", projekt: "Projekt B", timmar: 10 },
      { datum: "2025-10-28", projekt: "Projekt A", timmar: 7 }
    ]
  }
}

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>()
  const user = employeeData[params?.id as keyof typeof employeeData] ?? employeeData.erik

  function drawLonespecPDF() {
    const doc = new jsPDF()
    doc.setFillColor(180,210,240); doc.rect(0,0,210,30,'F')
    doc.setFont('helvetica','bold'); doc.setTextColor(38,78,112); doc.setFontSize(24)
    doc.text("LÖNESPECIFIKATION", 20,18)
    doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.setTextColor(0,0,0)
    doc.text(`Anställd: ${user.name}`,20,35); doc.text(`Period: ${user.period}`,120,35)
    doc.text(`Lön: ${user.lön.toLocaleString('sv-SE')} SEK`,20,47)
    doc.text(`OB: ${user.ob.toLocaleString('sv-SE')} SEK`,75,47)
    doc.text(`Totalt utbetalt: ${(user.lön+user.ob).toLocaleString('sv-SE')} SEK`,120,47)
    doc.setDrawColor(210,230,250)
    doc.line(20,55,190,55)
    doc.setFont('helvetica','bold'); doc.setFontSize(12)
    doc.text("DAG",20,62); doc.text("PROJEKT",70,62); doc.text("TIMMAR",110,62)
    let y=70
    doc.setFont('helvetica','normal'); doc.setFontSize(11)
    user.rows.forEach(row=>{
      doc.text(row.datum,20,y); doc.text(row.projekt,70,y); doc.text(String(row.timmar),110,y); y+=8
    })
    doc.setTextColor(90,90,90); doc.setFontSize(10)
    doc.text("Frost Bygg • frostbygg.se • support@frostbygg.se • +46-700-123456",20,280)
    doc.save('lonespec.pdf')
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="rounded-3xl shadow-lg bg-white bg-opacity-80 border border-blue-100 p-8 max-w-xl w-full">
        <FrostLogo size={28} />
        <h1 className="font-bold text-xl text-blue-700 mb-4">Lönespec för {user.name}</h1>
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border">
          <div className="font-bold">Period:</div> {user.period}<br/>
          <div className="font-bold">Lön:</div> {user.lön} SEK<br/>
          <div className="font-bold">OB-tillägg:</div> {user.ob} SEK<br/>
          <div className="font-bold">Totalt utbetalt:</div> {user.lön + user.ob} SEK<br/>
          <div className="font-bold mt-2">Rapporterade tider:</div>
          {user.rows.map((row,i)=>
            <div key={i}>{row.datum}: {row.projekt}, {row.timmar}h</div>
          )}
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-5 font-bold text-base hover:bg-blue-700 transition"
          onClick={drawLonespecPDF}
        >
          Skapa & ladda ner PDF
        </button>
      </div>
    </div>
  )
}

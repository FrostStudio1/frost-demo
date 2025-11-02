'use client'

import { useState, useEffect } from 'react'

const facts = [
  "💡 Frost Bygg använder automatisk OB-beräkning enligt byggkollektivavtalet för att säkerställa korrekt löneräkning.",
  "⚡ Stämpelklockan är tillgänglig 24/7 och sparas automatiskt, så du kan navigera mellan sidor utan att förlora din stämpling.",
  "📊 Systemet avrundar automatiskt alla tidsrapporter till minst 0,5 timmar för enklare fakturering.",
  "🌍 GPS-funktionen hjälper dig att automatiskt påminnas när du närmar dig en arbetsplats.",
  "💼 Administratörer kan se alla anställdas aktivitet i realtid via Live Karta.",
  "📄 Fakturor skapas automatiskt med fakturarader från tidsrapporterna när du skapar dem från ett projekt.",
  "🔒 All data är säkert isolerad per företag (tenant) - ingen kan se andras data.",
  "🎯 Projektförlopp visar visuellt när du närmar dig budgeten med färgkodning.",
  "📱 Appen är helt mobilvänlig och fungerar perfekt på telefon, tablet och dator.",
  "🤖 AI-sammanfattning hjälper dig snabbt förstå projektstatus och fakturaöversikt.",
]

export default function DidYouKnow() {
  const [currentFact, setCurrentFact] = useState<string>('')
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Show a random fact on mount
    const randomFact = facts[Math.floor(Math.random() * facts.length)]
    setCurrentFact(randomFact)

    // Rotate facts every 10 seconds
    const interval = setInterval(() => {
      const newFact = facts[Math.floor(Math.random() * facts.length)]
      setCurrentFact(newFact)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  if (!show) return null

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800 relative">
      <button
        onClick={() => setShow(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label="Stäng"
      >
        ✕
      </button>
      <div className="flex items-start gap-3">
        <div className="text-2xl">💡</div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wide">
            Visste du att?
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {currentFact}
          </p>
        </div>
      </div>
    </div>
  )
}


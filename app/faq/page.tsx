'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import FrostLogo from '@/components/FrostLogo'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  {
    category: 'Stämpelklocka',
    question: 'Hur fungerar stämpelklockan?',
    answer: 'Stämpelklockan låter dig snabbt stämpla in och ut. Du väljer ett projekt och klickar på "Stämpla in". När du är klar, klickar du på "Stämpla ut". Systemet beräknar automatiskt OB-timmar (kväll, natt, helg) enligt byggkollektivavtalet och avrundar till minst 0,5 timmar.'
  },
  {
    category: 'Stämpelklocka',
    question: 'Vad är GPS auto-checkin?',
    answer: 'GPS auto-checkin startar automatiskt när du är inom 500 meter från en arbetsplats (kan konfigureras av admin). Du får en notifikation när du närmar dig arbetsplatsen för att påminna dig att stämpla in.'
  },
  {
    category: 'Stämpelklocka',
    question: 'Hur stämplar jag in manuellt?',
    answer: 'Gå till dashboard och välj projekt i stämpelklockan, klicka sedan på "Stämpla in". För manuell tidsrapportering kan du också gå till "Rapporter" → "Ny tidsrapport".'
  },
  {
    category: 'OB-beräkning',
    question: 'När gäller OB-tillägg?',
    answer: 'OB-tillägg gäller enligt byggkollektivavtalet: Vanlig tid (06:00-18:00), OB Kväll (18:00-22:00), OB Natt (22:00-06:00), och OB Helg (alla helger). Systemet delar automatiskt upp tiden om du jobbar över flera OB-perioder.'
  },
  {
    category: 'OB-beräkning',
    question: 'Hur avrundas timmar?',
    answer: 'Alla tidsrapporter avrundas automatiskt uppåt till minst 0,5 timmar för faktureringsenhet.'
  },
  {
    category: 'Projekt',
    question: 'Hur skapar jag ett nytt projekt?',
    answer: 'Gå till "Projekt" → "Nytt projekt" eller klicka på "Skapa" på dashboarden. Fyll i projektnamn, kund, och övrig information.'
  },
  {
    category: 'Projekt',
    question: 'Kan jag se projektstatus och förlopp?',
    answer: 'Ja, på projekt-sidan kan du se alla projekt med förloppsbalkar som visar timmar använda vs budgeterade timmar.'
  },
  {
    category: 'Lönespecifikation',
    question: 'Var hittar jag min lönespecifikation?',
    answer: 'Gå till "Rapporter" → "Lönespec" eller klicka på din användare i lönespec-sektionen. Du kan exportera som PDF eller CSV.'
  },
  {
    category: 'Lönespecifikation',
    question: 'Vem kan se min lönespecifikation?',
    answer: 'Du kan bara se din egen lönespecifikation. Administratörer kan se alla lönespecifikationer.'
  },
  {
    category: 'Administration',
    question: 'Hur lägger jag till en ny anställd?',
    answer: 'Endast administratörer kan lägga till anställda. Gå till "Anställda" → "Lägg till anställd" och fyll i information.'
  },
  {
    category: 'Administration',
    question: 'Hur skapar jag arbetsplatser för GPS?',
    answer: 'Gå till "Admin" → "Arbetsplatser" och klicka på "+ Lägg till arbetsplats". Ange namn, adress, GPS-koordinater (eller klicka "Använd min position"), radie och auto-checkin inställningar.'
  },
  {
    category: 'Administration',
    question: 'Var ser jag alla incheckade anställda?',
    answer: 'Gå till "Admin" → "Live Karta" för att se alla incheckade anställda med deras GPS-positioner i realtid.'
  },
  {
    category: 'Fakturor',
    question: 'Hur skapar jag en faktura?',
    answer: 'Gå till "Fakturor" → "Ny faktura" och välj projekt, kund och tidsperiod. Systemet genererar automatiskt fakturan baserat på rapporterade timmar.'
  },
  {
    category: 'ROT-avdrag',
    question: 'Hur skapar jag en ROT-ansökan?',
    answer: 'Gå till "ROT-avdrag" → "Ny ansökan" och fyll i kundinformation och projektuppgifter. Systemet skapar automatiskt en ansökan som skickas till Skatteverket.'
  },
  {
    category: 'Tekniska',
    question: 'Jag ser inte stämpelklockan, vad gör jag?',
    answer: 'Kontrollera att du har en employee-record. Gå till "Admin" → "Admin Debug" för att kontrollera din status och fixa eventuella problem.'
  },
  {
    category: 'Tekniska',
    question: 'Varför fungerar inte GPS?',
    answer: 'Kontrollera att du har gett webbläsaren tillstånd att använda din position. GPS fungerar bäst i webbläsare på mobil eller desktop med GPS-hårdvara.'
  },
  {
    category: 'Tekniska',
    question: 'Hur rapporterar jag en bugg?',
    answer: 'Gå till "Feedback" i menyn och välj "Buggrapport". Beskriv problemet så detaljerat som möjligt, inklusive skärmdumpar om möjligt.'
  },
]

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Alla')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['Alla', ...Array.from(new Set(faqs.map(faq => faq.category)))]

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'Alla' || faq.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col lg:flex-row">
      <Sidebar />
      
      <main className="flex-1 w-full lg:ml-0 overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center">
            <FrostLogo size={48} />
            <h1 className="text-4xl sm:text-5xl font-black mt-4 mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              FAQ - Vanliga Frågor
            </h1>
            <p className="text-gray-600 text-center">
              Hitta svar på dina frågor om Frost Bygg
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Sök efter frågor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">
                  Inga frågor matchade din sökning.
                </p>
              </div>
            ) : (
              filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      ?
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                          {faq.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Contact Support */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Fortfarande frågor?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Kontakta support eller rapportera en bugg via feedback-sidan.
            </p>
            <div className="flex gap-3">
              <a
                href="/feedback"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                💬 Kontakta Support
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


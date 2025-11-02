'use client'

import { useState } from 'react'
import { toast } from '@/lib/toast'

interface AISummaryProps {
  type: 'project' | 'invoice'
  data: any
  className?: string
}

export default function AISummary({ type, data, className = '' }: AISummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function generateSummary() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      })

      if (!res.ok) {
        throw new Error('Kunde inte generera sammanfattning')
      }

      const result = await res.json()
      setSummary(result.summary || 'Ingen sammanfattning kunde genereras.')
      setExpanded(true)
    } catch (err: any) {
      toast.error('Kunde inte generera sammanfattning: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!summary && !loading) {
    return (
      <div className={`bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-purple-800 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🤖 AI-sammanfattning
          </h3>
          <button
            onClick={generateSummary}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Genererar...' : 'Generera'}
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Klicka på "Generera" för att få en AI-genererad sammanfattning av {type === 'project' ? 'projektet' : 'fakturan'}.
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-purple-800 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          🤖 AI-sammanfattning
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-1 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
        >
          {expanded ? 'Dölj' : 'Visa'}
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Genererar sammanfattning...</p>
        </div>
      ) : summary && expanded ? (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {summary}
          </p>
        </div>
      ) : null}
      
      {summary && (
        <button
          onClick={generateSummary}
          disabled={loading}
          className="mt-3 text-sm text-purple-600 dark:text-purple-400 hover:underline"
        >
          {loading ? 'Genererar om...' : 'Generera om'}
        </button>
      )}
    </div>
  )
}


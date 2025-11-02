import { NextResponse } from 'next/server'

/**
 * AI-summarization using Hugging Face Inference API (free tier)
 * Summarizes projects, invoices, or other data
 */
export async function POST(req: Request) {
  try {
    const { type, data } = await req.json()

    // Build prompt based on type
    let prompt = ''
    
    if (type === 'project') {
      const { name, hours, budgetedHours, status, customerName, timeEntries } = data
      const entries = timeEntries?.slice(0, 20).map((e: any) => 
        `- ${e.date}: ${e.hours || 0}h ${e.ob_type || ''}`
      ).join('\n') || 'Inga tidsrapporter ännu'
      
      prompt = `Sammanfatta följande byggprojekt på svenska, max 150 ord:\n\n` +
        `Projektnamn: ${name}\n` +
        `Kund: ${customerName || 'Okänd'}\n` +
        `Status: ${status || 'Pågående'}\n` +
        `Timmar använda: ${hours || 0}h\n` +
        `Budgeterade timmar: ${budgetedHours || 'Ej angivet'}h\n` +
        `Tidsrapporter:\n${entries}\n\n` +
        `Ge en kort sammanfattning av projektets status, framsteg och eventuella problem.`
    } else if (type === 'invoice') {
      const { number, projectName, total, lines } = data
      const lineItems = lines?.slice(0, 30).map((l: any) => 
        `${l.description || 'Arbete'}: ${l.hours || 0}h @ ${l.rate || 0}kr = ${l.amount || 0}kr`
      ).join('\n') || 'Inga poster'
      
      prompt = `Sammanfatta följande faktura på svenska, max 100 ord:\n\n` +
        `Fakturanr: ${number}\n` +
        `Projekt: ${projectName || 'Okänt'}\n` +
        `Totalt: ${total || 0}kr\n` +
        `Poster:\n${lineItems}\n\n` +
        `Ge en kort beskrivning av vad fakturan innehåller.`
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    // Use Hugging Face Inference API (free, no auth needed for many models)
    // Using a lightweight summarization model
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/SEBIS/legal_t5_small_sv_summarization',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 200,
              min_length: 50,
            },
          }),
        }
      )

      if (!response.ok) {
        // Fallback: simple template-based summary
        return generateFallbackSummary(type, data)
      }

      const result = await response.json()
      
      if (result.error) {
        // Model is loading, use fallback
        return generateFallbackSummary(type, data)
      }

      const summary = Array.isArray(result) && result[0]?.summary_text 
        ? result[0].summary_text 
        : (result.summary_text || generateFallbackSummary(type, data).summary)

      return NextResponse.json({ 
        summary,
        model: 'huggingface',
      })
    } catch (error) {
      // Fallback on any error
      return generateFallbackSummary(type, data)
    }
  } catch (err: any) {
    console.error('AI summarize error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to generate summary' },
      { status: 500 }
    )
  }
}

function generateFallbackSummary(type: string, data: any) {
  if (type === 'project') {
    const { name, hours, budgetedHours, status } = data
    const progress = budgetedHours ? Math.round((hours / budgetedHours) * 100) : null
    
    let summary = `${name} är ${status || 'pågående'}. `
    summary += hours ? `${hours} timmar har rapporterats. ` : 'Inga timmar rapporterade ännu. '
    if (progress !== null) {
      summary += `Projektet är ${progress}% klart enligt budget. `
    }
    summary += 'Fortsätt följa upp med kunden regelbundet.'
    
    return NextResponse.json({ 
      summary,
      model: 'template',
    })
  } else if (type === 'invoice') {
    const { number, total, lines } = data
    const totalHours = lines?.reduce((sum: number, l: any) => sum + (l.hours || 0), 0) || 0
    
    let summary = `Faktura ${number} omfattar ${lines?.length || 0} poster. `
    summary += totalHours > 0 ? `Totalt ${totalHours} timmar. ` : ''
    summary += `Totalt belopp: ${total || 0}kr. `
    summary += 'Fakturan är redo att skickas till kunden.'
    
    return NextResponse.json({ 
      summary,
      model: 'template',
    })
  }
  
  return NextResponse.json({ 
    summary: 'Sammanfattning kunde inte genereras.',
    model: 'none',
  })
}


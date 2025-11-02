import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return NextResponse.json({ success: false, error: 'No time report data provided' }, { status: 400 })
    }

    const supabase = createClient()
    const { error } = await supabase.from('time_reports').insert(data)

    if (error) {
      console.error('Failed to store offline time report', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Invalid offline time report request', err)
    return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 })
  }
}

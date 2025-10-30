import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  const data = await req.json()
  const supabase = createClient()
  await supabase.from('time_reports').insert(data)
  return NextResponse.json({ success: true })
}

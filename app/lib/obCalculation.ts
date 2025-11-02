/**
 * OB-beräkning enligt byggkollektivavtalet
 * 
 * OB Kväll: 18:00-22:00 (150%)
 * OB Natt: 22:00-06:00 (150%)
 * OB Helg: Lördag och söndag hela dagen (200%)
 * Vanlig tid: 06:00-18:00 på vardagar (100%)
 */

export interface OBTimeSplit {
  regular: number // timmar vanlig tid
  evening: number // timmar OB kväll
  night: number   // timmar OB natt
  weekend: number // timmar OB helg
  total: number   // totala timmar
}

/**
 * Beräkna OB-timmar för ett arbetspass
 * Hanterar flera OB-typer i samma pass (t.ex. 14:00-20:00 = 4h vanlig + 2h kväll)
 */
export function calculateOBHours(
  startTime: string | null, // "HH:MM" or null
  endTime: string | null,   // "HH:MM" or null
  date: Date         // datumet för arbetspasset
): OBTimeSplit {
  const result: OBTimeSplit = {
    regular: 0,
    evening: 0,
    night: 0,
    weekend: 0,
    total: 0
  }

  // Validate inputs
  if (!startTime || !endTime) {
    console.warn('calculateOBHours: Missing startTime or endTime', { startTime, endTime })
    return result
  }

  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  // Validate parsed values
  if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
    console.warn('calculateOBHours: Invalid time format', { startTime, endTime })
    return result
  }
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  // Kolla om det är helg (lördag eller söndag)
  const dayOfWeek = date.getDay() // 0 = söndag, 6 = lördag
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  // Om helg → allt är OB helg
  if (isWeekend) {
    let totalMinutes = endMinutes - startMinutes
    if (totalMinutes < 0) totalMinutes += 24 * 60 // Hantera över midnatt
    
    result.weekend = totalMinutes / 60
    result.total = result.weekend
    return result
  }
  
  // Vardag: beräkna per OB-period
  // Vanlig tid: 06:00-18:00
  // OB Kväll: 18:00-22:00
  // OB Natt: 22:00-06:00 (nästa dag)
  
  const REGULAR_START = 6 * 60   // 06:00 = 360 min
  const REGULAR_END = 18 * 60    // 18:00 = 1080 min
  const EVENING_START = 18 * 60  // 18:00 = 1080 min
  const EVENING_END = 22 * 60    // 22:00 = 1320 min
  const NIGHT_START = 22 * 60    // 22:00 = 1320 min
  const NIGHT_END_DAY1 = 24 * 60 // 24:00 = 1440 min
  const NIGHT_END_DAY2 = 24 * 60 + 6 * 60 // 06:00 nästa dag = 1800 min
  
  // Normalisera tider (hantera över midnatt)
  let start = startMinutes
  let end = endMinutes
  
  // Om end < start, betyder det att vi går över midnatt
  const spansMidnight = end < start
  
  if (spansMidnight) {
    end = end + 24 * 60
  }
  
  // Beräkna timmar per OB-period
  // 1. Vanlig tid (06:00-18:00)
  if (start < REGULAR_END) {
    const regularEnd = Math.min(end, REGULAR_END)
    if (regularEnd > Math.max(start, REGULAR_START)) {
      result.regular += (regularEnd - Math.max(start, REGULAR_START)) / 60
    }
  }
  
  // 2. OB Kväll (18:00-22:00)
  const eveningStart = Math.max(start, EVENING_START)
  const eveningEnd = Math.min(end, EVENING_END)
  if (eveningEnd > eveningStart && end > EVENING_START && start < EVENING_END) {
    result.evening += (eveningEnd - eveningStart) / 60
  }
  
  // 3. OB Natt (22:00-06:00 nästa dag)
  // Del 1: 22:00-24:00 (samma dag)
  if (start < NIGHT_END_DAY1 && end > NIGHT_START) {
    const nightStart1 = Math.max(start, NIGHT_START)
    const nightEnd1 = Math.min(end, NIGHT_END_DAY1)
    if (nightEnd1 > nightStart1) {
      result.night += (nightEnd1 - nightStart1) / 60
    }
  }
  
  // Del 2: 00:00-06:00 (nästa dag) - bara om vi går över midnatt
  if (spansMidnight) {
    const nightStart2 = Math.max(0, start - 24 * 60) // Normalisera till dag 2
    const nightEnd2 = Math.min(end - 24 * 60, REGULAR_START)
    if (nightEnd2 > nightStart2 && nightStart2 < REGULAR_START) {
      result.night += (nightEnd2 - Math.max(0, nightStart2)) / 60
    }
  } else if (start >= NIGHT_START && end <= 24 * 60 + REGULAR_START) {
    // Fall där vi startar efter 22:00 men slutar före 06:00 nästa dag
    // (Detta borde hanteras i Del 1, men som extra säkerhet)
    if (end > NIGHT_END_DAY1) {
      const nightStart2 = 0
      const nightEnd2 = Math.min(end - 24 * 60, REGULAR_START)
      if (nightEnd2 > nightStart2) {
        result.night += (nightEnd2 - nightStart2) / 60
      }
    }
  }
  
  result.total = result.regular + result.evening + result.night + result.weekend
  return result
}

/**
 * Beräkna total lön baserat på OB-timmar och base rate
 */
export function calculateTotalAmount(
  obSplit: OBTimeSplit,
  baseRate: number
): number {
  return (
    obSplit.regular * baseRate * 1.0 +      // 100%
    obSplit.evening * baseRate * 1.5 +      // 150%
    obSplit.night * baseRate * 1.5 +        // 150%
    obSplit.weekend * baseRate * 2.0        // 200%
  )
}


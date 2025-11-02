/**
 * Avrunda timmar till minst 0,5 timmar
 * Används för tidsrapporter för att säkerställa minsta faktureringsenhet
 */
export function roundToMinimumHalfHour(hours: number): number {
  if (hours <= 0) return 0
  
  // Avrunda uppåt till närmaste 0.5
  return Math.ceil(hours * 2) / 2
}

/**
 * Avrunda alla OB-timmar i en split till minst 0,5
 */
export function roundOBTimeSplit(split: { regular: number; evening: number; night: number; weekend: number; total: number }): typeof split {
  return {
    regular: roundToMinimumHalfHour(split.regular),
    evening: roundToMinimumHalfHour(split.evening),
    night: roundToMinimumHalfHour(split.night),
    weekend: roundToMinimumHalfHour(split.weekend),
    total: roundToMinimumHalfHour(split.total),
  }
}


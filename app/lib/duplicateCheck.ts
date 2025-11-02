/**
 * Funktioner för att kontrollera dubbletter av tidsrapporter
 */

export interface TimeEntryDuplicateCheck {
  employee_id: string
  project_id: string | null
  date: string
  start_time: string | null
  end_time: string | null
  tenant_id: string
}

/**
 * Kontrollerar om en tidsrapport överlappar med befintliga
 * @param newEntry - Den nya tidsrapporten som ska kontrolleras
 * @param existingEntries - Befintliga tidsrapporter
 * @returns true om det finns en överlappning/dubblett
 */
export function checkTimeOverlap(
  newEntry: TimeEntryDuplicateCheck,
  existingEntries: Array<{
    start_time: string | null
    end_time: string | null
    project_id: string | null
    employee_id: string
  }>
): boolean {
  // Om ingen start_time/end_time (t.ex. VABB/sjuk), kontrollera bara datum + employee + projekt
  if (!newEntry.start_time || !newEntry.end_time) {
    return existingEntries.some(
      (entry) =>
        entry.employee_id === newEntry.employee_id &&
        entry.project_id === newEntry.project_id &&
        (!entry.start_time || !entry.end_time) // Bara matcha andra icke-tidsbaserade
    )
  }

  // Konvertera tid till minuter från midnatt för enkel jämförelse
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const newStart = timeToMinutes(newEntry.start_time)
  const newEnd = timeToMinutes(newEntry.end_time)

  // Hantera över midnatt (nattarbete)
  const newEndAdjusted = newEnd < newStart ? newEnd + 24 * 60 : newEnd

  return existingEntries.some((entry) => {
    // Samma employee och projekt
    if (
      entry.employee_id !== newEntry.employee_id ||
      entry.project_id !== newEntry.project_id
    ) {
      return false
    }

    // Om befintlig entry saknar tider, räknas det inte som överlappning
    if (!entry.start_time || !entry.end_time) {
      return false
    }

    const existingStart = timeToMinutes(entry.start_time)
    const existingEnd = timeToMinutes(entry.end_time)
    const existingEndAdjusted = existingEnd < existingStart ? existingEnd + 24 * 60 : existingEnd

    // Kontrollera överlappning
    // Överlappning om: newStart < existingEnd && newEnd > existingStart
    return newStart < existingEndAdjusted && newEndAdjusted > existingStart
  })
}

/**
 * Formaterar dubblettinformation för användaren
 */
export function formatDuplicateMessage(duplicateEntry: {
  start_time: string | null
  end_time: string | null
  project_id: string | null
}): string {
  if (!duplicateEntry.start_time || !duplicateEntry.end_time) {
    return 'Det finns redan en tidsrapport för detta datum och projekt.'
  }

  return `Det finns redan en tidsrapport som överlappar med tiden ${duplicateEntry.start_time} - ${duplicateEntry.end_time}.`
}


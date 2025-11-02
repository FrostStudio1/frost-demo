/**
 * GPS utilities för arbetsplats-tracking och avståndsberäkningar
 */

export interface GPSLocation {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp?: Date
}

export interface WorkSite {
  id: string
  name: string
  latitude: number
  longitude: number
  radius_meters: number
  auto_checkin_enabled?: boolean
  auto_checkin_distance?: number // meter (default 500)
}

/**
 * Beräkna avstånd mellan två GPS-koordinater i meter (Haversine formula)
 */
export function calculateDistance(
  loc1: { latitude: number; longitude: number },
  loc2: { latitude: number; longitude: number }
): number {
  const R = 6371e3 // Jorden's radie i meter
  const φ1 = (loc1.latitude * Math.PI) / 180
  const φ2 = (loc2.latitude * Math.PI) / 180
  const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180
  const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Avstånd i meter
}

/**
 * Hitta närmaste arbetsplats
 */
export function findNearestWorkSite(
  location: GPSLocation,
  workSites: WorkSite[]
): { site: WorkSite; distance: number } | null {
  if (workSites.length === 0) return null

  let nearest: { site: WorkSite; distance: number } | null = null

  for (const site of workSites) {
    const distance = calculateDistance(location, {
      latitude: site.latitude,
      longitude: site.longitude,
    })

    if (!nearest || distance < nearest.distance) {
      nearest = { site, distance }
    }
  }

  return nearest
}

/**
 * Kolla om en position är inom en arbetsplats radie
 */
export function isWithinWorkSite(
  location: GPSLocation,
  workSite: WorkSite
): boolean {
  const distance = calculateDistance(location, {
    latitude: workSite.latitude,
    longitude: workSite.longitude,
  })
  return distance <= workSite.radius_meters
}

/**
 * Kolla om position är inom auto-checkin avstånd
 */
export function isWithinAutoCheckinDistance(
  location: GPSLocation,
  workSite: WorkSite
): boolean {
  if (!workSite.auto_checkin_enabled) return false
  
  const autoCheckinDistance = workSite.auto_checkin_distance || 500 // Default 500m
  const distance = calculateDistance(location, {
    latitude: workSite.latitude,
    longitude: workSite.longitude,
  })
  
  return distance <= autoCheckinDistance
}

/**
 * Hämta GPS-position med browser API
 */
export function getCurrentPosition(): Promise<GPSLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || undefined,
          timestamp: new Date(position.timestamp),
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

/**
 * Starta kontinuerlig GPS-tracking
 */
export function startGPSTracking(
  callback: (location: GPSLocation) => void,
  intervalMs: number = 10 * 60 * 1000 // Default 10 minuter
): number {
  return window.setInterval(async () => {
    try {
      const location = await getCurrentPosition()
      callback(location)
    } catch (error) {
      console.error('GPS tracking error:', error)
    }
  }, intervalMs)
}

/**
 * Stoppa GPS-tracking
 */
export function stopGPSTracking(intervalId: number) {
  clearInterval(intervalId)
}


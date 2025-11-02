# 📍 GPS-Integration för Frost Bygg

## Översikt

GPS-integration skulle låta användare spåra sin position när de är incheckade och få påminnelser när de lämnar arbetsplatsen. Detta förbättrar fakturering och säkerhet.

---

## 🎯 Funktionalitet

### 1. **Automatisk Platsregistrering**
- När användare stämplar in, sparas deras GPS-position
- Position uppdateras periodiskt (var 10-15:e minut) medan tidsrapporten är aktiv
- Position sparas i `time_entries` eller en separat `gps_tracking` tabell

### 2. **Push-notifikationer**
- **Påminnelse vid utcheckning**: När användare lämnar arbetsplatsen (baserat på avstånd)
- **Glömt att stämpla ut**: Notifikation om användare lämnat platsen men fortfarande är incheckad
- **Kom ihåg att stämpla in**: Notifikation när användare närmar sig känd arbetsplats

### 3. **Admin-funktioner**
- **Arbetsplatser**: Admin kan definiera arbetsplatser med GPS-koordinater och radie
- **Översikt**: Se var alla anställda befinner sig (endast under aktiva tidsrapporter)
- **Verifiering**: Verifiera att tidsrapporter registrerats från rätt plats
- **Analytics**: Var jobbar användare mest? Hur lång tid på varje plats?

---

## 🏗️ Teknisk Implementation

### Backend (Database Schema)

```sql
-- Ny tabell för arbetsplatser
CREATE TABLE work_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER DEFAULT 100, -- Radie för vad som räknas som "på plats"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Utöka time_entries med GPS-data
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS start_location_lat DECIMAL(10, 8);
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS start_location_lng DECIMAL(11, 8);
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS end_location_lat DECIMAL(10, 8);
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS end_location_lng DECIMAL(11, 8);
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS work_site_id UUID REFERENCES work_sites(id);

-- Alternativ: Separat tabell för GPS-tracking (mer detaljerad)
CREATE TABLE gps_tracking_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id UUID NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy_meters INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gps_tracking_time_entry ON gps_tracking_points(time_entry_id);
CREATE INDEX idx_gps_tracking_tenant ON gps_tracking_points(tenant_id);
```

### Frontend Components

#### 1. **GPS Permission Request**
```typescript
// app/components/GPSPermission.tsx
export function requestGPSPermission() {
  return navigator.geolocation.getCurrentPosition(
    (position) => {
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      }
    },
    (error) => {
      console.error('GPS permission denied:', error)
      return null
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}
```

#### 2. **GPS Tracking Hook**
```typescript
// hooks/useGPSTracking.ts
export function useGPSTracking(timeEntryId: string | null) {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  
  useEffect(() => {
    if (!timeEntryId || !isTracking) return
    
    // Uppdatera position var 10:e minut
    const interval = setInterval(async () => {
      const pos = await requestGPSPermission()
      if (pos) {
        setLocation({ lat: pos.lat, lng: pos.lng })
        // Spara till backend
        await fetch('/api/gps/track', {
          method: 'POST',
          body: JSON.stringify({
            timeEntryId,
            lat: pos.lat,
            lng: pos.lng,
            accuracy: pos.accuracy
          })
        })
      }
    }, 10 * 60 * 1000) // 10 minuter
    
    return () => clearInterval(interval)
  }, [timeEntryId, isTracking])
  
  return { location, isTracking, setIsTracking }
}
```

#### 3. **Work Site Manager (Admin)**
```typescript
// app/admin/work-sites/page.tsx
export default function WorkSitesPage() {
  // Admin kan:
  // - Skapa nya arbetsplatser (namn, adress, GPS-koordinater)
  // - Sätt radie för varje plats
  // - Se alla anställda som är på platsen just nu
  // - Se historik för varje plats
}
```

#### 4. **Integration med TimeClock**
```typescript
// När användare stämplar in:
async function handleCheckIn() {
  // 1. Be om GPS-permission
  const location = await requestGPSPermission()
  
  // 2. Hitta närmaste arbetsplats
  const nearestSite = await findNearestWorkSite(location)
  
  // 3. Skapa time_entry med GPS-data
  await createTimeEntry({
    ...otherData,
    start_location_lat: location.lat,
    start_location_lng: location.lng,
    work_site_id: nearestSite?.id
  })
  
  // 4. Starta GPS-tracking
  startGPSTracking(timeEntryId)
}
```

---

## 🔔 Push Notifikationer

### Service Worker Setup
```javascript
// public/service-worker.js
self.addEventListener('notificationclick', (event) => {
  if (event.notification.tag === 'checkout-reminder') {
    event.notification.close()
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

// Background sync för GPS-tracking
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-gps-tracking') {
    event.waitUntil(syncGPSTracking())
  }
})
```

### Notifikationslogik
```typescript
// utils/notifications/gps.ts
export async function checkDistanceFromWorkSite(
  currentLocation: {lat: number, lng: number},
  workSite: {lat: number, lng: number, radius: number},
  isCheckedIn: boolean
) {
  const distance = calculateDistance(currentLocation, workSite)
  
  // Om användare är incheckad men lämnat platsen
  if (isCheckedIn && distance > workSite.radius) {
    await showNotification({
      title: 'Glöm inte att stämpla ut!',
      body: 'Du har lämnat arbetsplatsen. Kom ihåg att stämpla ut.',
      tag: 'checkout-reminder',
      requireInteraction: true
    })
  }
}
```

---

## 🗺️ UI/UX Design

### Dashboard Integration

**Stämpelklocka med GPS-indikator:**
```
┌─────────────────────────────────────┐
│  ⏰ Stämpelklocka                   │
│                                     │
│  📍 Arbetsplats: Frost Bygg AB      │
│  🗺️  GPS: Aktiverat                │
│                                     │
│  [🎯 Stämpla in]                    │
│                                     │
│  ℹ️ Din position spåras när du är   │
│     incheckad för fakturerings-     │
│     verifiering.                    │
└─────────────────────────────────────┘
```

### Admin View - Work Sites
```
┌─────────────────────────────────────┐
│  🗺️ Arbetsplatser                   │
│                                     │
│  [+ Lägg till arbetsplats]          │
│                                     │
│  📍 Frost Bygg AB                   │
│     123 45 Stockholm                │
│     Radie: 100m                     │
│     👥 3 anställda på platsen       │
│                                     │
│  📍 Köksrenovering - Södermalm      │
│     Storgatan 10, Stockholm         │
│     Radie: 50m                      │
│     👥 1 anställd på platsen        │
└─────────────────────────────────────┘
```

### Map View (Valfritt - framtida)
```
┌─────────────────────────────────────┐
│  🗺️ Live Översikt                   │
│                                     │
│  [Karta med markers för:]           │
│  • Arbetsplatser (blå pins)         │
│  • Incheckade anställda (gröna)    │
│  • GPS-track för dagens arbete      │
│                                     │
│  [Filtrera efter:]                  │
│  ☐ Visa endast aktiva              │
│  ☐ Visa historik                   │
└─────────────────────────────────────┘
```

---

## 🔒 Säkerhet & Privacy

### Dataskydd
1. **GDPR-Compliance**:
   - Användare kan stänga av GPS-tracking
   - Användare kan ta bort sina GPS-data
   - Data sparas endast när tidsrapport är aktiv
   - Automatisk radering efter X månader (konfigurerbart)

2. **Permissions**:
   - Explicit tillstånd krävs (inte automatiskt aktiverat)
   - Tydlig förklaring av vad GPS används till
   - Enkelt att stänga av i inställningar

3. **Access Control**:
   - Endast admin kan se alla positionsdata
   - Anställda ser endast sin egen position/historik
   - GPS-data är tenant-isolerad

---

## 📱 Implementation Steps

### Phase 1: Grundläggande GPS-tracking (2-3 dagar)
1. ✅ Lägg till GPS-kolumner i `time_entries`
2. ✅ Skapa `work_sites` tabell
3. ✅ Uppdatera TimeClock för att spara GPS vid incheckning
4. ✅ Visa arbetsplats i stämpelklockan
5. ✅ Admin kan skapa/redigera arbetsplatser

### Phase 2: Kontinuerlig tracking (2-3 dagar)
1. ⏳ Implementera `useGPSTracking` hook
2. ⏳ Background sync via Service Worker
3. ⏳ Spara GPS-punkter var 10:e minut
4. ⏳ Visa GPS-track på tidsrapport-detaljer

### Phase 3: Push-notifikationer (2-3 dagar)
1. ⏳ Service Worker setup
2. ⏳ Distansberäkning
3. ⏳ Notifikationer vid avstånd från plats
4. ⏳ "Glöm inte att stämpla ut"-påminnelser

### Phase 4: Admin-analytics (2-3 dagar)
1. ⏳ Karta med live-översikt
2. ⏳ Analytics: var jobbar användare mest?
3. ⏳ Historik för arbetsplatser
4. ⏳ Export av GPS-data

---

## 💰 Kostnad & Prestanda

### Kostnad
- **Lagring**: ~1KB per GPS-punkt (var 10:e minut = 48 punkter/dag/anställd)
- **100 anställda, 5 dagar/vecka**: ~10MB/månad
- **Minimal kostnad** på Supabase (gratis tier räcker långt)

### Prestanda
- **Batteriförbrukning**: GPS används bara var 10:e minut, inte kontinuerligt
- **Nätverk**: Endast vid position-uppdatering (1 request per 10 min)
- **Privacy**: Användare kan stänga av helt om de vill

---

## 🎨 UX Considerations

### För användare
- ✅ **Valfritt**: GPS är opt-in, inte påtvingat
- ✅ **Tydligt**: Visa tydligt när GPS är aktivt
- ✅ **Kontroll**: Enkelt att stänga av
- ✅ **Fördelar**: Förklara varför GPS hjälper (faktureringsverifiering)

### För admin
- ✅ **Översikt**: Se var alla befinner sig just nu
- ✅ **Verifiering**: Bekräfta att tidsrapporter är från rätt plats
- ✅ **Analytics**: Förstå var arbete utförs mest

---

## 🚀 Starta Implementation?

Om du vill implementera GPS-integration kan jag börja med:
1. **Phase 1**: Grundläggande GPS-tracking (spara position vid incheckning)
2. **Arbetsplatser**: Admin kan skapa och hantera arbetsplatser
3. **UI**: Uppdatera TimeClock för att visa GPS-status

Vill du att jag börjar implementera detta? 🚀


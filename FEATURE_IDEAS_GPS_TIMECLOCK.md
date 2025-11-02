# GPS-integration & Stämpelklocka - Feature Ideas

## GPS-integration för påminnelser

### Koncept
När en anställd lämnar en arbetsplats (baserat på GPS-position), få en push-notifikation: "Glöm inte att registrera tid!"

### Teknisk implementation

#### Backend:
1. **Background job** (Vercel Cron eller Supabase Edge Function):
   - Kolla alla aktiva tidsrapporter som saknar `end_time`
   - Hämta användarens senaste GPS-position (sparad i `user_locations` tabell)
   - Jämför med kända arbetsplatser (sparade i `worksites` tabell)
   - Om användaren har lämnat arbetsplats → skicka notifikation

2. **GPS-position tracking**:
   - Använd Web Geolocation API på klient-sidan
   - Spara position när användare rapporterar start-tid
   - Uppdatera position periodiskt (var 5-10 min) när tidsrapport är aktiv
   - Spara i `user_locations` tabell:
     ```sql
     CREATE TABLE user_locations (
       id UUID PRIMARY KEY,
       user_id UUID REFERENCES auth.users,
       tenant_id UUID,
       latitude DECIMAL(10,8),
       longitude DECIMAL(11,8),
       accuracy DECIMAL,
       timestamp TIMESTAMPTZ,
       time_entry_id UUID REFERENCES time_entries
     );
     ```

3. **Arbetsplatser** (worksites):
   - Admin kan lägga till arbetsplatser med namn + GPS-koordinater + radius
   - Sparas i `worksites` tabell

#### Frontend:
- Request GPS-permission när användare startar tidsrapport
- Periodisk position tracking (setInterval)
- Visa position på karta (valfritt)
- Push notification när användare lämnat arbetsplats

#### Push Notifications:
- Web Push API (Service Worker)
- Eller SMS via Twilio (premium feature)
- Eller email (fallback)

### Fördelar:
✅ Förhindrar glömda tidsrapporter
✅ Automatisk verifiering att användare är på rätt plats
✅ Kan användas för fakturering (visa att jobb utförts på plats)
✅ Analytics: var jobbar användare mest?

### Nackdelar:
⚠️ Kräver GPS-permission (privacy concerns)
⚠️ Batteriförbrukning (kontinuerlig GPS-tracking)
⚠️ Kräver Service Worker för background tracking
⚠️ Komplexitet (mer kod att underhålla)

---

## Stämpelklocka (Time Clock)

### Koncept
En enkel knapp för att "stämpla in" och "stämpla ut" - som en traditionell stämpelklocka.

### Teknisk implementation

#### Frontend:
1. **Stor "Stämpla in/ut"-knapp** på dashboard:
   - Visar aktuell status ("Incheckad" / "Utcheckad")
   - Visar start-tid om incheckad
   - Enkel klick för att stämpla in/ut

2. **Auto-fyll formulär**:
   - När användare stämplar in:
     - Automatiskt start-tid = nu
     - Välj projekt från dropdown (eller senaste projekt)
     - OB-typ = auto-detektera baserat på tid
   - När användare stämplar ut:
     - Automatiskt end-tid = nu
     - Spara tidsrapport direkt

3. **Aktiv tidsrapport-visning**:
   - Visa "aktiv tidsrapport" på dashboard om användare är incheckad
   - Visar: Projekt, Start-tid, Förflutna timmar (real-time)
   - "Stämpla ut"-knapp

#### Backend:
- Spara `time_entries` med `start_time` men ingen `end_time` när användare stämplar in
- Uppdatera `end_time` när användare stämplar ut
- Beräkna `hours_total` automatiskt

### Fördelar:
✅ Mycket snabbare än fullständigt formulär
✅ Minskar risken att glömma att rapportera
✅ Bättre UX för mobilanvändare
✅ Kan kombineras med GPS för verifiering

### Nackdelar:
⚠️ Mindre flexibilitet (kan inte lägga till kommentarer direkt)
⚠️ Kräver att användare minns projekt/OB-typ vid incheckning

---

## Rekommendation

### Föreslagen approach:

**Phase 1: Stämpelklocka (Enkelt att implementera, stort värde)**
1. ✅ Lägg till stämpelklocka-knapp på dashboard
2. ✅ Auto-spara tidsrapport vid stämpling
3. ✅ Visa aktiv tidsrapport på dashboard
4. ✅ Tillåt att stämpla in med projekt + OB-typ
5. ✅ Visa "Du är incheckad sedan [tid]" med countdown

**Phase 2: GPS-integration (Mer avancerat)**
1. ⚠️ Lägg till GPS-tracking som valfritt feature
2. ⚠️ Push-notifikationer när användare lämnar plats
3. ⚠️ Arbetsplats-hantering för admin
4. ⚠️ GPS-verifiering för fakturering

### Prioritering:
1. **Hög prioritet**: Stämpelklocka - snabb implementation, stort värde
2. **Medel prioritet**: GPS-tracking (valfritt) - för användare som vill ha det
3. **Låg prioritet**: Automatiska påminnelser via GPS

---

## Teknisk stack för stämpelklocka

### Minimal implementation:
- Ny komponent: `TimeClock.tsx`
- State: `isCheckedIn`, `activeTimeEntry`
- API: `/api/time-clock/checkin`, `/api/time-clock/checkout`
- UI: Stor knapp på dashboard med status

### Avancerad implementation:
- Real-time timer (visar förflutna timmar)
- Auto-detektera OB-typ baserat på klockslag
- Projekt-förslag (senaste projektet)
- GPS-option (om användare vill aktivera)

---

## Säkerhet & Privacy

### GPS:
- ✅ Endast med explicit tillstånd
- ✅ Spara position endast när tidsrapport är aktiv
- ✅ Möjlighet att stänga av GPS-tracking
- ✅ GDPR-compliant (användare kan ta bort data)

### Stämpelklocka:
- ✅ Verifiera att användare är inloggad
- ✅ Tenant-isolation (endast se egna stämplingar)
- ✅ Admin kan se alla stämplingar (för verifiering)


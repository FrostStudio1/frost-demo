# 🧪 Testing Guide - Scheduling System (Dag 1)

**Status:** 🟡 IN PROGRESS  
**Datum:** 2025-01-XX  
**Testare:** Cursor Pro

---

## 📋 Test Checklist

### ✅ 1. Backend API Tests

#### `/api/schedules` - POST (Create Schedule)
- [ ] **Test 1.1:** Skapa schema med alla fält
  - [ ] Anställd: Välj från dropdown
  - [ ] Projekt: Välj från dropdown
  - [ ] Starttid: Välj datum och tid
  - [ ] Sluttid: Välj datum och tid (> starttid)
  - [ ] Status: Välj "scheduled"
  - [ ] Anteckningar: (valfritt)
  - [ ] **Expected:** Schema skapas, success toast visas

- [ ] **Test 1.2:** Validering - Ogiltiga data
  - [ ] Sluttid < starttid → Error message
  - [ ] Duration > 12 timmar → Error message
  - [ ] Tomt employee_id → Error message
  - [ ] Tomt project_id → Error message

- [ ] **Test 1.3:** Conflict Detection
  - [ ] Skapa schema för anställd A, 09:00-17:00
  - [ ] Försök skapa schema för samma anställd, 10:00-18:00 → Conflict error
  - [ ] Försök skapa schema för samma anställd, 19:00-20:00 → Success (ingen konflikt)

#### `/api/schedules` - GET (List Schedules)
- [ ] **Test 1.4:** Hämta scheman med filters
  - [ ] Utan filters → Alla scheman för tenant
  - [ ] Med project_id → Endast scheman för projektet
  - [ ] Med employee_id → Endast scheman för anställd
  - [ ] Med start_date/end_date → Endast scheman i datumintervall
  - [ ] Med status → Endast scheman med status

- [ ] **Test 1.5:** Tenant Isolation
  - [ ] Logga in som Tenant A → Se Tenant A's scheman
  - [ ] Logga in som Tenant B → Se Tenant B's scheman (inte A's)

#### `/api/schedules/[id]` - PUT (Update Schedule)
- [ ] **Test 1.6:** Uppdatera schema
  - [ ] Ändra starttid → Schema uppdateras
  - [ ] Ändra sluttid → Schema uppdateras
  - [ ] Ändra status → Schema uppdateras
  - [ ] Ändra notes → Schema uppdateras

- [ ] **Test 1.7:** Conflict vid uppdatering
  - [ ] Uppdatera schema till överlappande tid → Conflict error

#### `/api/schedules/[id]` - DELETE
- [ ] **Test 1.8:** Ta bort schema
  - [ ] Ta bort schema → Schema tas bort, success toast

#### `/api/schedules/[id]/complete` - POST
- [ ] **Test 1.9:** Markera schema som slutfört
  - [ ] Markera som completed → Schema uppdateras
  - [ ] Time entry skapas automatiskt → Verifiera i time_entries tabell
  - [ ] Time entry har rätt employee_id, project_id, hours

#### `/api/schedules/conflicts` - GET
- [ ] **Test 1.10:** Kontrollera konflikter
  - [ ] Check conflict för överlappande tid → hasConflict: true
  - [ ] Check conflict för icke-överlappande tid → hasConflict: false
  - [ ] Check conflict med exclude_id → Exkluderar sig själv

#### `/api/absences` - POST/GET/PUT/DELETE
- [ ] **Test 1.11:** Frånvaro CRUD
  - [ ] Skapa frånvaro → Success
  - [ ] Lista frånvaro → Alla frånvaror visas
  - [ ] Uppdatera frånvaro → Success
  - [ ] Ta bort frånvaro → Success

---

### ✅ 2. Frontend Component Tests

#### ScheduleCalendar Component
- [ ] **Test 2.1:** Rendering
  - [ ] Kalendern renderas korrekt
  - [ ] Veckodagar visas korrekt (Måndag-Söndag)
  - [ ] Scheman visas i rätt kolumner
  - [ ] Loading state visas vid laddning

- [ ] **Test 2.2:** Navigation
  - [ ] "←" knapp → Går till föregående vecka
  - [ ] "→" knapp → Går till nästa vecka
  - [ ] "Idag" knapp → Går till aktuell vecka

- [ ] **Test 2.3:** Drag & Drop
  - [ ] Dra schema från en dag till annan → Schema flyttas
  - [ ] Konflikt-visualisering → Röd border när konflikt
  - [ ] Success feedback → Toast "Schema uppdaterat"

- [ ] **Test 2.4:** Mobile Drag & Drop
  - [ ] Touch drag fungerar (250ms delay)
  - [ ] Visual feedback när man drar
  - [ ] Drop zone highlight fungerar

- [ ] **Test 2.5:** Click to Edit
  - [ ] Klicka på schema → Modal öppnas med schema-data
  - [ ] Klicka på tomt område → Skapa nytt schema-modal

#### ScheduleModal Component
- [ ] **Test 2.6:** Create Mode
  - [ ] Öppna modal → Tomt formulär
  - [ ] Fyll i alla fält → Submit → Schema skapas
  - [ ] Validering → Error messages visas vid fel

- [ ] **Test 2.7:** Edit Mode
  - [ ] Öppna modal med schema → Formulär fylls i korrekt
  - [ ] Ändra data → Submit → Schema uppdateras
  - [ ] Stäng modal → Ändringar sparas inte

- [ ] **Test 2.8:** Conflict Check i Modal
  - [ ] Ändra till överlappande tid → Conflict error visas
  - [ ] Ändra till icke-överlappande tid → Success

#### AbsenceCalendar Component
- [ ] **Test 2.9:** Rendering
  - [ ] Kalendern renderas korrekt
  - [ ] Frånvaror visas i rätt kolumner
  - [ ] Färgkodning fungerar (sick=red, vacation=green)

- [ ] **Test 2.10:** Multi-day Absences
  - [ ] Frånvaro över flera dagar → Visas i alla dagar
  - [ ] Status "pending" → Opacity 60%

---

### ✅ 3. Mobile & Responsive Tests

- [ ] **Test 3.1:** Mobile Layout (< 768px)
  - [ ] Kalendergrid: 1 kolumn vertikal
  - [ ] Knappar: Full width på mobil
  - [ ] Modaler: Bottom sheet på mobil
  - [ ] Touch targets: Minst 44x44px

- [ ] **Test 3.2:** Tablet Layout (768px - 1024px)
  - [ ] Kalendergrid: 7 kolumner
  - [ ] Modaler: Centrerad på tablet
  - [ ] Layout anpassar sig korrekt

- [ ] **Test 3.3:** Desktop Layout (> 1024px)
  - [ ] Kalendergrid: 7 kolumner
  - [ ] Alla feature fungerar
  - [ ] Hover states fungerar

- [ ] **Test 3.4:** Touch Interactions
  - [ ] Long-press för drag (250ms)
  - [ ] Tap för edit
  - [ ] Scroll fungerar smidigt
  - [ ] No accidental drags

---

### ✅ 4. Integration Tests

- [ ] **Test 4.1:** Project Page Integration
  - [ ] Gå till `/projects/[id]`
  - [ ] ScheduleCalendar visas under Budget Card
  - [ ] Endast scheman för projektet visas
  - [ ] Skapa schema från projekt-sidan → project_id är förifyllt

- [ ] **Test 4.2:** Calendar Page Integration
  - [ ] Gå till `/calendar`
  - [ ] Tabs: Schema & Frånvaro
  - [ ] Schema-tab → ScheduleCalendar visas
  - [ ] Frånvaro-tab → AbsenceCalendar visas

- [ ] **Test 4.3:** React Query Integration
  - [ ] Optimistic updates fungerar
  - [ ] Query invalidation fungerar efter mutations
  - [ ] Error handling med toast notifications
  - [ ] Loading states visas korrekt

---

### ✅ 5. Edge Cases & Error Handling

- [ ] **Test 5.1:** Empty States
  - [ ] Inga scheman → "Inga pass" visas
  - [ ] Inga frånvaror → "Ingen frånvaro" visas

- [ ] **Test 5.2:** Network Errors
  - [ ] Simulera network error → Error toast visas
  - [ ] Optimistic update rollback fungerar

- [ ] **Test 5.3:** Concurrent Updates
  - [ ] Öppna samma schema i två flikar
  - [ ] Uppdatera i en flik → Andra fliken uppdateras via React Query

- [ ] **Test 5.4:** Large Datasets
  - [ ] 100+ scheman i en vecka → Performance OK
  - [ ] Scroll fungerar smidigt

- [ ] **Test 5.5:** Timezone Handling
  - [ ] Skapa schema i olika tidszoner → Korrekt tidszon sparas
  - [ ] Drag & drop behåller korrekt tid

---

### ✅ 6. RLS & Security Tests

- [ ] **Test 6.1:** Tenant Isolation
  - [ ] Employee ser endast sina scheman
  - [ ] Admin ser alla scheman för tenant
  - [ ] Cross-tenant access → 403 eller 404

- [ ] **Test 6.2:** Authorization
  - [ ] Employee kan skapa sina scheman
  - [ ] Employee kan uppdatera sina scheman
  - [ ] Employee kan ta bort sina scheman
  - [ ] Employee kan INTE ta bort andra employees scheman

---

## 🚀 Snabbstart Testing (5 min)

1. **Öppna appen** → Logga in
2. **Gå till `/calendar`** → Schema-tab
3. **Skapa schema** → "Skapa nytt pass"
   - Välj anställd och projekt
   - Sätt tid: Idag 09:00-17:00
   - Klicka "Skapa pass"
4. **Testa drag & drop** → Dra schemat till morgondagen
5. **Testa conflict** → Skapa nytt schema för samma anställd, överlappande tid

---

## 🐛 Kända Issues att testa

### Fixed Issues
- ✅ Filters race condition → Fixed med useMemo
- ✅ Drag over race conditions → Fixed med debounce
- ✅ Click/drag conflict → Fixed med pointer events
- ✅ Tidszon problem → Fixed med korrekt datumkonstruktion

### Testa dessa fixes
- [ ] Filters uppdateras korrekt när vecka ändras
- [ ] Drag & drop ger inte för många API-anrop
- [ ] Click fungerar korrekt (inte när man drar)
- [ ] Tidszoner är korrekta vid drag & drop

---

## 📊 Test Results

### Passed Tests: [ ] / [ ]
### Failed Tests: [ ] / [ ]
### Bugs Found: [ ]

---

## 📝 Bug Report Template

```markdown
### Bug #X: [Title]

**Severity:** Low / Medium / High / Critical

**Description:**
[Vad händer]

**Expected:**
[Vad som borde hända]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Mobile/Tablet]
- OS: [Windows/Mac/Linux/iOS/Android]

**Console Errors:**
[Any console errors]

**Screenshots:**
[If applicable]
```

---

## ✅ Definition of Done

- [ ] Alla API endpoints testade
- [ ] Alla komponenter testade
- [ ] Mobile responsiveness testad
- [ ] Edge cases testade
- [ ] RLS säkerhet testad
- [ ] Inga kritiska buggar
- [ ] Performance OK
- [ ] Dokumentation uppdaterad med test results

---

**Nästa steg efter testing:** Fixa eventuella buggar och optimera prestanda


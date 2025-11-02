# ⚡ Snabbtest-guide

## 🚀 5-minuter test

### 1. Login & Dashboard (1 min)
```
□ Logga in
□ Dashboard laddas
□ Stämpelklocka syns
□ Inga console errors
```

### 2. Tidsrapportering (2 min)
```
□ Stämpla in (stämpelklocka)
□ Vänta 30 sekunder
□ Stämpla ut
□ Verifiera att tidsrapport skapades
□ Gå till /reports och se tidsrapporten
```

### 3. Projekt (1 min)
```
□ Gå till /projects
□ Klicka på ett projekt
□ Projekt laddas utan errors
□ AI Summary fungerar (eller visar loading)
```

### 4. Admin (1 min) - Endast om du är admin
```
□ Gå till /admin/work-sites
□ Sida laddas utan errors
□ Gå till /admin/live-map
□ Karta laddas
```

---

## 🧪 15-minuter grundtest

### Test 1: Autentisering (2 min)
- [ ] Logga in
- [ ] Logga ut
- [ ] Logga in igen
- [ ] Session behålls vid refresh

### Test 2: Navigation (2 min)
- [ ] Gå igenom alla huvudmenyer:
  - [ ] Dashboard
  - [ ] Anställda
  - [ ] Projekt
  - [ ] Kunder
  - [ ] Fakturor
  - [ ] Rapporter
  - [ ] Kalender
  - [ ] Analytics
- [ ] Inga 404 errors
- [ ] Inga console errors

### Test 3: CRUD Operationer (5 min)
- [ ] **Create:** Skapa nytt projekt
  - [ ] Formulär fungerar
  - [ ] Projekt skapas
  - [ ] Redirect till projekt-detaljer
- [ ] **Read:** Visa projekt-detaljer
  - [ ] Data visas korrekt
  - [ ] Inga "hittas inte" errors
- [ ] **Update:** Arkivera projekt
  - [ ] Projekt arkiveras
  - [ ] Notifikation visas
- [ ] **Delete:** Ta bort kund (om admin)
  - [ ] Bekräftelsedialog
  - [ ] Kund tas bort

### Test 4: Tidsrapportering (3 min)
- [ ] Stämpla in
- [ ] Stämpla ut
- [ ] Gå till /reports
- [ ] Tidsrapporten finns i listan
- [ ] Klicka på kalender
- [ ] Tidsrapporten syns i kalendern

### Test 5: Sök & Filter (2 min)
- [ ] Gå till /projects
- [ ] Testa sökning
- [ ] Testa sortering
- [ ] Gå till /reports
- [ ] Testa filter på OB-typ
- [ ] Testa filter på datum

### Test 6: Mobilvänlighet (1 min)
- [ ] Öppna DevTools → Toggle device toolbar
- [ ] Välj iPhone eller Android
- [ ] Navigera genom appen
- [ ] Hamburger-meny fungerar
- [ ] Formulär är användbara

---

## 🐛 Vanliga problem att leta efter

### Console Errors
Öppna Developer Tools (F12) → Console
- [ ] Inga röda errors
- [ ] Inga varningar om missing columns
- [ ] Inga "Auth session missing" errors

### Network Errors
Developer Tools → Network
- [ ] Alla requests returnerar 200 eller förväntad status
- [ ] Inga 401 (Unauthorized) errors
- [ ] Inga 500 (Server Error) errors

### Foreign Key Errors
Vid skapande av:
- [ ] Projekt → Inga `projects_tenant_id_fkey` errors
- [ ] Kund → Inga `clients_tenant_id_fkey` errors
- [ ] Tidsrapport → Inga `time_entries_tenant_id_fkey` errors
- [ ] Anställd → Inga `employees_tenant_id_fkey` errors

### Schema Errors
- [ ] Inga "Could not find the 'X' column" errors
- [ ] Progressive fallback fungerar

---

## ✅ Snabb sanity check

### Öppna appen och kolla:
```
□ Dashboard laddar utan errors
□ Inga console errors
□ Sidebar fungerar
□ Logout-knapp finns
□ Stämpelklocka syns (om du är anställd)
```

### Testa en kritisk funktion:
```
□ Stämpla in/ut (stämpelklocka)
□ Eller skapa ett projekt
□ Eller visa en faktura
```

### Kontrollera console:
```
□ Öppna Developer Tools (F12)
□ Gå till Console
□ Inga röda errors
```

---

## 🎯 Focus Areas per Feature

### 📅 Kalender
- [ ] Månadsvy visas
- [ ] Klick på dag visar detaljer
- [ ] Navigering fungerar
- [ ] Färgkodning fungerar

### 📎 Filhantering
- [ ] Uppladdning fungerar
- [ ] Filerna visas i listan
- [ ] Öppna/ladda ner fungerar

### 🔔 Notifikationer
- [ ] NotificationCenter syns
- [ ] Notifikationer triggas vid action
- [ ] Markera som läst fungerar

### 🗺️ GPS & Arbetsplatser
- [ ] Arbetsplatser kan skapas
- [ ] GPS-position hämtas
- [ ] Auto-checkin fungerar (om inom räckvidd)
- [ ] Live-karta visar anställda

---

## 🚨 Röd flagga - Stoppa allt!

Om du ser något av följande, **stoppa testningen** och fixa först:

- ❌ Foreign key constraint violations
- ❌ "Auth session missing!" errors överallt
- ❌ Appen crashar helt
- ❌ Data går förlorad
- ❌ Användare kan se andra tenants data

---

**Testa systematiskt och dokumentera allt! 🎯**


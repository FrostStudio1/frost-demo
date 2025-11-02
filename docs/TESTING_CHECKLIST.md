# 🧪 Testning & Bugtest Checklista

## 📋 Pre-Deployment Testning

### 🔐 Autentisering & Användarhantering

- [ ] **Inloggning**
  - [ ] Email/password inloggning fungerar
  - [ ] Google OAuth inloggning fungerar
  - [ ] Felmeddelanden visas vid felaktiga uppgifter
  - [ ] Session behålls vid sidrefresh

- [ ] **Utloggning**
  - [ ] Logout-knappen på dashboard fungerar
  - [ ] Användaren loggas ut korrekt
  - [ ] Redirect till login efter utloggning

- [ ] **Onboarding**
  - [ ] Alla 3 steg går igenom utan fel
  - [ ] Tenant skapas korrekt
  - [ ] Client skapas korrekt
  - [ ] Project skapas korrekt
  - [ ] Admin user skapas korrekt
  - [ ] Inga foreign key constraint errors
  - [ ] Omdirigering till dashboard efter onboarding

---

### 👥 Anställda (Employees)

- [ ] **Lista anställda**
  - [ ] Alla anställda visas för admin
  - [ ] Endast egna data visas för icke-admin
  - [ ] Sökning fungerar
  - [ ] Sortering fungerar

- [ ] **Lägg till anställd** (Admin only)
  - [ ] Endast admin kan komma åt `/employees/new`
  - [ ] Formulär validerar korrekt
  - [ ] Anställd skapas utan `default_rate_sek` errors
  - [ ] Success-meddelande visas
  - [ ] Redirect till employees-listan

- [ ] **Ta bort anställd** (Admin only)
  - [ ] Bekräftelsedialog visas
  - [ ] Anställd tas bort korrekt
  - [ ] Success-meddelande visas

---

### 🏗️ Projekt (Projects)

- [ ] **Lista projekt**
  - [ ] Alla projekt visas (ej arkiverade)
  - [ ] Sökning fungerar
  - [ ] Filter & sortering fungerar
  - [ ] Projekt-översikt visas korrekt

- [ ] **Projektdetaljer**
  - [ ] Projekt laddas korrekt (inga "Projektet hittas inte" errors)
  - [ ] Timmar visas korrekt
  - [ ] Budget/progress visas korrekt
  - [ ] AI Summary fungerar (valfritt)
  - [ ] Filuppladdning fungerar
  - [ ] Fil-listning fungerar
  - [ ] Skapa faktura-knapp fungerar

- [ ] **Arkivera projekt**
  - [ ] Projekt arkiveras korrekt
  - [ ] Notifikation visas
  - [ ] Projekt försvinner från aktiv lista
  - [ ] Projekt visas i arkiv
  - [ ] Återställning fungerar

- [ ] **Skapa nytt projekt**
  - [ ] Formulär fungerar
  - [ ] Koppling till kund fungerar
  - [ ] Projekt skapas korrekt

---

### 👔 Kunder (Clients)

- [ ] **Lista kunder**
  - [ ] Alla kunder visas (ej arkiverade)
  - [ ] Sökning fungerar
  - [ ] Sortering fungerar

- [ ] **Arkivera kund**
  - [ ] Kund arkiveras korrekt
  - [ ] Kund försvinner från aktiv lista
  - [ ] Återställning fungerar

- [ ] **Ta bort kund** (Admin only)
  - [ ] Bekräftelsedialog visas
  - [ ] Kund tas bort permanent

- [ ] **Skapa ny kund**
  - [ ] Formulär fungerar
  - [ ] Kund skapas korrekt
  - [ ] Org.nr valideras (om tillämpligt)

---

### 🧾 Fakturor (Invoices)

- [ ] **Lista fakturor**
  - [ ] Alla fakturor visas
  - [ ] Sökning fungerar
  - [ ] Filter på status fungerar
  - [ ] Sortering fungerar

- [ ] **Fakturadetaljer**
  - [ ] Faktura laddas korrekt
  - [ ] Fakturarader visas korrekt
  - [ ] ROT-avdrag beräknas korrekt (30%)
  - [ ] Filuppladdning fungerar
  - [ ] PDF-export fungerar
  - [ ] Email-funktion fungerar

- [ ] **Skapa faktura**
  - [ ] Från projekt: Projekt-ID pre-fylls
  - [ ] Formulär fungerar
  - [ ] Faktura skapas korrekt
  - [ ] Redirect till faktura-detaljer

---

### ⏱️ Tidsrapporter (Time Reports)

- [ ] **Lista tidsrapporter**
  - [ ] Alla rapporter visas (admin) eller endast egna (employee)
  - [ ] Sökning fungerar
  - [ ] Filter på projekt/OB-typ/datum fungerar
  - [ ] Sortering fungerar
  - [ ] Totalsumma visas korrekt

- [ ] **Manuell tidsrapportering**
  - [ ] Formulär fungerar
  - [ ] OB-typer fungerar (kväll, natt, helg)
  - [ ] Timmar beräknas korrekt
  - [ ] Dublettkontroll fungerar
  - [ ] Tidsrapport sparas korrekt
  - [ ] Inga foreign key constraint errors

- [ ] **Stämpelklocka**
  - [ ] Syns för alla användare (ej endast admin)
  - [ ] Check-in fungerar
  - [ ] GPS-spårning fungerar (om aktiverad)
  - [ ] Auto-checkin fungerar (om inom räckvidd)
  - [ ] Check-out fungerar
  - [ ] OB-timmar beräknas korrekt
  - [ ] Avrundning till 0,5h fungerar
  - [ ] Dublettkontroll fungerar

---

### 📅 Kalender

- [ ] **Kalendervy**
  - [ ] Månadsvy visas korrekt
  - [ ] Tidsrapporter visas per dag
  - [ ] Färgkodning baserat på OB-typ fungerar
  - [ ] Klick på dag visar detaljer
  - [ ] Navigering mellan månader fungerar
  - [ ] "Idag"-knapp fungerar

---

### 📊 Dashboard

- [ ] **Översikt**
  - [ ] Stats visas korrekt
  - [ ] Stämpelklocka syns
  - [ ] NotificationCenter syns och fungerar
  - [ ] Quick actions fungerar

---

### 🗺️ Admin-funktioner

- [ ] **Admin-check**
  - [ ] `/api/admin/check` returnerar korrekt status
  - [ ] Admin-sektioner syns endast för admin
  - [ ] Icke-admin ser inte admin-funktioner

- [ ] **Arbetsplatser** (`/admin/work-sites`)
  - [ ] Lista arbetsplatser fungerar
  - [ ] Skapa arbetsplats fungerar
  - [ ] GPS-koordinater fungerar
  - [ ] Redigera arbetsplats fungerar
  - [ ] Ta bort arbetsplats fungerar

- [ ] **Live-karta** (`/admin/live-map`)
  - [ ] Karta laddas korrekt
  - [ ] Anställda visas på karta
  - [ ] Arbetsplatser visas
  - [ ] GPS-positioner uppdateras i realtid

---

### 📎 Filhantering

- [ ] **Filuppladdning**
  - [ ] Drag & drop fungerar
  - [ ] Filvalidering fungerar (storlek, typ)
  - [ ] Uppladdning till projekt fungerar
  - [ ] Uppladdning till faktura fungerar
  - [ ] Felmeddelanden visas vid fel

- [ ] **Fillistning**
  - [ ] Uppladdade filer visas korrekt
  - [ ] Filstorlek visas korrekt
  - [ ] Öppna/ladda ner fungerar

---

### 🔔 Notifikationer

- [ ] **In-app notifikationer**
  - [ ] Notifikationer visas korrekt
  - [ ] Markera som läst fungerar
  - [ ] Markera alla som läst fungerar
  - [ ] NotificationCenter uppdateras korrekt
  - [ ] Notifikationer triggas vid:
    - [ ] Faktura skapad
    - [ ] Projekt arkiverat
    - [ ] Kund arkiverat

---

### 📱 Mobilvänlighet

- [ ] **Responsiv design**
  - [ ] Dashboard fungerar på mobil
  - [ ] Sidebar är hamburger-meny på mobil
  - [ ] Formulär är användbara på mobil
  - [ ] Tabeller är scrollbara på mobil
  - [ ] Knappar är klickbara på mobil

---

### 🌐 Cross-browser kompatibilitet

- [ ] **Chrome** - Alla funktioner fungerar
- [ ] **Firefox** - Alla funktioner fungerar
- [ ] **Safari** - Alla funktioner fungerar
- [ ] **Edge** - Alla funktioner fungerar

---

### 🔒 Säkerhet

- [ ] **Row Level Security (RLS)**
  - [ ] Användare ser endast sin tenant-data
  - [ ] Admin kan se all data för sin tenant
  - [ ] Icke-admin ser endast egen data

- [ ] **API Rate Limiting**
  - [ ] Rate limiting fungerar på `/api/feedback`
  - [ ] Rate limiting fungerar på `/api/employees/create`
  - [ ] Rate limiting fungerar på `/api/time-entries/*`

- [ ] **Input Validation**
  - [ ] Email-validering fungerar
  - [ ] UUID-validering fungerar
  - [ ] String-sanitization fungerar
  - [ ] SQL-injection förhindras

---

### 🐛 Kända buggar att testa

- [ ] **Foreign Key Constraints**
  - [ ] Inga `tenant_id_fkey` errors vid skapande
  - [ ] Tenant verifieras korrekt vid onboarding

- [ ] **Schema Fallbacks**
  - [ ] App fungerar även om vissa kolumner saknas
  - [ ] Progressive fallback fungerar för:
    - [ ] `default_rate_sek` / `base_rate_sek`
    - [ ] `org_number`
    - [ ] `status`
    - [ ] `description`

- [ ] **Session Management**
  - [ ] Inga "Auth session missing!" errors
  - [ ] Tenant ID hämtas korrekt
  - [ ] Fallback till API route fungerar

---

### 📝 Data-integritet

- [ ] **Deduplicering**
  - [ ] Duplicerade tidsrapporter detekteras
  - [ ] Bekräftelsedialog visas
  - [ ] Duplicering förhindras korrekt

- [ ] **Beräkningar**
  - [ ] OB-timmar beräknas korrekt (kväll/natt 150%, helg 200%)
  - [ ] Timmar avrundas till 0,5h
  - [ ] ROT-avdrag beräknas korrekt (30%)

---

## 🚨 Kritiska flöden att testa

### 1. Onboarding-flöde
```
1. Skapa konto
2. Gå igenom onboarding (3 steg)
3. Verifiera att allt skapades korrekt
4. Logga in och testa funktionalitet
```

### 2. Tidsrapporterings-flöde
```
1. Stämpla in (stämpelklocka)
2. Vänta några minuter
3. Stämpla ut
4. Verifiera att tidsrapport skapades korrekt
5. Kontrollera OB-beräkningar
```

### 3. Projekt-till-Faktura-flöde
```
1. Skapa projekt
2. Rapportera tid på projektet
3. Skapa faktura från projektet
4. Verifiera att timmar/pris är korrekt
5. Skicka faktura
```

### 4. Admin-funktionalitet
```
1. Logga in som admin
2. Skapa anställd
3. Skapa arbetsplats
4. Verifiera live-karta
5. Arkivera projekt/kund
```

---

## ✅ Checklista efter buggfixar

När du fixar en bugg, testa följande:

- [ ] Bugg är fixad
- [ ] Inga nya buggar introducerades
- [ ] Relaterade funktioner fungerar fortfarande
- [ ] Error handling fungerar korrekt
- [ ] User feedback visas korrekt
- [ ] Console har inga errors
- [ ] Network requests fungerar korrekt

---

## 📊 Testresultat

**Datum:** _______________

**Testare:** _______________

**Miljö:** Development / Production

**Resultat:**
- ✅ Fungerar perfekt
- ⚠️ Fungerar med små problem
- ❌ Fungerar inte / Kritiskt fel

**Noteringar:**
```
[Skriv dina noteringar här]
```

---

## 🔄 Regression Testing

Efter större ändringar, testa åtminstone:

- [ ] Login/Logout
- [ ] Dashboard
- [ ] Tidsrapportering (stämpelklocka)
- [ ] Projekt-skapande
- [ ] Faktura-skapande
- [ ] Admin-funktioner

---

**Lycka till med testningen! 🚀**


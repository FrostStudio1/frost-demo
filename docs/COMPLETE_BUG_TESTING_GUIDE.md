# 🐛 Komplett Bug Test Guide - Frost Solutions

**Version:** 1.0  
**Datum:** 2025-01-27  
**Syfte:** Systematisk testguide för att hitta och rapportera buggar

---

## 📋 Innehållsförteckning

1. [Förberedelser](#förberedelser)
2. [Autentisering & Säkerhet](#autentisering--säkerhet)
3. [Stämpelklocka](#stämpelklocka)
4. [Tidsrapportering](#tidsrapportering)
5. [Projekt](#projekt)
6. [Kunder](#kunder)
7. [Fakturor](#fakturor)
8. [Lönespecifikation](#lönespecifikation)
9. [ROT-avdrag](#rot-avdrag)
10. [ÄTA](#äta)
11. [GPS & Arbetsplatser](#gps--arbetsplatser)
12. [Admin Funktioner](#admin-funktioner)
13. [Mobil & Responsivitet](#mobil--responsivitet)
14. [Prestanda & Edge Cases](#prestanda--edge-cases)
15. [Rapportera Buggar](#rapportera-buggar)

---

## 🔧 Förberedelser

### Testmiljö Setup
- [ ] Logga in med admin-konto
- [ ] Logga in med anställd-konto (i separat webbläsare/flik)
- [ ] Öppna Developer Tools (F12)
- [ ] Aktivera Network tab för att se API-anrop
- [ ] Aktivera Console för att se errors

### Testdata
- [ ] Skapa minst 3 kunder
- [ ] Skapa minst 3 projekt (olika kunder)
- [ ] Skapa minst 2 anställda
- [ ] Skapa minst 1 arbetsplats med GPS-koordinater

---

## 🔐 Autentisering & Säkerhet

### Login/Logout
- [ ] Logga in med email/password
- [ ] Logga in med Google OAuth
- [ ] Logga ut och verifiera att session rensas
- [ ] Försök komma åt skyddad sida utan inloggning → ska redirecta till login
- [ ] Refresh sidan efter login → ska behålla session

### Tenant Isolation
- [ ] Logga in med Tenant A
- [ ] Skapa projekt/kund/faktura
- [ ] Logga in med Tenant B
- [ ] Verifiera att Tenant A's data INTE syns
- [ ] Försök komma åt Tenant A's data via URL → ska ge 403 eller 404

### Admin Check
- [ ] Vanlig anställd ska INTE se admin-menyer
- [ ] Admin ska se alla admin-menyer
- [ ] Försök komma åt `/admin` som vanlig anställd → ska nekas
- [ ] Försök skapa anställd som vanlig anställd → ska nekas

---

## ⏰ Stämpelklocka

### Grundfunktionalitet
- [ ] Stämpla in på projekt
- [ ] Stämpla ut från projekt
- [ ] Verifiera att tiden sparas korrekt
- [ ] Verifiera att tiden visas i tidsrapporter
- [ ] Stämpla in → navigera till annan sida → stämpla ut → ska fungera

### OB-beräkning
- [ ] Stämpla in 06:00-18:00 → ska ge vanlig tid
- [ ] Stämpla in 18:00-22:00 → ska ge OB Kväll
- [ ] Stämpla in 22:00-06:00 → ska ge OB Natt
- [ ] Stämpla in på helg → ska ge OB Helg
- [ ] Stämpla in över flera OB-perioder → ska delas upp korrekt

### Avrundning
- [ ] Stämpla in 14:00 → stämpla ut 14:15 → ska avrundas till 0,5 timmar
- [ ] Stämpla in 14:00 → stämpla ut 14:10 → ska avrundas till 0,5 timmar
- [ ] Stämpla in 14:00 → stämpla ut 14:45 → ska avrundas till 1 timme

### Edge Cases
- [ ] Stämpla in utan att välja projekt → ska ge felmeddelande
- [ ] Stämpla ut utan att ha stämplat in → ska ge felmeddelande
- [ ] Stämpla in → stänga webbläsaren → öppna igen → ska behålla stämpling
- [ ] Stämpla in → navigera mellan sidor → stämpla ut → ska fungera

### GPS Auto-checkin
- [ ] Närma sig arbetsplats (500m) → ska få notifikation
- [ ] Auto-checkin ska starta när nära arbetsplats
- [ ] Auto-checkin ska stoppas när man går för långt bort
- [ ] Admin ska kunna ändra avstånd för auto-checkin

---

## 📝 Tidsrapportering

### Manuell Rapportering
- [ ] Skapa ny tidsrapport
- [ ] Välj projekt
- [ ] Välj datum
- [ ] Ange timmar
- [ ] Välj OB-typ (kväll/natt/helg)
- [ ] Spara → verifiera att den syns i listan
- [ ] Redigera tidsrapport
- [ ] Ta bort tidsrapport

### Validering
- [ ] Försök spara utan projekt → ska ge felmeddelande
- [ ] Försök spara med negativa timmar → ska ge felmeddelande
- [ ] Försök spara med >24 timmar → ska ge felmeddelande eller varning
- [ ] Försök spara med obekväm tid utan OB-typ → ska ge felmeddelande

### Fakturering
- [ ] Skapa faktura från projekt → tidsrapporter ska markeras som fakturerade
- [ ] Verifiera att fakturerade tidsrapporter INTE syns i faktureringsvy
- [ ] Verifiera att fakturerade tidsrapporter INTE kan faktureras igen

---

## 🏗️ Projekt

### Skapande
- [ ] Skapa nytt projekt
- [ ] Välj kund
- [ ] Ange budgeterade timmar
- [ ] Ange baspris
- [ ] Spara → verifiera att projektet syns
- [ ] Verifiera att projektet kopplas till rätt kund

### Redigering
- [ ] Redigera projektnamn
- [ ] Redigera budgeterade timmar
- [ ] Redigera baspris
- [ ] Ändra status (aktiv → arkiverad)
- [ ] Återställa arkiverat projekt

### Visning
- [ ] Visa projektlista
- [ ] Sök i projektlista
- [ ] Filtrera på status
- [ ] Sortera på namn/datum/status
- [ ] Visa projekt-detaljer
- [ ] Verifiera att timmar visas korrekt
- [ ] Verifiera att progressbar fungerar
- [ ] Verifiera att progressbar visar rätt färg (>100% = röd)

### Anställdas Timmar
- [ ] Öppna projekt → sektion "Anställdas timmar"
- [ ] Verifiera att alla anställda som jobbat visas
- [ ] Verifiera att timmar per anställd är korrekt
- [ ] Verifiera att progressbar för fördelning fungerar

### Fakturering från Projekt
- [ ] Skapa faktura från projekt
- [ ] Verifiera att kundinformation synkas
- [ ] Verifiera att fakturarader skapas från tidsrapporter
- [ ] Verifiera att timmar markeras som fakturerade
- [ ] Ladda ner PDF → verifiera att fakturan är korrekt

### Arkivering
- [ ] Arkivera projekt
- [ ] Verifiera att arkiverat projekt INTE syns i huvudlista
- [ ] Gå till arkiv → verifiera att projektet syns där
- [ ] Återställa projekt från arkiv

---

## 👔 Kunder

### Skapande
- [ ] Skapa ny kund
- [ ] Ange namn
- [ ] Ange email
- [ ] Ange telefonnummer (valfritt)
- [ ] Ange organisationsnummer
- [ ] Ange adress
- [ ] Spara → verifiera att kunden syns

### Redigering
- [ ] Redigera kundnamn
- [ ] Redigera email
- [ ] Redigera telefonnummer
- [ ] Uppdatera adress

### Radering
- [ ] Ta bort kund utan projekt → ska fungera
- [ ] Försök ta bort kund med projekt → ska ge felmeddelande
- [ ] Ta bort kund med projekt efter att ha tagit bort projekt → ska fungera

### Visning
- [ ] Visa kundlista
- [ ] Sök i kundlista
- [ ] Filtrera på arkiverade/aktiva
- [ ] Klicka på kund → visa kund-detaljer
- [ ] Verifiera att kundens projekt visas

---

## 🧾 Fakturor

### Skapande
- [ ] Skapa faktura manuellt
- [ ] Välj kund
- [ ] Ange belopp
- [ ] Ange beskrivning
- [ ] Spara → verifiera att fakturan skapas
- [ ] Skapa faktura från projekt → verifiera att all info synkas

### Redigering
- [ ] Redigera fakturabelopp
- [ ] Redigera beskrivning
- [ ] Lägg till fakturarad
- [ ] Redigera fakturarad
- [ ] Ta bort fakturarad
- [ ] Verifiera att totalbelopp uppdateras automatiskt

### Fakturarader
- [ ] Lägg till rad med timmar
- [ ] Lägg till rad med antal
- [ ] Ändra pris per timme/enhet
- [ ] Verifiera att totalbelopp beräknas korrekt
- [ ] Ändra ordning på rader (sort_order)

### Status
- [ ] Markera faktura som skickad
- [ ] Markera faktura som betald
- [ ] Markera faktura som arkiverad
- [ ] Verifiera att status visas korrekt i listan

### E-post
- [ ] Skicka faktura via e-post
- [ ] Verifiera att e-post skickas till kundens email
- [ ] Försök skicka utan kundemail → ska ge felmeddelande
- [ ] Verifiera att faktura-länk fungerar i e-post

### PDF Export
- [ ] Ladda ner faktura som PDF
- [ ] Verifiera att all information finns i PDF
- [ ] Verifiera att fakturarader visas korrekt
- [ ] Verifiera att totalbelopp är korrekt
- [ ] Verifiera att ROT-avdrag beräknas korrekt (om applicerbart)

### Arkivering
- [ ] Arkivera faktura
- [ ] Verifiera att arkiverad faktura INTE syns i huvudlista (om inte filtrerat)
- [ ] Filtrera på arkiverade → verifiera att fakturan syns
- [ ] Återställa faktura från arkiv

### Radering
- [ ] Ta bort faktura
- [ ] Verifiera att fakturan tas bort
- [ ] Verifiera att fakturarader också tas bort

---

## 💰 Lönespecifikation

### Visning
- [ ] Öppna lönespec-sida
- [ ] Verifiera att anställd ser bara sin egen lönespec
- [ ] Verifiera att admin ser alla lönespecar
- [ ] Verifiera att timmar grupperas per OB-typ
- [ ] Verifiera att total lön beräknas korrekt

### Export
- [ ] Ladda ner lönespec som PDF
- [ ] Verifiera att PDF innehåller all information
- [ ] Ladda ner lönespec som CSV
- [ ] Öppna CSV i Excel → verifiera att data är korrekt

### Edge Cases
- [ ] Anställd utan timmar → ska visa 0 kr
- [ ] Anställd med bara OB-timmar → ska visa korrekt lön
- [ ] Anställd med timmar över flera månader → ska gruppera korrekt

---

## 🏠 ROT-avdrag

### Skapande
- [ ] Skapa ny ROT-ansökan
- [ ] Välj projekt
- [ ] Ange personnummer
- [ ] Ange fastighetsbeteckning
- [ ] Ange arbetskostnad
- [ ] Ange materialkostnad
- [ ] Verifiera att total kostnad beräknas korrekt
- [ ] Verifiera att ROT-avdrag beräknas korrekt (max 75 000 kr)

### Status
- [ ] Skicka ROT-ansökan till Skatteverket
- [ ] Verifiera att status uppdateras
- [ ] Kontrollera status via API
- [ ] Hantera godkänd/underkänd status

### Fakturering
- [ ] Skapa faktura med ROT-avdrag
- [ ] Verifiera att fakturabeloppet är justerat
- [ ] Verifiera att ROT-avdrag visas på fakturan

---

## ⚠️ ÄTA

### Skapande
- [ ] Skapa ny ÄTA-ansökan
- [ ] Välj projekt
- [ ] Välj anställd
- [ ] Ladda upp bild
- [ ] Beskriv arbete
- [ ] Skicka in → verifiera att ansökan skapas

### Admin Review
- [ ] Admin ska se alla ÄTA-ansökningar
- [ ] Admin ska kunna godkänna/underkänna
- [ ] Admin ska kunna lägga till kommentarer
- [ ] Verifiera att status uppdateras korrekt

---

## 📍 GPS & Arbetsplatser

### Arbetsplatser
- [ ] Skapa ny arbetsplats
- [ ] Ange namn
- [ ] Ange adress
- [ ] Ange GPS-koordinater (eller låt systemet hitta automatiskt)
- [ ] Ange avstånd för auto-checkin
- [ ] Aktivera/deaktivera auto-checkin
- [ ] Spara → verifiera att arbetsplatsen skapas

### GPS Tracking
- [ ] Aktivera GPS-tracking
- [ ] Verifiera att position visas på karta
- [ ] Verifiera att auto-checkin fungerar när nära arbetsplats
- [ ] Verifiera att auto-checkin stoppas när man går bort

### Live Karta (Admin)
- [ ] Öppna Live Karta som admin
- [ ] Verifiera att alla anställda som är stämplade in visas
- [ ] Verifiera att positioner uppdateras i realtid
- [ ] Klicka på anställd → visa detaljer

---

## 👨‍💼 Admin Funktioner

### Anställda
- [ ] Skapa ny anställd
- [ ] Ange namn, email, roll
- [ ] Ange standard-timlön
- [ ] Verifiera att anställd skapas
- [ ] Redigera anställd
- [ ] Ta bort anställd
- [ ] Verifiera att anställd INTE kan ta bort sig själv

### Arbetsplatser
- [ ] Se alla arbetsplatser
- [ ] Redigera arbetsplats
- [ ] Ta bort arbetsplats
- [ ] Ändra auto-checkin inställningar

### Debug
- [ ] Öppna Admin Debug-sida
- [ ] Verifiera att tenant ID visas korrekt
- [ ] Verifiera att employee data visas
- [ ] Verifiera att admin status visas korrekt

---

## 📱 Mobil & Responsivitet

### Responsiv Design
- [ ] Testa på mobil (375px bredd)
- [ ] Testa på tablet (768px bredd)
- [ ] Testa på desktop (1920px bredd)
- [ ] Verifiera att alla sidor är läsbara på mobil
- [ ] Verifiera att navigation fungerar på mobil
- [ ] Verifiera att formulär är användbara på mobil

### Touch Interaction
- [ ] Alla knappar ska vara minst 44x44px
- [ ] Knappar ska reagera på touch
- [ ] Scrollning ska fungera smidigt
- [ ] Hamburger-meny ska fungera på mobil

### Viewport
- [ ] Testa i porträttläge
- [ ] Testa i landskapsläge
- [ ] Verifiera att inget går utanför skärmen
- [ ] Verifiera att zoom fungerar korrekt

---

## ⚡ Prestanda & Edge Cases

### Stora Datamängder
- [ ] Skapa 100+ projekt → verifiera att listan laddas
- [ ] Skapa 1000+ tidsrapporter → verifiera att rapporter-sidan fungerar
- [ ] Skapa 50+ fakturor → verifiera att faktura-listan fungerar

### Edge Cases
- [ ] Skapa projekt utan kund → ska ge felmeddelande
- [ ] Skapa faktura utan kund → ska ge felmeddelande
- [ ] Skapa tidsrapport för framtida datum → ska ge varning eller felmeddelande
- [ ] Skapa tidsrapport för datum > 1 år tillbaka → ska fungera eller ge varning
- [ ] Ange belopp > 1 000 000 kr → ska fungera

### Felhantering
- [ ] Simulera nätverksfel → verifiera att felmeddelande visas
- [ ] Simulera timeout → verifiera att felmeddelande visas
- [ ] Försök spara med ogiltiga data → verifiera att validering fungerar
- [ ] Försök ta bort objekt som används → verifiera att felmeddelande visas

### Concurrent Actions
- [ ] Öppna samma sida i två flikar
- [ ] Uppdatera data i en flik
- [ ] Verifiera att andra fliken uppdateras (eller visar varning)
- [ ] Försök spara samma objekt från två flikar → ska hantera korrekt

---

## 🐛 Rapportera Buggar

### När du hittar en bugg:

1. **Klicka på "🐛 Rapportera bugg"-knappen** i error toast-meddelandet
   - Eller gå till `/feedback` och välj "Buggrapport"

2. **Fyll i formuläret:**
   - **Ämne:** Kort beskrivning av buggen
   - **Meddelande:** Detaljerad beskrivning:
     - Vad hände?
     - Vad förväntade du dig?
     - Steg för att återskapa buggen
     - Skärmdumpar (om möjligt)

3. **Inkludera teknisk information:**
   - Felmeddelande (kopiera från konsolen)
   - Sida där buggen uppstod
   - Webbläsare och version
   - Operativsystem

### Exempel på bra buggrapport:

```
Ämne: Faktura skapas utan kundinformation

Meddelande:
Vad hände:
- När jag skapar en faktura från ett projekt så skapas fakturan men den är tom - ingen kundinformation syns.

Vad förväntade jag mig:
- Fakturan ska innehålla kundens namn och kontaktinformation från projektet.

Steg för att återskapa:
1. Gå till ett projekt som har en kund kopplad
2. Klicka på "Skapa faktura"
3. Fakturan skapas men är tom

Teknisk information:
- Felmeddelande: Inget fel visas, fakturan skapas men är tom
- Sida: /projects/abc123-def456-ghi789
- Webbläsare: Chrome 120.0
- Konsol: [ingen errors]
```

---

## ✅ Test Checklist

Använd denna checklista när du testar:

```
□ Autentisering fungerar
□ Tenant isolation fungerar
□ Admin checks fungerar
□ Stämpelklocka fungerar korrekt
□ OB-beräkning är korrekt
□ Tidsrapportering fungerar
□ Projekt-skapande fungerar
□ Projekt-fakturering fungerar med kundinfo
□ Kund-hantering fungerar
□ Faktura-skapande fungerar
□ Faktura-redigering fungerar
□ PDF-export fungerar
□ E-postutskick fungerar
□ Lönespec fungerar
□ ROT-avdrag fungerar
□ ÄTA fungerar
□ GPS-tracking fungerar
□ Mobilvy fungerar
□ Error handling fungerar
□ "Rapportera bugg"-knapp visas vid errors
```

---

## 📊 Prioritering av Buggar

### 🔴 Kritisk (Fixas omedelbart)
- Säkerhetshål (tenant isolation, admin access)
- Dataförlust
- Appen kraschar helt

### 🟠 Hög (Fixas snart)
- Viktiga funktioner fungerar inte
- Felaktiga beräkningar (lön, fakturabelopp)
- Data synkas inte korrekt

### 🟡 Medel (Fixas vid tillfälle)
- UI-problem (text utanför skärmen)
- Mindre funktioner fungerar inte
- Förbättringar

### 🟢 Låg (Fixas om tid finns)
- Stilistiska problem
- Mindre UI-förbättringar
- Önskemål

---

## 🔍 Debugging Tips

### Chrome DevTools
- **Console:** Se JavaScript errors
- **Network:** Se API-anrop och responses
- **Application:** Se localStorage, cookies
- **Sources:** Sätt breakpoints för debugging

### Supabase Dashboard
- **Table Editor:** Verifiera att data sparas korrekt
- **Logs:** Se API-logs och errors
- **SQL Editor:** Kör queries för att verifiera data

### Vanliga Problem
- **Tenant ID mismatch:** Kolla att tenant_id är korrekt i alla queries
- **RLS blocking:** Kolla Row Level Security policies
- **Foreign key errors:** Verifiera att relaterade objekt finns
- **Missing columns:** Använd progressive fallback pattern

---

**Glöm inte:** Varje gång du hittar en bugg, klicka på "🐛 Rapportera bugg"-knappen för att rapportera den!


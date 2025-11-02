# 🏠 ROT-avdrag Implementation Status

## ✅ Komplett

1. **Databasschema** (`SUPABASE_ROT_SCHEMA.sql`)
   - ✅ `rot_applications` tabell med alla fält
   - ✅ `rot_status_history` tabell för statushistorik
   - ✅ `rot_api_logs` tabell för API-anrop
   - ✅ RLS policies för säkerhet
   - ✅ Triggers för automatisk uppdatering
   - ✅ Index för prestanda

2. **UI: Ny ROT-ansökan** (`app/rot/new/page.tsx`)
   - ✅ Formulär enligt SKV 5017
   - ✅ Validering av personnummer
   - ✅ Validering av belopp
   - ✅ Projekt- och kundval
   - ✅ Automatisk beräkning av totalkostnad
   - ✅ ROT-avdrag preview (30% av arbetskostnad)

3. **UI: ROT-ansökningar lista** (`app/rot/page.tsx`)
   - ✅ Lista över alla ansökningar
   - ✅ Statusfilter
   - ✅ Statusvisning med färger
   - ✅ Navigering till detaljsida

4. **Navigation**
   - ✅ Lagt till "ROT-avdrag" i Sidebar

## 🚧 Under utveckling

5. **UI: ROT-detaljsida** (`app/rot/[id]/page.tsx`)
   - ⏳ Visa ansökningsdetaljer
   - ⏳ Visa status och historik
   - ⏳ Knapp för att skicka till Skatteverket
   - ⏳ Knapp för att uppdatera status
   - ⏳ Knapp för att koppla till faktura
   - ⏳ Knapp för överklagande (vid avslag)

6. **API Integration: Skicka till Skatteverket** (`app/api/rot/[id]/submit/route.ts`)
   - ⏳ API-endpoint för att skicka ansökan
   - ⏳ Stub för Skatteverkets API (kan ersättas med riktig integration)
   - ⏳ Felhantering och retry-logik
   - ⏳ Sparar ärendenummer

7. **Statusuppföljning**
   - ⏳ API-endpoint för statusuppdatering (`app/api/rot/[id]/status/route.ts`)
   - ⏳ Manuell uppdatering via knapp
   - ⏳ Automatisk polling var 6:e timme (background job)

8. **Push-notiser**
   - ⏳ Notifikation vid godkännande
   - ⏳ Notifikation vid avslag
   - ⏳ iOS (APNs) och Android (FCM) support

9. **Faktura-koppling**
   - ⏳ Automatisk justering av fakturabelopp vid godkännande
   - ⏳ Knapp för att skicka faktura med ROT-avdrag

10. **Överklagande**
    - ⏳ Formulär för överklagande
    - ⏳ API-integration för att skicka överklagande

11. **Kryptering**
    - ⏳ Kryptering av personnummer i databasen
    - ⏳ Använd pgcrypto eller liknande

12. **GDPR-compliance**
    - ⏳ Exportfunktion för ROT-data
    - ⏳ Radering av ROT-data (anonymisering)

## 📝 Noteringar

### Skatteverkets API
Skatteverket har ett API för ROT/RUT-ansökningar via e-tjänster, men det kräver:
- BankID-autentisering
- Certifiering och registrering
- Specifik API-dokumentation från Skatteverket

För nu är det en **stub** som simulerar API-anrop. När riktig integration ska implementeras behöver du:
1. Kontakta Skatteverket för API-access
2. Implementera BankID-autentisering
3. Anpassa API-anropen till Skatteverkets specifikation

### Status polling
Automatisk statusuppdatering kan implementeras via:
- **Cron job** (t.ex. Vercel Cron, Supabase Edge Functions)
- **Background worker** (t.ex. BullMQ, Agenda.js)
- **Client-side polling** (mindre rekommenderat för produktion)

### Push-notiser
För push-notiser behöver du:
- **Firebase Cloud Messaging (FCM)** för Android
- **Apple Push Notification Service (APNs)** för iOS
- Service Worker för web push (valfritt)

## 🎯 Nästa steg

1. Kör `SUPABASE_ROT_SCHEMA.sql` i Supabase SQL Editor
2. Implementera ROT-detaljsidan (`app/rot/[id]/page.tsx`)
3. Implementera API-endpoints för att skicka och uppdatera status
4. Implementera status polling
5. Implementera push-notiser (valfritt för MVP)


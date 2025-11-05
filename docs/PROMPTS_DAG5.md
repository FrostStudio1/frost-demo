# 🌙 Prompts för Dag 5 - Integrationer & Fortnox Fix

## 📋 Översikt
Fortsätt med Fortnox/Visma-integrationer. Fokus på att fixa Fortnox OAuth-problem och förbättra integration-systemet.

---

## 🔍 PERPLEXITY PRO - Research Prompt

```
Du är en expert på Fortnox API och OAuth 2.0 integrationer.

RESEARCH UPPGIFT:
1. Fortnox OAuth 2.0 Authorization Code Flow
   - Korrekt implementation för Next.js server-side
   - Hur hantera redirect_uri i development (localhost:3000)
   - Vanliga fel och lösningar för "Invalid client" eller "Client ID saknas"

2. Environment Variables i Next.js
   - Varför .env.local inte laddas om servern inte startas om
   - Bästa praxis för att verifiera att env-variabler är laddade
   - Debugging-tekniker för att se om process.env innehåller rätt värden

3. Fortnox Developer Portal
   - Krav för OAuth-app registrering
   - Redirect URI format och tillåtna värden
   - Test-konton vs Production

VIKTIGT:
- Fokusera på praktiska lösningar och troubleshooting
- Ge exempel på korrekt vs felaktig implementation
- Inkludera vanliga felmeddelanden och deras fixar
- Aktuell information (2024-2025)

Returnera strukturerad research med:
- Problembeskrivning
- Rotorsak
- Lösningar (rankade efter sannolikhet)
- Code-exempel
- Debugging-steg
```

---

## 📝 NOTION PRO - Dokumentation Prompt

```
Du är project manager för Frost Solutions integration-projekt.

UPPGIFT:
Dokumentera dagens framsteg och skapa action plan för imorgon.

INCLUDE:
1. Status Update
   - ✅ Fixat: IntegrationStatusCard buggen (alla visade Fortnox)
   - ✅ Fixat: Premium design för integrations-sidan
   - ⚠️ Problem: Fortnox OAuth fungerar inte (client ID verkar inte laddas)
   - ⚠️ Problem: Användaren är admin men kan inte komma åt integrations-sidan

2. Action Plan för Imorgon
   - [ ] Debug Fortnox OAuth - verifiera att env-variabler laddas korrekt
   - [ ] Testa /api/integrations/fortnox/connect endpoint manuellt
   - [ ] Verifiera Fortnox Developer Portal settings
   - [ ] Fixa admin access-problem om det kvarstår
   - [ ] Testa hela OAuth-flödet från start till slut
   - [ ] Implementera error handling och user feedback

3. Technical Debt
   - IntegrationStatusCard är nu generisk (bra!)
   - Fortnox OAuth validering på plats (bra!)
   - Men: Fortnox connection fungerar inte ännu

4. Next Steps
   - Fixa Fortnox OAuth
   - Testa Visma OAuth (verkar fungera enligt användaren)
   - Implementera sync-jobb för fakturor och kunder
   - Skapa test-suite för integrationer

FORMAT:
Strukturerad Notion-dokumentation med checkboxes, code blocks, och action items.
```

---

## 🤖 GPT-5 - Backend Prompt

```
Du är en backend-expert för Next.js 16 App Router och Supabase.

UPPGIFT: Fixa Fortnox OAuth-problem och förbättra error handling

CURRENT PROBLEM:
- Användaren får "Fortnox Client ID saknas" trots att FORTNOX_CLIENT_ID=UFg21BcGXfMs finns i .env.local
- Servern verkar inte ladda environment-variablerna korrekt

TASKS:
1. Förbättra /api/integrations/fortnox/connect/route.ts
   - Lägg till debug-logging för env-variabler (säkert - inte logga secrets)
   - Verifiera att process.env.FORTNOX_CLIENT_ID faktiskt finns
   - Lägg till mer detaljerade felmeddelanden
   - Returnera hjälpsamma troubleshooting-tips i error response

2. Skapa diagnostic endpoint /api/integrations/debug/route.ts
   - Endpoint för att verifiera att env-variabler är laddade (utan att visa värden)
   - Returnera status: "loaded" eller "missing" för varje variabel
   - Endast tillgänglig i development mode

3. Förbättra error handling i OAuth flow
   - Bättre felmeddelanden vid OAuth-fel från Fortnox
   - Logging för troubleshooting
   - User-friendly error messages

4. Verifiera Fortnox OAuth implementation
   - Kontrollera att getAuthorizationUrl() använder rätt base URL
   - Verifiera redirect_uri format
   - Lägg till state validation i callback

REQUIREMENTS:
- TypeScript strict mode
- Matcha projektets patterns (extractErrorMessage, etc.)
- Inga console.log i production
- Säker hantering av secrets (aldrig logga eller exponera)

CODE STYLE:
- Använd existing patterns från projektet
- Följ Next.js 16 App Router conventions
- Använd Supabase admin client för database operations
```

---

## ✨ GEMINI 2.5 - Frontend Prompt

```
Du är en frontend-expert för React/Next.js med fokus på UX.

UPPGIFT: Förbättra integrations-sidan och error handling

CURRENT STATUS:
- Premium design är implementerad ✅
- IntegrationStatusCard är nu generisk ✅
- Men: Fortnox OAuth fungerar inte ännu ⚠️

TASKS:
1. Förbättra error display på integrations-sidan
   - Visa mer detaljerade felmeddelanden från API
   - Lägg till troubleshooting-tips direkt i UI
   - Visuell feedback när env-variabler saknas

2. Förbättra FortnoxConnectButton
   - Lägg till loading state med mer information
   - Visa specifika felmeddelanden från API
   - Lägg till "Test connection" knapp för debugging

3. Skapa Debug-panel (endast development)
   - Komponent som visar env-variable status (utan att visa värden)
   - Endast synlig i development mode
   - Hjälper med troubleshooting

4. Förbättra OAuth callback handling
   - Bättre error messages från URL params
   - Loading states under OAuth redirect
   - Success/error feedback

5. Premium polish
   - Smooth animations
   - Better spacing
   - Consistent color scheme

REQUIREMENTS:
- TypeScript strict
- Matcha projektets design system
- Använda lucide-react icons
- Responsive design
- Dark mode support

CODE STYLE:
- Använd existing hooks (useIntegrations, etc.)
- Följ Tailwind CSS patterns från projektet
- Använd toast notifications för feedback
```

---

## 🎯 CURSOR - Implementation Prompt

```
Du är huvud-implementeraren för Frost Solutions.

CONTEXT:
Vi har ett integrations-system med Fortnox och Visma. Fortnox OAuth fungerar inte ännu.

IMMEDIATE TASKS:
1. Debug Fortnox OAuth-problem
   - Verifiera att .env.local laddas korrekt
   - Testa /api/integrations/fortnox/connect endpoint
   - Fixa eventuella problem med env-variable loading

2. Implementera förbättringar från GPT-5 och Gemini
   - Diagnostic endpoint för env-variabler
   - Förbättrad error handling
   - Bättre UX på integrations-sidan

3. Testa hela OAuth-flödet
   - Från klick på "Anslut" till callback
   - Verifiera att tokens sparas korrekt
   - Testa att integration status uppdateras

4. Code review
   - Granska alla ändringar
   - Fixa eventuella TypeScript-fel
   - Verifiera att inget brutits

REQUIREMENTS:
- Testa alla ändringar innan commit
- Följ projektets code style
- Uppdatera dokumentation om nödvändigt
- Commit med tydliga messages

FOCUS:
Fixa Fortnox OAuth så att det fungerar från start till slut.
```

---

## 💻 COPILOT PLUS - Code Assistance Prompt

```
Du är code assistant för Frost Solutions.

UPPGIFT: Hjälp till med debugging och code improvements

FOCUS AREAS:
1. Environment Variables
   - Verifiera att .env.local format är korrekt
   - Hjälp med debugging env-variable loading
   - Suggest improvements för error handling

2. OAuth Implementation
   - Review Fortnox OAuth code för vanliga fel
   - Suggest improvements för security
   - Help with error handling

3. TypeScript
   - Fix type errors
   - Improve type safety
   - Add missing types

4. Code Quality
   - Suggest refactoring opportunities
   - Improve code readability
   - Add helpful comments

APPROACH:
- Be proactive - suggest fixes before errors occur
- Explain why changes are needed
- Reference existing patterns in codebase
- Keep code consistent with project style
```

---

## 🌊 WINDSURF - Comprehensive Context Prompt

```
Du är en senior fullstack-utvecklare och systemarkitekt för Frost Solutions - ett komplett projektlednings- och faktureringssystem byggt med Next.js 16, TypeScript, Supabase, och Tailwind CSS.

═══════════════════════════════════════════════════════════════════════════════
📋 PROJEKTÖVERSIKT
═══════════════════════════════════════════════════════════════════════════════

Frost Solutions är ett SaaS-system för svenska byggföretag med följande huvudfunktioner:
- Multi-tenant arkitektur (Supabase RLS)
- Projektledning med tidsrapportering
- Fakturering och kundhantering
- Arbetsordrar med status-flöden
- Employee management med roller (admin/employee)
- Offline-first med IndexedDB och sync-queue
- Dashboard med statistik och kalender
- ROT-avdrag och ÄTA-hantering

TECH STACK:
- Framework: Next.js 16 (App Router) med React Server Components
- Language: TypeScript (strict mode)
- Database: Supabase (PostgreSQL med RLS)
- Styling: Tailwind CSS med custom design system
- State Management: React Query (@tanstack/react-query)
- Offline: Dexie.js (IndexedDB), Service Worker, Sync Queue
- Authentication: Supabase Auth
- Icons: Lucide React
- Notifications: Sonner (via @/lib/toast)

PROJEKTSTRUKTUR:
- /app - Next.js App Router (pages, components, api routes)
- /app/lib - Core utilities (encryption, db, sync, integrations)
- /app/hooks - React Query hooks och custom hooks
- /app/components - Reusable UI components
- /app/types - TypeScript type definitions
- /sql - Database migrations och schema
- /docs - Dokumentation och prompts

═══════════════════════════════════════════════════════════════════════════════
🔌 INTEGRATIONS-SYSTEMET (DAG 4-5)
═══════════════════════════════════════════════════════════════════════════════

VI HAR IMPLEMENTERAT:
Ett komplett integrations-system för att synkronisera data mellan Frost och externa system (Fortnox och Visma).

DATABASE SCHEMA (app schema):
1. app.integrations
   - OAuth-konfigurationer per tenant och provider
   - Krypterade tokens (access_token, refresh_token, client_secret)
   - Status: disconnected | connected | error
   - Providers: fortnox | visma_eaccounting | visma_payroll

2. app.integration_jobs
   - Sync job queue med status (queued | running | success | failed | retry)
   - Exponential backoff retry strategy
   - Job types: full_sync, export, import, webhook

3. app.integration_mappings
   - Mappar lokal ID (Frost UUID) till remote ID (Fortnox/Visma ID)
   - Entity types: invoice, customer, employee, project, time_entry, etc.

4. app.sync_logs
   - Audit trail för alla sync-operationer
   - Levels: info | warn | error

VIKTIGA FILER:
- app/lib/integrations/fortnox/oauth.ts - OAuth 2.0 flow
- app/lib/integrations/fortnox/client.ts - API client med rate limiting
- app/lib/integrations/visma/oauth.ts - Visma OAuth
- app/lib/integrations/token-storage.ts - Krypterad token-lagring
- app/lib/integrations/sync/export.ts - Export från Frost till Fortnox
- app/lib/integrations/sync/import.ts - Import från Fortnox till Frost
- app/lib/integrations/sync/mappers.ts - Data transformation
- app/lib/encryption.ts - AES-256-GCM encryption för tokens

API ENDPOINTS:
- POST /api/integrations/fortnox/connect - Starta OAuth flow
- GET /api/integrations/fortnox/callback - OAuth callback handler
- POST /api/integrations/visma/connect - Starta Visma OAuth
- GET /api/integrations/visma/callback - Visma callback
- POST /api/integrations/[id]/sync - Queue sync job
- GET /api/integrations/[id]/status - Hämta integration status
- POST /api/integrations/[id]/export - Manuell export
- GET /api/integrations - Lista alla integrationer
- DELETE /api/integrations/[id] - Koppla bort integration

FRONTEND:
- app/settings/integrations/page.tsx - Huvudsida för integrations
- app/components/integrations/IntegrationStatusCard.tsx - Status för integration
- app/components/integrations/FortnoxConnectButton.tsx - OAuth start knapp
- app/components/integrations/VismaConnectButton.tsx - Visma OAuth knapp
- app/components/integrations/SyncDashboard.tsx - Visa sync jobs
- app/components/integrations/SyncHistory.tsx - Audit log
- app/components/integrations/ExportButtons.tsx - Manuell export UI
- app/hooks/useIntegrations.ts - React Query hooks för integrations

═══════════════════════════════════════════════════════════════════════════════
⚠️ AKTUELLA PROBLEM (DAG 5)
═══════════════════════════════════════════════════════════════════════════════

PROBLEM 1: FORTNOX OAUTH FUNGERAR INTE
Symptom:
- Användaren klickar på "Anslut till Fortnox"
- Får felmeddelande: "Fortnox Client ID saknas. Kontrollera att FORTNOX_CLIENT_ID är satt i .env.local och starta om servern."

Fakta:
- FORTNOX_CLIENT_ID=UFg21BcGXfMs finns i .env.local
- FORTNOX_CLIENT_SECRET=9r7SqU8WDT finns i .env.local
- Användaren har startat om servern (enligt instruktioner)
- Men servern verkar fortfarande inte hitta env-variablerna

Möjliga orsaker:
1. .env.local laddas inte korrekt i Next.js 16
2. Environment-variabler är inte tillgängliga i API routes
3. Formatfel i .env.local (mellanslag, citattecken, etc.)
4. Next.js cache-problem
5. Servern körs i fel läge (development vs production)

KOD SOM BEHÖVER GRANSKAS:
- app/api/integrations/fortnox/connect/route.ts
  - Validerar env-variabler men hittar dem inte
  - Använder process.env.FORTNOX_CLIENT_ID
  - Returnerar error om clientId saknas eller innehåller placeholder

- app/lib/integrations/fortnox/oauth.ts
  - getAuthorizationUrl() använder process.env.FORTNOX_CLIENT_ID
  - Skapar OAuth URL med client_id parameter

PROBLEM 2: ADMIN ACCESS (DELVIS LÖST)
Symptom:
- Användaren är inloggad som admin
- Men kan inte komma åt integrations-sidan (först)
- Nu verkar det fungera efter hydration-fix

Status:
- ✅ Fixat: Hydration error i SidebarClient
- ✅ Fixat: Admin-sektionen visas nu korrekt
- ⚠️ Behöver verifieras: Fungerar admin-check konsekvent?

═══════════════════════════════════════════════════════════════════════════════
✅ VAD SOM ÄR FIXAT IDAG (DAG 4)
═══════════════════════════════════════════════════════════════════════════════

1. IntegrationStatusCard Bug
   - Problem: Alla 3 integration-kort visade Fortnox-knapp
   - Fix: Gjorde komponenten generisk med getProviderInfo()
   - Nu: Visar rätt knapp för varje provider (Fortnox, Visma eAccounting, Visma Payroll)

2. Premium Design
   - Problem: Integrations-sidan var "VÄLDIGT ful"
   - Fix: Redesign med premium design
   - Nu: Gradient-kort, hover-effekter, bättre spacing, moderna UI-element

3. Fortnox OAuth Validering
   - Problem: Inga felmeddelanden när env-variabler saknas
   - Fix: Validering i /api/integrations/fortnox/connect/route.ts
   - Nu: Tydliga felmeddelanden om env-variabler saknas eller är felaktiga

4. Visma OAuth
   - Status: Verkar fungera (enligt användaren)
   - Visma-knappar leder till rätt login-sida

═══════════════════════════════════════════════════════════════════════════════
🔧 TEKNISK KONTEKT
═══════════════════════════════════════════════════════════════════════════════

ENVIRONMENT VARIABLES (.env.local):
För integrations-systemet behövs:
- FORTNOX_CLIENT_ID=UFg21BcGXfMs
- FORTNOX_CLIENT_SECRET=9r7SqU8WDT
- FORTNOX_REDIRECT_URI=http://localhost:3000/api/integrations/fortnox/callback
- VISMA_CLIENT_ID=...
- VISMA_CLIENT_SECRET=...
- ENCRYPTION_KEY_256_BASE64=... (32 byte key, Base64 encoded)

VIKTIGT: Next.js 16 laddar .env.local vid server-start. Om servern inte startas om efter ändringar, används gamla värden.

SUPABASE SCHEMA:
- Tabeller ligger i `app` schema (inte `public`)
- Supabase använder `search_path = public, app` för att hitta tabeller
- För writes till `app` schema: Använd admin client eller RPC functions
- PUBLIC VIEWs exponerar `app` schema tabeller via `public` schema för read-only access

OAUTH 2.0 FLOW:
1. Användare klickar "Anslut till Fortnox"
2. Frontend: useConnectFortnox() mutation
3. API: POST /api/integrations/fortnox/connect
   - Skapar integration record i app.integrations
   - Genererar OAuth authorization URL
   - Returnerar URL till frontend
4. Frontend: Redirectar till Fortnox authorization page
5. Användare: Godkänner/nekar access
6. Fortnox: Redirectar till callback URL med code
7. API: GET /api/integrations/fortnox/callback
   - Exchangerar code för tokens
   - Sparar krypterade tokens i database
   - Uppdaterar integration status till "connected"
8. Frontend: Redirectar till /settings/integrations?connected=fortnox

ERROR HANDLING:
- Använd extractErrorMessage() från @/lib/errorUtils
- Toast notifications via @/lib/toast
- User-friendly felmeddelanden på svenska
- Debug-logging i development mode

CODE PATTERNS:
- API routes: NextRequest/NextResponse
- Error handling: try/catch med extractErrorMessage()
- TypeScript: Strict mode, explicit types
- Supabase: Admin client för RLS bypass
- Encryption: AES-256-GCM via encryptJSON()
- React Query: useQuery/useMutation patterns

═══════════════════════════════════════════════════════════════════════════════
🎯 DINA UPPGIFTER (DAG 5)
═══════════════════════════════════════════════════════════════════════════════

PRIORITET 1: FIXA FORTNOX OAUTH
1. Debug environment variable loading
   - Verifiera att .env.local faktiskt laddas
   - Testa process.env.FORTNOX_CLIENT_ID i API route
   - Skapa diagnostic endpoint för att checka env-status
   - Lägg till debug-logging (säkert - inte logga secrets)

2. Verifiera Fortnox OAuth implementation
   - Kontrollera att getAuthorizationUrl() använder rätt värden
   - Verifiera redirect_uri format
   - Testa att OAuth URL genereras korrekt
   - Kontrollera Fortnox Developer Portal settings

3. Förbättra error handling
   - Mer detaljerade felmeddelanden
   - Troubleshooting-tips i UI
   - Logging för debugging

PRIORITET 2: VERIFIERA ADMIN ACCESS
- Testa att admin-check fungerar konsekvent
- Verifiera att integrations-sidan är tillgänglig för admin
- Fixa eventuella edge cases

PRIORITET 3: TESTA HELA FLÖDET
- Testa OAuth flow från start till slut
- Verifiera att tokens sparas korrekt (krypterade)
- Testa att integration status uppdateras
- Verifiera att callback fungerar

═══════════════════════════════════════════════════════════════════════════════
📝 KODSTANDARDER
═══════════════════════════════════════════════════════════════════════════════

1. TypeScript: Strict mode, explicit types, no any (utom där nödvändigt)
2. Error handling: Använd extractErrorMessage() för alla errors
3. Supabase: Använd admin client för writes till app schema
4. Encryption: Alltid kryptera tokens/secrets innan lagring
5. Logging: console.log endast i development, använd console.error för errors
6. UI: Använd toast notifications för user feedback
7. API: Returnera tydliga error messages på svenska
8. Code style: Matcha existing patterns i projektet
9. Testing: Testa alla ändringar innan commit
10. Documentation: Uppdatera docs om nödvändigt

═══════════════════════════════════════════════════════════════════════════════
🔍 DEBUGGING-RESURSER
═══════════════════════════════════════════════════════════════════════════════

FILES TO CHECK:
- app/api/integrations/fortnox/connect/route.ts (huvudproblemet)
- app/lib/integrations/fortnox/oauth.ts (OAuth URL generation)
- app/lib/integrations/token-storage.ts (token encryption)
- app/components/integrations/FortnoxConnectButton.tsx (UI trigger)
- app/hooks/useIntegrations.ts (React Query hooks)

DOCUMENTATION:
- docs/VERIFY_FORTNOX_CREDENTIALS.md - Guide för env-variabler
- docs/INTEGRATION_IMPLEMENTATION_NOTES.md - Implementation details
- docs/ENV_SETUP_GUIDE.md - Environment setup
- sql/CREATE_INTEGRATIONS_TABLES.sql - Database schema

TESTING:
- Testa /api/integrations/fortnox/connect manuellt (POST request)
- Kontrollera server console för debug-logs
- Verifiera .env.local format (inga mellanslag, citattecken, etc.)
- Testa att servern har startats om efter .env.local ändringar

═══════════════════════════════════════════════════════════════════════════════
🚀 FÖRVÄNTAT RESULTAT
═══════════════════════════════════════════════════════════════════════════════

När Fortnox OAuth är fixat ska:
1. Användare kunna klicka "Anslut till Fortnox"
2. OAuth flow starta korrekt (redirect till Fortnox)
3. Användare kunna godkänna access
4. Callback hantera tokens korrekt
5. Integration status uppdateras till "connected"
6. Användare redirectas tillbaka till integrations-sidan med success message

LYCKA TILL! 🚀
```

---

## 🌙 Godnatt!

**Sammanfattning för imorgon:**
- ✅ IntegrationStatusCard är fixad (visar rätt knapp för varje provider)
- ✅ Premium design är implementerad
- ⚠️ Fortnox OAuth behöver fixas (env-variabler laddas inte?)
- ⚠️ Admin access behöver verifieras

**Första steg imorgon:**
1. Debug Fortnox OAuth - verifiera env-variabler
2. Testa /api/integrations/fortnox/connect manuellt
3. Verifiera Fortnox Developer Portal settings

**Alla prompts är sparade i: `docs/PROMPTS_DAG5.md`**

Godnatt! 🚀✨


# Frost Bygg - Applikationssammanfattning

## 📋 Översikt

Frost Bygg är en komplett projekt- och tidsrapporteringslösning för byggföretag byggd med Next.js 16, React, TypeScript, Supabase och Tailwind CSS. Applikationen är designad för att hantera projekthantering, tidsrapportering, fakturering, lönespecifikationer, ROT-avdrag, GPS-tracking och administrativa uppgifter.

## 🏗️ Teknisk Stack

- **Frontend Framework**: Next.js 16 (App Router)
- **Språk**: TypeScript
- **Styling**: Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL)
- **Autentisering**: Supabase Auth (Google & Email)
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Maps/GPS**: Browser Geolocation API
- **AI**: Hugging Face Inference API (gratis tier)
- **PDF Generation**: jsPDF + html2canvas
- **Email**: Resend/SendGrid (valfritt)

## 🎯 Huvudfunktioner

### 1. **Dashboard** (`/dashboard`)
- Översikt över aktiva projekt
- Snabbstatistik (projekt, anställda, fakturor)
- Stämpelklocka med GPS-tracking
- Snabbåtkomst till vanliga funktioner

### 2. **Stämpelklocka** (Time Clock)
- **Läge**: Inbyggd i Dashboard
- **Funktioner**:
  - Snabb in-/utstämpling
  - Automatisk OB-beräkning (kväll 18-22, natt 22-06, helg)
  - GPS auto-checkin (500m radie, konfigurerbart)
  - Realtidsvisning av förflutna timmar
  - Avrundning till minst 0.5 timmar
- **GPS-funktioner**:
  - Auto-checkin när användare är nära arbetsplats
  - Kontinuerlig positionstracking
  - Visar avstånd till närmaste arbetsplats

### 3. **Projekt** (`/projects`)
- Visa alla aktiva projekt
- Projektstatus och förloppsbalkar
- Budget vs faktiska timmar
- Projektarkiv (`/projects/archive`)
- **Projektdetaljer** (`/projects/[id]`):
  - Detaljerad statistik
  - AI-sammanfattning (gratis via Hugging Face)
  - Skapa faktura direkt
  - PDF-export

### 4. **Anställda** (`/employees`)
- Lista över alla anställda
- Lägg till/ta bort anställda (admin)
- Rollhantering (admin/employee)
- Lönespecifikationer per anställd (`/payroll/employeeID/[employeeId]`)

### 5. **Lönespecifikationer** (`/payroll`)
- Personliga lönespecifikationer för anställda
- Admins kan se alla
- PDF/CSV export
- Automatisk OB-beräkning
- OB-typer: Vanlig, Kväll, Natt, Helg

### 6. **Kunder** (`/clients`)
- Kundhantering
- Organisationnummer
- Koppling till projekt

### 7. **Fakturor** (`/invoices`)
- Skapa fakturor från projekt
- PDF-generering
- Email-utskick (valfritt)
- Statusspårning (betalad/obetald)

### 8. **Rapporter** (`/reports`)
- Tidsrapporter (alla eller egna)
- Manuell tidsrapportering (`/reports/new`)
- Filtrering per anställd (admins)
- OB-typer och totaler

### 9. **ROT-avdrag** (`/rot`)
- Skapa ROT-ansökningar
- Integration med Skatteverket
- Krypterad lagring av känslig data
- Statusspårning

### 10. **ÄTA (Åtgärder)** (`/aeta`)
- Hantera åtgärder och problem
- Prioritering och status

### 11. **GPS & Arbetsplatser** (Admin)
- **Arbetsplatser** (`/admin/work-sites`):
  - Skapa/redigera/ta bort arbetsplatser
  - GPS-koordinater och radie
  - Auto-checkin inställningar
- **Live Karta** (`/admin/live-map`):
  - Se alla incheckade anställda i realtid
  - GPS-positioner på karta
  - Uppdateras automatiskt var 30:e sekund

### 12. **AI-sammanfattning** (Gratis)
- **Integration**: Hugging Face Inference API
- **Funktioner**:
  - Sammanfatta projekt (status, framsteg, problem)
  - Sammanfatta fakturor (poster, totaler)
- **Fallback**: Template-baserad sammanfattning om AI inte är tillgänglig

### 13. **FAQ** (`/faq`)
- Vanliga frågor och svar
- Kategoriserad (Stämpelklocka, OB-beräkning, Projekt, etc.)
- Sökfunktion

### 14. **Feedback** (`/feedback`)
- Buggrapporter
- Email till `vilmer.frost@gmail.com`
- Resend/SendGrid integration (valfritt)

## 🔐 Säkerhet & Åtkomstkontroll

### Row Level Security (RLS)
- Alla tabeller har RLS aktiverat
- Tenant-isolation (multi-tenant)
- Anställda ser endast sina egna data
- Admins ser allt för sin tenant

### Rollhantering
- **Admin**: Full åtkomst till allt
- **Employee**: Egen data endast
- API-routes använder service role för RLS-bypass där nödvändigt

### API Routes med Service Role
- `/api/admin/check` - Admin-kontroll
- `/api/admin/fix-role` - Fixa admin-role
- `/api/admin/live-map` - Live-karta data
- `/api/work-sites` - Arbetsplatshantering
- `/api/employees/create` - Skapa anställda
- `/api/onboarding/*` - Onboarding-processer

## 📱 Responsiv Design

- **Mobil-first**: Alla sidor är optimerade för mobil
- **Breakpoints**: `sm:`, `md:`, `lg:`, `xl:`
- **Touch-friendly**: Stora knappar, bra spacing
- **Sidebar**: Hamburger-meny på mobil, permanent på desktop

## 🎨 Design & UX

### Färgschema
- Gradient-baserad design (blue → purple → pink)
- Mörkt läge (dark mode) stöd
- Tailwind CSS för konsistent styling

### Komponenter
- **Sidebar**: Navigering med ikoner
- **Cards**: Gradient-bakgrunder, skuggor
- **Buttons**: Gradient-knappar med hover-effekter
- **Forms**: Moderna input-fält med focus-states

## 📊 Database Schema (Supabase)

### Huvudtabeller
- `tenants` - Företag/organisationer
- `employees` - Anställda (kopplade till tenants)
- `projects` - Projekt
- `clients` - Kunder
- `time_entries` - Tidsrapporter
- `invoices` - Fakturor
- `work_sites` - Arbetsplatser (GPS)
- `gps_tracking_points` - Detaljerad GPS-tracking
- `rot_applications` - ROT-ansökningar
- `aeta_requests` - Åtgärder

### Viktiga Kolumner
- `tenant_id` - Alltid krävs för multi-tenant isolation
- `auth_user_id` - Koppling till Supabase Auth
- `role` - 'admin' eller 'employee'
- GPS-kolumner: `start_location_lat/lng`, `end_location_lat/lng`

## 🔄 Onboarding Process

1. **Steg 1**: Skapa tenant (företag)
2. **Steg 2**: Skapa admin-användare
3. **Steg 3**: Skapa första kund
4. **Steg 4**: Skapa första projekt

Alla steg använder API-routes med service role för att kringgå RLS under skapandet.

## 🛠️ Development Setup

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_key (optional)
SENDGRID_API_KEY=your_sendgrid_key (optional)
```

### Database Migrations
- Kör SQL-filer i Supabase SQL Editor:
  - `SUPABASE_CREATE_WORK_SITES.sql`
  - `SUPABASE_ADD_BASE_RATE.sql`
  - Andra migrations vid behov

## 🐛 Felhantering

### Progressive Fallback
- Hantering av saknade databaskolumner
- Fallback för AI om API inte är tillgänglig
- Graceful degradation överallt

### Error Boundaries
- React Error Boundaries
- Toast-notifikationer för användarfeedback
- Console logging för debugging

## 🚀 Deployment

- **Platform**: Vercel (rekommenderat för Next.js)
- **Database**: Supabase (hosted PostgreSQL)
- **Storage**: Supabase Storage (för PDFs, dokument)

## 📝 Viktiga Filer

### Komponenter
- `app/components/TimeClock.tsx` - Stämpelklocka
- `app/components/Sidebar.tsx` / `SidebarClient.tsx` - Navigering
- `app/components/AISummary.tsx` - AI-sammanfattning
- `app/components/PayslipExport.tsx` - PDF/CSV export

### API Routes
- `app/api/admin/*` - Admin-funktioner
- `app/api/ai/summarize` - AI-sammanfattning
- `app/api/employees/create` - Skapa anställda
- `app/api/work-sites/*` - Arbetsplatshantering

### Utils
- `lib/obCalculation.ts` - OB-beräkning
- `lib/timeRounding.ts` - Tidsavrundning
- `lib/gpsUtils.ts` - GPS-funktioner
- `hooks/useAdmin.ts` - Admin-check hook

## 🎯 Framtida Förbättringar

1. **PWA Support**: Service Worker redan implementerad
2. **Offline Mode**: Basfunktioner offline
3. **Push Notifications**: För påminnelser
4. **Advanced Analytics**: Dashboard med grafer
5. **Mobile App**: React Native wrapper

## 📞 Support & Feedback

- **FAQ**: `/faq`
- **Feedback**: `/feedback`
- **Admin Debug**: `/admin/debug` (för troubleshooting)

---

**Version**: 1.0.0  
**Byggd med**: ❤️ och Next.js 16  
**License**: Proprietary


# 🔍 Perplexity Pro Prompt - Dag 2: Arbetsorder-system

## 📋 Kopiera denna prompt till Perplexity Pro:

```
Du är research-assistent för Frost Solutions, ett byggföretags mjukvaruprojekt.

LÄGET JUST NU (Dag 2 - Arbetsorder-system):
- Vi ska implementera ett dedikerat arbetsorder-system med statusflöde och foto-upload
- Teknisk stack: Next.js 16 (App Router), Supabase (PostgreSQL), TypeScript, React Query, Tailwind CSS
- Vi har redan implementerat schema/resursplanering-system (Dag 1) med success
- Vi har redan foto-upload funktionalitet för ÄTA (rot_applications) som vi kan referera till

EXISTERANDE KODBASE:
- Foto-upload pattern finns i /api/ata/[id]/photos/route.ts
- Supabase Storage bucket: 'ata-photos' (vi kan skapa 'work-order-photos')
- Patterns: tenant isolation, RLS policies, service role för admin, Zod validation
- Komponenter: ScheduleCalendar, ScheduleModal (vi kan följa samma modal-pattern)

RESEARCH-UPPGIFTER FÖR DAG 2:

1. WORK ORDER PATTERNS & BEST PRACTICES:
   - Hur designar man ett arbetsorder-system för byggbranschen?
   - Vilka är vanliga statusflöden för arbetsorder? (Ny → Tilldelad → Pågående → Klar → Godkänd)
   - Hur hanterar man prioriteter i arbetsorder-system?
   - Best practices för arbetsorder-UI/UX i mobil-appar
   - Hur kopplar man arbetsorder till projekt och anställda?
   - Exempel på arbetsorder-system i byggbranschen (Fieldwire, Procore, etc.)

2. STATUS TRANSITION PATTERNS:
   - Hur validerar man status transitions (vilka transitions är tillåtna)?
   - Best practices för status transition validation i backend
   - State machine patterns för arbetsorder-status
   - Hur hanterar man rollbaserad access till status transitions?
   - PostgreSQL patterns för status transitions (CHECK constraints, triggers?)
   - TypeScript enum/union types för status values

3. FOTO-UPLOAD PATTERNS MED SUPABASE STORAGE:
   - Best practices för foto-upload i arbetsorder-system
   - Hur strukturerar man Supabase Storage buckets för arbetsorder-foton?
   - Multipart/form-data handling i Next.js 16 App Router
   - Foto-compression och thumbnail-generation
   - Foto-galleri patterns för React
   - Mobile foto-upload best practices
   - Drag & drop foto-upload för desktop
   - Progress indicators för foto-upload
   - Error handling för foto-upload failures

4. PUSH NOTIFICATION SETUP FÖR PWA:
   - Hur sätter man upp push notifications i Next.js PWA?
   - Service Worker patterns för push notifications
   - Web Push API best practices
   - Supabase Realtime + push notifications integration
   - Hur triggar man push notifications vid status changes?
   - Mobile push notification setup (iOS Safari, Android Chrome)
   - Notification permission handling

5. WORK ORDER UI/UX PATTERNS:
   - Kort-lista vs detaljvy patterns för arbetsorder
   - Filter och sortering UI patterns
   - Status badge designs och färger
   - Priority indicators (visual design)
   - Foto-galleri UI patterns
   - Mobile-optimized arbetsorder views
   - Drag & drop för att ändra status (t.ex. Trello-style)
   - Loading states och skeleton screens

VAD JAG BEHÖVER:

FÖR VARJE RESEARCH-PUNKT:
- ✅ Sammanfattning av best practices
- ✅ Konkreta kod-exempel som matchar vår stack (Next.js 16, Supabase, TypeScript)
- ✅ Jämförelse av alternativ med för- och nackdelar
- ✅ Rekommenderad approach med motivation
- ✅ Länkar till dokumentation och tutorials
- ✅ Vanliga pitfalls att undvika
- ✅ Implementation-steg och checklist

VIKTIGT ATT TA HÄNSYN TILL:
- Vi använder Supabase RLS (Row Level Security) för multi-tenant isolation
- Alla API routes använder getTenantId() för tenant resolution
- Vi har redan useAdmin() hook för admin-kontroll
- Vi följer mobile-first design approach
- Vi använder TypeScript med strict mode
- Vi har Tailwind CSS design system med specificerade färger
- Vi har redan foto-upload pattern i projektet (kan referera till)

EXEMPEL PÅ VAD JAG VILL HA:
- "För status transitions, rekommenderar jag X pattern eftersom Y, här är kodexempel..."
- "För foto-upload, Supabase Storage är perfekt för oss eftersom vi redan använder det, här är hur du implementerar..."
- "För push notifications, Web Push API fungerar bra med Next.js, men du behöver X och Y..."

Ge mig konkreta, actionable recommendations med kod-exempel!
```

---

## 🎯 Användning

1. **Kopiera hela prompten** ovan (från "Du är research-assistent...")
2. **Klistra in i Perplexity Pro**
3. **Vänta på research results**
4. **Använd resultaten** för att ta beslut (Cursor Pro) och implementera (GPT-5/Gemini)

---

**Status:** ✅ Redo för Dag 2 research! 🚀


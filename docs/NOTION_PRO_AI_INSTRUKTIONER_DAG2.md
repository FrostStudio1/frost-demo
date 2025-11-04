# 📋 Notion Pro AI Instruktioner - Dag 2 Task Breakdown & Dag 1 Dokumentation

## 🎯 Instruktion för Notion Pro AI

Kopiera denna text och skicka till Notion Pro AI:

---

```
Du är projektledare och dokumenterar progress för Frost Solutions.

DAGENS UPPGIFTER:

1. TA BORT GAMLA TASK BREAKDOWN:
   - Ta bort alla gamla task breakdowns för Dag 1 från Notion-dokumentet
   - Behåll endast den kompletta dokumentationen för Dag 1 (se punkt 3)

2. SKAPA TASK BREAKDOWN FÖR DAG 2:
   Skapa en komplett task breakdown för Dag 2: Arbetsorder-system med följande struktur:

   ## 📋 Dag 2: Arbetsorder-system - Task Breakdown
   
   **Mål:** Dedikerat arbetsorder-system med statusflöde och foto-upload
   
   ### ⏰ 08:00-09:00: Morning Planning & Research (1h)
   
   #### Research Tasks (Perplexity Pro - 30 min)
   - [ ] Research work order patterns och best practices
   - [ ] Research status transition patterns för arbetsorder
   - [ ] Research push notification setup för PWA
   - [ ] Research foto-upload patterns med Supabase Storage
   - [ ] Research work order UI/UX patterns
   
   #### Task Planning (Notion Pro - 10 min)
   - [ ] Review dagens mål och deliverables
   - [ ] Skapa subtasks för alla steg
   - [ ] Estimera tidsåtgång per task
   
   ### ⏰ 09:00-12:00: Backend Development (3h)
   
   #### Database & API Design (GPT-5 - 2h)
   - [ ] Design work_orders tabell schema:
       - [ ] Kolumner: id, tenant_id, project_id, employee_id, title, description, status, priority, created_at, updated_at, assigned_at, completed_at, approved_at
       - [ ] Status: 'new' → 'assigned' → 'in_progress' → 'completed' → 'approved'
       - [ ] Priority: 'low', 'medium', 'high', 'urgent'
       - [ ] Foreign keys och RLS policies
   - [ ] Skapa SQL migration för work_orders tabell
   - [ ] Design work_order_photos tabell (för foto-upload)
   - [ ] Skapa SQL migration för work_order_photos
   - [ ] Design status transition validation logic
   - [ ] Skapa API endpoints:
       - [ ] POST /api/work-orders - Skapa arbetsorder
       - [ ] GET /api/work-orders - Lista arbetsorder (med filters)
       - [ ] GET /api/work-orders/[id] - Hämta specifik arbetsorder
       - [ ] PUT /api/work-orders/[id] - Uppdatera arbetsorder
       - [ ] DELETE /api/work-orders/[id] - Ta bort arbetsorder
       - [ ] POST /api/work-orders/[id]/status - Ändra status (med validation)
       - [ ] POST /api/work-orders/[id]/photos - Ladda upp foto
       - [ ] DELETE /api/work-orders/[id]/photos/[photoId] - Ta bort foto
   
   #### Backend Review & Integration (Cursor Pro - 1h)
   - [ ] Review GPT-5's SQL migration (RLS policies, indexes, constraints)
   - [ ] Review GPT-5's API endpoints (error handling, validation, tenant isolation)
   - [ ] Kör SQL migration i Supabase
   - [ ] Testa API endpoints med Postman/curl
   - [ ] Fixa eventuella bugs eller förbättringar
   
   ### ⏰ 13:00-17:00: Frontend Development (4h)
   
   #### UI Components Design (Gemini 2.5 - 2h)
   - [ ] Skapa WorkOrderCard komponent:
       - [ ] Visa arbetsorder-info (title, status, priority, employee, project)
       - [ ] Status badge med färger
       - [ ] Priority indicator
       - [ ] Foto-preview (om finns)
       - [ ] Click to open detail view
   - [ ] Skapa WorkOrderList komponent:
       - [ ] Lista arbetsorder med filters (status, priority, project, employee)
       - [ ] Sortering (datum, priority, status)
       - [ ] Pagination eller infinite scroll
       - [ ] Mobile-optimized layout
   - [ ] Skapa WorkOrderDetail page/komponent:
       - [ ] Full arbetsorder-info
       - [ ] Status transition buttons (med validation)
       - [ ] Foto-galleri med upload-funktionalitet
       - [ ] Kommentarer/sektion (för framtida implementation)
       - [ ] Mobile-optimized view
   
   #### Frontend Review & Integration (Cursor Pro - 1h)
   - [ ] Review Gemini's komponenter (struktur, styling, funktionalitet)
   - [ ] Integrera komponenter med API
   - [ ] Testa foto-upload funktionalitet
   - [ ] Testa status transitions
   - [ ] Fixa eventuella bugs eller förbättringar
   
   #### Mobile Optimization (Gemini 2.5 - 1h)
   - [ ] Optimera WorkOrderList för mobile (touch-friendly, swipe gestures)
   - [ ] Optimera WorkOrderDetail för mobile (bottom sheet för actions)
   - [ ] Foto-upload optimization för mobile
   - [ ] Testa på olika screen sizes
   
   ### ⏰ 18:00-20:00: Push Notifications & Integration (2h)
   
   #### Push Notifications Setup (Cursor Pro - 1h)
   - [ ] Research PWA push notification setup
   - [ ] Setup service worker för push notifications
   - [ ] Integrera push notifications med arbetsorder-status ändringar
   - [ ] Testa push notifications på mobile och desktop
   
   #### Full Integration Testing (Cursor Pro - 1h)
   - [ ] Testa hela flödet:
       - [ ] Skapa arbetsorder
       - [ ] Tilldela till anställd
       - [ ] Ändra status till "in_progress"
       - [ ] Ladda upp foto
       - [ ] Markera som "completed"
       - [ ] Godkänn (status "approved")
   - [ ] Testa edge cases:
       - [ ] Ogiltiga status transitions
       - [ ] Foto-upload errors
       - [ ] Network errors
       - [ ] Tenant isolation
   - [ ] Fixa alla bugs som hittas
   
   #### Git Commit & Documentation (Cursor Pro - 30 min)
   - [ ] Final review av all kod
   - [ ] Git commit med tydligt meddelande
   - [ ] Uppdatera Notion med completion status
   
   ### ✅ Success Checklist för Dag 2
   
   - [ ] Morning planning completed (08:00-09:00)
   - [ ] Research completed (Perplexity)
   - [ ] Database schema designad och migrerad (GPT-5)
   - [ ] API endpoints working (GPT-5)
   - [ ] Frontend components created (Gemini)
   - [ ] Foto-upload fungerar (Gemini + Cursor)
   - [ ] Status transitions fungerar med validation (GPT-5 + Cursor)
   - [ ] Push notifications setup (Cursor)
   - [ ] Mobile optimization done (Gemini)
   - [ ] Full testing passed (Cursor)
   - [ ] Git commit done (Cursor)
   - [ ] Notion updated (Notion Pro)

3. SKAPA DOKUMENTATION FÖR DAG 1:
   Skapa en komplett dokumentation för Dag 1: Resursplanering & Schema med följande struktur:

   ## 📚 Dag 1: Resursplanering & Schema - Dokumentation
   
   **Status:** ✅ KOMPLETT
   **Datum:** [Dagens datum]
   
   ### 🎯 Mål för Dag 1
   Implementera drag & drop schema, bemanning per projekt, och frånvarohantering.
   
   ### ✅ Genomförda Features
   
   #### Backend (GPT-5):
   - ✅ SQL migration: ADD_SHIFT_TYPE_TRANSPORT.sql
   - ✅ schedule_slots tabell med kolumner:
       - shift_type (day/night/evening/weekend/other)
       - transport_time_minutes
       - Standard kolumner (id, tenant_id, project_id, employee_id, start_time, end_time, status, etc.)
   - ✅ absences tabell för frånvarohantering
   - ✅ API endpoints:
       - POST /api/schedules - Skapa schema
       - GET /api/schedules - Lista scheman (med filters)
       - PUT /api/schedules/[id] - Uppdatera schema
       - DELETE /api/schedules/[id] - Ta bort schema
       - POST /api/absences - Skapa frånvaro
       - GET /api/absences - Lista frånvaro
   - ✅ Conflict detection (PostgreSQL EXCLUDE constraint + app-level checking)
   - ✅ Auto-time entry creation från completed schedules
   - ✅ Automatiska notifikationer när schema skapas
   
   #### Frontend (Gemini 2.5):
   - ✅ ScheduleCalendar komponent - Veckovy med drag & drop (@dnd-kit)
   - ✅ ScheduleModal komponent - Form för att skapa/redigera scheman
   - ✅ ScheduleSlot komponent - Draggable card för schemapass
   - ✅ AbsenceCalendar komponent - Kalender för frånvaro
   - ✅ AbsenceModal komponent - Form för frånvaro
   - ✅ shift_type dropdown i ScheduleModal
   - ✅ transport_time_minutes input i ScheduleModal
   - ✅ Vecko-skapande knapp
   - ✅ "Schema lägga på flera projekt" knapp
   - ✅ Admin-only knappar (alla kan se scheman)
   - ✅ Mobile-optimized components
   
   #### Integration & Fixes (Cursor Pro):
   - ✅ Admin-only för schemaläggning (alla kan se scheman)
   - ✅ Fixat useEffect dependency array error
   - ✅ Fixat anställda-synkroniseringsproblem (använder nu /api/employees/list)
   - ✅ Implementerat useScheduleReminders() hook för påminnelser när anställd är sen
   - ✅ Implementerat useAdmin() hook för admin-kontroll
   - ✅ Integrerat alla komponenter med API
   - ✅ Full integration testing
   - ✅ Performance optimization
   
   ### 🔧 Tekniska Detaljer
   
   #### Database:
   - Tabeller: schedule_slots, absences, employees, projects, notifications, time_entries
   - RLS policies för tenant isolation på alla tabeller
   - Indexes för performance (idx_schedule_slots_shift_type)
   - EXCLUDE constraint för conflict prevention
   
   #### API Routes:
   - /api/schedules - CRUD operations för scheman
   - /api/absences - CRUD operations för frånvaro
   - /api/employees/list - Lista anställda (för att undvika RLS-problem)
   - /api/notifications/create - Skapa notifikationer
   
   #### Hooks:
   - useEmployees() - Hämtar anställda via /api/employees/list
   - useProjects() - Hämtar projekt
   - useAdmin() - Kollar admin-status
   - useScheduleReminders() - Påminnelser när anställd är sen
   
   #### Komponenter:
   - ScheduleCalendar - Huvudkalender med drag & drop
   - ScheduleModal - Modal för att skapa/redigera scheman
   - ScheduleSlot - Draggable card för schemapass
   - AbsenceCalendar - Kalender för frånvaro
   - AbsenceModal - Modal för frånvaro
   
   ### 🐛 Buggar Som Fixades
   - ✅ useEffect dependency array error i ScheduleCalendar
   - ✅ Anställda syns inte (fixat genom att använda API route istället för direkt Supabase)
   - ✅ Admin-only knappar syns inte (fixat med useAdmin() hook)
   - ✅ Schema lägga på flera projekt knapp syns inte (fixat med admin-kontroll)
   
   ### 💡 Beslut Och Lösningar
   - ✅ Beslut: @dnd-kit för drag & drop (motivation: TypeScript-native, maintained, bättre performance)
   - ✅ Beslut: Custom calendar component (motivation: Mer kontroll, bättre integration)
   - ✅ Beslut: Dual-layer conflict detection (motivation: Snabb feedback + data integrity)
   - ✅ Beslut: Admin-only för schemaläggning (motivation: Kontroll och säkerhet)
   - ✅ Beslut: useEmployees() via API route (motivation: Undvika RLS-problem)
   
   ### 📝 Lessons Learned
   - RLS kan skapa problem när man hämtar data direkt från Supabase - använd API routes istället
   - Admin-kontroll behöver implementeras konsekvent på alla ställen
   - Drag & drop kräver noggrann hantering av state och re-renders
   - Mobile optimization är viktigt från början, inte något man lägger till efteråt
   
   ### 🚀 Nästa Steg (För Framtida Förbättringar)
   - Förbättra vecko-skapande med riktig modal istället för prompts
   - Implementera flera projekt per dag för samma anställd
   - Förbättra påminnelse-systemet med direktkontakt till handläggare
   - Optimera queries för stora datasets
   - Lägg till mer avancerade filter i ScheduleCalendar

4. STRUKTURERA NOTION-DOKUMENTET:
   Organisera Notion-dokumentet enligt följande struktur:
   
   # Frost Solutions - Master Document
   
   ## 📅 Dags Rutiner
   [Behåll befintliga rutiner]
   
   ## 📋 Daily Tasks
   
   ### Dag 1: Resursplanering & Schema ✅ KOMPLETT
   [Klistra in dokumentationen från punkt 3]
   
   ### Dag 2: Arbetsorder-system 🚧 I PROGRESS
   [Klistra in task breakdown från punkt 2]
   
   ## 🏗️ Project Architecture
   [Behåll befintlig arkitektur-dokumentation]
   
   ## 📝 Notes & Decisions
   [Behåll befintliga notes]

VIKTIGT:
- Ta bort ALLA gamla task breakdowns för Dag 1
- Skapa EN komplett task breakdown för Dag 2 med alla subtasks och checkboxes
- Skapa EN komplett dokumentation för Dag 1 som visar vad som är klart
- Håll dokumentationen organiserad och lättläslig
- Använd checkboxes för alla tasks
- Inkludera tidsestimeringar där relevant
- Dokumentera alla viktiga beslut och lösningar
```

---

## 📋 Ytterligare Instruktioner

**När du skickar detta till Notion Pro AI:**

1. **Kopiera hela texten** ovan (från och med "Du är projektledare...")
2. **Klistra in i Notion Pro AI**
3. **Låt Notion Pro AI** skapa strukturen och task breakdown
4. **Granska resultatet** och justera om nödvändigt
5. **Spara och uppdatera** när tasks är klara

**Tips:**
- Notion Pro AI kan behöva några försök för att få strukturen helt rätt
- Du kan ge specifika instruktioner om formatet om du vill ändra något
- Uppdatera task breakdownen kontinuerligt när tasks är klara
- Flytta kompletta tasks till dokumentationen när de är färdiga

---

**Status:** ✅ Instruktioner redo för Notion Pro AI! 🚀


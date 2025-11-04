# 📋 Notion Pro Prompt - Dag 2: Arbetsorder-system

## 🎯 Kopiera denna prompt till Notion Pro AI:

```
Du är projektledare och dokumenterar progress för Frost Solutions.

DAGENS UPPGIFTER - DAG 2: ARBETSORDER-SYSTEM:

1. UPPDATERA DAGENS STATUS:
   - Markerade att vi startar Dag 2: Arbetsorder-system
   - Skapa en ny sektion för Dag 2 i Notion-dokumentet

2. SKAPA TASK BREAKDOWN FÖR DAG 2:
   Skapa en komplett task breakdown för Dag 2: Arbetsorder-system med följande struktur:

   ## 📋 Dag 2: Arbetsorder-system - Task Breakdown
   
   **Mål:** Dedikerat arbetsorder-system med statusflöde och foto-upload
   **Status:** 🚧 I PROGRESS
   **Starttid:** [Dagens datum och tid]
   
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

3. DOKUMENTERA PROGRESS KONTINUERLIGT:
   - Uppdatera checkboxes när tasks är klara
   - Dokumentera bugs som hittas och fixas
   - Notera viktiga beslut och lösningar
   - Tracka tidsåtgång för varje sektion
   - Dokumentera blockers eller issues

4. STRUKTURERA NOTION-DOKUMENTET:
   Organisera Notion-dokumentet enligt följande struktur:
   
   # Frost Solutions - Master Document
   
   ## 📅 Dags Rutiner
   [Behåll befintliga rutiner]
   
   ## 📋 Daily Tasks
   
   ### Dag 1: Resursplanering & Schema ✅ KOMPLETT
   [Behåll befintlig dokumentation]
   
   ### Dag 2: Arbetsorder-system 🚧 I PROGRESS
   [Klistra in task breakdown ovan]
   
   ## 🏗️ Project Architecture
   [Uppdatera med nya tabeller och API endpoints när de är klara]
   
   ## 📝 Notes & Decisions
   [Dokumentera viktiga beslut från Dag 2]

VIKTIGT:
- Använd checkboxes för alla tasks
- Uppdatera status kontinuerligt (🚧 I PROGRESS → ✅ KOMPLETT)
- Dokumentera alla viktiga beslut med motivation
- Tracka bugs och fixes
- Håll dokumentationen organiserad och lättläslig
- När Dag 2 är klar, skapa komplett dokumentation liknande Dag 1
```

---

## 🎯 Ytterligare Instruktioner för Notion Pro

**När du använder detta:**

1. **Kopiera hela prompten** ovan (från "Du är projektledare...")
2. **Klistra in i Notion Pro AI**
3. **Låt Notion Pro AI** skapa strukturen och task breakdown
4. **Uppdatera kontinuerligt** när tasks är klara
5. **Dokumentera beslut** när viktiga val görs

**Tips:**
- Notion Pro AI kan behöva flera försök för att få strukturen helt rätt
- Du kan ge specifika instruktioner om formatet om du vill ändra något
- Uppdatera task breakdownen kontinuerligt under dagen
- Flytta kompletta tasks till dokumentationen när de är färdiga
- Använd emojis för visuell organisering (✅ 🚧 📝 🐛)

---

**Status:** ✅ Redo för Dag 2 dokumentation! 🚀


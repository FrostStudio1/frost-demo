# 📋 Notion Master Document Template

## Kopiera detta till ditt Notion-dokument

---

# Frost Solutions - Master Document

## 📅 Dags Rutiner

### 08:00-09:00: Planning (Notion + Perplexity)
- [ ] Review dagens tasks från 8-week plan
- [ ] Research dagens features (Perplexity)
- [ ] Setup architecture (Cursor Pro)

### 09:00-12:00: Backend (GPT-5 + Cursor Pro)
- [ ] GPT-5: Skriv komplex backend-logik
- [ ] Cursor Pro: Review & integrera
- [ ] Copilot: Auto-complete assistance

### 13:00-17:00: Frontend (Gemini + Copilot)
- [ ] Gemini 2.5: Skapa UI-komponenter
- [ ] Cursor Pro: Integrera komponenter
- [ ] Testa responsive design

### 18:00-20:00: Integration & Commit (Cursor Pro)
- [ ] Integrera backend + frontend
- [ ] Testa full flow
- [ ] Fixa bugs
- [ ] Git commit

---

## 🏗️ Project Architecture

### Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Caching:** React Query
- **Styling:** Tailwind CSS
- **Language:** TypeScript

### Database Schema
- [Länk till SQL migrations]
- Tenants, Employees, Projects, Clients, Time Entries, Invoices, etc.

### API Endpoints
- `/api/projects/*` - Projekt management
- `/api/invoices/*` - Fakturering
- `/api/time-entries/*` - Tidsrapportering
- `/api/employees/*` - Anställda
- `/api/clients/*` - Kunder
- `/api/ata/*` - ÄTA 2.0
- `/api/budget/*` - Budget & Alerts
- `/api/public-links/*` - Customer Portal
- `/api/audit-logs/*` - Audit Log

### Component Library
- `ScheduleCalendar` - Schema-komponent
- `WorkOrderCard` - Arbetsorder-kort
- `TimeClock` - Stämpelklocka
- `ATA2Card` - ÄTA 2.0 management
- `BudgetCard` - Budget & Alerts
- `NotificationCenter` - Notifikationer

---

## 📋 Daily Tasks

### Dag 1: Resursplanering & Schema
**Mål:** Drag & drop schema, bemanning, frånvaro

#### Morning (08:00-12:00)
- [ ] Research @dnd-kit (Perplexity)
- [ ] Setup project structure (Cursor Pro)
- [ ] SQL migration för schedules (GPT-5)
- [ ] API endpoints för schedules (GPT-5)

#### Afternoon (13:00-17:00)
- [ ] ScheduleCalendar component (Gemini 2.5)
- [ ] Drag & drop funktionalitet (Gemini 2.5)
- [ ] Integrera med projects (Cursor Pro)

#### Evening (18:00-20:00)
- [ ] Testa full flow (Cursor Pro)
- [ ] Fixa bugs
- [ ] Git commit

---

### Dag 2: Arbetsorder-system
**Mål:** Dedikerat arbetsorder-system med statusflöde

#### Morning (08:00-12:00)
- [ ] Research work order patterns (Perplexity)
- [ ] SQL migration för work_orders (GPT-5)
- [ ] API endpoints (GPT-5)
- [ ] Status transition logic (GPT-5)

#### Afternoon (13:00-17:00)
- [ ] WorkOrderCard component (Gemini 2.5)
- [ ] WorkOrderList component (Gemini 2.5)
- [ ] Mobile-optimized views (Gemini 2.5)

#### Evening (18:00-20:00)
- [ ] Push notifications (Cursor Pro)
- [ ] Integration & testing (Cursor Pro)
- [ ] Git commit

---

### Dag 3: Offline-stöd & Sync
**Mål:** Fungera perfekt offline med sync

#### Morning (08:00-12:00)
- [ ] Research Service Worker patterns (Perplexity)
- [ ] Service Worker code (GPT-5)
- [ ] IndexedDB setup (GPT-5)
- [ ] Sync algorithms (GPT-5)

#### Afternoon (13:00-17:00)
- [ ] Offline UI indicators (Gemini 2.5)
- [ ] Sync progress UI (Gemini 2.5)
- [ ] Offline banner (Gemini 2.5)

#### Evening (18:00-20:00)
- [ ] Testa offline scenarios (Cursor Pro)
- [ ] Testa sync conflicts (Cursor Pro)
- [ ] Git commit

---

### Dag 4: Fortnox/Visma Integration
**Mål:** Fullständig integration med bokföring

#### Morning (08:00-12:00)
- [ ] Research Fortnox API (Perplexity)
- [ ] Research Visma API (Perplexity)
- [ ] Fortnox API client (GPT-5)
- [ ] Visma API client (GPT-5)

#### Afternoon (13:00-17:00)
- [ ] Integration settings UI (Gemini 2.5)
- [ ] Connection flow (Gemini 2.5)
- [ ] Sync status display (Gemini 2.5)

#### Evening (18:00-20:00)
- [ ] Auto-sync setup (Cursor Pro)
- [ ] Testing (Cursor Pro)
- [ ] Git commit

---

### Dag 5: AI-stöd → 100%
**Mål:** AI i varje del av appen

#### Morning (08:00-12:00)
- [ ] Research Hugging Face APIs (Perplexity)
- [ ] AI material identifiering (GPT-5)
- [ ] AI faktureringsförslag (GPT-5)
- [ ] AI projektplanering (GPT-5)

#### Afternoon (13:00-17:00)
- [ ] AI suggestion UI (Gemini 2.5)
- [ ] Loading states (Gemini 2.5)
- [ ] Success animations (Gemini 2.5)

#### Evening (18:00-20:00)
- [ ] Caching implementation (Cursor Pro)
- [ ] Performance optimization (Cursor Pro)
- [ ] Git commit

---

### Dag 6: Advanced Features
**Mål:** Features Bygglet inte har

#### Morning (08:00-12:00)
- [ ] Research geofencing (Perplexity)
- [ ] Geofencing 2.0 logic (GPT-5)
- [ ] GPS tracking (GPT-5)
- [ ] Heatmap generation (GPT-5)

#### Afternoon (13:00-17:00)
- [ ] Map components (Gemini 2.5)
- [ ] Geofence visualization (Gemini 2.5)
- [ ] Heatmap UI (Gemini 2.5)

#### Evening (18:00-20:00)
- [ ] Gamification system (Gemini 2.5)
- [ ] Integration & testing (Cursor Pro)
- [ ] Git commit

---

### Dag 7: KMA/Egenkontroller & Offert
**Mål:** Checklista-motor + Offert-system

#### Morning (08:00-12:00)
- [ ] Research KMA requirements (Perplexity)
- [ ] Checklista-motor (GPT-5)
- [ ] Offert-system (GPT-5)
- [ ] Auto-project creation (GPT-5)

#### Afternoon (13:00-17:00)
- [ ] Checklist components (Gemini 2.5)
- [ ] Photo camera integration (Gemini 2.5)
- [ ] Offert UI (Gemini 2.5)

#### Evening (18:00-20:00)
- [ ] Integration & testing (Cursor Pro)
- [ ] Final polish (Cursor Pro)
- [ ] Git commit

---

## 🐛 Bug Log

### Format
```
[Date] [Bug Description]
- Status: [Open/In Progress/Fixed]
- Found by: [AI/Manual]
- Solution: [Description]
- Fixed by: [AI/Manual]
```

### Exempel
```
[2025-01-15] Invoice creation doesn't sync project data
- Status: Fixed
- Found by: Manual testing
- Solution: Added project_id to invoice creation payload
- Fixed by: Cursor Pro
```

---

## 📝 Decision Log

### Format
```
[Date] [Decision]
- Reason: [Why]
- Impact: [What changes]
- Decided by: [AI/Team]
```

### Exempel
```
[2025-01-15] Use @dnd-kit instead of react-beautiful-dnd
- Reason: Better performance, maintained, better TypeScript support
- Impact: All calendar components use @dnd-kit
- Decided by: Perplexity Pro research + Cursor Pro
```

---

## 🔗 AI Prompts Library

### Cursor Pro (Composer) - Cmd+I
```
"Implementera [feature]:
- [Requirements]
- Context: [paste relevant code]
- Make it production-ready with TypeScript and error handling"
```

### Cursor Pro (Chat) - Cmd+L
```
"Review this code:
[paste code]
- Check code style
- Suggest improvements
- Add error handling
- Make it production-ready"
```

### GPT-5
```
"Du är senior developer för Frost Solutions. Implementera [feature]:
- Requirements: [list]
- Context: [paste code snippets]
- Database schema: [share schema]
- Make it production-ready med proper error handling och validation"
```

### Gemini 2.5
```
"Du är UI/UX specialist för Frost Solutions. Skapa [component]:
- Features: [list]
- Design system: [share colors, typography]
- Reference: [share existing components]
- Make it clean, simple, och responsive"
```

### Perplexity Pro
```
"Research [topic] för Frost Solutions:
- Best practices
- API documentation
- Code examples
- Common pitfalls
- Provide summary + examples + links"
```

### Notion Pro
```
"Uppdatera progress för dag X:
- Completed: [list]
- In Progress: [list]
- Issues: [list]
- Tomorrow's Plan: [list]

Dokumentera viktiga beslut och lösningar."
```

---

## 📚 Documentation Links

### Internal Docs
- [8-Week Implementation Plan](./docs/8_WEEK_IMPLEMENTATION_PLAN.md)
- [6-AI Power Team Guide](./docs/6_AI_POWER_TEAM_GUIDE.md)
- [UI/UX Design System](./docs/UI_UX_DESIGN_SYSTEM.md)
- [100% Match Plan](./docs/100_PERCENT_MATCH_PLAN.md)

### External Docs
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)

---

## 📊 Progress Tracker

### Week Overview
- [ ] Dag 1: Resursplanering ✅/❌
- [ ] Dag 2: Arbetsorder ✅/❌
- [ ] Dag 3: Offline-stöd ✅/❌
- [ ] Dag 4: Fortnox/Visma ✅/❌
- [ ] Dag 5: AI-stöd ✅/❌
- [ ] Dag 6: Advanced Features ✅/❌
- [ ] Dag 7: KMA/Offert ✅/❌

### Completion Rate
- **Total Features:** 7
- **Completed:** 0
- **In Progress:** 0
- **Remaining:** 7
- **Progress:** 0%

---

## 🎯 Success Metrics

### Daily Goals
- ✅ 12h produktivt arbete
- ✅ 1 major feature komplett
- ✅ 0 critical bugs
- ✅ All code committed

### Weekly Goals
- ✅ 7 features kompletta
- ✅ 100% match Bygglet
- ✅ Alla unique features
- ✅ Production-ready

---

## 💡 Tips & Tricks

### Context Sharing
- **Delar Notion-länkar** med AI:er för context
- **Uppdaterar Notion** efter varje major decision
- **Använder prompts library** för konsistens

### Code Quality
- **Cursor Pro** är final arbiter för code quality
- **GPT-5** för komplex logik review
- **Alltid testa** innan commit

### Speed Optimization
- **Parallellt arbete:** Backend + Frontend samtidigt
- **Reuse code:** Copilot för boilerplate
- **Batch tasks:** Gruppera relaterade features

---

**Uppdatera detta dokument varje dag! 📝**

